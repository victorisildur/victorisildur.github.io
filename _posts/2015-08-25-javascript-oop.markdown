---
layout: post
title: "javascript模拟类，完整版！"
date: 2015-08-25 15:06:00
categories: javascript
---

## 初衷
面试网易，被一道prototype模拟类的问题问住了，问题是这样的：

```javascript
function Super() {
    this.courses = ['math','music'];
}
function Sub() {
}
Sub.prototype = new Super()
var sub1 = new Sub();
sub1.courses.push('chinese');
var sub2 = new Sub();
sub1.courses.push('english');
```

第一问比较简单，问sub1.courses, sub2.courses里面内容是什么。显然是一样的，因为顺着原型链找，找到的是同一个对象。

第二问比较难，问如何修改上述代码，使得Sub实例集成的courses相互独立？

## 目标

用javascript实现：

1. 类属性继承
2. 类方法继承
3. 实例属性继承
4. 实例方法继承

## 实现

