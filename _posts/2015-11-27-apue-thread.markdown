---
layout: post
title: "unix环境高级编程8: 多线程"
date: 2015-11-27 09:30:00
categories: os
---

##一些语法

#声明指针，是否分配空间？

```c
struct arg_set * mailbox;
```

不分配！


#pthread_cond_wait()为什么要有lock参数？
我们先看看函数原型：

```c
int pthread_cond_wait(pthread_cond_t * cond, pthread_mutex_t * mutex);
int pthread_cond_signal(pthread_cond_t * cond);
```

pthread_cond_wait使线程挂起，知道另一个线程通过条件变量发出消息。
它先自动释放锁，然后等待条件变量的变化。
如果调用pthread_cond_wait前锁没有锁住，执行结果不确定。
wait返回后，锁被重新锁上。

pthread_cond_signal通过条件变量cond发消息。若没有线程等待消息，什么都不会发生。
若有多个线程等待，只唤醒他们中的一个。

## 多线程统计文件字数

关键在于一个锁和一个条件变量。
锁用来保证只有一个counter能通知计数中心自己数好了。
条件变量用来通知计数中心有人数好了，也用来通知counter你可以存了。

看代码吧：[words counter](https://github.com/victorisildur/UNIX/blob/master/APUE/thread/vote1.c)

## 多线程web server

先要了解独立进程（detached threads）。
迄今为止，我们所有的线程在create之后，都要在main里面join它。
就像malloc之后要free一样。

然而，web server不需要线程返回，因为原线程不需要从子线程得到任何数据。
独立线程就很好，他会在自己执行结束后自动释放资源。
配置方法就靠`pthread_create()`的第二个参数：

```c
pthread_t t;
pthread_attr_t     attr_detached;
pthread_attr_init(&attr_detached)
pthread_attr_setdetached(&attr_detached, PTHREAD_CREATE_DETACHED);

pthread_create(&t, &attr_detached, func, arg);
```

代码太长，就不写了，简单概括就是每次accept之后，创建一个独立线程去处理它。

## 多线程动画

我们考虑这样一个动画，用户输入n个单词，我们把它们画在n行上，单词在自己的一行上不断bounce。
按照事件编程一章的思路，使用定时器引发handler，handler负责绘图。
主循环负责按键检测。

现在有了多线程，我们可以给每个单词分配一个线程！
线程负责自己单词的绘制。

代码如下：[animation](https://github.com/victorisildur/UNIX/blob/master/APUE/thread/tanimate1.c)

注意，这个版本的代码是有问题的，因为主线程和子线程都有可能修改变量dir，最好给dir也上锁。

