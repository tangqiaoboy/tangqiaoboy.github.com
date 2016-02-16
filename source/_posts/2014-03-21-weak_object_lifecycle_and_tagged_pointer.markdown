---
layout: post
title: "NSNumber对象缓存以及Tagged Pointer"
date: 2014-03-21 21:09
comments: true
categories: iOS
---

这是一次和 [@onevcat](http://onevcat.com/) 的技术讨论总结。技术点比较散，但是还都比较有意思。涉及的技术细节包括：

 1. 系统对象的缓存
 1. `Tagged Pointer`对象

## autorelase对象

按照苹果的编程约定，由非`alloc`,`copy`返回的对象都是`autorelease`的，所以对于以下代码，虽然变量`number`是`__weak`的，但是由于`[NSNumber numberWithInt:100]`返回的对象是`autorelase`的，所以仍然能通过NSLog打印出来。

``` objc
__weak NSNumber *number = [NSNumber numberWithInt:100];
NSLog(@"number = %@", number);

```

从汇编代码中看，以上代码在创建`number`变量时，是通过`objc_loadWeak`方法进行的。而根据 [Clang的官方文档](http://clang.llvm.org/docs/AutomaticReferenceCounting.html#arc-runtime-objc-loadweak)，`objc_loadWeak`方法会`retain`并`autorelease`这个对象。所以给一个weak对象赋值，它并不会马上释放，而是会放到`autorelease pool`中，与`autorelease pool`一起释放。

如下是`objc_loadWeak`的代码示例：

``` objc
id objc_loadWeak(id *object) {
  return objc_autorelease(objc_loadWeakRetained(object));
}
```

为了验证这个回答，我们又做了一个有趣的例子来验证，如下所示：

``` objc
__weak NSNumber *number;
@autoreleasepool {
	number = [NSNumber numberWithInt:100];
}
NSLog(@"number = %@", number);
```

在上面这个例子中，果然如我们所料，`number`在通过NSLog查看值时，变成了nil。


###讨论二：关于NSNumber对象的缓存

我们在做以上实验时，发现一个有趣的现象，如果你把100变成了10，则`number`变成在NSLog时，就能够输出值来，不再是nil了。如下是测试代码：

``` objc
__weak NSNumber *number;
@autoreleasepool {
	number = [NSNumber numberWithInt:10];
}
NSLog(@"number = %@", number);
```

经过 onevcat 的实验，从-1 ～ 12都是可以输出的，而其它值却会变成nil。于是我们猜测是系统对这些常见值的对象做了缓存，于是我们写了如下代码来验证。

结果果然是这样，多次创建值为10的`NSNumber`对象，其地址都是<font color=red>一样的</font>。而多次创建值为100的`NSNumber`对象，每次创建获得的对象地址都是<font color=red>不一样的</font>。

``` objc
NSNumber *number = [NSNumber numberWithInt:10];
NSNumber *another = [NSNumber numberWithInt:10];
NSLog(@"%p %p", number, another);

number = [NSNumber numberWithInt:100];
another = [NSNumber numberWithInt:100];
NSLog(@"%p %p", number, another);
```

###讨论三：64位系统与Tagged Pointer对象

讨论本来已经结束了，结果我在写这篇博客的时候，手贱又测试了一下，发现在64位的模拟器下，无论创建多少次，也无论int的值是多少，所有相同int值的`NSNumber`对象地址都是一样的！

疑惑了几分钟，我突然想起WWDC中介绍的64位系统引放的`Tagged Pointer`，恍然大悟。

在WWDC2013的《Session 404 Advanced in Objective-C》视频中，苹果介绍了`Tagged Pointer`。`Tagged Pointer`的存在主要是为了节省内存。我们知道，对象的指针大小一般是与机器字长有关，在32位系统中，一个指针的大小是32位（4字节），而在64位系统中，一个指针的大小将是64位（8字节）。

在64位系统中，如果我们真正使用一个指针来存储`NSNumber`实例，那么我们首先需要一个8字节的指针，另外需要一块内存存储`NSNumber`实例，这通常又是8字节。这样的内存开销是比较大的。苹果对于`NSNumber`和`NSDate`对象，改成了用`Tagged Pointer`来存储，简单来说，`Tagged Pointer`是一个假的指针，它的值不再是另一个地址，而就是对应变量的值。

`Tagged Pointer`主要有以下3个特点：

 1. `Tagged Pointer`专门用来存储小的对象，例如`NSNumber`和`NSDate`
 1. `Tagged Pointer`指针的值不再是地址了，而是真正的值。所以，实际上它不再是一个对象了，它只是一个披着对象皮的普通变量而已！所以，它的内存并不存储在堆中，也不需要malloc和free。
 1. 在内存读取上有着3倍的效率（以前是寻址->发消息->获取值，现在直接获取值），创建时比以前快106倍。
 
 相关英文文档截图如下：
 
 {% img /images/tagged_pointer_1.jpg %}


但`Tagged Pointer`的引入也带来了问题，即`Tagged Pointer`因为并不是真正的对象，而是一个伪对象，所以你如果完全把它当成对象来使，可能会让它露马脚。比如我在[《Objective-C对象模型及应用》](http://blog.devtang.com/blog/2013/10/15/objective-c-object-model/)一文中就写道，所有对象都有 `isa` 指针，而`Tagged Pointer`其实是没有的，因为它不是真正的对象。

因为不是真正的对象，所以如果你直接访问`Tagged Pointer`的`isa`成员的话，在编译时将会有如下警告：

 {% img /images/tagged_pointer_2.jpg %}
 
对于上面的写法，应该换成相应的方法调用，如 `isKindOfClass` 和 `object_getClass`，如下图所示：

 {% img /images/tagged_pointer_3.jpg %}
 
 
至此，所有疑问都已经解决，开心～

另外这儿有一篇介绍`Tagged Pointer`的文章：[《64位与Tagged Pointer》](http://blog.xcodev.com/archives/tagged-pointer-and-64-bit/)，一并推荐给大家。





