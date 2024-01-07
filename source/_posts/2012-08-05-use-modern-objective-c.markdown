---
layout: post
title: "Objective-C的新特性"
date: 2012-08-05 21:50
comments: true
categories: iOS
---

苹果在今年的 WWDC2012 大会上介绍了大量 Objective-C 的新特性，能够帮助 iOS 程序员更加高效地编写代码。在不久前更新的 Xcode4.4 版本中，这些新特性已经可以使用了。让我们看看这些新特性有哪些：

<!-- more -->

## Object Literals

这个是我认为最赞的一个改进。Object Literals 允许你方便地定义数字、数组和字典对象。这个功能类似于 java5 提供的 auto boxing 功能。这虽然是一个语法糖，但我认为对提高写代码效率帮助很大。让我们先来看看以前定义数字、数组和字典对象的方法：

``` objc
    NSNumber * number = [NSNumber numberWithInt:1];
    NSArray * array = [NSArray arrayWithObjects:@"one", @"two", nil];
    NSDictionary * dict = [NSDictionary dictionaryWithObjectsAndKeys:@"value1", @"key1", @"value2", @"key2", nil];
```
是不是很恶心？现在以上代码可以简化成以下形式，注意到没有，不用再在参数的最后加恶心的 nil 了，字典的 key 和 value 也不再是倒着先写 value, 再写 key 了：

``` objc
    NSNumber * number = @1;
    NSArray * array = @[@"one", @"two"];
    NSDictionary * dict = @{@"key1":@"value1", @"key2":@"value2"};
```

更多的示例如下：

``` objc
  // 整数
  NSNumber *fortyTwo = @42;             // 等价于 [NSNumber numberWithInt:42]
  NSNumber *fortyTwoUnsigned = @42U;    // 等价于 [NSNumber numberWithUnsignedInt:42U]
  NSNumber *fortyTwoLong = @42L;        // 等价于 [NSNumber numberWithLong:42L]
  NSNumber *fortyTwoLongLong = @42LL;   // 等价于 [NSNumber numberWithLongLong:42LL]

  // 浮点数
  NSNumber *piFloat = @3.141592654F;    // 等价于 [NSNumber numberWithFloat:3.141592654F]
  NSNumber *piDouble = @3.1415926535;   // 等价于 [NSNumber numberWithDouble:3.1415926535]

  // 布尔值
  NSNumber *yesNumber = @YES;           // 等价于 [NSNumber numberWithBool:YES]
  NSNumber *noNumber = @NO;             // 等价于 [NSNumber numberWithBool:NO]

  // 空数组
  NSArray * array = @[];                // 等价于 [NSArray array]
  // 空的字典
  NSDictionary * dict = @{};            // 等价于 [NSDictionary dictionary]



```

怎么样？是不是简单多了？而且，为了方便你的旧代码迁移到新的写法，xcode 专门还提供了转换工具，在 xcode4.4 中，选择 Edit -> Refactor -> Convert to Modern Objective-C Syntax 即可。如下所示：
{% img /images/modern-objc-convert-tool.jpg %}

## 局部的函数调用不用前向申明

这虽然是一个挺小的改进，但是很贴心。假如我们在一个源文件中有 2 个函数：分别名为 foo 和 bar，其中 foo 的定义在 bar 前面。那如果在 foo 函数内部直接调用 bar，编译器会报警告说找不到函数 bar。

而现在，我们可以随意地在源文件中放置函数 bar 的位置。编译器在找不到 bar 时，会再源码后面找，如果找到了 bar，就不会报错了。

## 带有类型的 enum

现在我们可以定义 enum 是无符号整数还是整数，这样编译器会更加智能的做类型检查。如下所示：

``` objc
typedef enum TableViewCellType : NSInteger {
    TableViewCellTypeQueue,
    TableViewCellTypeNewFans,
    TableViewCellTypeUserInfo,
    TableViewCellTypeOrganization,
    TableViewCellTypeFeedback,
    TableViewCellTypeRateApp,
    TableViewCellTypeRecommendation,
    TableViewCellTypeLogout
}TableViewCellType;
```

## 默认生成 @synthesize 代码

以前写完一个诸如 @property (nonatomic, strong) NSString * username; 变量定义后，马上得转到 .m 文件中去增加相应的 @synthesize username = _username; 代码。

现在，编辑器发现你没有写 @synthesize 时，会自动帮你加上这一行。这同时在另一方面，起到了鼓励大家使用以下划线开头的变量名作为成员变量名的作用。

当然，为了向下兼容，如果你的程序里面已经有了 @property 变量对应的 @synthesize 代码时，编辑器就不会自动帮你增加这个代码了。

另外有 2 种特殊情况下，即使你没有写 @synthesize ，编辑器也不会自动帮你加上，这 2 种情况是：

1. 你同时提供了该 property 的 setter 和 getter 方法。
2. 你的这个 property 是 readonly 的，并且你提供了其 getter 方法。

## 遍历元素

你是如何遍历数组的元素的？通常我们有 2 种做法，一种是用 for in，另一种是用一个变量来循环数组下标。如下：

``` objc
        NSArray * lines = ...
        for (NSString * line in lines) {
           // ...
        }
        for (int i = 0; i < lines.count; ++i) {
            NSString * s = [lines objectAtIndex:i];
            ...
        }
```

如果是字典，遍历的代码就要稍微复杂一点了：
``` objc
        NSDictionary * dict = …
        NSArray * keys = [dict allKeys];
        for (NSString * key in keys) {
            NSString * value = [dict objectForKey:key];
            
        }
``` 

现在，xcode 对于 iOS4.0 以上的系统，支持用 block 来遍历元素了。用 block 来遍历字典可以简化代码的编写，建议大家都使用上这个新特性。

``` objc
    [lines enumerateObjectsUsingBlock:^(NSString * obj, NSUInteger idx, BOOL *stop) {
            
    }];

    [_urlArguments enumerateKeysAndObjectsUsingBlock:^(id key, id obj, BOOL *stop) {

    }];
```

## Subscripting Methods

这个新特性在 WWDC2012 的视频中提到了，但是在 Xcode4.4 中没有实现（在 Xcode4.5 中实现了）。也是一个很体贴的语法糖，它允许你用中括号来代替原本的方法来获取和设置数组元素。

简单来说，以前的 [array objectAtIndex:idx] 和 [array replaceObjectAtIndex:idx withObject:obj]，可以直接写作 array[idx] 和 array[idx] = obj 了。其实这个特性在很多高级语言中都实现了，只是 Objective-C 生于 80 年代，一直没改进这个。

以下是一些示例代码：
``` objc
    NSArray * array = @[ @"111", @"222", @"333"];
    for (int i = 0; i < 3; ++i) {
        NSLog(@"array[i] = %@", array[i]);
    }
    
    NSMutableDictionary * dict =[@{  @1: @"value1",
                                     @2: @"value2",
                                     @3: @"value3" } mutableCopy];
    for (int i = 0; i < 3; ++i) {
        NSLog(@"dict[%d] = %@", i, dict[@(i+1)]);
        dict[@(i+1)] = [NSString stringWithFormat:@"new %@", dict[@(i+1)]];
    }
    
    [dict enumerateKeysAndObjectsUsingBlock:^(id key, id obj, BOOL *stop) {
        NSLog(@"dict[%@] = %@", key, dict[key]);
    }];
```

这个改进同样对 NSDictionary 有效。甚至，你也可以给你自己的类提供中括号操作符对应的方法。具体做法是实现如下两个方法：

``` objc
- (id)objectAtIndexedSubscript:(NSUInterger)idx;
- (void)setObject:(id)value atIndexedSubscript:(NSUInteger)idx;
```

## Tips
上面提到了不用写 @synthesize 了，那原本写的那么多 @synthesize 怎么办呢？作为有代码洁癖的我很想把它们删掉，但怎么删呢？一个文件一个文件打开，然后行一行删掉吗？放心，苹果已经帮我们想了解决方案。在 WWDC2012 Session 400 Developer Tools Kickoff 中，苹果介绍了具体做法。步骤如下：

1. 首先使用区域查找，因为一般项目都会依赖第三方的开源库，我们可不想更改别人的库，所以我们只查找我们库中的文件，如下图所示：

{% img /images/modern-objc-remove-synthesize-1.png %}

2. 接着我们用正则匹配，找到以 @synthesize 开头，后面接着是 var = _var; 格式的行。插入正则表达式很简单，直接点击查找输入框左边的放大镜，选择 “insert pattern"，苹果就会把常见的正则表达式都列出来，你直接选择就可以了，非常方便。如下图所示：

{% img /images/modern-objc-insert-pattern.png %}

在插入好合适的正则表达式后，我们按回车，就可以搜索到结果。

{% img /images/modern-objc-search-result.png %}

3. 我们点击搜索界面的 preview 按钮，查看替换效果，可以看到，对于我们测试代码，Xcode 生成的预览图已经正确地当对应代码删掉了。然后我们就可以点击替换，去掉所有的 @synthesize 代码了。

{% img /images/modern-objc-replace-review.png %}


在下载完 Xcode4.4 后，我就把我们的工程代码都转换成了新特性的语法。在转换后，我发现原本 25000 行的代码少了将近 1000 行。心里还是很开心的，因为又可以少写一些体力活类型的代码了。

还是那句话，希望这些新特性能够让大家玩得开心。

### 参考资料
 * LLVM 官方网站比较全面地介绍了 Object Literal： <http://clang.llvm.org/docs/ObjectiveCLiterals.html>
 * WWDC2012 Session 400 Developer Tools Kickoff
 * WWDC2012 Session 405 Modern Objective-C 
 * WWDC2012 Session 413 Migrating to Modern Objective-C

