---
layout: post
title: 2015-04-16-javascript 表格非空判断
date: 2015-04-16 02:28:27
categories:
---
#引子
jquery自带的
```html
<input required>
```
非常好用，但是只能在一个form里做非空校验

如果我们想用js对任何元素及其子元素做非空校验，该怎么办呢？

#attr
我们借鉴required方式，给我们想要非空的元素加
```html
<element i-require>
```
然后用jquery的attr方法判断即可！
```javascript
$(element).attr('i-require') !== undefined
```

#深度优先遍历算法
```javascript
var checkNoneEmpty = function( element ) {
        if( ! (element instanceof jQuery) ) {
            element = $(element);
        }
        if( element.attr('i-require') !== undefined ) {
            var value = element.val();
            if( ! value ) {
                return false;
            }
        }
        if( element.children().length > 0 ) {
            var has_empty = false;
            element.children().each( function( index , child ) {
                if( checkNoneEmpty(child) === false ) {
                    has_empty = true;
                    return false;
                }
            });
            if( has_empty ) {
                return false;
            }
        }
        return true;
    };
```