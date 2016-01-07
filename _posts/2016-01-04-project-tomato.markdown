---
layout: post
title: "tomato项目: get started"
date: 2016-01-04 08:51:00
categories: programming
---

## 什么是tomato项目

一个Hybrid App，目的是量化你的努力，在成为专家的1万小时路上走的更远。

另外，也能帮我理解技术现状:)

## what

核心：定时提醒吃番茄啦，记录你吃番茄的数量，并得到别人的反馈

组成：

<table>
    <thead>
        <tr>
            <th>功能</th>
            <th>实现</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>提醒吃番茄</td>
            <td>native</td>
        </tr>
        <tr>
            <td>记录番茄树</td>
            <td>native</td>
        </tr>
        <tr>
            <td>我的番茄历史</td>
            <td>web</td>
        </tr>
        <tr>
            <td>评论别人的番茄</td>
            <td>web</td>
        </tr>
    </tbody>
</table>


## how

现在Digital Ocean的服务器已经搞出来了，本周目标是把web部分先搞出来，web部分的要求是：

1. 移动优先的
2. 渐进增强的
3. like 原生的

具体组成部分有：

1. 我的番茄历史
2. 看别人的番茄
3. 评价别人的番茄

<table>
<thead>
     <tr><th>时间</th>
         <th>工作内容</th></tr>
</thead>
<tbody>
<tr><td>前半周(0104~0106)</td>
    <td>本地node服务器，JQM写页面，然后搬到do上</td>
</tr>
<tr><td>后半周(0107~0109)</td>
    <td>设计表结构，动态化，绑域名，dns</td>
</tr>
<tr><td>下周</td>
    <td>native部分</td>
</tr>
</tbody>
</table>

## 开工

# express

现在用jade模板了！看了下新特性有：更简语法，block继承，方便的控制语句

# Jquery Mobile

主要特性：渐进增强，RWD，ajax页面加载

# 技术路线

我的番茄历史页面，主页是以天为单位的统计，点进去是以番茄为单位的具体统计

## Digital Ocean配置

2天时间把jqm写了个大概，没有美工感觉好丑，也没做流量优化。
今天想把流量优化做一下，所以要配一下namecheap的域名，能域名访问过去。
这中间涉及几个概念：a record, cname, url redirection

* aname: name到ip的映射
* cname: web1.aa.com, web2.aa.com都映射到一台机器, name到name的映射, 只有该name没有其他record时才会用到cname
* alias: 中文不知道对应什么，也是name到name，和cname的区别是可以与其他record共存
* url redirection: 返回http 301

好了，现在[isildur.me](http://isildur.me)可以访问了。