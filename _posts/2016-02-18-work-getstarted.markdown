---
layout: post
title: "work: get started"
date: 2016-02-18 08:27:00
categories: programming
excerpt: 工作笔记，工作细节与经验辑录
---

## 工具链

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

## 调试

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

## js问题
`document.write()`如果是在embedded script里写，则不会调用`document.open()`，这个open是会清空文档的。

## css问题

rem在padding中计算不准，要绕一下. 
字会比理想的小，不要用padding算，以ceiling过的rem为准，用line-height确保总大小无偏差。
网上一篇讲rem已死的，主要意思是现在reference pixel流行，浏览器也支持了device pixel ratio，所以为了media query精确，没必要用rem。

实际项目中，rem确实有问题，但是测量方便。所有大小都和屏幕宽度成正比，包括宽度！
这种情况下，用px就比较难搞，你该如何表示(高=屏幕宽*0.1)呢？
很难不是吗。

font-size >12px时，width: 10rem是可以正确衡量的。

图片如何压缩? gulp-imagemin! 0-7种优化层次，随你选。

backgrond-size 100%相对于什么？？

display: list-item; 
box-sizing: border-box; 用border计算宽高，与content-box相对。

## ps技巧

仅当前可见：alt点击眼睛
复制选框内所有图层：ctrl + shift + c， 然后ctrl+n就是可见区域大小拉！
组移到最上面： ctrl + shift + ]

## 性能问题

1. 进入子设备页，loading很久: js内联，依赖onload事件
2. 操作子设备，中间态很久: 后台问题
3. 灯挂掉: x5内核canvas有适配性问题，小米4上渲染不出来

## uin
cookie里有时候是没有的，这个不可依赖！

cookie作用域*.qq.com，这个是native webview里限制的。所以Fiddler映射的时候不能乱来。

## device.js
里面有个验证，device的exports有个`/(qq\.com)/.test(location.hostname)`的逻辑，所以发到测试环境所有device接口都不能用。

## webpack

# webpack css-split
这个要解决的问题是style-loader插入style的方式太慢了，也不能利用到缓存。
但同时我们又希望分模块require不同的css。
如何js里看来css是分模块的，加载起来却是打包好的css和js并行加载？

webpack ExtractTextPlugin解决如下：

```javascript
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    module: {
        loaders: [
	    { test: /\.css$/,
	      loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
	    }
	]
    },
    plugins: [
        new ExtractTextPlugin('style.css')
    ]
}
```

这样，所有`require('base.css')`之类的css引用都被打包到`style.css`里。

# webpack lib split

外部依赖库是不经常动的，不应被每次打包进bundle里，对此第一反应是multiple entry:

```javascript
module.exports = {
  entry: {
    main: './index.js',
    vendor: 'moment'
  },
  output: {
    filename: '[chunkhash].[name].js',
    path: __dirname
  }
}
```

这样本意是把lib单独打到一个vendor.js里，首先报错：`a dependency to an entry point is not all allowed`.

这是个webpack的奇怪issue: [https://github.com/webpack/webpack/issues/300](https://github.com/webpack/webpack/issues/300)

解决后moment库既被打包进了1adsf3azasdf.vendor.js, 也被打包进了a123a23c1il34cx.main.js.

对此web提供了CommonsChunkPlugin:

```javascript
module.exports = {
  entry: {
    main: './index.js',
    vendor: 'moment'
  },
  output: {
    filename: '[chunkhash].[name].js',
    path: __dirname
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor'
    })
  ]
}
```

这里webpack用jsonp包了下vendor，保证main chunk一定能调用到vendor chunk，这里实现细节还不清楚，暂且不表。
另外注意只这样配置，你会发现改了业务逻辑后，vendor hash还是变了，这是因为chunk里包含了webpack的运行时代码。
需要CommonsChunkPlugin里把manifest加上:

```javascript
new webpack.optimize.CommonsChunkPlugin({
  names: ['vendor', 'manifest']
})
```

现在，外部库、应用逻辑、webpack运行时代码被分离打包了, 但还存在一个问题：chunk名是带hash的，名字一长串，html里怎么引用呢？

`webpack --json`会输出一个Json文件，其中assetsByChunkName表明了chunkfile的全名。

# webpack ddl

webpack编译太慢了？ external是一种思路，ddl是另一种。

dll的思路是，把webpack不去分析库文件，只把库文件拼在一起，并标上ID，同时输出一个manifest.json，说明module name -> id的映射关系。

应用代码要引用库里的模块时，只依赖manifest.json，这样依赖dll只需一次编译，优于CommonsChunkPlugin!

基于这个思路编译是两步走的，第一步编译ddl:

```javascript
module.exports = {
  output: {
    path: './lib',
    filename: '[hash].[name].js',
    library: '[name]_[hash]',
    libraryTarget: 'var'
  },
  entry: {
    dll: ['react', 'react-dom', 'react-router', 'react-addons-css-transition-group']
  },
  plugins: [
    new webpack.DllPlugin({
      path: './manifest.json',
      name: '[name]_[hash]',
      context: __dirname
    })
  ]
}
```

第一步输出了`lib/d3s1u2b2.dll.js`和`manifest.json`。
第二步利用`manifest.json`编译业务代码：

```javascript
module.exports = {
  entry: './index.js',
  output: {filename: './index.bundle.js', path: __dirname},
  plugins: [
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require('./manifest.json'),
      sourceType: 'var'
    })
  ]
}
```
