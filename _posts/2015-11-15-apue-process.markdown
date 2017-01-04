---
layout: post
title: "unix环境高级编程5: 进程"
date: 2015-11-15 23:32:00
categories: os
excerpt: exec, fork, ctrl+c
---

## shell是如何实现的？

才想起来，用的就是exec系统调用咯。
其高层有多种实现，我们来写一个`execvp()`的实现：

```c
int main()
{
    char * arglist[3];
    arglist[0] = "ls";
    arglist[1] = "-l";
    arglist[2] = 0;
    printf("*** about to exec ls -l\n");
    execvp("ls", arglist);
    printf("*** ls is done.\n");
}
```

`execvp(const char * file, const char * argv[])`第一个参数是要执行的文件名。
文件在PATH环境变量所指定的目录中查找file。

# fork版本
上一个版本的问题在于程序只执行一次。
想要shell长存，就要采用fork方案。
fork本身比较简单，值得注意的点是主线程要等子线程结束。
wait的例子如下：[wait demo 01](https://github.com/victorisildur/UNIX/blob/master/APUE/process/waitdemo.c)

然后的思路就很直观了，不断地fgets读命令行参数，遇到回车后fork，主进程等子进程，然后再次读命令行参数。
子进程用execvp去执行相应地程序。

程序如下：[prompting shell 02](https://github.com/victorisildur/UNIX/blob/master/APUE/process/psh02.c)

# SIGINT信号？

没问题？那是你use case不够！如果在子进程执行的时候按下ctrl+c会怎样？
你会发现父进程被一起杀掉了！

思路是给父进程设置sigmask。子进程则不设。这个留作练习。

