---
layout: post
title: "Objective-C对象模型及应用"
date: 2013-10-15 20:31
comments: true
categories: iOS
---

## 前言

原创文章，转载请注明出自 [唐巧的技术博客](http://blog.devtang.com)。

本文主要介绍 Objective-C 对象模型的实现细节，以及 Objective-C 语言对象模型中对`isa swizzling`和`method swizzling`的支持。希望本文能加深你对 Objective-C 对象的理解。

## ISA 指针

Objective-C 是一门面向对象的编程语言。每一个对象都是一个类的实例。在 Objective-C 语言的内部，每一个对象都有一个名为 isa 的指针，指向该对象的类。每一个类描述了一系列它的实例的特点，包括成员变量的列表，成员函数的列表等。每一个对象都可以接受消息，而对象能够接收的消息列表是保存在它所对应的类中。

在 XCode 中按`Shift + Command + O`, 然后输入 NSObject.h 和 objc.h，可以打开 NSObject 的定义头文件，通过头文件我们可以看到，NSObject 就是一个包含 isa 指针的结构体，如下图所示：

<!-- more -->

{% img /images/class-nsobject-isa.jpg %}
{% img /images/class-objc-object-isa.jpg %}


按照面向对象语言的设计原则，所有事物都应该是对象（严格来说 Objective-C 并没有完全做到这一点，因为它有象 int, double 这样的简单变量类型）。在 Objective-C 语言中，每一个类实际上也是一个对象。每一个类也有一个名为 isa 的指针。每一个类也可以接受消息，例如`[NSObject alloc]`，就是向 NSObject 这个类发送名为`alloc`消息。

在 XCode 中按`Shift + Command + O`, 然后输入 runtime.h，可以打开 Class 的定义头文件，通过头文件我们可以看到，Class 也是一个包含 isa 指针的结构体，如下图所示。（图中除了 isa 外还有其它成员变量，但那是为了兼容非 2.0 版的 Objective-C 的遗留逻辑，大家可以忽略它。）

{% img /images/class-objc-class-isa.jpg %}

因为类也是一个对象，那它也必须是另一个类的实列，这个类就是元类 (`metaclass`)。元类保存了类方法的列表。当一个类方法被调用时，元类会首先查找它本身是否有该类方法的实现，如果没有，则该元类会向它的父类查找该方法，直到一直找到继承链的头。

元类 (`metaclass`) 也是一个对象，那么元类的 isa 指针又指向哪里呢？为了设计上的完整，所有的元类的 isa 指针都会指向一个根元类 (root `metaclass`)。根元类 (root metaclass) 本身的 isa 指针指向自己，这样就行成了一个闭环。上面提到，一个对象能够接收的消息列表是保存在它所对应的类中的。在实际编程中，我们几乎不会遇到向元类发消息的情况，那它的 isa 指针在实际上很少用到。不过这么设计保证了面向对象的干净，即所有事物都是对象，都有 isa 指针。

我们再来看看继承关系，由于类方法的定义是保存在元类 (`metaclass`) 中，而方法调用的规则是，如果该类没有一个方法的实现，则向它的父类继续查找。所以，为了保证父类的类方法可以在子类中可以被调用，所以子类的元类会继承父类的元类，换而言之，类对象和元类对象有着同样的继承关系。

我很想把关系说清楚一些，但是这块儿确实有点绕，下面这张图或许能够让大家对 isa 和继承的关系清楚一些（该图片来自 [这里](http://www.sealiesoftware.com/blog/class%20diagram.pdf)）

{% img /images/class-diagram.jpg %}

该图中，最让人困惑的莫过于 Root Class 了。在实现中，Root Class 是指 NSObject，我们可以从图中看出：

 1. NSObject 类包括它的对象实例方法。
 2. NSObject 的元类包括它的类方法，例如 alloc 方法。
 3. NSObject 的元类继承自 NSObject 类。
 4. 一个 NSObject 的类中的方法同时也会被 NSObject 的子类在查找方法时找到。

## 类的成员变量

如果把类的实例看成一个 C 语言的结构体（struct），上面说的 isa 指针就是这个结构体的第一个成员变量，而类的其它成员变量依次排列在结构体中。排列顺序如下图所示（图片来自《iOS 6 Programming Pushing the Limits》）：

{% img /images/class-member.jpg %}

为了验证该说法，我们在 XCode 中新建一个工程，在 main.m 中运行如下代码：

``` objc

#import <UIKit/UIKit.h>

@interface Father : NSObject {
    int _father;
}

@end

@implementation Father

@end

@interface Child : Father {
    int _child;
}

@end

@implementation Child

@end


int main(int argc, char * argv[])
{
    
  Child * child = [[Child alloc] init];    
  @autoreleasepool {
      // ...
  }
}
```

我们将断点下在 ` @autoreleasepool` 处，然后在 Console 中输入`p *child`, 则可以看到 Xcode 输出如下内容，这与我们上面的说法一致。

```
(lldb) p *child
(Child) $0 = {
  (Father) Father = {
    (NSObject) NSObject = {
      (Class) isa = Child
    }
    (int) _father = 0
  }
  (int) _child = 0
}
```

## 可变与不可变

因为对象在内存中的排布可以看成一个结构体，该结构体的大小并不能动态变化。所以无法在运行时动态给对象增加成员变量。

相对的，对象的方法定义都保存在类的可变区域中。Objective-C 2.0 并未在头文件中将实现暴露出来，但在 Objective-C 1.0 中，我们可以看到方法的定义列表是一个名为 `methodLists`的指针的指针（如下图所示）。通过修改该指针指向的指针的值，就可以实现动态地为某一个类增加成员方法。这也是`Category`实现的原理。同时也说明了为什么`Category`只可为对象增加成员方法，却不能增加成员变量。

{% img /images/class-objc-class-isa.jpg %}

需要特别说明一下，通过`objc_setAssociatedObject` 和 `objc_getAssociatedObject`方法可以变相地给对象增加成员变量，但由于实现机制不一样，所以并不是真正改变了对象的内存结构。

除了对象的方法可以动态修改，因为 isa 本身也只是一个指针，所以我们也可以在运行时动态地修改 isa 指针的值，达到替换对象整个行为的目的。不过该应用场景较少。

## 系统相关 API 及应用

### isa swizzling 的应用

系统提供的 KVO 的实现，就利用了动态地修改 isa 指针的值的技术。在 [苹果的文档](https://developer.apple.com/library/ios/documentation/cocoa/conceptual/KeyValueObserving/Articles/KVOImplementation.html) 中可以看到如下描述：

{% blockquote %}

Key-Value Observing Implementation Details

Automatic key-value observing is implemented using a technique called isa-swizzling.

The isa pointer, as the name suggests, points to the object's class which maintains a dispatch table. This dispatch table essentially contains pointers to the methods the class implements, among other data.

When an observer is registered for an attribute of an object the isa pointer of the observed object is modified, pointing to an intermediate class rather than at the true class. As a result the value of the isa pointer does not necessarily reflect the actual class of the instance.

You should never rely on the isa pointer to determine class membership. Instead, you should use the class method to determine the class of an object instance.

{% endblockquote %}

<del> 类似的，使用 isa swizzling 的技术的还有系统提供的 Key-Value Coding（KVC）。</del> (谢谢大家指出错误，KVC 并没有使用到 isa swizzling)

### Method Swizzling API 说明

Objective-C 提供了以下 API 来动态替换类方法或实例方法的实现：

 * `class_replaceMethod` 替换类方法的定义
 * `method_exchangeImplementations` 交换 2 个方法的实现
 * `method_setImplementation` 设置 1 个方法的实现
 
这 3 个方法有一些细微的差别，给大家介绍如下：

 * `class_replaceMethod`在苹果的文档（如下图所示）中能看到，它有两种不同的行为。当类中没有想替换的原方法时，该方法会调用`class_addMethod`来为该类增加一个新方法，也因为如此，`class_replaceMethod`在调用时需要传入`types`参数，而`method_exchangeImplementations`和`method_setImplementation`却不需要。

{% img /images/class-replace-method.jpg %}

 * `method_exchangeImplementations` 的内部实现相当于调用了 2 次`method_setImplementation`方法，从苹果的文档中能清晰地了解到（如下图所示）
 
{% img /images/class-method-exchange-imp.jpg %}

从以上的区别我们可以总结出这 3 个 API 的使用场景:

 * `class_replaceMethod`, 当需要替换的方法可能有不存在的情况时，可以考虑使用该方法。
 * `method_exchangeImplementations`，当需要交换 2 个方法的实现时使用。
 * `method_setImplementation` 最简单的用法，当仅仅需要为一个方法设置其实现方式时使用。
 
以上 3 个方法的源码在 [这里](https://www.opensource.apple.com/source/objc4/objc4-532/runtime/objc-runtime-new.mm)，感兴趣的同学可以读一读。

### 使用示例

我们在开发 [猿题库](http://yuantiku.com) 客户端的笔记功能时，需要使用系统的`UIImagePickerController`。但是，我们发现，在 iOS6.0.2 系统下，系统提供的`UIImagePickerController`在 iPad 横屏下有转屏的 Bug，造成其方向错误。具体的 Bug 详情可以见 [这里](http://stackoverflow.com/questions/12522491/crash-on-presenting-uiimagepickercontroller-under-ios-6-0)。

为了修复该 Bug，我们需要替换`UIImagePickerController`的如下 2 个方法

``` objc
- (BOOL)shouldAutorotate;
- (UIInterfaceOrientation)preferredInterfaceOrientationForPresentation;

```

我们先实现了一个名为`ImagePickerReplaceMethodsHolder`的类，用于定义替换后的方法和实现。如下所示：

``` objc

// ImagePickerReplaceMethodsHolder.h
@interface ImagePickerReplaceMethodsHolder : NSObject

- (BOOL)shouldAutorotate;
- (UIInterfaceOrientation)preferredInterfaceOrientationForPresentation;

@end

// ImagePickerReplaceMethodsHolder.m
@implementation ImagePickerReplaceMethodsHolder

- (BOOL)shouldAutorotate {
    return NO;
}

- (UIInterfaceOrientation)preferredInterfaceOrientationForPresentation {
    return UIInterfaceOrientationPortrait;
}


@end


```

然后，我们在调用处，判断当前的 iOS 版本，对于 [iOS6.0, iOS6.1) 之间的版本，我们将`UIImagePickerController`的有问题的方法替换。具体代码如下：

``` objc

#define SYSTEM_VERSION_GREATER_THAN_OR_EQUAL_TO(v)  ([[[UIDevice currentDevice] systemVersion] compare:v options:NSNumericSearch] != NSOrderedAscending)
#define SYSTEM_VERSION_LESS_THAN(v)                 ([[[UIDevice currentDevice] systemVersion] compare:v options:NSNumericSearch] == NSOrderedAscending)

+ (void)load {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        [self hackForImagePicker];
    });
}

+ (void)hackForImagePicker {
    // fix bug of image picker under iOS 6.0
    // http://stackoverflow.com/questions/12522491/crash-on-presenting-uiimagepickercontroller-under-ios-6-0
    if (SYSTEM_VERSION_GREATER_THAN_OR_EQUAL_TO(@"6.0")
        && SYSTEM_VERSION_LESS_THAN(@"6.1")) {
        Method oldMethod1 = class_getInstanceMethod([UIImagePickerController class], @selector(shouldAutorotate));
        Method newMethod1 = class_getInstanceMethod([ImagePickerReplaceMethodsHolder class], @selector(shouldAutorotate));
        method_setImplementation(oldMethod1, method_getImplementation(newMethod1));

        Method oldMethod2 = class_getInstanceMethod([UIImagePickerController class], @selector(preferredInterfaceOrientationForPresentation));
        Method newMethod2 = class_getInstanceMethod([ImagePickerReplaceMethodsHolder class], @selector(preferredInterfaceOrientationForPresentation));
        method_setImplementation(oldMethod2, method_getImplementation(newMethod2));
    }
}

```

通过如上代码，我们就针对 iOS 特定版本的有问题的系统库函数打了 Patch，使问题得到解决。

### 开源界的使用

有少量不明真相的同学以为苹果在审核时会拒绝 App 使用以上 API，这其实是对苹果的误解。使用如上 API 是安全的。另外，开源界也对以上方法都适当的使用。例如：

 * 著名的网络库 [AFNetworking](https://github.com/AFNetworking/AFNetworking)。AFNetworking 网络库 (v1.x 版本) 使用了 class_replaceMethod 方法（AFHTTPRequestOperation.m 文件第 105 行）
 * [Nimbus](https://github.com/jverkoey/nimbus)。Nimbus 是著名的工具类库，它在其 core 模块中提供了`NIRuntimeClassModifications.h`文件，用于提供上述 API 的封装。
 * 国内的大众点评 iOS 客户端。该客户端使用了他们自己开发的基于 Wax 修改而来的 [WaxPatch](https://github.com/mmin18/WaxPatch)，WaxPatch 可以实现通过服务器更新来动态修改客户端的逻辑。而 WaxPatch 主要是修改了 wax 中的 wax_instance.m 文件，在其中加入了 class_replaceMethod 来替换原始实现，从而实现修改客户端的原有行为。



## 总结

通过本文，我们了解到了 Objective-C 语言的对象模型，以及 Objective-C 语言对象模型中对`isa swizzling`和`method swizzling`的支持。本文也通过具体的实例代码和开源项目，让我们对该对象模型提供的动态性有了更加深刻的认识。

## 后记

文章发表后，一些同行指出在 ARM64 的 CPU 下，isa 的内部结构有变化。这点我是知道的，不过希望以后再撰文讨论。感兴趣的同学可以查看苹果今年 WWDC2013 的视频：《Session 404 Advanced in Objective-C》。

### 参考链接
 
 * <https://developer.apple.com/library/mac/documentation/Cocoa/Conceptual/ObjCRuntimeGuide/Introduction/Introduction.html>
 * <http://www.sealiesoftware.com/blog/archive/2009/04/14/objc_explain_Classes_and_metaclasses.html>
 * <http://www.devalot.com/articles/2011/11/objc-object-model.html>
 * <http://www.cocoawithlove.com/2010/01/what-is-meta-class-in-objective-c.html>
 * <http://www.sealiesoftware.com/blog/archive/2009/04/14/objc_explain_Classes_and_metaclasses.html>
 * [gunstep 的实现源码](http://wwwmain.gnustep.org/resources/downloads.php)
 * <http://algorithm.com.au/downloads/talks/objective-c-internals/objective-c-internals.pdf>
 * <http://opensource.apple.com/source/objc4/objc4-532/runtime/>
 * <https://github.com/AFNetworking/AFNetworking>
 * <https://github.com/jverkoey/nimbus>
 * <https://github.com/mmin18/WaxPatch>
