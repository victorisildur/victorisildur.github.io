---
layout: post
title: "js设计模式"
date: 2016-05-08 17:27:00
categories: programming
excerpt: javascript设计模式，通向完美代码之路
---

## singleton

需求是这样的，ProductInfo类需要去查product列表，这个列表希望用一个静态变量，以节省空间。
问题是列表需要ajax取到才行，singleton模式Init滞后，所以适合这个场景。

```javascript
var mySingleton = (function () {
    var instance;
    function init() {
        return {
            publicMethod1: publicMethod1
        };
    }
    return {
        getInstance: function() {
            if (!instance) {
                instance = init();
            }
            return instance;
        }
    }
})();
```

现在的问题是，ajax请求放哪里？
对我们的情况，显然希望立马去请求，init还是采用这种lazy init。

所以应该成为这样：

```javascript
var mySingleton = (function () {
    var gotData = false;
    var privateData;
    ajax.get({
        onSuccess: function(data) {
            gotData = true;
            privateData = data;
        }
    });
    var instance;
    function init() {
        while (!gotData)
            ;
        return {
            publicMethod1: publicMethod1
        };
    }
    return {
        getInstance: function() {
            if (!instance) {
                instance = init();
            }
            return instance;
        }
    }
})();
```

注意到init里有一个循环等待gotData的动作，是不是觉得太暴力？
优雅的方式是用回调，但只有第一次是真正需要等待回调的，所以也不是很好。 

## 依赖、关联、聚合、组合

* 依赖： FileWriter ----> IoUtil. 有require的意味在里面
* 关联： Person &rarr; House. 两者有关系，互相是has-a的关系
* 聚合： Libary <>&rarr; Books. 和关联基本一样，但是是复数概念。has-many的关系
* 组合： Head &diams; &rarr; Hands. 和聚合一样是has-many, has-a的意味，但注意是不可拆分的那种，composed-of的意味。

然后来看装饰者模式；

![decorator]({{site.url}}/assets/images/decorator_pattern.jpg)

装饰者由真正干活的VisualComponent组合而成，装饰者父类的`draw()`只是调用VisualComponent的`draw()`。
装饰者子类的`draw()`首先调用父类的`draw()`，然后调用自己的多于操作。
如`drawBorder()`，画边框。

这样就能实现UI中：创建一个textView，在上面加一个scrollView，再在上面加一个borderView这样的需求：

![scrollView, borderView]({{site.url}}/assets/images/scroll_border_view.jpg)

这里有个很好的javascript版decorator模式的实现：
[https://github.com/tcorral/Design-Patterns-in-Javascript/tree/es6/Decorator](https://github.com/tcorral/Design-Patterns-in-Javascript/tree/es6/Decorator)