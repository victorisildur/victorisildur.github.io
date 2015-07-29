---
layout: post
title: 2015-05-09-javascript原型链与原型继承
date: 2015-05-09 03:19:47
categories:
---
#引子
```javascript
var Model = function() {
	prototype: {
		init: function() {}
	},
	create: function() {
		var object = Object.create(this);
		object.prototype = Object.create(this.prototype)
		return object
	}
}
```
# 原型链
![这里写图片描述](http://img.blog.csdn.net/20150509142551955)
1. Func.prototype = object : {constructor, [[Prototype]]}
2. object.[[constructor]] = Func
3. new Func().[[Prototype]] = Func.prototype
4. var a = new Func()执行三步：

    1. 创建空对象{}, 赋给变量a 
    2. object.[[Prototype]] = Func
    3. 执行object.constructor.apply( this, arguments )

注意：
- 是因为 new Func().[[Prototype]] == Func.prototype，所以才会有Array.prototype.slice = function() {}

# 原型继承
![prototype-basc inheritance](http://jbcdn2.b0.upaiyun.com/2012/05/JavaScript-prototypes-and-inheritance4.jpg)
```javascript
var B = function() {}
B.prototype = new A()
B.prototype.constructor = B
var b = new B()
b.[[Prototype]] == B.prototype == instance of A// whose [[Prototype]] is A
//所以最终B的原型链指向A
```

这时我们再来看引子的程序：
```javascript
var Model = function() {
	prototype: {
		init: function() {}
	},
	create: function() {
		var object = Object.create(this);
		// object.[[Prototype]] = F.prototype = this
		object.prototype = Object.create(this.prototype)
		// object.prototype = F.prototype = this.prototype
		return object
	}
}
// 创建新Model
var UserModel = Model.create() // 返回的是个object啊！
                               // 不能new UserModel啊！
// UserModel.prototype = Model.prototype
// UserModel.[[Prototype]] = Model // 这样Model的属性都可以同过原型链在UserModel中使用
var model = new Model
// model.[[Prototype]] = Model.prototype
```