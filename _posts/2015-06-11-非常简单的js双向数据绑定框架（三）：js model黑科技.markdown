---
layout: post
title: 2015-06-11-非常简单的js双向数据绑定框架（三）：js model黑科技
date: 2015-06-11 10:52:45
categories:javascript
---
# 初衷
之前我们要在js域更新model，需要这样：
```javascript
model.set('name', 'sub');
```
这实在太土了。。。
我们希望像angularjs一样，直接：
```javascript
$scope.name = 'sub';
```
然后bong, 视图就会更新！这样的黑科技必定是极好的。
# 目标
1. 完成model更新黑科技
2. 200行以内完成
我们希望html长成这样：
```html
<head>
    <title>avalon like mvvm framework</title>
    <script src="frame.js"></script>
    <script src="app.js"></script>
  </head>
  <body isi-controller="MainController">
    <h1> avalon lik mvvm framework </h1>
    <p id="my-p">{{width}}</p>
  </body>
```
{{width}}即绑到p里面，又绑到isi-css-width里面，又绑了个isi-click
不用写data-bind=xxx属性了，很像angularjs有没有！
js我们希望长这样：
```javascript
var model = MVVM.define("MainController", function(vm) {
    vm.width = 150;
    vm.click = function() {
        vm.width = parseFloat(vm.w) + 10;
    };
});

MVVM.scanTag();
```
想要改变model数据，直接vm.property = xxx就好，不用去model.set('property',xxx)了！

# 实现
今次主要借鉴avalon“劫持”setter,getter的方法，链接：[avalon简化版解读](http://www.cnblogs.com/aaronjs/p/3614049.html)

虽说是简化过的avalon，还是挺难读的。
整理下思路，主要两大点：
1. vm对象 --> vModel对象，劫持vm各个属性的set,get方法
2. scanTag() --> 遍历dom树找关键字，去vModel找求值函数，注册到订阅者列表

其中去vModel这一点不是很清楚，这几天一定要搞清，自己mock一个出来

## 第一版，劫持getter, setter
之前提到，关键步骤有两个，
1. 劫持vm中各个属性的getter, setter
2. scanTag，在这个过程中对vm对象求值，对vm对象handler(一般是去改视图)

贴一下关键代码和注释：
```javascript
    /*----------- define ------------------*/
    var MVVM = function() {};
    MVVM.define = function(name, factory) {
        var scope = {};
        factory(scope);
        var model = modelFactory(scope);
        factory(model);
        model.$id = name;
        return vModels[name] = model;
    }
    /* @param scope {object}: vm工厂方法生成的对象
     * @return vModel {object}: scope各property的set,get方法被劫持了后的对象。
     */
    function modelFactory(scope) {
        var vModel = {},
            originalModel = {},
            accessingProperties = {};
        // originalModel保存vm的属性, accessingProperties保存属性的accessor(及属性的订阅者)
        for(var prop in scope) {
            resolveAccess(prop, scope[prop], originalModel, accessingProperties);
        }
        // 关键！劫持需要access的属性的set,get方法！
        vModel = Object.defineProperties(vModel,withValue(accessingProperties));
        //
        vModel.$id = generateId();
        vModel.$accessors = accessingProperties;
        vModel.$originalModel = originalModel;
        vModel[SUB_NAME] = [];
        return vModel;
	}
```
```javascript
    MVVM.scanTag = function(element, vModel) {
        // 假使通过parse, 取到了包含{{}}的元素<p>
        var myP = document.getElementById('my-p');
        executeBindings([{
            filters: undefined,
            element: myP,
            nodeType: 3,
            type: "text",
            value: "width"
        }], vModels["MainController"]);
    };
    /* @param bindings {array} : bindings
     * @param vModel {object} : vModel
     * @func: exec bindingHandlers of text
     */
    function executeBindings(bindings, vModel) {
        bindings.forEach( function(data){
            bindingHandlers[data.type](data,vModel); 
            //bindingHandlers往下较长，就不贴了
            //主要功能是生成binding object的求值函数，handler函数，注册事件
        });
    }    
```

# 第二版
第一版有问题，没有事件啊，click不支持的话就太土了。
所以第二版引入事件注册。
简单的说，给每个vm的属性的setter,getter里，都搞一个subscriber数组，记录set这个属性时得通知哪些人，同时，在get这个属性时，收集订阅者。
这个过程有点绕，我也是一步步设断点才知道怎么运行的：
scanTag的时候，要生成每个属性的求值函数和handler函数，生成完之后，做注册。
注册的时候，是对整个binding object操作，首先去调用求值函数，这样有两个作用：
1. 调用了get方法，从而把这个binding object加到这个属性的subscribers数组里了 
2. get到值之后去set, 从而在scanTag的过程中把vm里的property搞到各个html里去

理清这些思路后，我们来重构avalon的代码，因为原码命名实在太乱了，词不达意，导致读码的时候思路也很乱。 代码写完我会上传到github

代码写完了，主要是以binding object和accessor为中心，accessor保有有关的bindings，setter,getter里用到binding.evaluter与binding.handler来处理view更新。binding.evalutor, handler有scanTag()过程获取

代码： [github.com/victorisildur/javascript](https://github.com/victorisildur/javascript)