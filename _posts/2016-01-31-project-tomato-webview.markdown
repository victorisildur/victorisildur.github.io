---
layout: post
title: "tomato项目: webview部分"
date: 2016-01-31 08:27:00
categories: programming
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

