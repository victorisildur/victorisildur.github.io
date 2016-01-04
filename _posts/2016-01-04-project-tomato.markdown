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