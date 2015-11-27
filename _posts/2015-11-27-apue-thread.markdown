---
layout: post
title: "unix环境高级编程8: thread、IPC"
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