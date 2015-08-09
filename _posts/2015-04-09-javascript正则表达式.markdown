---
layout: post
title: "2015-04-09-javascript正则表达式"
date: 2015-04-09 05:32:17
categories: 
---
#引子
遇到的问题：
```javascript
// 希望字符串格式：
"io":1 , "cpu":2 , "mem":3 ,
// 可接受的字符串格式：
"io":1 , "cpu":2 , "mem":3
```
我们希望检测到第二种格式，然后偷偷的在最后加一个逗号就好。
我的代码：
```javascript
var vrRegx = /^("[a-zA-Z0-9]+":[0-9]+,)+(\s*"[a-zA-Z0-9_\-+]+"\s*:\s*[0-9]+\s*)?$/;
    var vrPattern = function(str) {
        console.debug( 'str: ' + str );
        console.debug( vrRegx.exec(str) );
    };
```
返回的数组总是没有第一项
```javascript
"io" : 1
```
待解决！