---
layout: post
title:  "How to migrate blogs from CSDN" 
date:   2015-07-09 10:02:00
categories: nodejs
---
因为涉及CSDN，所以用中文

从1月份其开始大量写csdn，其markdown编辑器挺好用，可惜生成出的页面并没有人看

转换csdn blog最终是要取到blog的markdown格式，打开csdn的markdown编辑页面，发现获取原blog内容的请求为：

http://write.blog.csdn.net/mdeditor/getArticle?id=11111111&user_name=aaaaaa

返回结果是一个json

所以，只要知道了blog_id, 就能拼出url抓下来。

接下来考虑如何获取我所有blog的id, 基本想法是去博客列表页面，因为点列表中一项的时候，会跳转到对应博客，所以猜想html中应该包含了id信息。

看一下列表页的html，发现包含id的语句长得像这样：

{% hightlight html %}
lifen class="link_title"><a href="/vctisildur/article/details/46778265">^M
        nodejs使用中遇到的问题            ^M
        </a>
{% endhighlight%}

直观的看，用个正则就能搞定

所以最后步骤为：

1. get列表页

2. 过滤列表页所有行，保留能匹配 /href=.*\/article\/details\/(\d+)/ 的行

3. map过滤后的行，保留(\d+)

4. reduce id array，去重

这样就得到了所有博客id

最后按id拼url去抓markdown内容就好啦

所有源码:

[csdn-convert code][csdn-convert]

[csdn-convert]:   https://github.com/victorisildur/javascript/tree/master/convert-csdn
