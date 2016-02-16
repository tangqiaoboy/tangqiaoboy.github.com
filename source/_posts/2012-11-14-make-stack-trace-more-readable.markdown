---
layout: post
title: "让XCode的 stack trace信息可读"
date: 2012-11-14 20:19
comments: true
categories: iOS
---

昨天在写iOS代码的时候，调试的时候模拟器崩溃了。异常停在了如下整个main函数的入口处：

``` objc
int main(int argc, char *argv[])
{
    @autoreleasepool {
        // 异常停在了下面这行，毫无提示作用
        return UIApplicationMain(argc, argv, nil, NSStringFromClass([MyClass class]));
    }
}

```

<!-- more -->

XCode的Console界面报出了一些出错信息, 如下图所示：

{% img /images/stacktrace-1.jpg %}

我根据Console里面的文字提示信息，猜出应该是出现了空指针nil的操作。但是具体出错在哪一行，却不知道。最终虽然找到了bug，但是debug的过程确实费了些时间。考虑到这个stace trace信息应该对我挺有帮助才对的，所以我就查了一下如何让这原本一堆16进制的调用栈信息更可读。于是在stackoverflow上找到了2个比较好的解决办法，在这里分享给大家。

##方法一

该[方法](http://stackoverflow.com/questions/7841610/xcode-4-2-debug-doesnt-symbolicate-stack-call)的步骤是，首先在你的AppDelegate中定义一个方法, 用于处理异常：

``` objc
void uncaughtExceptionHandler(NSException *exception) {
    NSLog(@"CRASH: %@", exception);
    NSLog(@"Stack Trace: %@", [exception callStackSymbols]);
    // Internal error reporting
}
```
然后在应用启动时，设置这个方法作为自己的自定义异常回调：

``` objc
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{   
    NSSetUncaughtExceptionHandler(&uncaughtExceptionHandler);
    // Normal launch stuff
}
```

完成之后，当对于上面的异常，在定义了这个回调之后，Log信息变成如下所示，出错行一目了然，根据下面的可读的stack trace，我一下就可以找到是QuestionParser这个类的第378行导致的异常，进而可以跳到出错行分析原因，很容易就把bug修复了。

``` objc
Ape[2711:11303] CRASH: *** -[__NSPlaceholderDictionary initWithObjects:forKeys:count:]: attempt to insert nil object from objects[2]
Ape[2711:11303] Stack Trace: (
	0   CoreFoundation                      0x0209402e __exceptionPreprocess + 206
	1   libobjc.A.dylib                     0x01a71e7e objc_exception_throw + 44
	2   CoreFoundation                      0x0205aa95 -[__NSPlaceholderDictionary initWithObjects:forKeys:count:] + 165
	3   CoreFoundation                      0x020874e9 +[NSDictionary dictionaryWithObjects:forKeys:count:] + 73
	4   Ape                                 0x00096a0a +[QuestionParser parseToDictionary:] + 378
	5   Ape                                 0x00096434 -[QuestionStore putQuestion:] + 308
	6   Ape                                 0x00089ddf -[QuestionViewController requestFinished:] + 303
	7   Ape                                 0x000869dd -[NetworkAgent requestFinished:] + 653
	8   Ape                                 0x00085d33 __27-[NetworkAgent addRequest:]_block_invoke_0 + 131
	9   libdispatch.dylib                   0x01cf153f _dispatch_call_block_and_release + 15
	10  libdispatch.dylib                   0x01d03014 _dispatch_client_callout + 14
	11  libdispatch.dylib                   0x01cf2fd6 _dispatch_after_timer_callback + 28
	12  libdispatch.dylib                   0x01d03014 _dispatch_client_callout + 14
	13  libdispatch.dylib                   0x01cfa8b7 _dispatch_source_latch_and_call + 219
	14  libdispatch.dylib                   0x01cf6405 _dispatch_source_invoke + 322
	15  libdispatch.dylib                   0x01cf3768 _dispatch_main_queue_callback_4CF + 187
	16  CoreFoundation                      0x0203aaf5 __CFRunLoopRun + 1925
	17  CoreFoundation                      0x02039f44 CFRunLoopRunSpecific + 276
	18  CoreFoundation                      0x02039e1b CFRunLoopRunInMode + 123
	19  GraphicsServices                    0x0282b7e3 GSEventRunModal + 88
	20  GraphicsServices                    0x0282b668 GSEventRun + 104
	21  UIKit                               0x00be265c UIApplicationMain + 1211
	22  Ape                                 0x00016c5d main + 141
	23  Ape                                 0x00002b05 start + 53
	24  ???                                 0x00000001 0x0 + 1
)

```

##方法二

方法二相比方法一更加简单，具体做法是在XCode界面中按cmd + 6跳到Breakpoint的tab，然后点击左下角的+号，增加一个Exception的断点，如下图所示。这样，当异常出现时，会自动停在异常处，而不会抛出到UIApplicationMain。拿我的有bug的程序来说，代码会自动断在QuestionParser这个类的第378行。

{% img /images/stacktrace-2.png %}


##总结

其实以前XCode是能显示出可读的stack trace信息的，似乎到了XCode4.2以后就出问题了。所以上面提到的2个办法相当于walk around解决了XCode4.2以后出现的bug。如果该文章对你有用，希望你能帮我点击下面的分享按钮，分享给更多朋友，同时也帮我宣传一下博客，这将有助于我分享更多的心得给大家，Have fun!

