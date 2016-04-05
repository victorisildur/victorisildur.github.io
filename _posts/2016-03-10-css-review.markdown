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

## text-shadow
对p无效，对h有效？why?

# 模块化

## SMACSS


# 雪碧图
今天打算用一下雪碧图，compass的方案，其好处是不用手动去拼雪碧图，计算position。
坏处是sass的，现在还不清楚怎么和less结合。
而且定位怎么用rem表示也不知道。

先装起来看看。

```css
@import "compass/utilities/sprites";    // 加载compass sprites模块
@import "share/*.png";                    // 导入share目录下所有png图片
@include all-share-sprites;                // 输出所有的雪碧图css
```

这三句之后，会输出`stylesheets/share.css`。
其中的backgroud-position都是以px为单位的。
接下来要考虑和background-size的关系！ 
