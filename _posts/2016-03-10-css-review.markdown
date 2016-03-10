---
layout: post
title: "css细节汇总"
date: 2016-03-10 08:27:00
categories: programming
---

# Text

## 不换行，省略号

```css
white-space: normal|nowrap|pre|pre-wrap|pre-line;
/* nowrap: 不换行, normal: 合并空行空格，换行, pre-wrap: 保留空行空格 */
word-break: normal|keep-all|break-all;
/* break-all: 任意字母之间可以断掉换行 */
text-overflow: clip|ellipsis;

//正确写法：
text-overflow: ellipsis;
overflow: hidden;
white-space: no-wrap;
```
