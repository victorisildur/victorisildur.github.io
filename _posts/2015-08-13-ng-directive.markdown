---
layout: post
title: "angular js自定义directive与集成jquery插件"
date: 2015-08-13 19:26:00
categories: javascript
---
##需求
1. 页面需要一个datetime-picker，而angular ui只有date picker和time picker。希望有个像jquery-datetimepicker那样的angular实现。

2. 页面需要一个长得像iphone一样的switch，同样希望能在angular中用。

##思路
必须自己写angular的directive！

先不讲概念，看下直观效果

datetimepicker:

![datetimepicker]({{ site.url }}/assets/images/datetimepicker.png)

toggle-switch:

![toggle-switch]({{ site.url }}/assets/images/toggle-switch.png)

其中datetimepicker直接复用了jquery的datetimepicker插件，只是做了angularjs的ngModel接入。主要用到的directive概念：

compile, pre link, post link

toggle-switch全部自己写起，主要用到的directive概念：

$formatter, $parser, $viewChangeListeners, $render

##实现

# 与jquery插件的集成

html中正常引用jquery.datetimepicker插件和angularjs

同时写自定义的<datetime-picker>

```html
<datetime-picker ng-model="myDatetime.datetime"></datetime-picker>
<script src="datetimepicker-master/jquery.js"></script>
<script src="datetimepicker-master/jquery.datetimepicker.js"></script>
<script src="angular.js"></script>
<script src="app.js"></script>
```
重点是如何把ng-model的值myDatetime.datetime双向绑定上去：

```javascript
app.directive('datetimePicker', function() {
    return {
        require: "ngModel",
        template: "<input>",
        replace: true,
        link: function(scope, elem, attrs, ngModelCtrl) {
            if(!ngModelCtrl) return;
            $(elem).datetimepicker({
                format: 'Y-m-d H:i:s',
                step: 15,
                lang: 'ch',
                onSelectTime: function(datetime){
                    console.log(datetime);
                    scope.$apply(function() {
                        ngModelCtrl.$setViewValue(datetime);
                    });
                }
            });
        }
    }
});
```

这段代码做了这几个事儿：

compile阶段：
把**datetime-picker**替换成**input**

link阶段：
具体的说是post link阶段，把*input*元素绑定上$().datetimepicker
同时设置插件选择time时的监听器，用户选择时间后，触发：

```javascript
$scope.$apply( function() {
    ngModelCtrl.$setViewValue(datetime);
});
```

ngModelCtrl, 这是什么？

打印下link函数传入的第四个参数ngModel，可以看到是一个带有$modelValue, $viewValue, $viewChangeListener, $render, $parsers, $formatters的对象

它是require: ngModel之后可以被同时注入指令的ngModelController，用来处理数据绑定、验证、css更新等不实际操作DOM的事情（而且已经到post link阶段了，你也不应该去操作dom）

到这里ngModelCtrl.$setViewValue就好理解了：

用jquery插件传来的值，赋给*input*元素，这样视图层就有了新的datetime值

然后因为我们外层用$scope.$apply()包裹，所以触发了$digest循环，循环过程中$scope.myDatetime.datetime被更新。

至此，jquery插件对angular视图和Model的更新就都完成了

或者，我们不想触发$digest循环，angular还要去搞脏值检测，多麻烦，有没有办法直接手动改掉Model的值呢？也是有的，这里对link()第一个参数scope的model属性操作就可以了：

```javascript
ngModelCtrl.$setViewValue(datetime);
scope.model = datetime;
```

# 如何手写directive toggle-switch?

toggle-switch难点在于思路上。

首先，switch从逻辑上来说，就是个0,1开关，和 input type="checkbox"实在太像。很容易就想去写个input ng-model="open"，然后通过样式操作让它变得像个iphone的开关。

这个的想法有个问题：iphone switch长成那样，显然是要把checkbox覆盖掉的，你没法直接点到checkbox！

正确思路是：画一个switch，用ng-model的true false值控制其样式，每次click的时候，model值取反。

核心代码如下：

```html
<toggle-switch ng-model="alimonitorObj.ifWangwang"></toggle-switch>
```

```javascript
// 模板
template: '<div role="radio" class="toggle-switch" ng-class="{ \'disabled\': disabled }">' +
            '<div class="toggle-switch-animate" ng-class="{\'switch-off\': !model, \'switch-on\': model}">' +
              '<span class="switch-left" ng-bind="onLabel"></span>' +
              '<span class="knob" ng-bind="knobLabel"></span>' +
              '<span class="switch-right" ng-bind="offLabel"></span>' +
            '</div>' +
          '</div>',

// link
link: function(scope, element, attrs, ngModelCtrl){
    element.on('click', function() {
        scope.$apply(scope.toggle);
    });

    ngModelCtrl.$render = function(){
        scope.model = ngModelCtrl.$viewValue;
    };

    scope.toggle = function toggle() {
        if(!scope.disabled) {
           scope.model = !scope.model;
           ngModelCtrl.$setViewValue(scope.model);
        }
    };
}
```
这段代码做了如下几个事：

1. 把 *toggle-switch* 元素替换成 *div class="toggle-switch"* 元素，其中部分css class由model决定

2. $render: 

   从控制器里设置mySwitchStatus.ifOpen = true到 *div class="switch-open"*，经历了这么几步骤：

   ![formatters-render]({{site.url}}/assets/images/formatters-render.png)

   1. 控制器初始化，触发$digest循环

   2. 检测到$scope.mySwitchStatus.ifOpen是脏值

   3. 执行$$watcher列表中 mySwitchStatus.ifOpen的$watch函数ngModelWatch()

   4. ngModel()中：
   
   ```javascript
   if (modelValue !== ctrl.$modelValue) {
      ctrl.$modelValue = ctrl.$$rawModelValue = modelValue;
      var formatters = ctrl.$formatters,
          idx = formatters.length;
      var viewValue = modelValue;
      while (idx--) {
        viewValue = formatters[idx](viewValue);
      }
      if (ctrl.$viewValue !== viewValue) {
        ctrl.$viewValue = ctrl.$$lastCommittedViewValue = viewValue;
        ctrl.$render();
      }
    }
   ```

   5. ngModel()中：依次执行$formatters中的函数, mySwitchStatus.ifOpen中的值被最终转换成dom中的字符串

   6. $viewValue被赋值为formatters处理后的字符串

   7. 执行$render()

   所以这里的 $render保证了$scope.mySwitchStatus.ifOpen变化后，scope.model随之变化

   （？？不应该是自动的吗？？ 似乎scope.model 和 ngModelCtrl.$modelValue不一样）

   这样，初始状态下 div class="switch-open"就完成了

   然后就是监听elem.click事件，触发时scope.model反向，并更新$viewValue

   整个过程结束

   这里至于为什么$watcher长成这个样, 

   ctrl.$viewViewValue如何最终影响到视图dom，就要另开一篇讲了。