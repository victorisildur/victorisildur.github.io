---
layout: post
title: "莱昂式unix源码阅读5: 低速io设备"
date: 2015-11-07 08:49:00
categories: os
---

低速io设备是指速度小于1000字符/s。
这一块莱昂式直接陷入细节去讲了，导致完全没看懂。

# 字符设备
device switch结构数组记录了所有字符设备。
v6用它来操控设备。

```c
4635:
struct cdevsw {
    int (*d_open)();
    int (*d_close)();
    int (*d_read)();
    int (*d_write)();
    int (*d_sgtty)();
} cdevsw[];
```

`cdevsw[]`数组记录整个系统的字符设备配置信息，在v6里，共有5种有效地字符设备。

```c
4669:
int (*cdevsw[])() {
    &klopen,  &klclose, &klread, &klwrite, &klsgtty,  /*console*/
    &pcopen,  &pcclose, &pcread, &pcwrite, &pcsgtty,  /*pc*/
    &lpopen,  &lpclose, &lpread, &lpwrite, &lpsgtty,  /*lp*/
    &nulldev, &nulldev, &mmread, &mmwrite, &nodev,    /*mem*/
    &nulldev, &nulldev, &rkread, &rkwrite, &nodev,    /*rk*/
}
```

我们知道，unix将设备当做文件。对设备，其inode中记录了：
1. i_addr[0].d_major即设备号
2. i_mode & IFMT为设备类型，对字符设备而言，该值为IFCHR

在openi函数中，我们其实已经接触过设备文件的代码：

```c
6710:
maj = rip->i_addr[0].d_major;
switch(rip->i_mode & IFMT) {
    ...
    case IFCHR:
        if(maj >= nchrdev)
            goto bad;
        (*cdevsw[maj].d_open)(dev,rw);
    ...
)
}
```

读写操作中，也有类似的过程。代码分别在readi(6221)和writei(6276)中。
几乎一摸一样。

# 缓冲区
和块设备一样，字符设备的输入输出也是靠缓冲区做到的。
以缓冲区为界，函数可分为高低两个层次。底层负责与实际设备交互。高层函数只与缓冲区打交道。

字符缓冲区有两个结构,cblock和clist。
系统共有NCLIST个缓冲区资源。`struct cblock cfree[NCLIST]`

clist是字符链表的头结点。而cfreelist是空闲cblock链表的头。
`cinit()`函数(8234)使用头插法建立cfreelist链表。

getc和putc函数用来从缓冲区链表中get核put char。这是汇编写的。

# 交互式终端

v6采用dl11/kl11终端。它拥有4个设备寄存器，接收两组，发送两组。

```c
8016
struct klregs {
    int klrcsr; //接收状态寄存器
    int klrbuf; //接收数据缓存寄存器
    int kltcsr; //发送状态寄存器
    int kltbuf; //发送数据缓存寄存器
}
```

寄存器内容我们简单列一下，好有点直观概念：

1. 接收状态寄存器
   * 0位：阅读器使能
   * 1位：数据终端准备就绪
   * 6位：接收器中断允许
   * 7位：接收器完成
2. 接收器数据缓存寄存器
   * 0~7位：接收到的字符，只读
   * 15位：设置时表示已出错

v6里PDP11就一个终端console。其设备寄存器的起始地址为KLADDR:

```c
8008  #define KLADDR 0177560
```

console的中断矢量地址是060（用于接收寄存器），064（用于发送寄存器）。
其中断处理程序分别是klrint, klxint

# tty
无论使用哪一种硬件借口，每个终端端口都会有一个tty型结构与其相关联：

```c
8015: struct tty kl11[NKL11+NDL11]
```

前面说过，inode中的i_addr[0].d_major记录的是设备号，
那么，i_addr[0].d_minor记录的就是该端口在这个kl11数组里的下标。

minor号还有一个作用是用来计算该端口的设备寄存器的起始地址：

```c
8039: (klopen)
addr = KLADDR + 8*dev.d_minor
```

```c
7926
struct tty {
    struct clist t_rawq;  //input chars right off device
    struct clist t_canq;  //input chars after erase and kill
    struct clist t_outq;  //output list to device
    int t_flags;
    int *t_addr           //device address
    
    char t_delct;         //number of delimiters in raw q
    char t_col;           //
    char t_erase;         //erase character
    char t_kill;          //kill character
    char t_state;         //internal state

    char t_char;          //temp char
    int  t_speed;     
    int  t_dev;           //device name
}
```

tty有三个队列：

1. 原始输入队列t_rawq
2. "加工后"的输入队列t_canq
3. 输出队列t_outq

加工其实就是把退格键考虑进去了的队列。
比如cakr退格e，加工后就只剩cake

tty的设置，开关暂时不管，反之无非是对寄存器操作下而已。
我主要关心read,write

#read过程

当用户在设备上按键后，会引发一个接收中断，其处理流程如下：
klin -> klrint -> ttyinput

```c
8355: (ttyinput)
//ttyinput的这一句将设备传入的字符放入raw队列。
putc(c, &t_rawq); 
//唤醒对raw感兴趣的进程。或者输入了换行，则唤醒所有进程
if(t_flags&RAW || c=='\n' || c=004) {
    wakeup(&tp->t_rawq);
    ...
}
```

#write过程
进程通过cdevsw[].d_write进程输出：
klwrite -> ttwrite -> ttyoutput -> ttstart

```c
8558: (ttwrite::atp)
tp = atp; // tty结构指针
while((c=cpass()) >= 0) {
    spl5();
    ....
    spl0();
    ttyoutput(c,tp)
}
ttstart(tp);
```

过程就是通过cpass取得用户空间的输出字符，然后通过ttyoutput将其放入输出队列。
最后，调用ttstart启动输出。

ttyoutput把字符放入输出队列

```c
8477: ttyoutput(ac, tp)
if(c)
    putc(c|0200, &rtp->t_outq);
```

ttstart启动设备，讲一个字符输出出去。

```c
8520: ttstart
if( (c=getc(&tp_outq) >= 0) {
    if (c<=0177)
        addr->tttbuf = c | (partab[c] & 0200);
        ...
}
```

设备发送这个字符成功后，会引起一个发送中断，表明自己已经可以接收下一个字符了。

```c
8070:   klxint(dev)
register struct tty *tp;
tp = &kl11[dev.d_minor];
ttstart(tp);
if(tp->outq.c_cc == 0 || tp->t_outq.c_cc == TTLOWAT)
    wakeup(&tp->t_outq);
```

可见klxint讲再次调用ttstart以接收下一个字符。