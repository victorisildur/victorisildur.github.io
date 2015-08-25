---
layout: post
title: "原生javascript知识补全"
date: 2015-08-25 18:06:00
categories: javascript
---

## 初衷

面试网易，发现在事件处理上，对原生javascript掌握不够

## 事件

触发自定义事件:

```javascript
var event = new Event('build');
elem.addEventListener('build', function() {
    //todo
});
elem.dispatchEvent(event);
/* 更高级点的自定义事件 */
var event2 = new CustomEvent('build', {detail:'this is detail info'});
function eventHandler(e) {
    /* 其实就是给event对象上多绑了点属性  */
    console.log(e.detail);
}
```

触发原生事件:

```javascript
var event = new MouseEvent('click', {
    'view': window,
    'bubbles': true,
    'cancelable': true
  });
elem.dispatchEvent(event);
```

## Element类

# 判断节点tag

```javascript
    elem.tagName; // 'A', 'P', 'BUTTON'
    elem.nodeName; // 'A', 'P', 'BUTTON'
```

Element类的实例是有tagName属性的，Node是Element的父类，所以nodeName适用性更广。

