---
layout: post
title: "tomato项目: webview部分"
date: 2016-01-31 08:27:00
categories: programming
excerpt: webview部分
---

app里用到webview的地方有两块：统计折线图、圈子。
今天从第一块开始。

# webview

第一步要解决如何从饼状图调到折线图页面，fragment是不考虑了，因为viewpager在管，所以考虑用intent另开一个activity。

activity里layout只有个WebView和一个ProgressBar，这里ProgressBar要自己添加，因为theme用的就是不带，不管怎么调都出不来ProgressBar。
然后webView的onChange事件中去更改ProgressBar的进度条样式。
回退按键也要手动去调用`onPressBack()`才能回到原来Fragment。
这个ActionBar实在是不统一，各种api乱七八糟的。



用loadUrl请求页面之前，先解决服务器连不上的问题，我认为是防火墙的问题，nodejs在运行着的，但浏览器连不过去。
这个不懂怎么debug，先把鸟哥的书看起来。

linux防火墙采用链式处理，packet依次经过chain上的rule。一共有三个链：

1. ip filter: INPUT,OUTPUT,FORWARD
2. nat: prerouting, postrouting(SNAT/MASQUERADE), OUTPUT
3. mangle: 处理packet的flag

查看这几个表的内容用命令：`iptables -t nat -L -n`

自己删除了几条filter rule没有作用，后来5alt帮我看了看，直接把iptables清空了，解决了问题。
同时给我搜了个类似的人的问答，让我意识到问题在于自己append的accept all太靠后了，
前面的一条REJECT --reject-with-icmp-host-prohibited搞掉了。

# React + Flux + Material Design
之前的博客写过React的思想，但是具体实践中没有体会到reuse特性，也没有写过样式，这次希望用在Tomato项目中。
先从折线图开始。

Flux看起来像一个处理单向绑定的pattern, 用action抽象动作，dispatcher解耦components，store就是store，view变化又可能产生新的Action.

Flux的Dispatcher，Action，Store代码都是自己写，官网上有代码。
View是传统React代码，Action通过Dispatcher, Store, 最终结果是更新自己的prop和state。
我写angular view的时候，大量的时间是在处理`this.mode = MODE.ADDNEW`之类的代码，ui的状态和动作逻辑直接混杂，
一个点击动作往往既要做数据更新，又要做ui状态的判断和跃迁。这种杂糅导致了逻辑和界面的耦合，调试也很麻烦。

从这个角度讲，双向绑定就是store和view.state夹杂成了一个概念，action、store和view往往混在一起，导致调试开发都很困难。

最后用browserify结合在一起。

## React的一些要点

1. Reconcile，这个不知道怎么翻译。
例子是如果Card里有两个`<p>`，当我们想把第一个移除时，实际操作是改第一个`<p>`的内容，移除第二个`<p>`。
2. list经常shuffle的情况，或者说children经常reorder的情况，要给每个Child赋一个key。
3. 性能瓶颈在于dom mutation而不是js执行，react宣称自己nb的地方就是整合、优化了dom变化。
4. propTypes: {prop1: React.PropTypes.element.isRequired}，React会自己做类型验证。
5. React生命周期：Mount, Update, Unmount, 每个阶段又再分为小阶段。
 如果很多部件都想用一样的生命事件函数，可以用mixins。
6. 对input, textarea, select元素，react用onChange监听。
7. render返回的实际是一个Virtual DOM，用户总是不直接操作真正dom。

## css动画

transform分为：
* translate: 平移
* rotate: 旋转
* scale: 缩放

animation:
用keyframe规定事件节点，节点间的转化时间用如下语法规定：
* animation-name time timing-func time count ...
* keyframe节点可以规定transform

transition:
平滑的改变一个css属性值
* 语法：属性 duration timing-function
* transition可以smooth change transform，这时属性为all

so，transition是只对一个属性的变化，相对简单；
animation有了keyframe的帮助，适用于复杂动画。
两者都可能使用到transform。

## material-ui

material ui是react写的component库，不过import语法和安装方法都看不懂，要先看npm, gulp, browserify!

import, export语法都是es6里的, 我们来看看这一句：

```javascript
import React from 'react';
import RaisedButton from 'material-ui/lib/raised-button';

const MyAwesomeReactComponent = () => (
    <RaisedButton label="Default"/>
);

export default MyAwesomeReactComponent;
```

import和export和CommonJS有点相似，区别在于CommonJS导出的是一个对象，而export不是。
同时import功能更多一些。
`export default`意思是导出的东西我不做命名，使用者随便命名，拿到的都是`MyAwesomeReactComponent`。

const就是常量声明。

`()=>()`是最关键的部分，这是一个arrow function，是比function更简的function，相当于lambda。
这个arrow fanction意思是参数无，返回`<RaisedButton/>`。

## React和Highcharts的结合

require语法和import语法可以在jsx里混用，我也是比较疑惑它是怎么做到的。
Highchart的调用用highcharts官方写的方法不顶用，这里我用的是![kirjs](https://github.com/kirjs/react-highcharts)的解决方案。
粗略看了下它的代码，也是重构一个React Component，在`componentDidMount`的时候去`new Highcharts`对象，在`shouldComponentUpdate()`的时候去重新`new Highcharts()`。
至于`Highcharts`这个类本身是怎么回事，那就不知道了。



