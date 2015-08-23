---
layout: post
title: "Reactjs的一些理解"
date: 2015-08-23 17:06:00
categories: javascript
---

## 宗旨
我认为React的component是关键，它是抽象过的节点，对此官网是这样说的：

> We pass some methods in a JavaScript object to React.createClass() to create a new React component.

> The most important of these methods is called render which returns a tree of React components that will eventually render to HTML.

> You can return a tree of components that you (or someone else) built. This is what makes React composable: a key tenet of maintainable frontends.

所以，第一印象上讲，React提供了：

1. 一种方便写组件的方式(jsx)，这种方式非常内聚，非常直观，帮助我们一个文件放html, 一个文件操作dom带来的割裂，这种割裂使得我们很少有“组件”的概念，只能疲于复制粘贴

2. 一种优雅的ui托管：把html用React内部对象抽象了一层，更易于做动态效果

3. 自由，这是听蘑菇街面试官讲的，他说angularjs做一些组件费劲，我不知道他有没有写过directive，不过directive理解起来是有点麻烦

## 一些基本概念

# props

通过形如：

```javascript
React.render(
    <CommentBox data={data}></CommentBox>,
    document.getElementById('content')
);
```

传入父组件，子组件通过 this.props.data 访问。有一点数据单向流动的意思在里面。

# state

prop是render后就定死的，那我们想要改变绑定数据，或者弄点动态效果该怎么办呢？就用state

可以在入口处声明 data = {this.state.data}把state绑到props上，然后在合适的时机调用this.setState就行了

# event

既然有React组件的概念，说明React自己保有实际DOM，那么React虚拟节点能绑事件也是自然而然的：

```javascript
React.render(
    <CommentBox data={data}></CommentBox>,
    <CommentForm onCommentSubmit={this.handleCommentSubmit}></CommentForm>
    document.getElementById('content')
);
```

剩下在handleCommmitSubmit里做上传逻辑，更新state逻辑相对简单，就不再赘述了。

## 总结

就最后一个submit事件--> ajax --> 改this.state所实现的功能，在angularjs里要这样：
ng-submit --> ajax --> 改$scope.mode, $scope.data

其实js逻辑复杂度是差不多的，但是angularjs的Model和View分的略开，导致写到后面会忘记操作scope会对view造成什么影响

二是angularjs什么东西都要绑到scope上（指令除外），这搞的几乎没有“组件”概念，更难以复用。

React所有东西都是内聚的，都是操作虚拟节点的state,props,event，模型和视图也是在一起，代码看起来可读性大大提高。

ok, 简单地比较了下Reactjs和Angularjs, 感觉React确实适合去写UI组件，组件定制要求高的场景下开发肯定比自己去写angular directive要快要可复用。