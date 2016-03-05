---
layout: post
title: "touch-dnd源码阅读"
date: 2016-03-05 08:27:00
categories: programming
---

# touch-dnd是什么
是一个绕开html 5 draggable api，自己实现drag-and-drop, sortable的zepto插件。
用了下发现非常好用，但用在自己项目里存在z-index问题。
所以一定要好好看看源码。