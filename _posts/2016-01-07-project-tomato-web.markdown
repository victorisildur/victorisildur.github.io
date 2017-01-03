---
layout: post
title: "tomato项目: web部分"
date: 2016-01-07 19:51:00
categories: programming
excerpt: 页面部分，应该用react重写一发
---

## 静态页面

jquery mobile非常依靠jquery，它的class都是jquery解析之后再addClass上去的，这会造成2G下页面很长时间没有样式，
说实话不是很欣赏这种做法，静态的class就应该留给程序员手工去配，jquery负责ajax劫持，动画之类的增强效果。

用了三天写静态，中间被档案的事耽搁了，不过也是慢的可以。主要遇到的问题是custom build之后icon没有了，header效果也没有了。
好吧，论坛上说是因为custom build的js顺序问题，瞬间感觉jqm生产环境完全没法用。。。

想要自己写效果的话也可以啊！用jqm无非是想要3个东西：

1. 渐进增强
2. link劫持
3. 动画效果

不过我觉得现在已经从0到1了，先把native部分搞了，回头动态化web的时候再来做自己的库。

