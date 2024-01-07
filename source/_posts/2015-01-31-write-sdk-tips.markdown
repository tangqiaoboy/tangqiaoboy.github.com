---
layout: post
title: "写iOS SDK注意事项"
date: 2015-01-31 21:44:33 +0800
comments: true
categories: iOS
---

我发现即使是像腾讯、小米这样的大厂提供的 SDK，在质量和规范上也有很多问题，而且包括我以及我身边的很多朋友都被恶心到了，所以我就把这些注意事项总结出来，希望大家不要犯同样的错误。

### 注意事项一：所有类名都应该加前缀

说明：没有前缀的类名有冲突的风险。

Bad Case：微信分享的 SDK，文件名：`WXApiObject.h`，代码如下，其中`BaseReq`类和`BaseResp`类都没有加前缀。

```
@interface BaseReq : NSObject

/** 请求类型 */
@property (nonatomic, assign) int type;
/** 由用户微信号和 AppID 组成的唯一标识，发送请求时第三方程序必须填写，用于校验微信用户是否换号登录 */
@property (nonatomic, retain) NSString* openID;

@end


#pragma mark - BaseResp
/*! @brief 该类为微信终端 SDK 所有响应类的基类
 *
 */
@interface BaseResp : NSObject
/** 错误码 */
@property (nonatomic, assign) int errCode;
/** 错误提示字符串 */
@property (nonatomic, retain) NSString *errStr;
/** 响应类型 */
@property (nonatomic, assign) int type;

@end
```

### 注意事项二：所有 category 方法加前缀

说明：category 方法如果不加前缀，有冲突的风险。

Bad Case：腾讯分享的 SDK，它为 NSArray 增加了一个 JSONArray 的 category，造成我们本身的同名 category 被覆盖。另外他们为 NSArray 增加的其它 category 和著名的 Cordova 开源库冲突，造成 Cordova 无法使用。

### 注意事项三：不要将第三方库打包进 SDK

说明：尽量不要将第三方库打包进 SDK，如果要打包，最好也要将该第三方库重命名，以避免冲突。

Bad Case：小米的推送 SDK，直接在 SDK 静态库里面编进去一个第三方依赖库，而且这个库还是 ASIHttpRequest。ASIHttp 当前已经处于无人维护状态，很多 Bug 都是大家自己在修复（例如网易就自己维护了一个 ASIHttpRequest 的分支）。在 SDK 中依赖这种库还是比较麻烦的。

### 注意事项四：做基本的检查和测试

说明：SDK 对外公布前应该进行基本的编译检查，不应该有编译器警告存在。

Bad Case：腾讯分享的 SDK。它的 `CGIParamsWrap.o` 和  `TencentOAuth.o` 文件里面的方法名冲突了，如下所示：


>ld: warning: instance method 'deleteAPIRequestBySeq:' in category from /Users/tangqiao/work/iphone/solar-ios/lib_common/TencentOpenApi/TencentOpenAPI.framework/TencentOpenAPI(CGIParamsWrap.o) overrides method from class in /Users/tangqiao/work/iphone/solar-ios/lib_common/TencentOpenApi/TencentOpenAPI.framework/TencentOpenAPI(TencentOAuth.o)


### 注意事项五：文档完整并且正确

说明：这就不用解释了吧？

Bad Case: 微信官方的微信支付的示例代码，里面有各种错误，代码都无法编译成功。如下所示的是其中一个错误：

{% img /images/weixin-pay-error.jpg %}

于是还有人专门帮微信另外制作了一个非官方的说明文档，地址在这里：<https://github.com/gbammc/WechatPayDemo>

### 注意事项六：支持最新的 CPU 版本

说明：去年苹果的一次 Bug，造成上传应用必须支持 arm64 的 CPU 版本，结果众多应用因为依赖的 SDK 不支持 arm64 而无法更新。当然，这次 Bug 出来之后，各 SDK 厂商都紧急做了更新。但是我觉得这种事情如果要做得专业，就应该一开始就紧跟技术更新，及时更新，而不是被迫更新。

## 总结

以上 6 点是我认为写一个 SDK 的最最基本的要求，希望被点名批评的同学能尽快改正哟～

如果大家在使用其它 SDK 时也发现了类似的问题，欢迎在文章下面留言。希望通过这种方式给开发相关 SDK 的同学一些压力，让他们好好改一下。

