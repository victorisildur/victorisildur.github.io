---
layout: post
title: 2015-04-01-angularjs源码阅读
date: 2015-04-01 05:28:54
categories:
---
#compile到底干了些什么？
##书上是怎么写的
\$compile指令会遍历dom树并搜集它找到的所有指令，然后将这些指令的链接函数合并为单一的链接函数。
然后这个链接函数会将 *编译好的模板* 链接到$rootScope中去
```javascript
function compile($compileNodes,transcludeFn,...){
	//$compileNodes是JQuery的Node对象Array
	var compositeLinkFn = compileNodes($compileNodes,transcludeFn,$compileNodes..)
}

function compileNodes(nodeList,transcludeFn,$rootElement,...){
	
}
```