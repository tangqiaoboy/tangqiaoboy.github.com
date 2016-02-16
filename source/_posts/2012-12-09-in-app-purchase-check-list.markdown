---
layout: post
title: "iOS应用内付费(IAP)开发步骤列表"
date: 2012-12-09 12:55
comments: true
categories: iOS
---

前两天和服务端同事一起，完成了应用内付费（以下简称IAP, In app purchase）的开发工作。步骤繁多，在此把开发步骤列表整理如下。因为只是步骤列表，所以并不含详细的说明教程，需要看教程的新手，可以看我附在最后的一些参考链接。

<!-- more -->

### 配置Developer.apple.com

登录到[Developer.apple.com](https://developer.apple.com/)，然后进行以下步骤：

1. 为应用建立建立一个不带通配符的App ID
2. 用该App ID生成和安装相应的Provisioning Profile文件。

### 配置iTunes Connect

登录到[iTunes Connet](https://itunesconnect.apple.com/)，然后进行以下步骤：

1. 用该App ID创建一个新的应用。
2. 在该应用中，创建应用内付费项目，选择付费类型，通常可选的是可重复消费(Consumable)的或是永久有效(Non-Consumable)的2种，然后设置好价格和Product ID以及购买介绍和截图即可，这里的Product ID是需要记住的，后面开发的时候需要。如下图所示：
  {% img /images/iap-add-product-id.png %}


3. 添加一个用于在sandbox付费的测试用户，如下图所示。注意苹果对该测试用户的密码要求
和正式账号一样，必须是至少8位，并且同时包含数字和大小写字母：
  {% img /images/iap-adduser-1.png %}
  {% img /images/iap-adduser-2.png %}

4. 填写相关的税务，银行，联系人信息。如下图所示：
  {% img /images/iap-tax-info.png %}

###开发工作(ios端)

1、 在工程中引入 storekit.framework 和 #import <StoreKit/StoreKit.h>

2、 获得所有的付费Product ID列表。这个可以用常量存储在本地，也可以由自己的服务器返回。

3、 制作一个界面，展示所有的应用内付费项目。这些应用内付费项目的价格和介绍信息可以是自己的服务器返回。但如果是不带服务器的单机游戏应用或工具类应用，则可以通过向App Store查询获得。我在测试时发现，向App Store查询速度非常慢，通常需要2-3秒钟，所以不建议这么做，最好还是搞个自己的服务器吧。

4、当用户点击了一个IAP项目，我们先查询用户是否允许应用内付费，如果不允许则不用进行以下步骤了。代码如下：
``` objc
    if ([SKPaymentQueue canMakePayments]) {
        // 执行下面提到的第5步：
        [self getProductInfo];
    } else {
        NSLog(@"失败，用户禁止应用内付费购买.");
    }
```

5、 我们先通过该IAP的ProductID向AppStore查询，获得SKPayment实例，然后通过SKPaymentQueue的 addPayment方法发起一个购买的操作。
``` objc
// 下面的ProductId应该是事先在itunesConnect中添加好的，已存在的付费项目。否则查询会失败。
- (void)getProductInfo {
	NSSet * set = [NSSet setWithArray:@[@"ProductId"]];
	SKProductsRequest * request = [[SKProductsRequest alloc] initWithProductIdentifiers:set];
	request.delegate = self;
	[request start];
}

// 以上查询的回调函数
- (void)productsRequest:(SKProductsRequest *)request didReceiveResponse:(SKProductsResponse *)response {
    NSArray *myProduct = response.products;
    if (myProduct.count == 0) {
        NSLog(@"无法获取产品信息，购买失败。");
        return;
    }
    SKPayment * payment = [SKPayment paymentWithProduct:myProduct[0]];
    [[SKPaymentQueue defaultQueue] addPayment:payment];
}
```

6、 在viewDidLoad方法中，将购买页面设置成购买的Observer。
``` objc
- (void)viewDidLoad {
    [super viewDidLoad];
    // 监听购买结果
    [[SKPaymentQueue defaultQueue] addTransactionObserver:self];
}

- (void)viewDidUnload {
    [super viewDidUnload];
    [[SKPaymentQueue defaultQueue] removeTransactionObserver:self];
}
```

7、 当用户购买的操作有结果时，就会触发下面的回调函数，相应进行处理即可。
``` objc
- (void)paymentQueue:(SKPaymentQueue *)queue updatedTransactions:(NSArray *)transactions {
    for (SKPaymentTransaction *transaction in transactions)
    {
        switch (transaction.transactionState)
        {
            case SKPaymentTransactionStatePurchased://交易完成
                NSLog(@"transactionIdentifier = %@", transaction.transactionIdentifier);
                [self completeTransaction:transaction];
                break;
            case SKPaymentTransactionStateFailed://交易失败
                [self failedTransaction:transaction];
                break;
            case SKPaymentTransactionStateRestored://已经购买过该商品
                [self restoreTransaction:transaction];
                break;
            case SKPaymentTransactionStatePurchasing:      //商品添加进列表
                NSLog(@"商品添加进列表");
                break;
            default:
                break;
        }
    }

}

- (void)completeTransaction:(SKPaymentTransaction *)transaction {
    // Your application should implement these two methods.
    NSString * productIdentifier = transaction.payment.productIdentifier;
    NSString * receipt = [transaction.transactionReceipt base64EncodedString];
    if ([productIdentifier length] > 0) {
        // 向自己的服务器验证购买凭证
    }

    // Remove the transaction from the payment queue.
    [[SKPaymentQueue defaultQueue] finishTransaction: transaction];

}

- (void)failedTransaction:(SKPaymentTransaction *)transaction {
    if(transaction.error.code != SKErrorPaymentCancelled) {
        NSLog(@"购买失败");
    } else {
        NSLog(@"用户取消交易");
    }
    [[SKPaymentQueue defaultQueue] finishTransaction: transaction];
}

- (void)restoreTransaction:(SKPaymentTransaction *)transaction {
	// 对于已购商品，处理恢复购买的逻辑
    [[SKPaymentQueue defaultQueue] finishTransaction: transaction];
}

```

8、服务器验证凭证(Optional)。如果购买成功，我们需要将凭证发送到服务器上进行验证。考虑到网络异常情况，iOS端的发送凭证操作应该进行持久化，如果程序退出，崩溃或网络异常，可以恢复重试。

###开发工作(服务端)

服务端的工作比较简单，分4步：

1. 接收ios端发过来的购买凭证。
2. 判断凭证是否已经存在或验证过，然后存储该凭证。
3. 将该凭证发送到苹果的服务器验证，并将验证结果返回给客户端。
4. 如果需要，修改用户相应的会员权限。

考虑到网络异常情况，服务器的验证应该是一个可恢复的队列，如果网络失败了，应该进行重试。

与苹果的验证接口文档在[这里](https://developer.apple.com/library/ios/#documentation/NetworkingInternet/Conceptual/StoreKitGuide/VerifyingStoreReceipts/VerifyingStoreReceipts.html#//apple_ref/doc/uid/TP40008267-CH104-SW3)。简单来说就是将该购买凭证用Base64编码，然后POST给苹果的验证服务器，苹果将验证结果以JSON形式返回。

苹果AppStore线上的购买凭证验证地址是<https://buy.itunes.apple.com/verifyReceipt> ，测试的验证地址是：<https://sandbox.itunes.apple.com/verifyReceipt>

## 参考链接

以下参考链接详细说明了完成应用内付费开发的步骤：

1. <https://developer.apple.com/appstore/in-app-purchase/index.html>
2. <http://www.himigame.com/iphone-cocos2d/550.html>
3. <http://www.cocoachina.com/iphonedev/sdk/2011/1028/3435.html>
4. <http://www.cocoachina.com/newbie/basic/2012/0214/3976.html>

