---
layout: post
title: "angular js自定义directive与集成jquery插件"
date: 2015-08-13 19:26:00
categories: javascript
---
#需求
1. 页面需要一个datetime-picker，而angular ui只有date picker和time picker。希望有个像jquery-datetimepicker那样的angular实现。

2. 页面需要一个长得像iphone一样的switch，同样希望能在angular中用。

#思路
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

#实现

## 与jquery插件的继承

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
把<datetime-picker></datetime-picker>替换成<input>

link阶段：
具体的说是post link阶段，把<input>元素绑定上$().datetimepicker
同时设置插件选择time时的监听器，用户选择时间后，触发：

```javascript
$scope.$apply( function() {
    ngModelCtrl.$setViewValue(datetime);
});
```

这是什么？

打印下link函数传入的第四个参数，可以看到是一个带有$modelValue, $viewValue, $viewChangeListener, $render, $parsers, $formatters的对象

它是require: ngModel之后可以被同时注入指令的ngModelController，用来处理数据绑定、验证、css更新等不实际操作DOM的事情（而且已经到post link阶段了，你也不应该去操作dom）

到这里ngModelCtrl.$setViewValue就好理解了：

用jquery插件传来的值，赋给<input>元素，这样视图层就有了新的datetime值

然后因为我们外层用$scope.$apply()包裹，所以触发了$digest循环，循环过程中$scope.myDatetime.datetime被更新。

至此，jquery插件对angular视图和Model的更新就都完成了

或者，我们不想触发$digest循环，angular还要去搞脏值检测，多麻烦，有没有办法直接手动改掉Model的值呢？也是有的，这里对link()第一个参数scope的model属性操作就可以了：

```javascript
ngModelCtrl.$setViewValue(datetime);
scope.model = datetime;
```

## 如何手写directive toggle-switch?