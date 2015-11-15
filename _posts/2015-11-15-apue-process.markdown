---
layout: post
title: "unix环境高级编程5: 进程"
date: 2015-11-15 23:32:00
categories: os
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

