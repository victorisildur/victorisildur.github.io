---
layout: post
title: "unix网络编程3: 网络编程学习目标"
date: 2015-12-06 22:23:00
categories: network
---

TCP/IP详解，UNIX网络编程都看不下去，转而先看网络编程程序员的经验之谈：
网络编程的组成，以及学习重点。
希望接下来的学习能更高效。

## 为什么学习网络编程

职业上：物联网部门你不会TCP/IP合适吗！？ 搞web只知道HTTP合适吗？

## 一些要了解的事

1. 网络编程主要在trouble shooting方面，不要搞socket API，都用库或框架，你用不到的
2. 网络编程起支撑作用，不占主导。主导是业务逻辑。另，瓶颈可能是网络，也可能是CPU、Disk IO、数据库。这要求对所在领域要了解够深，明白各个因素的tradeoff
3. 协议设计是网络编程的核心！

## TCP/IP详解协议篇

1. 连接的建立、断开
2. 正确性的保证（ack）
2. 窗口协议，保证发的够快
3. 拥塞协议，保证发的不是太快
4. 超时、重传
5. keep-alive，检测半打开连接

## 不懂的

1. 长连接是什么？
2. http与tcp/ip

长连接就是建立连接之后不断掉，用一个连接发所有数据。
短连接就是发完一点数据就关掉连接，要发送新数据，就开新连接。

根据网上的说法，http的多个文件用的是短连接？这个要确认下！

## ping

好久没更新博客了，优点迷茫，知道看了蜜蜂和排球的比喻，人啊，还是一次专注做一件事的好！

今天的目标是Digital Ocean搞一搞，毕竟student pack在那儿，结果上不了digital ocean，
浏览器提示error connection，这必须搞清为啥啊，毕竟shadowsock是能上google的。

工具呢是ping和traceroute，怎么用我也不知，所以要仔细看看。

## 计划

12.27 - 1.2 第一周Mobile Web APP

* Digital Ocean上搞好
* 读head first mobile web和<动态html参考和开发应用大全>
* 兼容iOS,Android浏览器和手Q内嵌WebView

1.3 - 1.9 第二周Android Native

* Android Native找个好教程
* 天气？wishing well?
