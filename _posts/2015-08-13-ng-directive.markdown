---
layout: post
title: "angular js自定义directive与集成jquery插件"
date: 2015-08-13 19:26:00
categories: javascript
---
#需求
1. 页面需要一个datetime-picker，而angular ui只有date picker和time picker。希望有个像jquery-datetimepicker那样的angular实现。

2. 页面需要一个长得像iphone一样的switch，同样希望能在angular中用。

#思路
必须自己写angular的directive！

先不讲概念，看下直观效果

datetimepicker:
![datetimepicker]({{ site.url }}/assets/images/datetimepicker.png)

toggle-switch:
![toggle-switch]({{ site.url }}/assets/images/toggle-switch.png)

其中datetimepicker直接复用了jquery的datetimepicker插件，只是做了angularjs的ngModel接入。主要用到的directive概念：

compile, pre link, post link

toggle-switch全部自己写起，主要用到的directive概念：

$formatter, $parser, $viewChangeListeners, $render

#实现