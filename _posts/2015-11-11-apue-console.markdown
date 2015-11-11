---
layout: post
title: "unix环境高级编程4: 设备控制"
date: 2015-11-11 14:17:00
categories: os
---

看完了普通文件系统，接下来看设备。

## 终端是什么

`ls /dev`一下，最后一列是中断，ttysd, ttyse等都代表中断。
很多用户输入都来自终端。传统中断是键盘和显示单元。
但telnet或ssh窗口也可以认为是一个终端。

#磁盘连接的属性

系统调用open用于在进程和磁盘文件之间创建一个连接。
磁盘链接有两个特殊属性：缓冲、自动添加模式。

系统调用open用于在进程和磁盘文件之间创建一个连接。
进程和中断间的连接看起来很简单。
用`getchar()`和`putchar()`就能在终端和进程间传输字节。

然而，实际上这个模型是不完整的。
`getchar()`在输入回车之后才会有反应。
这说明设备文件描述符和进程之间必定有一个处理层：

1. 进程在用户输入return后才接收数据
2. 进程将用户输入的return看做换行符
3. 进程发送换行符，终端接收到回车+换行

这中间夹的一层叫做终端驱动程序或tty驱动程序（tty是指teletype公司的老式打印终端）。
还记得我们的more程序吗？我们用`tcsetattr()`设置了`termios->c_lflags`里的一些位。

`stty`就是查看中断驱动程序的命令。发现了什么？里面有lflags内容！
tty驱动程序包含很多对传入数据所进行的操作，分为4类：

1. 输入：驱动如何处理从终端来的字符
2. 输出：驱动如何处理流向终端的字符
3. 控制：字符如何被表示：位的个数、位的奇偶性、停止位
4. 本地：驱动如何处理来自驱动内部的字符

```c
struct termios org_opts, new_opts;
tcgetattr(STDIN_FILENO, &org_opts);
memcpy(&new_opts, &org_opts, sizeof(new_opts));
new_opts.c_lflag &= ~(ICANON | ECHO);         // c_lflag: control mode flags
tcsetattr(STDIN_FILENO, TCSANOW, &new_opts);  // TCSANOW: 立即更新驱动程序设置
```

so, 到不同设备的连接，属性集不同。
磁盘连接的属性则是诸如O_SYNC, O_APPEND这样的属性。
程序员如何查看和控制一个设备的设置呢？

系统调用ioctl提供对连接到fd的设备驱动的属性和操作的访问。
每种类型的设备都有自己的属性集合ioctl操作集。
我们试试用ioctl显示屏幕的尺寸：

```c
#include <sys/ioctl.h>
void print_screen_dimensions()
{
    struct winsize wbuf;
    if ( ioctl(0,TIOCGWINSZ,&wbuf) != -1 )   
    /* TIOCGWINSZ是request代号。
     * 定义在sys/ioctl.h中。
     */
    {
        printf("%d rows x %d cols\n", wbuf.ws_row, wbuf.ws_col);
        printf("%d wide x %d tall\n", wbuf.ws_xpixel, wbuf.ws_ypixel);
    }
}
```

## 为用户编程：终端控制和信号

