---
layout: post
title: "Typescript工具链"
date: 2016-09-26 08:27:00
categories: programming
excerpt: "typescript, vs code, 微软的一整套技术链"
---

## typescript

初看type script，主要提供两个能力：一是强类型变量，二是interface。举个例子：

```javascript
// 变量的类型声明
function greeter(person: Person) {
    return 'Hi, ' + person.firstName + ' ' + person.lastName;
}

// interface
interface Person {
    firstName: string;
    lastName: string;
}
```

这样能解决javascript弱类型出现的很多bug

## vs code的vim模式

vs下的emacs模式插件不太好用，vim插件的还原度要高很多。
使用过程中，为了让所有vim快捷键生效（包括和windows快捷键冲突的那些），应在settings.json中开启如下设置：

```javascript
"vim.useCtrlKeys": true
```