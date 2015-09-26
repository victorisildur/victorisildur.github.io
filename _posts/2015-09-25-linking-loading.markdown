---
layout: post
title: "连接与加载"
date: 2015-09-25 20:16:00
categories: os
---

## c++ #include引发的疑问

学了os, 学了编译原理，然而还是不知道为什么出现undefined symbol，不知道头文件干什么的

## 静态连接

符号表！a.c --> a.o, b.c --> b.o. 其中a.o引用了b.o中的变量/函数，那么汇编层面是怎么找到的呢？

其实就是靠编译原理中的符号表，a.o的符号表中会显示一项未定义的符号，b.o的符号表中有同一项

连接时，symbol resolve会解决未定义符号问题，重定位会解决汇编层面的相对地址，绝对地址问题

## 动态连接

要获得动态链接的直观印象，我们首先看下连接好之后，虚拟地址中都有哪些映射内容

例程非常简单，搞一个打印函数作为动态库lib.so:

```c
/* lib.c */
#include <stdio.h>
void foobar(int i) {
     printf("printing from lib.so %d\n", i);
     sleep(-1); //挂起，为了看内存分配
}
/* lib.h */
#ifndef LIB_H
#define LIB_H
void foobar(int i);
#endif
/* program1.c */
#include "lib.h"
int main() {
    foobar(1);
    return 0;
}
```

先编译so:

gcc -fPIC -shared -o lib.so lib.c

再编译连接program1.c 和 lib.so:

gcc -o program1 program1.c ./lib.so

运行起program1:

./program1 &

查看内存分配：

cat /proc/1234/maps

可以看到，相比静态链接出来的可执行文件，地址空间里多了点东西，

7fe0 6004 b000 - 7fe0 6004 c000  只读段/lib/x86-64-linux-gnu/ld-2.15.so
7fe0 6004 c000 - 7fe0 6004 e000  读写段/lib/x86-64-linux-gnu/ld-2.15.so

这个ld.so就是动态链接程序了，它负责在运行时动态的把动态库链接进来。

这个链接程序是谁指定的呢？其实是program这个elf的.interp段决定的。

objdump -s program 看一下：

.interp段的内容就是/lib64/ld-linux-x86-64.so.2

去看一下，发现是个软连，连到/lib/x86_64-linux-gnu/ld-2.15.so

## 加载

只有静态连接的可执行文件，加载比较简单，execv，进入内核态，初始化进程空间，页表映射好，pc映射到可执行文件入口

然后回到用户态，开始执行机器码啦

## 未解决问题

动态连接！got没有看懂，也是比较抽象

