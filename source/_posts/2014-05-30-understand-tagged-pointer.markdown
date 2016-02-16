---
layout: post
title: "深入理解Tagged Pointer"
date: 2014-05-30 22:15:29 +0800
comments: true
categories: iOS
---

## 版权说明

本文为 InfoQ 中文站特供稿件，首发地址为：[文章链接](http://www.infoq.com/cn/articles/deep-understanding-of-tagged-pointer)。如需转载，请与 InfoQ 中文站联系。

【摘要】：为了节省内存和提高执行效率，苹果提出了`Tagged Pointer`的概念。对于 64 位程序，引入 Tagged Pointer 后，相关逻辑能减少一半的内存占用，以及 3 倍的访问速度提升，100 倍的创建、销毁速度提升。本文从`Tagged Pointer`试图解决的问题入手，带领读者理解`Tagged Pointer`的实现细节和优势，最后指出了使用时的注意事项。

## 前言

在 2013 年 9 月，苹果推出了 [iPhone5s](http://en.wikipedia.org/wiki/IPhone_5S)，与此同时，iPhone5s 配备了首个采用 64 位架构的 [A7 双核处理器](http://en.wikipedia.org/wiki/Apple_A7)，为了节省内存和提高执行效率，苹果提出了`Tagged Pointer`的概念。对于 64 位程序，引入 Tagged Pointer 后，相关逻辑能减少一半的内存占用，以及 3 倍的访问速度提升，100 倍的创建、销毁速度提升。本文从`Tagged Pointer`试图解决的问题入手，带领读者理解`Tagged Pointer`的实现细节和优势，最后指出了使用时的注意事项。

## 问题

我们先看看原有的对象为什么会浪费内存。假设我们要存储一个 NSNumber 对象，其值是一个整数。正常情况下，如果这个整数只是一个 NSInteger 的普通变量，那么它所占用的内存是与 CPU 的位数有关，在 32 位 CPU 下占 4 个字节，在 64 位 CPU 下是占 8 个字节的。而指针类型的大小通常也是与 CPU 位数相关，一个指针所占用的内存在 32 位 CPU 下为 4 个字节，在 64 位 CPU 下也是 8 个字节。

所以一个普通的 iOS 程序，如果没有`Tagged Pointer`对象，从 32 位机器迁移到 64 位机器中后，虽然逻辑没有任何变化，但这种 NSNumber、NSDate 一类的对象所占用的内存会翻倍。如下图所示：

{% img /images/tagged_pointer_before.jpg %}


我们再来看看效率上的问题，为了存储和访问一个 NSNumber 对象，我们需要在堆上为其分配内存，另外还要维护它的引用计数，管理它的生命期。这些都给程序增加了额外的逻辑，造成运行效率上的损失。

## Tagged Pointer

为了改进上面提到的内存占用和效率问题，苹果提出了`Tagged Pointer`对象。由于 NSNumber、NSDate 一类的变量本身的值需要占用的内存大小常常不需要 8 个字节，拿整数来说，4 个字节所能表示的有符号整数就可以达到 20 多亿（注：2^31=2147483648，另外 1 位作为符号位)，对于绝大多数情况都是可以处理的。

所以我们可以将一个对象的指针拆成两部分，一部分直接保存数据，另一部分作为特殊标记，表示这是一个特别的指针，不指向任何一个地址。所以，引入了`Tagged Pointer`对象之后，64 位 CPU 下 NSNumber 的内存图变成了以下这样：

{% img /images/tagged_pointer_after.jpg %}

对此，我们也可以用 Xcode 做实验来验证。我们的实验代码如下：

``` objc

int main(int argc, char * argv[])
{
    @autoreleasepool {
        NSNumber *number1 = @1;
        NSNumber *number2 = @2;
        NSNumber *number3 = @3;
        NSNumber *numberFFFF = @(0xFFFF);
        
        NSLog(@"number1 pointer is %p", number1);
        NSLog(@"number2 pointer is %p", number2);
        NSLog(@"number3 pointer is %p", number3);
        NSLog(@"numberffff pointer is %p", numberFFFF);
        return UIApplicationMain(argc, argv, nil, NSStringFromClass([AppDelegate class]));
    }
}

```

在该代码中，我们将几个 Number 类型的指针的值直接输出。需要注意的是，我们需要将模拟器切换成 64 位的 CPU 来测试，如下图所示：

{% img /images/tagged_pointer_switch_64bit_simulator.jpg %}


运行之后，我们得到的结果如下，可以看到，除去最后的数字最末尾的 2 以及最开头的 0xb，其它数字刚好表示了相应 NSNumber 的值。

```
number1 pointer is 0xb000000000000012
number2 pointer is 0xb000000000000022
number3 pointer is 0xb000000000000032
numberFFFF pointer is 0xb0000000000ffff2
```

可见，苹果确实是将值直接存储到了指针本身里面。我们还可以猜测，数字最末尾的 2 以及最开头的 0xb 是否就是苹果对于`Tagged Pointer`的特殊标记呢？我们尝试放一个 8 字节的长的整数到`NSNumber`实例中，对于这样的实例，由于`Tagged Pointer`无法将其按上面的压缩方式来保存，那么应该就会以普通对象的方式来保存，我们的实验代码如下：

``` objc
NSNumber *bigNumber = @(0xEFFFFFFFFFFFFFFF);
NSLog(@"bigNumber pointer is %p", bigNumber);
```

运行之后，结果如下，验证了我们的猜测，`bigNumber`的地址更像是一个普通的指针地址，和它本身的值看不出任何关系：

```
bigNumber pointer is 0x10921ecc0
```

可见，当 8 字节可以承载用于表示的数值时，系统就会以`Tagged Pointer`的方式生成指针，如果 8 字节承载不了时，则又用以前的方式来生成普通的指针。关于以上关于`Tag Pointer`的存储细节，我们也可以在 [这里](https://www.mikeash.com/pyblog/friday-qa-2012-07-27-lets-build-tagged-pointers.html) 找到相应的讨论，但是其中关于`Tagged Pointer`的实现细节与我们的实验并不相符，笔者认为可能是苹果更改了具体的实现细节，并且这并不影响`Tagged Pointer`我们讨论`Tagged Pointer`本身的优点。

## 特点

我们也可以在 WWDC2013 的《Session 404 Advanced in Objective-C》视频中，看到苹果对于`Tagged Pointer`特点的介绍：

 1. `Tagged Pointer`专门用来存储小的对象，例如`NSNumber`和`NSDate`
 1. `Tagged Pointer`指针的值不再是地址了，而是真正的值。所以，实际上它不再是一个对象了，它只是一个披着对象皮的普通变量而已。所以，它的内存并不存储在堆中，也不需要 malloc 和 free。
 1. 在内存读取上有着 3 倍的效率，创建时比以前快 106 倍。

由此可见，苹果引入`Tagged Pointer`，不但减少了 64 位机器下程序的内存占用，还提高了运行效率。完美地解决了小内存对象在存储和访问效率上的问题。

## isa 指针

`Tagged Pointer`的引入也带来了问题，即`Tagged Pointer`因为并不是真正的对象，而是一个伪对象，所以你如果完全把它当成对象来使，可能会让它露马脚。比如我在 [《Objective-C 对象模型及应用》](http://blog.devtang.com/blog/2013/10/15/objective-c-object-model/) 一文中就写道，所有对象都有 `isa` 指针，而`Tagged Pointer`其实是没有的，因为它不是真正的对象。
因为不是真正的对象，所以如果你直接访问`Tagged Pointer`的`isa`成员的话，在编译时将会有如下警告：

{% img /images/tagged_pointer_isa_forbidden.jpg %}

对于上面的写法，应该换成相应的方法调用，如 `isKindOfClass` 和 `object_getClass`。只要避免在代码中直接访问对象的 isa 变量，即可避免这个问题。

## 总结

苹果将`Tagged Pointer`引入，给 64 位系统带来了内存的节省和运行效率的提高。`Tagged Pointer`通过在其最后一个 bit 位设置一个特殊标记，用于将数据直接保存在指针本身中。因为`Tagged Pointer`并不是真正的对象，我们在使用时需要注意不要直接访问其 isa 变量。

