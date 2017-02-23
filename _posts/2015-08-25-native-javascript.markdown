---
layout: post
title: "原生javascript知识补全"
date: 2015-08-25 18:06:00
categories: javascript
---

# 初衷

面试网易，发现在事件处理上，对原生javascript掌握不够

# 事件

触发自定义事件:

```javascript
var event = new Event('build');
elem.addEventListener('build', function() {
    //todo
});
elem.dispatchEvent(event);
/* 更高级点的自定义事件 */
var event2 = new CustomEvent('build', {detail:'this is detail info'});
function eventHandler(e) {
    /* 其实就是给event对象上多绑了点属性  */
    console.log(e.detail);
}
```

触发原生事件:

```javascript
var event = new MouseEvent('click', {
    'view': window,
    'bubbles': true,
    'cancelable': true
  });
elem.dispatchEvent(event);
```

# Element类

## 判断节点tag

```javascript
    elem.tagName; // 'A', 'P', 'BUTTON'
    elem.nodeName; // 'A', 'P', 'BUTTON'
```

Element类的实例是有tagName属性的，Node是Element的父类，所以nodeName适用性更广。

# 字符编码

## 由encodeURI()引申开

为什么要encodeURI()呢？ 因为虽然所有网络协议都要支持UTF-8编码，但url,uri又是只能ASCII编码的，那么uri里有超出256的字符怎么办？

答案是把他们编成`%FF`这样的，每个`%FF`代表一个字节。

类似的，base64也只接受ASCII编码的字符串，所以`btoa()`前要先`encodeURI()`。

## 底层编码

Unicode字符集为4字节字符集，UTF-8, UTF-16, UTF-32都是其编码方法。
BOM是放在文件头，告诉UTF-16/UTF-32决定大小端的依据。

因为Unicode字符集是4字节，所以其总字符数，即（code point数）为`2^32`.
这么大的字符空间，现在被分为17个位面(plane)，每个位面含`2^16`个code point。

显然，17个位面只是总字符集的子集。大概暂时是够用的吧。
Anyway，位面编码空间为`xy0000`到`xyFFFF`，`xy`是位面号，从`00`到`10`正好17个。

BMP就是第0个位面，编码空间为`000000`到`00FFFF`。
全称Basic Multilingual Plane, 基础多语言位面，涵盖了大多数语言的字符。
剩下16个位面因为用的少，被称为星云层。

javascript engine按ECMA标准，可使用UCS-2或UTF-16编码。

UCS-2是定长的。总是2字节长。
UTF-16是变长的，对BMP字符，2字节正好够。
对于星云层的字符，UTF-16使用Surrogate pair进行编码。

比如，`u1D306`被编码成`0xD834 0xDF06`.
前2个字节是high surrogate。范围`0xD800`到`0xDBFF`，即`2^10`范围。
后2个字节是low surrogate。范围`0xDC00`到`0xDFFF`，即`2^10`范围。
合起来就有`2^20`范围，正好是16个位面的表示范围。
具体转换是线性变换，公式`C = (H - 0xD800) * 0x400 + L - 0xDC00 + 0x10000`.

语言上，我们应认为javascript是Unicode字符集的，UCS-2编码的。
对中文来讲，大多数中午字符都能2字节搞定。
比如，'我'==='\u6211'.

但对星云层的字符，如`u1D306`，js会按UTF-16进行四字节编码，但仍认为是2个code point。

当然，es6将修复这些问题。方法如下：

```javascript
let symbol = '\u{1d306}'
String.fromCodePoint(); //从unicode code point返回对应字符
String.prototype.codePointAt(); //从unicode字符返回code point
String.prototype.at(); //返回指定位置字符
```

## encodeURI encodeURIComponent

encodeURI会把`= ? ; , @ & + $`这些字符留着不编码，因为这些是URI的保留字符。
encodeURIComponent则统统编码。

escape, unescape是encodeURICompnent, decodeURIComponent的废弃版本。
区别在于escape会把unicode字符编成`%u6211`，而encodeURI会编成`%E6%88%91`.

简单的说，不要在任何情况下使用escape就是了。
encodeURI生成的是utf8编码。
utf8是前缀码，变长，一般来说中文2-4字节。



