---
layout: post
title: "Reactjs的一些理解"
date: 2015-08-23 17:06:00
categories: javascript
---

## 宗旨
我认为React的compent是关键，它是抽象过的节点，对此官网是这样说的：

> We pass some methods in a JavaScript object to React.createClass() to create a new React component.

> The most important of these methods is called render which returns a tree of React components that will eventually render to HTML.

> You can return a tree of components that you (or someone else) built. This is what makes React composable: a key tenet of maintainable frontends.

所以，第一印象上讲，React提供了：

1. 一种方便写组件的方式(jsx)，这种方式非常内聚，非常直观，帮助我们一个文件放html, 一个文件操作dom带来的割裂，这种割裂使得我们很少有“组件”的概念，只能疲于复制粘贴

2. 一种优雅的ui托管：把html用React内部对象抽象了一层，更易于做动态效果

3. 自由，这是听蘑菇街面试官讲的，他说angularjs做一些组件费劲，我不知道他有没有写过directive，不过directive理解起来是有点麻烦


