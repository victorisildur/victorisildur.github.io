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