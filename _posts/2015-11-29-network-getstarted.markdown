---
layout: post
title: "unix网络编程1: 基本框架"
date: 2015-11-29 21:47:00
categories: network
---

## 初衷

计算机网络学了总觉得没感觉，知道了TCP, CIDR，RIP, BGP, ARP之后又怎样呢？还不是只管ajax一下。
了解最深无非是tornado响应请求的时候看一下转码问题，还是无法解决长连接断掉这样的bug。

修炼内功啊，年轻人！

## 基本框架

unix内核提供了`socket()`, `connect()`, `listen()`, `accept()`, `send()`, `recv()`一系列系统调用。
然而只是会写最简单的tcp程序，这太挫了，但也是没办法的事。
一点点来吧。

先看几个语言上的问题：

1. `gethostbyname()`是如何实现的？定义在`netdb.h`里，它首先查找本地数据库`/etc/hosts`，找不到的话去查dns服务器。
返回`hostent`结构体：

```c
struct  hostent {
    char    *h_name;        /* official name of host */
    char    **h_aliases;    /* alias list */
    int     h_addrtype;     /* host address type */
    int     h_length;       /* length of address */
    char    **h_addr_list;  /* list of addresses from name server */
};
#define h_addr  h_addr_list[0]  /* address, for backward compatibility */

/* 我们用到的地方 */
hp = gethostbyname(hname);
..
sap->sin_addr = *(struct in_addr *) hp->h_addr;
```

好吧，这里又遇到问题，`in_addr`是个什么结构？

```c
struct in_addr {
    in_addr_t s_addr;
};
typedef __uint32_t      in_addr_t;
```

所以这里是把char[]转unit_32了。验证程序在这里：

2. `getservbyname()`如何实现的？

```c
/* 函数原型 */
struct servent * getservbyname(const char*name, const char *proto);
struct  servent {
    char    *s_name;        /* official name of service */
    char    **s_aliases;    /* alias list */
    int     s_port;         /* port service resides at */
    char    *s_proto;       /* protocol to use */
};
```

这个函数就是给定服务名（如domain）和协议名（如udp），返回服务端口之类的。
查找表保存在`/etc/services`里。