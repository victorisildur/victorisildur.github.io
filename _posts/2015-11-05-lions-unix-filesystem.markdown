---
layout: post
title: "莱昂式unix源码阅读4: file system"
date: 2015-11-05 22:33:00
categories: os
---

#构成

*目录：一坨文件，维护着文件的逻辑名称。通过`namei()`我们可以获得文件名->inode
*文件：进程拥有的东西。
*inode：硬盘几个块的抽象。可以多个文件link到一个inode。
inode由(devno, ino)唯一标示。

#文件的物理位置

这块书上写的不是很清楚，是bmap的内容，这里详细讲一下。
inode使用i_addr[8]数组来记录文件的物理块号。

1. 对小文件（块数<=8块），i_addr数组直接存放文件占用的物理块号。
2. 对大文件。
前七个块是间接块。每个块里存了256个真实块地址。所以最大256*7=1792块。
i_addr[7]是双层间接块。又多了256*256块。

`bmap(ip, bn)`将逻辑块号转化为物理块号。
什么是逻辑块呢？
其实就是文件长度按512字节分成逻辑上的连续块号。

所以`bmap()`的核心语句就是：

```c
6447  nb = ip->i_addr[bn];

6472  bp = bread(d, nb);  //拿到的是一个buffer指针，读到内存啦
6473  bap = bp->b_addr;   //内核态地址

6496  i = bn & 0377;      //bn在节间block中的偏移量
6497  if((nb=bap[i]) == 0 ...)  //bap[bn]，即 (*ip->i_addr[bn])[i]
                                //nb最终是间接block中存储的一个physic block地址
```

`bmap()`其他代码是用来处理双层间接和物理地址不存在，要“写”的情况。

#pathname到inode的转换

`namei()`函数，
主要难点在于如何递归地取目录文件，读目录文件的一个entry。
再由这个entry找下一个目录文件。
还有，entry存的是什么？inode编号？

这块代码还没仔细看。
