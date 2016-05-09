---
layout: post
title: "js设计模式"
date: 2016-05-08 17:27:00
categories: programming
---

# singleton

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
