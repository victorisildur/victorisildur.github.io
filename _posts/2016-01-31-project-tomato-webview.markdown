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

ProgressBar要自己添加，回退按键也要手动去掉，ActionBar实在是不统一，各种api乱七八糟的。

用loadUrl请求页面之前，先解决服务器连不上的问题，我认为是防火墙的问题，nodejs在运行着的，但浏览器连不过去。
这个不懂怎么debug，先把鸟哥的书看起来。

linux防火墙采用链式处理，packet依次经过chain上的rule。一共有三个链：

1. ip filter: INPUT,OUTPUT,FORWARD
2. nat: prerouting, postrouting(SNAT/MASQUERADE), OUTPUT
3. mangle: 处理packet的flag

查看这几个表的内容用命令：`iptables -t nat -L -n`
