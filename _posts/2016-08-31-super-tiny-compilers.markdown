---
layout: post
title: "Super Tiny Compiler"
date: 2016-08-31 08:27:00
categories: programming
excerpt: "jsx, sass, 到处都是编译器变体在工作"
---

## 200行的编译器

目标：把lisp风格的语法编译成c风格。像这样：

| Lisp                   |  c                    |
| ---------------------- | --------------------- |
| (add 2 2)              | add(2, 2)             |
| (add 2 (subtract 4 2)) | add(2, subtract(4,2)) |

## Parser: 词法分析 + 句法分析

词法分析(lexical analysis)就是tokenizer(lexer).
句法分析(syntactic analysis)就是生产AST.

对于`(add 2 (subtract 4 2))`Parser生产出的token大概是这样：

```javascript
[
{type: 'paren',  value: '('},
{type: 'name',   value: 'add'},
{type: 'number', value: '2'},
{type: 'paren',  value: '('},
{type: 'name',   value: 'subtract'},
{type: 'number', value: '4'},
{type: 'number', value: '2'},
{type: 'paren',  value: ')'},
{type: 'paren',  value: ')'}
]
```

句法分析生成的AST长这样：

```javascript
{
    type: 'Program',
    body: [
	{
	    type: 'CallExpression',
	    name: 'add',
	    params: [
		{
		    type: 'NumberLiteral',
		    value: '2'
		},
		{
		    type: 'CallExpression',
		    name: 'subtract',
		    params: [
			{
			    type: 'NumberLiteral',
			    value: '4'
			},
			{
			    type: 'NumberLiteral',
			    value: '2'
			}
		    ]
		}
	    ]
	}
    ]
}
```

## Transformation

我们可以在AST node上CRUD属性，或者CRUD节点。
这里我们要transform到c-like语法，所以是重新构建一个AST.

转化时，我们首先遍历AST，这里采用dfs，前序的。
对转化AST来说，visiting每个node就足够了。
我们用一个visitor对象来做这件事：

```javascript
var visitor = {
    NumberLiteral(node, parent) {}
    CallExpression(node, parent) {}
}
```

## tokenizer的实现

一个个char读进来，判断是否是空格、数字、name、括号，然后响应的转成token加到数组里就可以了。
我的实现版本：[tokenizer](https://github.com/victorisildur/super-tiny-compiler/blob/master/src/tokenizer.js)

比较简单，具体就不写了。

## parser的实现

parser是递归实现的，重点在于遇到了name类型的token，其param是对后面的token递归得到的。
重点代码如下：

```javascript
if (token.type === 'paren' && token.value === '(') {
   token = tokens[++current];
   node.type = 'CallExpression';
   node.name = token.value;
   while (token.type !== 'paren' || token.type !== ')') {
      node.params.push(walk());
      token = tokens[current];
   }
}
```

实际实现时，我们的递归写的更清晰些，详见[parser.js](https://github.com/victorisildur/super-tiny-compiler/blob/master/src/parser.js)

这里主要注意的是一个body里是要有多个expression的，所以walk返回的顶层node也是多个，顶层应这样调用`walk()`:

```javascript
    let curr = 0,
	node = null,
	ast = {
	    type: 'Program',
	    body: []
	};
    // a program body may consists of mutiple CallExpressions
    while (curr < tokens.length) {
	({curr, node} = walk(tokens, curr));
	ast.body.push(node);
    }
    return ast;
```

这里`({curr, node} = walk(tokens, curr))`的写法是解构语法在已定义过的变量(curr已经定义过了)时的写法。
