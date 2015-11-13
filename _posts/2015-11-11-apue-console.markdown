---
layout: post
title: "unix环境高级编程4: 设备控制与事件驱动编程"
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

用户应该如何应对signal? 我们看个例子就知：

```c
#include <signal.h>
main()
{
    void f(int);
    int i;
    signal(SIGINT,f);
    for(i=0; i<5; i++) {
        printf("hello\n");
        sleep(1);
    }
}
void f(int signum)
{
    printf("Ouch!\n");
}
```

忽略信号呢？`signal(SIGINT, SIG_IGN)`就好！
unix中信号有16种，都在`signal.h`中定义。KILL,QUIT,INT等都有。

## 事件驱动编程

# pong

就是用一个挡板反弹小球，小时候比诺基亚更早的时代，手机上往往有这个游戏。
（我你妹学unix就是越学月回去的过程。。。）

图形上，我们就在tty上做，25*80，呵呵，激动吧。这其实是有库的，叫curses。
其主要函数有move,addstr,addch,clear,standout,standend.

其实就是每秒变换位置画string，例子在这里：[pong string game](https://github.com/victorisildur/UNIX/blob/master/APUE/game/pong_str.c)

这个简单地例子只能1s刷新一次，这是`sleep()`带来的限制。
我们需要更精确的时间控制：alarms。
sleep的内部是由alarm做的，其步骤为：

1. 为SIGALRM设置一个处理函数
2. 调用`alarm(num_seconds)`
3. 调用`pause`，这个sys call挂起进程，直到信号到达。注意是任何信号。

额，其实这个只是解释了下sleep的内部，精度1s的问题还是没有解决。
后来，unix退出interval timer的概念，有更高的精度。
每个进程都有3个独立的计时器，而不是原来的一个。
计时器有两个设置：初始间隔、重复间隔。
函数为nsleep，单位是微秒。

三种计时器分别是：

1. ITIMER_REAL. 不管核心态还是用户态用了多少处理器时间，它都记录。
当它定时时间到，发送SIGALRM信号。
2. ITIMER_VIRTUAL. 只记录用户态运行时。
发送SIGVTALRM信号。
3. ITIMER_PROF
发送SIFPROF信号。

间隔计时器的例子见这里：[ticker demo](https://github.com/victorisildur/UNIX/blob/master/APUE/game/ticker_demo.c)

第二个问题是多种信号同时到来会怎样？堵塞？排队？还是忽略？
我们可以通过例程看一下：[multi signal demo]()

我们可以得出结论：

1. 处理函数不用每次重置。
处理函数被调用后仍起作用。我们设置一次处理函数就行了。
2. 后来的信号会打断前面的信号。
连续按`ctrl+c`和`ctrl+\`，会发现inthandler之后紧接着quithandler，然后回到Inthandler，最后回到main
3. SIGX阻塞SIGX。连续按两次`ctrl+c`，会发现第二次会被阻塞住。
如果疯狂地按，有些被阻塞的SIGX会被忽略。
4. 被中断的syscall。
如果我们正在read的时候，按下`ctrl+c`会怎样？
amazing! 之前输入的字符没有了！

so,还是挺多细节的。不好搞啊。

POSIX搞了个改进版的信号库，以应对多信号时的种种竞争情况。
我们从其设置信号handler的结构器看看它有哪些东西：

```c
struct  sigaction {
    union __sigaction_u __sigaction_u;  /* signal handler */
    sigset_t sa_mask;               /* signal mask to apply */
    int     sa_flags;               /* see signal options below */
};

union __sigaction_u {
    void    (*__sa_handler)(int);    /* SIG_DFL, SIG_IGN, or function*/
    void    (*__sa_sigaction)(int, struct __siginfo *, void *); /*new handler*/
};
```

可以看到，`__sa_sigaction()`参数有`__siginfo`，它就给了我们关于信号更多一些的信息。
如何告诉内核我们要用新的信号处理方式呢？设置`sa_flags`的`SA_SIGINFO`位就行了。
至于sa_mask和sa_flags，设置比较简单：

1. sa_flags有四个位：SA_RESETHAND设置是否“捕鼠器”模式。
SA_NODEFER。是否关闭信号自动阻塞。
SA_RESTART。不太明白。
SA_SIGINFO。指明用sa_handler韩式sa_sigaction
2. sa_mask: 决定是否阻塞其他信号。

例子很简单，我们赶时间，就不写了。

# 临界区问题

想写个游戏的前置问题真是多啊。。

一段代码，如果在运行时被打断讲导致数据的损毁，则称这段代码为临界区。
想要保护临界区？阻塞信号就好！
代码如下：

```c
sigset_t sigs, prevsigs;
sigemptyset(&sigs);
sigaddset(&sigs, SIGINT);
sigaddset(&sigs, SIGQUIT);
sigprocmask(SIG_BLOCK, &sigs, &prevsigs);
/*阻塞了，可以操作临界区了*/
//blabla...
sigprocmask(SIG_SET, *prevsigs, NULL);
```

我们的挡板游戏中有什么临界区呢？

代码如下：[1d bounce game](https://github.com/victorisildur/UNIX/blob/master/APUE/game/bounce1d.c)