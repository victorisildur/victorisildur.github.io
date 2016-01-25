---
layout: post
title: "tomato项目: native部分"
date: 2016-01-08 10:51:00
categories: programming
---

## sdk下载问题
pptp不知道怎么回事，连接不上，在DO上中转下载了dl.google.com上的一个sdk，建起了一个project。
但是还是缺很多component，用ss代理总是TLS问题，ss似乎https有问题。
今天总算在sdk manager找到force http选项，能下载了，但是有checksum问题。
跪，这个实在不知道怎么回事，还是啃pptp吧

跪，pptp被封，ss今天也被封。用了qq的http代理解决了。蛋疼爆炸。

最近看房子+准备答辩，没时间弄，蛋疼

转眼24号了，回家一周了，人生真是堕落啊。。。 花了20块钱买了个巨慢的vpn，总算把开发环境搞好了

## ui部分
ui部分按照官网的best ui practice在搞，主题是toolbar + custom view + custom list，具体看图：

![ui version 1]({{site.url}}/assets/images/android_snap01.png)

具体注意：

1. 进度圈中的button用linear layout和relative layout实现不了，要用frame layout，这样能堆叠起来
2. 进度是用`onDraw()`画出来的，`canvas.drawArc()`里用`Stroke`画就行了
3. 番茄历史是用`RecyclerView`画的，注意RV里有LayoutManager，LM里有Adapter，Adapter有ViewHolder，用的是`ViewHolder.onBindViewHolder()`实现数据到View的单向绑定

fab是比较蛋疼的地方，首先是没控件，最后用了`android.support.design.widget.FloatingActionButton`，这个怎么实现的不懂，总之样子还可以，阴影效果也有。
好吧，这个包的实现也有问题，没法运行时换icon，采用makovkastar的实现。

![ui version 2]({{site.url}}/assets/images/android_snap02.png)

定位上，我想放到两个material之间，用负值marginTop, marginLeft Hack了一下，实现的不是很好。

## 定时部分
当按下FAB，期望开始倒计时，相关动作有：

1. 进度圈开始转动
2. 计时结束：alert

## 存储部分
用的是sqlite，封装的时候遇到几个问题：

1. `db = helper.getReadableDatabase()`之后可以迅速`close()`，官方说cache过了，不用担心
2. AlertDialog生成传context的时候一定要用`this`而不是`getApplicationContext()`的结果，否则会报错：
You need to use a Theme.AppCompat theme (or descendant) with this activity.
这什么问题呢？猜想是getApplicationContext的实现问题。
StackOverflow上的解释是ui所需的context是Active Activity的上下文，而getApplicationContext提供的是整个app process的上下文。

上机的时候遇到getAllRecords逻辑问题，要判断`cursor.moveToFirst()`的返回！`Adapter`绑定`dataSet`时也要做相应处理。

