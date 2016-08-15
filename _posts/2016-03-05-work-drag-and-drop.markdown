---
layout: post
title: "touch-dnd源码阅读"
date: 2016-03-05 08:27:00
categories: programming
excerpt: touch-dnd实现的真好，sortable, draggable, droppable实现细节
---

# touch-dnd是什么
是一个绕开html 5 draggable api，自己实现drag-and-drop, sortable的zepto插件。
用了下发现非常好用，但用在自己项目里存在z-index问题。
所以一定要好好看看源码。

# 实现思路
首先是jquery plugin的标准做法，如default settings, 事件转化，`$.proxy`这些。
然后看到调用sortable时，发生了如下几件事：

1. `this`的`touchstart`事件被代理到`Sortable.prototype.start`上。
2. `dragging.start(this, e.currentTarget, e)`，交给Dragging类处理。
   Dragging类首先由事件e计算`origin.x, origin.y, offset.x, offset.y, origin.scrollX, origin.scrollY`。
   然后把`mousemove touchmove`代理给`Dragging.prototype.move`
3. `Dragging.prototype.move`经过复杂的计算，算出了offsetX, offsetY，然后`transform: translate(offsetX, offsetY)`

想要实现swap时的trasition，该如何做？
源码中可以知道：

1. `Dragging.prototype.move()`计算出offsetX, offsetY后，用`document.elementFromPoint()`获取拖曳目标位置的原有节点over。
当`over!=last && currentTarget!=lastEntered`，就认为是enter一个原有节点啦！
随后发`dragging:enter`事件。
1. 发生`dragging:enter`事件，`Sortable.prototype.enter()`判断`isContainer`，然后掉`Sortable.prototype.diverted()`
2. `Dragging.adjustPlacement()`中，this.handle是clone的draggble节点，把this.handle平移过去（去哪儿？）。
这个应该是去直接平移到目标位置用的。
3. 好像完全没有swap的动画啊，dragging element被删除掉之后，其后的元素会自然而然的补上空，因为它们都是float:left的。

# 一些细节
1. translate, translateZ与translate3d: translateZ(tz) === translate3d(0,0,tz)
2. drag态返回normal态，要destroy掉sortable，否则再次进入drag态会报重复绑定错误
3. 不能重复destroy sortable，这个靠`prevState !== newState`实现

# 不明白的地方
1. .card position:relative之后z-index才生效。
> mdn: z-index only has an effect if an element is positioned
注意，position+z-index会建立新的stacking context哦。
在全部不声明z-index的情况下，stack顺序如下：
    1. root元素的background, border
    2. normal flow的元素
    3. positioned元素
2. background复合写法UC不支持。
3. overflow:hidden的元素必须有position。
> mdn: container must either have a bounding height or white-space: nowrap
之所以产生这个感觉是误解，因为父元素不给position，svg会absolute到下面去，那overflow就失效了。
父元素给position, svg部分在父元素内。
4. svg的viewbox和width,height的关系. width,height是"物理面积"，viewBox是"逻辑面积"。
问题在于1600:100的逻辑面积，物理面积200%: 30%按说没有问题，但实际出来被压缩了。
5. enter, leave, divert, drop的职责还是没有分清。马蛋还要再看！

# css操蛋细节
1. background-size在qq浏览器上失效：不知道什么鬼，暂时解不了