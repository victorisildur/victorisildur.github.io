---
layout: post
title: "从html上写ng-model，到$digest循环调用$$watchers之间发生了什么"
date: 2015-08-14 17:18:30
categories: javascript
---

## 目标
1. 搞清楚$digest循环时调用的$$watchers是哪里来的

## 简单结论
当dom ready后发生了这么几件事：
1. AngularInit() 拿到ng-app名

2. bootstrap() 生成 injector

3. injector实例化$rootScope, $rootElement, $compile, $injector.

4. $compile(element)

最后一步$compile中，又分如下几步：

1. 遍历dom树

2. 找ng-开头的directive的节点

3. 执行directive的compile, pre link, post link函数

4. 组合prelink postlink函数，如果post link中有 $scope.watch(expr, listener)的话，就把listener加到$scope[expr].$$watchers中去

5. 因为angular对input元素内置的post link函数是会在listener中改dom，也会监听dom的值改scope, 所以:

scope值变化 --> $$watcher中的listener改dom; 
dom值变化   --> $scope变化

至此，双向绑定完成！
