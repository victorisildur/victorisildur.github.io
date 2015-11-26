---
layout: post
title: "unix环境高级编程7: server、socket"
date: 2015-11-25 21:22:00
categories: os
---

## 进程间通信

1. 两个管道。管道是单向的，打开两个管道，能确保coroutine（协同进程）工作。
2. popen。popen运行了一个进程，返回指向该程序标准输入或输出的连接。
这有什么卵用呢？我们来看个例子：

```c
#include <stdlib.h>

int main()
{
    FILE *fp;
    char buf[100];
    int i = 0;
    
    fp = popen("who|sort","r");
    while (fgets(buf, 100, fp) != NULL)
        printf("%3d %s", i++, buf);
    pclose(fp);
    return 0;
}
```

这个popen是怎么实现的？有什么卵用呢？

其实现其实就是搞一个子进程去`exec("/bin/sh","-c",cmd,NULL)`，这样就执行了任意shell命令如例子中的`who|sort`.
返回的文件描述符是父进程与子进程之间的管道。
具体是父到子的管道，还是子到父的管道，那就要看popen的第二个参数是r还是w了。
父进程把这个文件返回给main函数，然后就完成任务。

so...popen就是一种从进程获得数据的方法。
与之对应的是fopen，从文件获取数据；以及从函数获取数据。

## socket: 连接远端进程

管道是的进程间通信就像在读写文件，但他有两个缺陷。一，管道通过fork贡献，所以只能连接相关的进程。二，同样因为上面的理由，它只能连接同一台机器的进程。

# 服务器端

socket服务器的步骤我们比较熟悉，就是bind->listen->accept->rw->close。

写个时间服务器的例子 [time server](https://github.com/victorisildur/UNIX/blob/master/APUE/socket/timeserver1.c)

# 客户端

流程建立socket->connet->read->打印->close. 例子：[time client](https://github.com/victorisildur/UNIX/blob/master/APUE/socket/timeclient1.c)

