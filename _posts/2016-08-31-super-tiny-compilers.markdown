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

太累了，明天补完



