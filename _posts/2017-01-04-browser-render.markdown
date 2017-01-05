----
layout: post
title: "浏览器渲染原理与动画"
date: 2017-01-04 08:51:00
categories: programming
excerpt: "Layout层->Paint层->Graphic层，理解为何动画卡顿。Createjs，css动画对比"
---

## 浏览器渲染流程

# 工欲善其事, 必先利其器

* Layers Panel查看PaintLayer, CompositeLayer
  1. `chrome://flags`打开`enable-devtools-experiments`
  2. 开发者工具->settings->experiments->Layers panel
* 页面上直接看CompositeLayer边界
  1. 开发者工具->more tools->rendering->layer borders
* 页面上实时看repaint区域
  1. 开发者工具->more tools->rendering->Paint Flashing

# 具体流程

这篇的总结的很好，理论部分就交给它了：[http://taobaofed.org/blog/2016/04/25/performance-composite](http://taobaofed.org/blog/2016/04/25/performance-composite/)

简单总结：

1. 渲染有三步：
  1. Layout, 生成LayoutObject组成的树，LayoutObject描述了dom元素的大小、位置
  2. Paint, 生成PaintLayer组成的树，PaintLayer聚合了同一stack context上的LayoutObjects, 描述了如何对LayoutObjects进行像素填充
  3. Composite，生成GraphicLayer组成的树，GraphicLayer聚合了符合特定条件的PaintLayers，又叫合成层，描述了GPU看到的层是怎样的
2. 优化思路：
  1. 动画元素单另成一个合成层，可减少主线程开销. css3 animation, transition效果平滑内在原因就是新建了合成层。[http://km.oa.com/group/26246/articles/show/265989?kmref=search&from_page=1&no=6](http://km.oa.com/group/26246/articles/show/265989?kmref=search&from_page=1&no=6)
  2. 合成层不宜过多，浪费渲染资源[http://km.oa.com/group/TGideas/articles/show/262915](http://km.oa.com/group/TGideas/articles/show/262915)

看不到优化思路外链的骚蕊了，内网限制 :(

ps，想要看官方文档，不想看二手货，请移步chromium.org: [https://www.chromium.org/developers/design-documents](https://www.chromium.org/developers/design-documents)

## Hilo

Hilo有canvas, webgl, dom三种模式，Hilo的DomElement模式管理Dom元素，本质上是用n多层合成层分离3d transform的元素。

# Render Dom

我们来看个甩鞭子的例子: [https://github.com/victorisildur/hilo-demos](https://github.com/victorisildur/hilo-demos) 

打开Layers面板观察，每个小盒子都是一个合成层，而且从不触发重绘。
同时Element观察，每个小盒子的运动是css transform translate3d属性不断变化控制的，而不是animate完成的，这里可能会问了，what? 
是Tween.to里靠js定期修改了transform属性麽？这会不会省了paint环节，但增了style环节？

看下timeline，确实如此：

![timeline]({{site.url}}/assets/images/hilo_tween_render.png)

有了直观印象，我们来看Tween是如何缓动DomElement的：





