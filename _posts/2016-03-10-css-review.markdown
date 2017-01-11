---
layout: post
title: "css细节汇总"
date: 2016-03-10 08:27:00
categories: programming
excerpt: css细节辑录
---

## Text

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

遇到一个tricky的问题：pre的white-space属性默认为`pre`, 对超长的一行不会换行，导致无法搞限宽pre. 要手动改pre-wrap才行。

这里注意`pre`与`pre-wrap`, `pre-line`的区别：`pre`只在源码里有换行时换行，`pre-wrap`保留空格、遇到边界也换行，`pre-line`合并空格、遇到边界也换行。

## text-shadow
对p无效，对h有效？why?



## 雪碧图

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



## 模块化

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

## inline-block
空格也会算成间隔！所以inline-block的时候，两个inline-block元素中间不要有空格！

## transition
移动端，对transform进行transition会出bug，响应严重滞后。但是对margin-right一类的进行transition，又会不平滑，非常蛋疼。

进一步测试发现，chrome上是可以的，uc和qq浏览器都反映巨慢无比，而且这和timing-function是linear还是ease，transition-property是all还是transform无关。

km上的方案是，要重新运行animate，用setTimeout法，把任务立马插入队列。这里需要深究为什么！！！

```javascript
window.setTimeout(function(){
    elem.addClass('swiping-left')
}, 0);
```

再用插入队列的方案，用transition做动画，发现uc里完全不支持transition: transform，qq支持，但是经常卡死，完全不能用。

## LESS

## @var与@{var}

variable用作value时，写作@var；用作property name, selector name等时，写作@{var}

## input底部色条动画
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

## 高分屏适配
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

## flex失效问题
x5遇到的另一个问题是flex失效，暂时不清楚是什么原因造成的。

```css
.flex {
    display: -webkit-flex;
    -webkit-flex-direction: row;
}
```

weinre看了，就是不认flex，目测和tbs1.4版本关系，未经验证。
最后是用float + 33.3333%解决的。

## 高分屏1px边框解决

思路是搞个1px的background，然后background为linear-gradient渐变，渐变时50%是有颜色的，50%是透明的。

代码如下：

```css
linear-gradient(180deg, @color, @color 50%, transparent 50%) top    left  / 100% 1px no-repeat,
linear-gradient(90deg,  @color, @color 50%, transparent 50%) top    right / 1px 100% no-repeat,
linear-gradient(0,      @color, @color 50%, transparent 50%) bottom right / 100% 1px no-repeat,
linear-gradient(-90deg, @color, @color 50%, transparent 50%) bottom left  / 1px 100% no-repeat;
```

后来发现x5内核对这个支持有问题，有些机子（vivo）会显示不出来。

然后用的是和QQ健康一样的解决方案，用after元素搞一个2倍大的1px边框，然后scale 0.5，从而得到0.5px。

代码如下：

```css
.border-scale(@top, @right, @bottom, @left) {
position: absolute;
top: 0;
left: 0;
display: block;

content: " ";
width: 200%;
height: 200%;
border-top: @top-border;
border-right: @right-border;
border-bottom: @bottom-border;
border-left: @left-border;

-webkit-transform:scale(.5);
-webkit-transform-origin: 0 0;
transform:scale(.5);
transform-origin: 0 0;
padding: 1px;
-webkit-box-sizing: border-box;
box-sizing: border-box;
pointer-events:none;
z-index: 0;
}
```

## line-height
line-height取值为百分比时，是相对于当前元素的font-size的，而且其默认值不是1，而是1.2或其他值（与font-family有关）。
经常要手动设置为100%，否则字高对不齐！

## position: absolute
现象：loading展示不出来。

结论：父元素下有两个absolute的子元素。
后一个子如果太大的话，会把前一个子覆盖掉。

## 长页面优化

页面很长时，滑动页面，会有很大的卡顿。
场景页还会出现定位元元素"漂移，体验非常糟。

这个没有搜到现成的解决方案，漂移问题通过反复试验发现，是一个父元素下同时有float元素和绝对定位元素，弃用这种写法就ok了.

滑动卡顿问题，仅出现在vivo和红米note上，联想的老机子都没问题。

StackOverflow威武！[android -webkit-overflow-scrolling](http://stackoverflow.com/questions/15906508/chrome-browser-for-android-no-longer-supports-webkit-overflow-scrolling-is-the)



## iOS页面滑动事件
iOS上，会必现整个页面下移，而不是期望的l-content(overflow-y: auto)下移。
原因不清楚，最后的解决是l-content设置为overflow-y: scroll; -webkit-overflow-scrolling: touch。
l-wrapper设置为overflow-y: auto。

其中，-webkit-overflow-scrolling是iOS特有的特性，iOS会创建原生控件UIScrollView的子类UIWebOverflowScrollView来加速。

## 安卓滚动条
html, body, l-wrapper的高度都是定死的，l-content是长页面，高度有限制。
l-content设置了overflow:scroll，但是l-content的滚动条出不来。

这个问题还不知道是什么造成的，kathy说要去掉外层的高度限制，试了试没成功。

## animation性能问题

animation: transform: translateX发现很卡，按原来理解transform应该很厉害才对。
这个后来发现是因为svg带了渐变就会很卡。

## 无限波浪

想要实现无限波浪，核心是结束的点和开始的点一样。
自己实现的时候，用两张图来轮转，补位的和前一个首尾相连。
但事实证明这样是不行的，因为这种依赖100%宽度。
而百分比是不准的。
samjinli提出的完美解决方案是用一张宽度2200px的图，自身滚到1/2处回原点。
这样的好处是px量的准，也不需要多放一张图。
实在厉害。

## css实现loading进度条

这里借用了svg stroke-dasharray 和 stroke-dashoffset属性。
详见博客[svg stroke](http://www.zhangxinxu.com/wordpress/2015/07/svg-circle-loading/)

实现过程中，iOS不支持`transform: matrix`。
对此用`transform rotate`代替，注意rotate的轴心是由`transform-origin`确定的，默认为`0px 0px 0px`。
所以，最终代码如下：

```html
<style>
 .dash-animate {
     animation: dash 60s linear;
 }
 @keyframes dash {
     to {
         stroke-dashoffset: 0;
     }
 }
</style>
<svg class="search-count-down-svg" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid" xmlns="http://www.w3.org/2000/svg">
    <g>
        <circle cx="100" cy="100" r="94" stroke-width="6" stroke="#D1D3D7" fill="none"></circle>
        <circle cx="100" cy="100" r="94" stroke-width="6" stroke="#00A5E0" fill="none"
                transform-origin="50% 50%" transform="rotate(-90deg)"
                stroke-dasharray="590.619" stroke-dashoffset="590.619"
                class="dash-animate"
                ></circle>
    </g>
</svg>
```

注意dasharray, dashoffset的值都取为2*PI*r，即往头部偏移一个周长，当60s后偏移为0，正好蓝色circle全部显示出来。

这个方案纯css实现，要想重新计时，hide >> show一下就好。

## postcss

@keyframes X5内核不认，一般来说就直接@-webkit-keyframes了，但grunt-autoprefixer可以自动补全，gulp应该也有类似的，但我还没弄。

## linear-gradient

用gulp-autoprefixer时发现的问题，要用to left这样的语法，left这样的语法已经被废弃。

## iOS禁用垂直方向滑动

```javascript
document.ontouchmove = function(evt) {
    evt.preventDefault();
}
```

详见这个thread [stackoverflow](http://stackoverflow.com/questions/7768269/ipad-safari-disable-scrolling-and-bounce-effect)

## width: 100%

遇到padding时候，padding不会算进100%里啊，100%一定要配合border-box用啊。

## animation-fill-mode

forwards: 设置对象状态为动画结束时的状态.

backwards: 设置对象状态为动画开始时的状态.

both: 设置对象状态为动画开始or结束时的状态.

## npm install淘宝源

加--registry命令可解。

`npm install xxx --save --registry=https://registry.npm.taobao.org`

## date input样式

去除默认样式：

```css
input [type='month'] {
    -webkit-appearance: none !important;
    background-color: transparent !important;
}
```

没什么用的写法：

```css
::webkit-datetime-edit-fields-wrapper {
    background-color: #fff !important;
}
::webkit-autofill {
    background-color: #fff !important;
}
```

## overflow-x失效

手Q上怎么搞overflow-x, important都不行。
`body {position: fixed;}`才成功了。
参考这个thread: [overflow-xhidden-doesnt-prevent-content-from-overflowing-in-mobile-browsers](http://stackoverflow.com/questions/14270084/overflow-xhidden-doesnt-prevent-content-from-overflowing-in-mobile-browsers)

这个BFC能解释吗？ 这种问题靠谷歌大法去解有点挫啊。

## flex兼容

```css
// -webkit-box是09年的写法
display: -webkit-flex;
display: -webkit-box;
display: flex;

// -webkit-box-align是09年的写法，纵向排列方式
-webkit-box-align: center;
-webkit-align-items: center;
align-items: center;

// -webkit-box-pack是09年的写法，横向排列方式
-webkit-box-pack: center;
-webkit-justify-content: center;
justify-content: center;
```

## 渐进增强图片

[slack.com](slack.com)的首页用了一张很大的图，但最开始是很糊的一张图，然后慢慢变清晰。
这个效果比直接放一张清晰大图，等它从上到下慢慢加载要好太多了！
这是怎么做到的呢？

css代码里有这样一行：

```css
background-image: url(...nasa-header-image.jpg), url(...nasa-header-image@tiny.jpg);
```

这是css3允许的mutiple backgrounds。
即定义多个背景，列表中的第一个背景在最上面，最后一个背景在最下面。

显然，这里低分辨率的图片放下面，高分辨率的图片放上面。
达到的效果就是低分辨率的图先展示出来，然后慢慢被高分辨的图从上到下覆盖。

## option direction

对`<select><option>`控件，如果想要实现文字靠右的效果，`text-align: right`是没有用的。
对此，要使用`direction: rtl`css属性，或者`<select dir="rtl">` html属性。

单纯这样会使'4*6'这样的字符串逆序，原因未知。
解决方法是对select元素和option元素使用不同的direction:

```css
select { direction: rtl; }
option { direction: ltr; }
```

## mix-blend-mode && background-blend-mode

设计师提了个这样的需求，要实现ps中的图层overlay效果：

![mix-blend-mode]({{site.url}}/asssets/images/overlay-effect.png)

这个实现依赖`mix-blend-mode`属性：它规定元素如何与其直接父元素、背景融合。

与此对应，还有一个`background-blend-mode`属性，它规定元素的background-image, background-color之间如何互相融合。
