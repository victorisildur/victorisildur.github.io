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



# 模块化

## SMACSS

Scalable and Modular Architecture CSS，目的是让css模块化，使样式也符合DRY原则。
它把样式分为如下五类：

* base rules:   无论元素在页面哪里，都应该遵循的原则
* layout rules: 分割页面的"布局"，它是module的容器
* module rules: 模块，如sidebar, callout, product list
* state rules:  layout/module在不同"状态"下的样式
* theme rules:  主题，不同主题下layout和module的样子

命名规则：
* layout: 用l- grid-之类的前缀
* state:  用is-hidden, is-前缀
* module: 普通命名，注意子类采用相同前缀

模块的一些注意：
1. 模块尽量不要用element，这样对html结构的依赖就太大了
2. 选择器不要嵌套太深，越深就越难修改
3. 子类的概念，一般用`nav nav-inverted`之类的

# inline-block
空格也会算成间隔！所以inline-block的时候，两个inline-block元素中间不要有空格！

# transition
移动端，对transform进行transition会出bug，响应严重滞后。但是对margin-right一类的进行transition，又会不平滑，非常蛋疼。

进一步测试发现，chrome上是可以的，uc和qq浏览器都反映巨慢无比，而且这和timing-function是linear还是ease，transition-property是all还是transform无关。

km上的方案是，要重新运行animate，用setTimeout法，把任务立马插入队列。这里需要深究为什么！！！

```javascript
window.setTimeout(function(){
    elem.addClass('swiping-left')
}, 0);
```

再用插入队列的方案，用transition做动画，发现uc里完全不支持transition: transform，qq支持，但是经常卡死，完全不能用。

# LESS

## @var与@{var}

variable用作value时，写作@var；用作property name, selector name等时，写作@{var}

# input底部色条动画
思路是input:focus时，将其背景大小从0变100%，
背景位置center。
然后给background设transition，这样背景色条就会从中间向两边慢慢扩散。

```css
.bg {
    background-image: linear-gradient(#62a8ea, #62a8ea), linear-gradient(#e4eaec, #e4eaec);
    background-size: 0 2px, 100% 1px;
}
.bg:focus {
    background-size: 100% 2px, 100% 1px;
}
```

# 高分屏适配
x5不支持`<meta name="viewport" content="initial-scale=0.5"/>`的计算，导致只能回到原来的做法。
公式为：

```javascript
var rootFontSize = document.clientWidth / 10;
```

```css
.px2rem (@name, @px) {
    @{name}: @px / 75 * 1px;
}

.px2px (@name, @px) {
    @{name}: round(@px / 2) * 1px;
}
```

px到rem的推导相对简单，px到px的除以2是因为设计稿宽750，而设备无关像素是375，所以测量值要除以2.

# flex失效问题
x5遇到的另一个问题是flex失效，暂时不清楚是什么原因造成的。

```css
.flex {
    display: -webkit-flex;
    -webkit-flex-direction: row;
}
```

weinre看了，就是不认flex，目测和tbs1.4版本关系，未经验证。
最后是用float + 33.3333%解决的。

# 高分屏1px边框解决

思路是搞个1px的background，然后background为linear-gradient渐变，渐变时50%是有颜色的，50%是透明的。

代码如下：

