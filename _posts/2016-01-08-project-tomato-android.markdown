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

把start button-> dialog-> count down timer-> add record连起来：

1. 按下start button：把customDialog和context绑起来，这样context才能作为listener供稍后回调。onclick后调用`customDialog.show()`
2. 按下Dialog确定键：回调listener，listener里开始计数，并add record

## 状态跳转
考虑这样的情况，我按下start button，开始25min的工作，结束后该怎么办？
我的希望是，提示工作结束（响铃、震动），开始休息模式，5min之后，休息结束。
提示休息结束（响铃、震动），给用户快捷方式再次开始工作。

so，工作状态和休息状态总是交替，但有几个地方需要特别注意：

1. 提前结束休息？休息的timer要取消掉
2. 初始化timer是什么状态？工作
3. 工作时间和休息时间？搞到values里去
4. 结束状态提示？震动、亮灯、状态栏，timerView也要有相应文字！好吧，最后是加了个rest done状态写的。

## 震动、亮灯、状态栏

### 状态栏：Notification (中文学名应该叫通知栏)

简单的`builder.build()`, `manager.notify()`就可以实现静态的notification，但是还缺两个功能，一是动态更新时间，二是在notification上实现action

![notification ver 1]({{site.url}}/assets/images/android_notification.png)

### 震动，亮灯

明天再写，小细节

## 统计页面

这个页面希望上边是饼状图，下边是柱状图，让用户看自己的历史分布

首先考虑导航，希望做到屏幕下面，因为现在屏幕太大了:(，同时希望能滑动触发，进一步便利切页面。

控件选择ViewPager，这样几个页面都在同一个activity下面，分别是一个page，代码要重构。
多弄几个Fragment代表每个page，初始化什么的全部托管给Page Class。
实际上，AppCompatActivity是FragmentActivity的子类，所以天然集成Fragment，我们弄好view pager的管理就好。

Toolbar采用custom view，注意custom view里的click事件要触发`viewPager.setCurrentItem()`，
viewPager的`onPageChange`事件要触发custom view的样式改变。
互相依赖。

Fragment的管理靠Adapter，Adapter夹在Fragment和viewPager控件中间，空间事件触发Fragment的换入换出，
对Adapter来说，把index到Fragment的关系管好就行了。
如下图所示：

![toolbar]({{site.url}}/assets/images/android_toolbar.png)

今天把饼状图弄了，遇到一个view pager的生命周期和三个fragment生命周期不一致的问题，
对我们来说，希望在一个page reenter的时候触发fragment的onResume，但是实际上三个fragment的onResume都和view pager绑在一起了，
这样一来就没法判断page reenter事件，没法重绘page。

解决办法就是自己定义resume接口，在onpageselected事件到来时调用之。期间要注意getItem()的返回要是正在运行的fragment

然后想做的效果是点击饼状图一个扇区时放大扇区，然后发现有事件分发问题，只有最后一个扇区能接收到touch事件，不知道怎么回事。
这尼玛要delegateTouch，复杂的不行，链接留这里[delegate touch event](http://developer.android.com/training/gestures/viewgroup.html)，考虑绕一下，用下面的列表来触发放大扇区事件。

