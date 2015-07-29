---
layout: post
title: 2015-05-23-javascript scope chain
date: 2015-05-23 05:15:34
categories:
---
# scope chain
一个函数有一个scope chain
函数每调用一次，该函数的scope上创建一个对象，函数的局部变量被当做属性赋值给这个新对象。
所以对嵌套函数
```javascript
function A() {
	var a = 'A';
	function B() {
		var b = 'B'
	}
	function C() {
		var c = 'C'
	}
}
```
scope A   <---  scope B
       ^
       |
       |___ scope C
当A()被调用。 scope A上有新对象，新对象有a属性。
                           scope B上有新对象， 新对象有b属性。
                           scope C上有新对象， 新对象有c属性。
                           B函数内能通过scope chain找到a 属性
                           C函数也能通过scope chain找到a 属性，两者是同一对象。因为都是在A()的这次调用里新建的对象的a属性。
                           

# context上下文
阿里前端的一道题：
```javascript
var Obj = function() {
	this.msg = 'ok';
	this.shout = function() {
		alert(this.msg)
	};
	this.waitAndShout = function() {
		//填写代码，5s后调用this.shout
	}
}
```
错误代码1：
```javascript
setTimeout.call(this, this.shout, 1000)
// illegal invocation
```
错误代码2：
```javascript
var f = setTimeout.bind(this)
f(this.shout , 1000)
// illegal invocation
```
正确代码：
```javascript
setTimeout( this.shout.bind(this) , 1000)
// this.shout的context由window变为this
```


# 函数调用时，发生了什么
函数被调用时，将创建一个execution context，创建执行上下文时，发生了三件事：
1. 创建Activation object
2. 创建arguments 对象
3. 创建scope

这里我们主要关心scope, scope是a list( or a chain ) of objects. 每个函数对象都有一个[[scope]]属性，[[scope]]属性由对象序列or对象链表构成。这个列表/链表被[[scope]]属性引用，Activation object在列表/链表头。
接下来，初始化variables. 也是发生三件事：
1. 函数的参数会变成Activation object的属性。
2. 内部函数会变成Activation object的属性。
3. var 会变成Activation object的属性。

这些属性都会赋值为undefined，直到执行函数体里的赋值语句。这就是传说中的Hoisting, 预声明～

scope呢？先看原文：

>Function objects created with the Function constructor always have a [[scope]] property referring to a scope chain that only contains the global object.
Function objects created with function declarations or function expressions have the scope chain of the execution context in which they are created assigned to their internal [[scope]] property.

通俗翻译一下：
1. 函数语句声明的函数，[[scope]]指向global object
2. 函数定义和函数表达式的声明的函数，[[scope]]指向他们执行上下文的[[scope]]

Identifier  Resolution:
解析标识符时，沿着[[scope]]指向的scope chain找，第一项显然是Activition Object，里面包含了：参数，内部函数，内部变量。找不到标识付，再去第二项，也就是执行上下文的[[scope]]找。。。依次类推。

所以之前A中含B,C的栗子，B,C的[[scope]]都指向了A的[[scope]]，A的scope chain第一项含有a, 所以B,C都找到a，且是同一个a。

# 网易的说法
网易主要讲了词法环境：
注意词法环境的outer是有静态分析确定的
![词法环境](http://img.blog.csdn.net/20150607085019998)

[ecma定义](http://www.ecma-international.org/publications/standards/Ecma-262.htm)

函数表达式执行时，函数对象的scope被赋值为当前execution context，和之前的吻合。