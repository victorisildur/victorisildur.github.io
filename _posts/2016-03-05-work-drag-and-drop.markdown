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

# 实现思路
首先是jquery plugin的标准做法，如default settings, 事件转化，`$.proxy`这些。
然后看到调用sortable时，发生了如下几件事：
1. `this`的`touchstart`事件被代理到`Sortable.prototype.start`上。
2. `dragging.start(this, e.currentTarget, e)`，交给Dragging类处理。
   Dragging类首先由事件e计算`origin.x, origin.y, offset.x, offset.y, origin.scrollX, origin.scrollY`。
   然后把`mousemove touchmove`代理给`Dragging.prototype.move`
3. `Dragging.prototype.move`经过复杂的计算，算出了offsetX, offsetY，然后`transform: translate(offsetX, offsetY)`

# 一些细节
1. translate, translateZ与translate3d: translateZ(tz) === translate3d(0,0,tz)
2. 