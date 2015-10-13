---
layout: post
title: "修改booksim源码，实现loadaware broadcast"
date: 2015-10-12 20:38:00
categories: os
---

## booksim干嘛的

做注包率试验！

它仿真具体的路由器结构，比较偏硬件层。我们要做的就是想办法把loadaware广播算法移植过来，跑数据出来！

## routefunc

/src/routefunc.cc下有个Map，里面定义了config文件里routing_func = dor 被映射成哪个路由函数

## 不懂的地方

我现在想打印一下router的output buffer，但是不知道怎么打印。特么的这玩意儿文档太少了
