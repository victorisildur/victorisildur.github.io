---
layout: post
title: 2015-05-29-javascript 基础
date: 2015-05-29 05:40:08
categories:
---
# 严格模式
## 好处
消除语法模糊，避免一些安全问题
提高编译、运行速度
## 区别
1. 不支持全局变量的隐式声明
2. 不支持对象的重名属性
3. 不支持argument.callee

# 变量标示符
1. 字符，_，$开头
2. 除了开头，允许数字

# 内置类型
![这里写图片描述](http://img.blog.csdn.net/20150529162811847)

引用类型：Object
原始类型：Null, Undefined, Boolean, Number, String
![这里写图片描述](http://img.blog.csdn.net/20150529163157783)

# 类型识别
## typeof
识别除null外的标准类型
## Object.prototype.toString
```javascript
Object.prototype.toString.call(obj).slice(8,-1).toLowerCase()
```
Array, Date,RegExp,Error 内置对象都可以
## instanceof
不能判别原始对象类型： string, number, boolean

# 内置对象