---
layout: post
title: "谈Objective-C block的实现"
date: 2013-07-28 10:42
comments: true
categories: iOS
---

## 前言

[这里](http://blog.parse.com/2013/02/05/objective-c-blocks-quiz/) 有关于 block 的 5 道测试题，建议你阅读本文之前先做一下测试。

先介绍一下什么是闭包。在 wikipedia 上，[闭包的定义](http://en.wikipedia.org/wiki/Closure_(computer_science)) 是:

{% blockquote %}
In programming languages, a closure is a function or reference to a function together with a referencing environment—a table storing a reference to each of the non-local variables (also called free variables or upvalues) of that function.
{% endblockquote %}
   
翻译过来，闭包是一个函数（或指向函数的指针），再加上该函数执行的外部的上下文变量（有时候也称作自由变量）。

block 实际上就是 Objective-C 语言对于闭包的实现。
block 配合上 dispatch_queue，可以方便地实现简单的多线程编程和异步编程，关于这个，我之前写过一篇文章介绍：[《使用 GCD》](/2012/02/22/use-gcd/)。

本文主要介绍 Objective-C 语言的 block 在编译器中的实现方式。主要包括：

 1. block 的内部实现数据结构介绍
 2. block 的三种类型及其相关的内存管理方式
 3. block 如何通过 capture 变量来达到访问函数外的变量

<!-- more -->

## 实现方式

### 数据结构定义

block 的数据结构定义如下（图片来自 [这里](http://www.galloway.me.uk/2013/05/a-look-inside-blocks-episode-3-block-copy/))：

{% img /images/block-struct.jpg %}

对应的结构体定义如下：

``` objc
struct Block_descriptor {
    unsigned long int reserved;
    unsigned long int size;
    void (*copy)(void *dst, void *src);
    void (*dispose)(void *);
};

struct Block_layout {
    void *isa;
    int flags;
    int reserved;
    void (*invoke)(void *, ...);
    struct Block_descriptor *descriptor;
    /* Imported variables. */
};
```

通过该图，我们可以知道，一个 block 实例实际上由 6 部分构成：

 1. isa 指针，所有对象都有该指针，用于实现对象相关的功能。
 2. flags，用于按 bit 位表示一些 block 的附加信息，本文后面介绍 block copy 的实现代码可以看到对该变量的使用。
 3. reserved，保留变量。
 4. invoke，函数指针，指向具体的 block 实现的函数调用地址。
 5. descriptor， 表示该 block 的附加描述信息，主要是 size 大小，以及 copy 和 dispose 函数的指针。
 6. variables，capture 过来的变量，block 能够访问它外部的局部变量，就是因为将这些变量（或变量的地址）复制到了结构体中。

该数据结构和后面的 clang 分析出来的结构实际是一样的，不过仅是结构体的嵌套方式不一样。但这一点我一开始没有想明白，所以也给大家解释一下，如下 2 个结构体 SampleA 和 SampleB 在内存上是完全一样的，原因是结构体本身并不带有任何额外的附加信息。

``` c
struct SampleA {
    int a;
    int b;
    int c;
};

struct SampleB {
    int a;
    struct Part1 {
        int b;
    };
    struct Part2 {
        int c;
    };
};

```


在 Objective-C 语言中，一共有 3 种类型的 block：

 1. _NSConcreteGlobalBlock 全局的静态 block，不会访问任何外部变量。
 2. _NSConcreteStackBlock  保存在栈中的 block，当函数返回时会被销毁。
 3. _NSConcreteMallocBlock 保存在堆中的 block，当引用计数为 0 时会被销毁。

我们在下面会分别来查看它们各自的实现方式上的差别。

### 研究工具：clang

为了研究编译器是如何实现 block 的，我们需要使用 clang。clang 提供一个命令，可以将 Objetive-C 的源码改写成 c 语言的，借此可以研究 block 具体的源码实现方式。该命令是

``` c
clang -rewrite-objc block.c
```

## NSConcreteGlobalBlock 类型的 block 的实现

我们先新建一个名为 block1.c 的源文件：

``` objc
#include <stdio.h>

int main()
{
    ^{ printf("Hello, World!\n"); } ();
    return 0;
}

```

然后在命令行中输入`clang -rewrite-objc block1.c`即可在目录中看到 clang 输出了一个名为 block1.cpp 的文件。该文件就是 block 在 c 语言实现，我将 block1.cpp 中一些无关的代码去掉，将关键代码引用如下：

``` objc
struct __block_impl {
    void *isa;
    int Flags;
    int Reserved;
    void *FuncPtr;
};

struct __main_block_impl_0 {
    struct __block_impl impl;
    struct __main_block_desc_0* Desc;
    __main_block_impl_0(void *fp, struct __main_block_desc_0 *desc, int flags=0) {
        impl.isa = &_NSConcreteStackBlock;
        impl.Flags = flags;
        impl.FuncPtr = fp;
        Desc = desc;
    }
};
static void __main_block_func_0(struct __main_block_impl_0 *__cself) {
    printf("Hello, World!\n");
}

static struct __main_block_desc_0 {
    size_t reserved;
    size_t Block_size;
} __main_block_desc_0_DATA = { 0, sizeof(struct __main_block_impl_0) };

int main()
{
    (void (*)())&__main_block_impl_0((void *)__main_block_func_0, &__main_block_desc_0_DATA) ();
    return 0;
}

```

下面我们就具体看一下是如何实现的。__main_block_impl_0 就是该 block 的实现，从中我们可以看出：

 1. 一个 block 实际是一个对象，它主要由一个 isa 和 一个 impl 和 一个 descriptor 组成。
 2. <del> 在本例中，isa 指向 _NSConcreteGlobalBlock， 主要是为了实现对象的所有特性，在此我们就不展开讨论了。</del> 
 3. 由于 clang 改写的具体实现方式和 LLVM 不太一样，并且这里没有开启 ARC。所以这里我们看到 isa 指向的还是`_NSConcreteStackBlock`。但在 LLVM 的实现中，开启 ARC 时，block 应该是 _NSConcreteGlobalBlock 类型，具体可以看 [《objective-c-blocks-quiz》](http://blog.parse.com/2013/02/05/objective-c-blocks-quiz/) 第二题的解释。
 3. impl 是实际的函数指针，本例中，它指向 __main_block_func_0。这里的 impl 相当于之前提到的 invoke 变量，只是 clang 编译器对变量的命名不一样而已。
 4. descriptor 是用于描述当前这个 block 的附加信息的，包括结构体的大小，需要 capture 和 dispose 的变量列表等。结构体大小需要保存是因为，每个 block 因为会 capture 一些变量，这些变量会加到 __main_block_impl_0 这个结构体中，使其体积变大。在该例子中我们还看不到相关 capture 的代码，后面将会看到。


## NSConcreteStackBlock 类型的 block 的实现

我们另外新建一个名为 block2.c 的文件，输入以下内容：

``` objc
#include <stdio.h>

int main() {
    int a = 100;
    void (^block2)(void) = ^{
        printf("%d\n", a);
    };
    block2();

    return 0;
}
```

用之前提到的 clang 工具，转换后的关键代码如下：

``` c
struct __main_block_impl_0 {
    struct __block_impl impl;
    struct __main_block_desc_0* Desc;
    int a;
    __main_block_impl_0(void *fp, struct __main_block_desc_0 *desc, int _a, int flags=0) : a(_a) {
        impl.isa = &_NSConcreteStackBlock;
        impl.Flags = flags;
        impl.FuncPtr = fp;
        Desc = desc;
    }
};
static void __main_block_func_0(struct __main_block_impl_0 *__cself) {
    int a = __cself->a; // bound by copy
    printf("%d\n", a);
}

static struct __main_block_desc_0 {
    size_t reserved;
    size_t Block_size;
} __main_block_desc_0_DATA = { 0, sizeof(struct __main_block_impl_0)};

int main()
{
    int a = 100;
    void (*block2)(void) = (void (*)())&__main_block_impl_0((void *)__main_block_func_0, &__main_block_desc_0_DATA, a);
    ((void (*)(__block_impl *))((__block_impl *)block2)->FuncPtr)((__block_impl *)block2);

    return 0;
}
```

在本例中，我们可以看到：

 1. 本例中，isa 指向 _NSConcreteStackBlock，说明这是一个分配在栈上的实例。
 2. __main_block_impl_0 中增加了一个变量 a，在 block 中引用的变量 a 实际是在申明 block 时，被复制到 __main_block_impl_0 结构体中的那个变量 a。因为这样，我们就能理解，在 block 内部修改变量 a 的内容，不会影响外部的实际变量 a。
 3. __main_block_impl_0 中由于增加了一个变量 a，所以结构体的大小变大了，该结构体大小被写在了 __main_block_desc_0 中。


我们修改上面的源码，在变量前面增加 __block 关键字：

``` c
#include <stdio.h>

int main()
{
    __block int i = 1024;
    void (^block1)(void) = ^{
        printf("%d\n", i);
        i = 1023;
    };
    block1();
    return 0;
}
```

生成的关键代码如下，可以看到，差异相当大：

``` c

struct __Block_byref_i_0 {
    void *__isa;
    __Block_byref_i_0 *__forwarding;
    int __flags;
    int __size;
    int i;
};

struct __main_block_impl_0 {
    struct __block_impl impl;
    struct __main_block_desc_0* Desc;
    __Block_byref_i_0 *i; // by ref
    __main_block_impl_0(void *fp, struct __main_block_desc_0 *desc, __Block_byref_i_0 *_i, int flags=0) : i(_i->__forwarding) {
        impl.isa = &_NSConcreteStackBlock;
        impl.Flags = flags;
        impl.FuncPtr = fp;
        Desc = desc;
    }
};
static void __main_block_func_0(struct __main_block_impl_0 *__cself) {
    __Block_byref_i_0 *i = __cself->i; // bound by ref

    printf("%d\n", (i->__forwarding->i));
    (i->__forwarding->i) = 1023;
}

static void __main_block_copy_0(struct __main_block_impl_0*dst, struct __main_block_impl_0*src) {_Block_object_assign((void*)&dst->i, (void*)src->i, 8/*BLOCK_FIELD_IS_BYREF*/);}

static void __main_block_dispose_0(struct __main_block_impl_0*src) {_Block_object_dispose((void*)src->i, 8/*BLOCK_FIELD_IS_BYREF*/);}

static struct __main_block_desc_0 {
    size_t reserved;
    size_t Block_size;
    void (*copy)(struct __main_block_impl_0*, struct __main_block_impl_0*);
    void (*dispose)(struct __main_block_impl_0*);
} __main_block_desc_0_DATA = { 0, sizeof(struct __main_block_impl_0), __main_block_copy_0, __main_block_dispose_0};

int main()
{
    __attribute__((__blocks__(byref))) __Block_byref_i_0 i = {(void*)0,(__Block_byref_i_0 *)&i, 0, sizeof(__Block_byref_i_0), 1024};
    void (*block1)(void) = (void (*)())&__main_block_impl_0((void *)__main_block_func_0, &__main_block_desc_0_DATA, (__Block_byref_i_0 *)&i, 570425344);
    ((void (*)(__block_impl *))((__block_impl *)block1)->FuncPtr)((__block_impl *)block1);
    return 0;
}
```

从代码中我们可以看到：

 1. 源码中增加一个名为 __Block_byref_i_0 的结构体，用来保存我们要 capture 并且修改的变量 i。
 2. __main_block_impl_0 中引用的是 __Block_byref_i_0 的结构体指针，这样就可以达到修改外部变量的作用。
 3. __Block_byref_i_0 结构体中带有 isa，说明它也是一个对象。
 4. 我们需要负责 __Block_byref_i_0 结构体相关的内存管理，所以 __main_block_desc_0 中增加了 copy 和 dispose 函数指针，对于在调用前后修改相应变量的引用计数。


## NSConcreteMallocBlock 类型的 block 的实现

NSConcreteMallocBlock 类型的 block 通常不会在源码中直接出现，因为默认它是当一个 block 被 copy 的时候，才会将这个 block 复制到堆中。以下是一个 block 被 copy 时的示例代码 (来自 [这里](http://www.galloway.me.uk/2013/05/a-look-inside-blocks-episode-3-block-copy/))，可以看到，在第 8 步，目标的 block 类型被修改为 _NSConcreteMallocBlock。


``` objc
static void *_Block_copy_internal(const void *arg, const int flags) {
    struct Block_layout *aBlock;
    const bool wantsOne = (WANTS_ONE & flags) == WANTS_ONE;

    // 1
    if (!arg) return NULL;

    // 2
    aBlock = (struct Block_layout *)arg;

    // 3
    if (aBlock->flags & BLOCK_NEEDS_FREE) {
        // latches on high
        latching_incr_int(&aBlock->flags);
        return aBlock;
    }

    // 4
    else if (aBlock->flags & BLOCK_IS_GLOBAL) {
        return aBlock;
    }

    // 5
    struct Block_layout *result = malloc(aBlock->descriptor->size);
    if (!result) return (void *)0;

    // 6
    memmove(result, aBlock, aBlock->descriptor->size); // bitcopy first

    // 7
    result->flags &= ~(BLOCK_REFCOUNT_MASK);    // XXX not needed
    result->flags |= BLOCK_NEEDS_FREE | 1;

    // 8
    result->isa = _NSConcreteMallocBlock;

    // 9
    if (result->flags & BLOCK_HAS_COPY_DISPOSE) {
        (*aBlock->descriptor->copy)(result, aBlock); // do fixup
    }

    return result;
}
```

## 变量的复制

对于 block 外的变量引用，block 默认是将其复制到其数据结构中来实现访问的，如下图所示（图片来自 [这里](http://rypress.com/tutorials/objective-c/blocks.html)）：

{% img /images/block-capture-1.jpg %}

对于用 __block 修饰的外部变量引用，block 是复制其引用地址来实现访问的，如下图所示（图片来自 [这里](http://rypress.com/tutorials/objective-c/blocks.html)）：

{% img /images/block-capture-2.jpg %}

## LLVM 源码

在 LLVM 开源的关于 [block 的实现源码](https://llvm.org/svn/llvm-project/compiler-rt/trunk/BlocksRuntime/Block_private.h)，其内容也和我们用 clang 改写得到的内容相似，印证了我们对于 block 内部数据结构的推测。

## ARC 对 block 类型的影响

在 ARC 开启的情况下，将只会有 NSConcreteGlobalBlock 和 NSConcreteMallocBlock 类型的 block。

原本的 NSConcreteStackBlock 的 block 会被 NSConcreteMallocBlock 类型的 block 替代。证明方式是以下代码在 XCode 中，会输出 `<__NSMallocBlock__: 0x100109960>`。在苹果的 [官方文档](http://developer.apple.com/library/ios/#releasenotes/ObjectiveC/RN-TransitioningToARC/Introduction/Introduction.html) 中也提到，当把栈中的 block 返回时，不需要调用 copy 方法了。

``` objc

#import <Foundation/Foundation.h>

int main(int argc, const char * argv[])
{
    @autoreleasepool {
        int i = 1024;
        void (^block1)(void) = ^{
            printf("%d\n", i);
        };
        block1();
        NSLog(@"%@", block1);
    }
    return 0;
}

```

我个人认为这么做的原因是，由于 ARC 已经能很好地处理对象的生命周期的管理，这样所有对象都放到堆上管理，对于编译器实现来说，会比较方便。

## 参考链接

希望本文能加深你对于 block 的理解。我在学习中，查阅了以下文章，一并分享给大家。祝大家玩得开心～

 * [A look inside blocks: Episode 1](http://www.galloway.me.uk/2012/10/a-look-inside-blocks-episode-1/)
 * [A look inside blocks: Episode 2](http://www.galloway.me.uk/2012/10/a-look-inside-blocks-episode-2/)
 * [A look inside blocks: Episode 3](http://www.galloway.me.uk/2013/05/a-look-inside-blocks-episode-3-block-copy/)
 * [对 Objective-C 中 Block 的追探](http://www.cnblogs.com/biosli/archive/2013/05/29/iOS_Objective-C_Block.html)
 * [LLVM 中 block 实现源码](https://llvm.org/svn/llvm-project/compiler-rt/trunk/BlocksRuntime/Block_private.h)
 * [objective-c-blocks-quiz](http://blog.parse.com/2013/02/05/objective-c-blocks-quiz/)
 * [Blocks](http://rypress.com/tutorials/objective-c/blocks.html)


