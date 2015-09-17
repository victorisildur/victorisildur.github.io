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

```javascript
function Super() {
    this.courses = ['math','music'];
}
function Sub() {
    /* 这里保证父类的Constructor被执行 */
    Super.apply(this, arguments); 
}
/* 这里保证父类的prototype被子类继承 */
function f() {}
f.prototype = new Super();
Sub.prototype = new f();
```

一般来讲，javascript中我们愿意把类的方法放到原型对象里去，函数嘛，要那么多份拷贝干嘛，通过原型链统统调用同一个就好。

## 理论

把成员变量放构造器里，把成员方法放原型链里，这叫组合继承

这是不是最优的呢？我们可以看到，构造器里调用了一次父类构造函数，prototype又调用了一次，那么，Super里的成员变量this.courses实际上是创建了两份的。这能不能改进呢？

答案是用寄生式组合继承。什么意思呢？就是用构造器继承去继承成员变量，用原型链只去继承父类的原型

```javascript
function Super() {
    this.courses = ['math','music'];
}
Super.prototype.sayHi = function() { alert('Hi'); }

function Sub() {
    /* 这里保证父类的Constructor被执行 */
    Super.apply(this, arguments); 
}

/* 寄生继承 */
function object_create(o) {
    function F() {}
    F.prototype = o;
    return new F();
}

/* 这里保证父类的prototype被子类继承 */
Sub.prototype = object_create(Super.prototype);
Sub.prototype.constructor = Sub;
```

完美的继承方案，不是吗？


