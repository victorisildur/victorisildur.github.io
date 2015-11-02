---
layout: post
title: "莱昂式unix源码阅读2: 硬中断与trap"
date: 2015-11-02 09:26:00
categories: os
---

#clock中断

细节比较多，暂时没什么想写的，就是注意栈的操作，保证rtt之后能恢复中断前的sp和PS。

#trap

trap与call基本公用的同一段代码。处理过程在trap.c里.
dev（通常是PS低5位）是最重要的参数，它指明了trap是前状态是核心态否，是trap指令调用的trap()否。

然后对sys call执行sys call对应处理过程（在sys1.c里)。
对非trap指令引发的陷入，发signal.

常用的syscall有exec，fork等。

#signal

每个进程的ppda区中有一个整形数组`u.u_signal`，长度为NSIG(UNIX中为20).
每一项对应一个不同类型的软件中断，定义了遇到此种软件中断时应采取的动作。
值为0代表进程将终止，奇数代表忽略，偶数为用户空间中某个过程的起始地址。

在proc结构中有`char p_sig`项，将其值设为0 ~ NSIG-1的值，就会造成一个中断。

软件中断处理函数，需要内核协助。
内核帮忙设置好用户态栈，使得`rtt`回来之后执行的第一条指令恰是处理函数起始地址。

//好多种软件中断啊。。。看不完。。