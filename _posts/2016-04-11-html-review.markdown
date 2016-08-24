---
layout: post
title: "html细节汇总"
date: 2016-04-11 17:27:00
categories: programming
excerpt: html细节辑录
---

## base标签

一般地，a标签里的href是相对于当前文档的，用了base标签后就对此修正了。
语法如下：

```html
<base href="xx.com/xxx"/>
```

## application cache

网关里url参数经常变动，导致html被多份缓存。
想知道有没有办法html强制不要去缓存，在这个回答里发现不可以，一定会被缓存：[html5-cache-manifest-no-cache-for-html-file-itself](http://stackoverflow.com/questions/5045782/html5-cache-manifest-no-cache-for-html-file-itself)。

## svg path

path 的d属性是一长串命令的组合，Move To, Line To, Arc To。
由此可以方便的声明任意形状。
Path也是SVG中最强大的元素。

我们来看下命令怎么用，命令首先分大小写。
大写命令后跟绝对坐标、小写命令后跟相对坐标。
主要几种命令：

* Move to: `M x y`, `m dx dy`
* Line to: `L x y`, `l dx dy`
* Horizontal Line: `H x`, `h dx`
* Vertical Line: `V y`, `v dy`
* Close Path: `Z`, `z`
* Cubic Bezier Curve: `C x1 y1, x2 y2, x y`, `c dx1 dy1, dx2 dy2, dx dy`.
三次贝塞尔曲线。
这里起始点是不需要说明的，起始点就是path现在到达的坐标。
(x,y)是终止点，(x1,y1)(x2,y2)是中间两个control point。
* Extend Cubic Bezier Curve: `S x2 y2, x y`, `s dx2 dy2, dx dy`.
这里第一个control point也不用声明了，默认为上一个C或S的control point的倒影。
* Quadratic Bezier Curve: `Q x1 y1, x y`, `q dx1 dy1, dx dy`.
二次贝塞尔曲线。
(x1, y1)是control point, (x,y)是终止点。
* Extend Quadratic Bezier Curve: `T x y`, `t dx dy`.
这里control point也不用声明了，默认为上一个Q或T的control point的倒影。
* Arc: `A rx ry x-axis-rotation large-arc-flag sweep-flag x y`.
给定两点，连接两点椭圆的rx ry，有2个椭圆可以连接这两点。
每个椭圆上又有两条路可走。
因此，large-arc-flag: arc走过的角度是否大于180度。
sweep-flag: arc是角度正方向移动or负方向移动。
这里角度正方向有点坑的，是顺时针，和平时坐标系里的正角度不同。
