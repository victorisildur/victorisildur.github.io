---
layout: post
title:  "web安全" 
date:   2017-07-04 10:02:00
categories: web-security
---

# xss

本身原理是构造带<script>的用户输入，如果php原样echo回页面，就中招了。

比较麻烦的是如何验这个问题，因为门神系统会拦掉非法请求，要同时配host和proxy。
结论是burp suite，在repeater->target里配host ip。在user options->socks proxy里配proxy
