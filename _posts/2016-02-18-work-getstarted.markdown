---
layout: post
title: "work: get started"
date: 2016-01-31 08:27:00
categories: programming
---

# 工具链

grunt进行自动化工作，包括：

* include replace
* less
* auto prefixer
* transport seajs（提取模块中的依赖，并为每个模块设置模块id）

好吧，智能网关项目工具链变了，靠的是open-builder + less，open-builder是自己写的jar，用来@insert和PreTmpl，less用来生成css。
这里面的主要问题是openbuilder是个黑箱，insert语法非常烂，而且tmpl语法不透明。
insert的良好替代是grunt-include-replace，tmpl的良好替代是angular/react。

关于tmpl要深入查看，现在的数据相当于是写死的，tmpl渲染的是sceneArray，得到TMPL.SCENE，然后用js渲染进去。
对项目后期来说，这种渲染方式性能上应该是优的，代码会很简单，而且也是动态的。

现在，openbuilder基本确定是可以被替换掉的：

* tmpl => mustache
* less => less-loader
* compress => webpack.optimize.JsUglify
* insert => gulp-file-include `@@include语法很好用！`

由于压缩了Zeptojs，文件大小从129KB减小到了64KB。

# 调试

fiddler做proxy，手机设置proxy为本机，端口为fiddler端口，然后fiddler rule加一条

```java
if ( oSession.url.indexOf("qzs.qq.com/open/mobile/iot_nas") > -1 ) {
   oSession.url.Replace("qzs.qq.com/open/mobile/iot_nas", "lx.qq.com/build/iot_nas");
   // 这里lx.qq.com要在Host Remapping里定义，定义为本机ip
}
```

emacs reactangle string: `C-x r t`

emacs load path默认是`emacs_install_path/VERSION/site-lisp`和`emacs_install_path/site-lisp`。
想要加的话就：

```lisp
(add-to-list 'load-path "your package storage path")
```

web-mode非常吊，`C-c C-n`可以切换opening/closing tags.

# js问题
`document.write()`如果是在embedded script里写，则不会调用`document.open()`，这个open是会清空文档的。

# css问题

rem在padding中计算不准，要绕一下. 
字会比理想的小，不要用padding算，以ceiling过的rem为准，用line-height确保总大小无偏差。
网上一篇讲rem已死的，主要意思是现在reference pixel流行，浏览器也支持了device pixel ratio，所以为了media query精确，没必要用rem。

实际项目中，rem确实有问题，但是测量方便。所有大小都和屏幕宽度成正比，包括宽度！
这种情况下，用px就比较难搞，你该如何表示(高=屏幕宽*0.1)呢？
很难不是吗。

图片如何压缩? gulp-imagemin! 0-7种优化层次，随你选。
