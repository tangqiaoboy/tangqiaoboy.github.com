---
layout: post
title: "改进iOS客户端的升级提醒功能"
date: 2012-11-10 18:42
comments: true
categories: iOS
---

##功能设计

先申明一下，我是码农，不是一个产品经理，但我觉得现有市面上的很多 App，设计的 “升级提示功能” 都不太友好。在此分享一下我的想法，欢迎大家讨论。

这些 App 包括：新浪微博、网易微博、网易新闻客户端以及大部分带有升级提示功能的 App，所以我觉得这个问题还是挺普遍的。对于该问题，一句话描述起来就是：“这些 App 都会在用户刚刚使用它的时候，提示有新版本，让用户去 AppStore 上下载最新的版本”。下面是某个应用的升级提示截图：

{% img /images/app-upgrade-1.jpg %}

为什么我认为这是一个糟糕的设计呢？因为用户刚刚打开你的 App，明显就是想使用你的功能。例如刚刚打开新浪微博，可能就是想看一下最新的消息或回复。刚刚打开网易新闻客户端，可能就是想看看最新的新闻。这个时候，你告诉用户有新版本，是想让用户暂时放弃使用该 App 吗？我不知道有多少用户会去点 “升级” 这个按钮，反正我每次看到这个提示都很郁闷，因为我如果点了，我就暂时不能使用该应用了（升级时原版本的 App 是无法使用的）。所以我在想，这个提示升级的时间能不能做得更友好一些？

<!-- more -->

有一次在地铁上我想到了一个好办法，就是让升级提示不是出现在软件刚刚打开的时候，而是用户刚刚退出 App 的时候，我们可以在用户刚刚退出 App 的时候，向 iOS 设备发一个本地的通知 (Local Notification)，在本地通知上显示升级提示。当用户点击这个升级提示时，我们的 App 在启动后跳转到 AppStore，这样就达到的提示升级的效果。

这样做相比以前的好处有以下几点：

 1. 用户退出 App 的时刻，是一个访问这个 App 活动的结束。在这个时候提示，用户更有理由接受升级。
 2. 即便用户当前不接受升级，但这个升级提示都会存在用户的通知中心中，用户想升级时，点击这个通知，就可以方便地一键跳到 AppStore 的下载页面。而之前的方法在用户取消后，用户就不方便取获下载地址了。

另外，本地通知的使用只需要 iOS4.0 以上版本即可，而在中国，[iOS4.0 以上比例](http://www.zhihu.com/question/20267080) 达到了 99%。本地通知也不需要向用户申请发送通知的 DeviceToken，所以该方案很少被用户禁止（用户只能专门去通知中心将该应用的所有通知关闭）。当然，这个升级提示也不应该每次都出现，以免对用户产生太多打挠，象我在粉笔网客户端上设置的策略是最多半个月出现一次。

在我在粉笔网 iPhone 端实现该方案后，有一次我发现支付宝的 iOS 客户端也采用通知的方式来提示用户升级，看来大家都想到一块儿了。不过从通知的发送时间来看，他们应该不是使用的本地通知，而是通过服务器发送 Push 通知的方式。这种方式的好处是即使用户安装后一次也没有使用你的 App，你还是可以通过通知来唤醒他，可能的坏处是：

 1. 可能用户已经升完级了，你还把升级通知的信息发给用户了。象我就是，支付宝都升完级了，还发通知提示我有新版可以使用。
 2. 用户如果禁止了应用的 Push 通知，你就没办法发送升级提醒了。


##技术实现

再简单说一下技术实现，我写了一个 VersionAgent 类，每 24 小时最多向服务器请求一次最新的 App 版本。然后在每次 App 启动 5 秒后，检查一下是否过了 24 小时一次的请求阈值，如下所示：

``` objc
- (void)applicationDidBecomeActive:(UIApplication *)application
{
    double delayInSeconds = 5.0;
    dispatch_time_t popTime = dispatch_time(DISPATCH_TIME_NOW, delayInSeconds * NSEC_PER_SEC);
    dispatch_after(popTime, dispatch_get_main_queue(), ^(void){
        [[VersionAgent sharedInstance] checkVersion];
    });
}

```


如果版本有更新，则在 AppDelegate 的 applicationDidEnterBackgroundl 回调中，发送一个本地通知，示例代码如下：

``` objc
- (void)applicationDidEnterBackground:(UIApplication *)application
{
    if ([[VersionAgent sharedInstance] shouldShowLocalNotification]) {
        dispatch_async(dispatch_get_main_queue(), ^{
            UILocalNotification * localNotification = [[UILocalNotification alloc] init];
            if (localNotification) {
                localNotification.fireDate= [[[NSDate alloc] init] dateByAddingTimeInterval:3];
                localNotification.timeZone=[NSTimeZone defaultTimeZone];
                localNotification.alertBody = @" 粉笔网客户端有新的版本，点击到 App Store 升级。";
                localNotification.alertAction = @" 升级 ";
                localNotification.soundName = @"";
                [application scheduleLocalNotification:localNotification];
            }
        });
    }
}
```

然后通过 AppDelegate 的回调函数，判断 App 的启动方式是否是通过用户点击通知中心的升级提示来启动，如果是，则跳转到 AppStore，示例代码如下：

``` objc
- (void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification {
    // open app store link
    NSString * url = [NSString stringWithFormat:@"itms-apps://itunes.apple.com/app/id%@", APP_STORE_ID];
    [[UIApplication sharedApplication] openURL:[NSURL URLWithString:url]];
}

```

##题外话

{% img /images/app-upgrade-2.jpeg %}

最新微博上有一个 [新闻](http://www.chinanews.com/sh/2012/11-09/4315347.shtml?utm_source=bshare&utm_campaign=bshare&utm_medium=sinaminiblog#bsh-24-154760667) 很火，一个技术男，给女友发弹窗通知求爱。有些人回复说这样做太麻烦，需要在服务器上记 DeviceToken，否则所有用户都发的话，会让很多不相关的人收到。

其实这完全可以用本地通知来做，完全不需要服务器配合，相当简单。
具体做法是：你自己写一个发本地求爱通知的小应用，然后记下女友手机的 UDID，将女友的手机设置成开发者设备，然后抓住一次机会在其手机上安装好开发者证书和你写的这个小 App 即可。可以把这个 App 隐藏在某个文件夹下面，然后打开一次，设置好本地通知的发出时间即可。

我的很多文章最后结尾都是 Have fun，不过最近很难高兴起来啊。因为 0x12 Big，今天 google 的全线产品都无法访问了。想起我每天的工作都是用 google 搜技术贴，用 gmail 收邮件，用 gtalk 聊天，我的联系人信息，备忘录也是同步在 google contact 上，我真的无法 fun 起来了。本博客是架设在 github 上的，我也很担心该博客可能也会因为是境外 IP 而被禁止访问。

有时候，我很气愤，而有时候，我会乐观地想，这些都是负能量的积累，黎明前的黑暗。不管怎么样，谁也无法阻止大家对自由的向往，希望有朝一日，所有人都能自由地获取信息。



