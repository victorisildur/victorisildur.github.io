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

3. 为什么要用`bzero()`清空struct

```c
struct sockaddr_in * sap;
bzero(sap, sizeof(*sap)); 
```

好吧，暂时想不到其他方法。

4. `size_t`是什么？

`size_t`是`sizeof()`的返回类型。
一般是unsigned int。
我们写点简单代码来验证下：

```c
int main()
{
    int intvar, *ptr_intvar;
    char charvar, *ptr_charvar;
    struct st {
        int a;
        char *b;
    };

    struct st stvar;
    struct st * ptr_stvar;
    printf("%d\n", sizeof(intvar));      //4
    printf("%d\n", sizeof(ptr_intvar));  //8
    printf("%d\n", sizeof(charvar));     //1
    printf("%d\n", sizeof(ptr_charvar)); //8
    printf("%d\n", sizeof(stvar));       //16
    printf("%d\n", sizeof(ptr_stvar));   //8
}
```

可以看到，凡是指针，大小都为8（64位系统）。
int,char之类的基本类型返回字节数。
结构体返回结构体各成员sizeof之和。

5. 为什么要`htonl()`,`ntohl()`,`htons()`,`ntohs()`一系列方法？

网络字节序用的是big endian。也就是我们易读的那种。
而host machine的字节序取决于cpu。所以要转一下。
我们可以验证下自己mac上用的是大端还是小端：

```c
#include <arpa/inet.h>
int main()
{
    int a = 16;
    printf("%d --> ", a);      // 16              00,00,00,00, 00,00,00,10
    printf("%d", htonl(a));    // 268435456       10,00,00,00, 00,00,00,00
}
```

诺，是小端。所以转换下还是很必要地。

## 技巧6：记住，TCP是流！

`read(sd, len)`是看不到边界的！
请求读len也可能只读到一部分！

对此，我们需要两个工具：
1. `readn(sd, *bp, len)`，读取定长字符。读不满就一直循环的读。
2. 自定义packet。
在packet头部包含packet长度信息。
这样我们就能基于readn开发readvrec。
每次读一个变长packet!

## 技巧9：TCP是可靠的，但不是绝对可靠

这里主要讨论了peer意外崩溃的各种情况。
具体要看TCP状态机了。在TCP/IP详解里有，留待以后补上。

好吧，不看协议，技巧10理解不了。先把协议看掉再说。