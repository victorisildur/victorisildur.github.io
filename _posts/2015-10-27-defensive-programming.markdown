---
layout: post
title: "代码大全2: 防御性编程"
date: 2015-10-27 09:50:00
categories: methodology
---

## assert

assert就是编程珠玑里的断言，用来确认前置条件和后置条件的。

```c++
#define ASSERT( condition, message ) { \
    if ( !(condition) = {              \
        LogError( "assertion failed:", \
            #condition, message );     \
        exit( EXIT_FAILURE );          \
    }                                  \
}
```

当然，你也不能全依靠断言，系统总有理解能力之外的异常，鲁棒的代码应该既有断言也有异常处理。

nonono, assert用来处理never gonna happen的问题，异常用来处理预料之中的问题。

## exception

异常处理要注意抽象的一致性。类只应向上抛自己这一层抽象的异常，例：

```java
class Employee {
  public TaxId GetTexId() throws EOFException {
     // 很糟！EOF是下层的概念，不应被暴漏给上层。上层只应收到和employee有关的异常。
  }
}

class Employee {
  public TaxId GetTaxId() throws EmployeeDataNotAvailable {
     // good，上层能理解是employee数据不可用
  }
}
```

## barricade

船舱隔板一样的作用。或者像消毒室一样。
我们在internal class和external class之间搞一层专门做数据验证，对错误敏感的类。
曾经的RESTFUL类就是一个例子。

## debugging aids

开发的时候多搞点帮助debug的功能，比如一些附加按钮，提前发现问题总是好的！