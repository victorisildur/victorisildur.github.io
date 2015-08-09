---
layout: post
title: "2015-06-24-epoll的io异步模型与tornado的关系"
date: 2015-06-24 09:25:32
categories: os
---
# 初衷
TORNADO IOLOOP: A level-triggered I/O loop.
```python
def connection_ready(sock, fd, events):
    while True:
        try:
            connection, address = sock.accept()
        except socket.error as e:
            if e.args[0] not in (errno.EWOULDBLOCK, errno.EAGAIN):
                raise
            return
        connection.setblocking(0)
        handle_connection(connection, address)

if __name__ == '__main__':
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM, 0)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.setblocking(0)
    sock.bind(("", port))
    sock.listen(128)

    io_loop = tornado.ioloop.IOLoop.current()
    callback = functools.partial(connection_ready, sock)
    io_loop.add_handler(sock.fileno(), callback, io_loop.READ)
    io_loop.start()
```


# epoll
简单理解，普通socket, while(1) 拿到connectSocket之后要死等connectSocket.recv
而epoll去监听 serverSocketFd 的 epollin 事件
发生时，回调 serverSocket.accept
监听connectSockect 的 epollin 事件，发生时，回调connectSocket.recv，然后做对应操作

类比银行，顾客就是connectSockect, fd写入就是排到队了
前者就是顾客不停的去看排没排到队
后者就是顾客排到队，柜台会喊顾客

参考文档： [epoll](http://blog.csdn.net/xiajun07061225/article/details/9250579)

# IOLoop.add_callback()
??
