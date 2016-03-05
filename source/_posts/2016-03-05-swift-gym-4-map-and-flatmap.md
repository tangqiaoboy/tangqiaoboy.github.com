---
title: Swift 烧脑体操（四） - map 和 flatMap
date: 2016-03-05 20:15:34
categories: iOS
tags: Swift
---

## 版权说明

本文为 InfoQ 中文站特供稿件，首发地址为：[文章链接](http://www.infoq.com/cn/articles/swift-brain-gym-map-and-flatmap)。如需转载，请与 InfoQ 中文站联系。

## 前言

Swift 其实比 Objective-C 复杂很多，相对于出生于上世纪 80 年代的 Objective-C 来说，Swift 融入了大量新特性。这也使得我们学习掌握这门语言变得相对来说更加困难。不过一切都是值得的，Swift 相比 Objective-C，写出来的程序更安全、更简洁，最终能够提高我们的工作效率和质量。

Swift 相关的学习资料已经很多，我想从另外一个角度来介绍它的一些特性，我把这个角度叫做「烧脑体操」。什么意思呢？就是我们专门挑一些比较费脑子的语言细节来学习。通过「烧脑」地思考，来达到对 Swift 语言的更加深入的理解。

这是本体操的第四节，练习前请做好准备运动，保持头脑清醒。

我之前一直以为我是懂 `map` 和 `flatMap` 的。但是直到我看到别人说：「一个实现了 `flatMap` 方法的类型其实就是 monad。」我又发现这个熟悉的东西变得陌生起来，本节烧脑体操打算更细致一些介绍 `map` 和 `flatMap`，为了下一节介绍 monad 做铺垫。

## 准备运动：基础知识

![](http://ww4.sinaimg.cn/mw690/65dc76a3gw1f0sz177142j20dk07bjsd.jpg)

### 数组中的 `map` 和 `flatMap`

数组中的 `map` 对数组元素进行某种规则的转换，例如：

```
let arr = [1, 2, 4]
// arr = [1, 2, 4]

let brr = arr.map {
    "No." + String($0)
}
// brr = ["No.1", "No.2", "No.4"]
```

而 `flatMap` 和 `map` 的差别在哪里呢？我们可以对比一下它们的定义。为了方便阅读，我在删掉了定义中的 `@noescape` 、`throws` 和 `rethrows` 关键字，如果你对这些关键字有疑问，可以查阅上一期的烧脑文章：

```
extension SequenceType {
    public func map<T>(transform: (Self.Generator.Element) -> T) 
         -> [T]
}

extension SequenceType {
    public func flatMap<S : SequenceType>(transform: (Self.Generator.Element) -> S) 
         -> [S.Generator.Element]
}

extension SequenceType {
    public func flatMap<T>(transform: (Self.Generator.Element) -> T?) 
         -> [T]
}
```

我们从中可以发现，`map` 的定义只有一个，而 `flatMap` 的定义有两个重载的函数，这两个重载的函数都是接受一个闭包作为参数，返回一个数组。但是差别在于，闭包的定义不一样。

第一个函数闭包的定义是：`(Self.Generator.Element) -> S`，并且这里 S 被定义成：`S : SequenceType`。所以它是接受数组元素，然后输出一个 `SequenceType` 类型的元素的闭包。有趣的是， `flatMap` 最终执行的结果并不是 `SequenceType` 的数组，而是 `SequenceType` 内部元素另外组成的数组，即：`[S.Generator.Element]`。

是不是有点晕？看看示例代码就比较清楚了：

```
let arr = [[1, 2, 3], [6, 5, 4]]
let brr = arr.flatMap {
    $0
}
// brr = [1, 2, 3, 6, 5, 4]
```

你看出来了吗？在这个例子中，数组 arr 调用 `flatMap` 时，元素`[1, 2, 3]` 和 `[6, 5, 4]` 分别被传入闭包中，又直接被作为结果返回。但是，最终的结果中，却是由这两个数组中的元素共同组成的新数组：`[1, 2, 3, 6, 5, 4]` 。

需要注意的是，其实整个 `flatMap` 方法可以拆解成两步：

 * 第一步像 `map` 方法那样，对元素进行某种规则的转换。
 * 第二步，执行 `flatten` 方法，将数组中的元素一一取出来，组成一个新数组。

所以，刚刚的代码其实等价于：

```
let arr = [[1, 2, 3], [6, 5, 4]]
let crr = Array(arr.map{ $0 }.flatten())
// crr = [1, 2, 3, 6, 5, 4]
```

讲完了 `flatMap` 的第一种重载的函数，我们再来看第二种重载。

在第二种重载中，闭包的定义变成了：`(Self.Generator.Element) -> T?`，返回值 T 不再像第一种重载中那样要求是数组了，而变成了一个 Optional 的任意类型。而 `flatMap` 最终输出的数组结果，其实不是这个 `T?` 类型，而是这个 `T?` 类型解包之后，不为 `.None` 的元数数组：`[T]`。

我们还是直接看代码吧。

```
let arr: [Int?] = [1, 2, nil, 4, nil, 5]
let brr = arr.flatMap { $0 }
// brr = [1, 2, 4, 5]
```

在这个例子中，`flatMap` 将数组中的 nil 都丢弃掉了，只保留了非空的值。

在实际业务中，这样的例子还挺常见，比如你想构造一组图片，于是你使用 UIImage 的构造函数，但是这个函数可能会失败（比如图像的名字不存在时），所以返回的是一个 Optional 的 UIImage 对象。使用 `flatMap` 方法可以方便地将这些对象中为 .None 的都去除掉。如下所示：

```
let images = (1...6).flatMap {
    UIImage(named: "imageName-\($0)") 
}  
```

### Optional 中的 `map` 和 `flatMap`

其实 `map` 和 `flatMap` 不止存在于数组中，在 Optional 中也存在。我们先看看定义吧：

```
public enum Optional<Wrapped> : _Reflectable, NilLiteralConvertible {
    case None
    case Some(Wrapped)

    public func map<U>( f: (Wrapped) throws -> U) 
        rethrows -> U?

    public func flatMap<U>( f: (Wrapped) throws -> U?) 
        rethrows -> U?
}
```

所以，对于一个 Optional 的变量来说，`map` 方法允许它再次修改自己的值，并且不必关心自己是否为 `.None`。例如：

```
let a1: Int? = 3
let b1 = a1.map{ $0 * 2 }
// b1 = 6

let a2: Int? = nil
let b2 = a2.map{ $0 * 2 }
// b2 = nil
```

再举一个例子，比如我们想把一个字符串转成 NSDate 实例，如果不用 `map` 方法，我们只能这么写：

```
var date: NSDate? = ...
var formatted = date == nil ? nil : NSDateFormatter().stringFromDate(date!)
```

而使用 `map` 函数后，代码变得更短，更易读：

```
var date: NSDate? = ...
var formatted = date.map(NSDateFormatter().stringFromDate)
```

看出来特点了吗？当我们的输入是一个 Optional，同时我们需要在逻辑中处理这个 Optional 是否为 nil，那么就适合用 `map` 来替代原来的写法，使得代码更加简短。

那什么时候使用 Optional 的 `flatMap` 方法呢？答案是：当我们的闭包参数有可能返回 nil 的时候。

比如，我们希望将一个字符串转换成 Int，但是转换可能失败，这个时候我们就可以用 `flatMap` 方法，如下所示：

```
let s: String? = "abc"
let v = s.flatMap { (a: String) -> Int? in
    return Int(a)
}
```

我在这里还发现了更多的使用 `map` 和 `flatMap` 的例子，分享给大家：<http://blog.xebia.com/the-power-of-map-and-flatmap-of-swift-optionals/>。

## `map` 和 `flatMap` 的源码

![](https://quotesaga.s3.amazonaws.com/quote/QS_be152af2851e4e4e8d5049b0d5cbaed9.jpg)

>Talk is cheap. Show me the code.
>
>-- Linus Torvalds

为了更好地理解，我们去翻翻苹果开源的 Swift 代码，看看 `map` 和 `flatMap` 的实现吧。

### 数组的 `map` 的源码

源码地址是：<https://github.com/apple/swift/blob/master/stdlib/public/core/Collection.swift>，摘录如下：

```
public func map<T>(@noescape transform: (Generator.Element) throws -> T)
        rethrows -> [T] {
    let count: Int = numericCast(self.count)
    if count == 0 {
        return []
    }
    
    var result = ContiguousArray<T>()
    result.reserveCapacity(count)
    
    var i = self.startIndex
    
    for _ in 0..<count {
        result.append(try transform(self[i]))
        i = i.successor()
    }
    
    _expectEnd(i, self)
    return Array(result)
}
```

### 数组的 `flatMap` 的源码（重载函数一）

刚刚也说到，数组的 `flatMap` 有两个重载的函数。我们先看第一个的函数实现。源码地址是：<https://github.com/apple/swift/blob/master/stdlib/public/core/SequenceAlgorithms.swift.gyb>。

```

public func flatMap<S : SequenceType>(
        transform: (${GElement}) throws -> S
    ) rethrows -> [S.${GElement}] {
        var result: [S.${GElement}] = []
        for element in self {
            result.appendContentsOf(try transform(element))
        }
        return result
}

```

对于这个代码，我们可以看出，它做了以下几件事情：

 1. 构造一个名为 `result` 的新数组，用于存放结果。
 1. 遍历自己的元素，对于每个元素，调用闭包的转换函数 `transform`，进行转换。
 1. 将转换的结果，使用 `appendContentsOf` 方法，将结果放入 `result` 数组中。

而这个 `appendContentsOf` 方法，即是把数组中的元素取出来，放入新数组。以下是一个简单示例：

```
var arr = [1, 3, 2]
arr.appendContentsOf([4, 5])
// arr = [1, 3, 2, 4, 5]
```

所以这种 `flatMap` 必须要求 `transform` 函数返回的是一个 `SequenceType` 类型，因为 `appendContentsOf` 方法需要的是一个 `SequenceType` 类型的参数。

### 数组的 `flatMap` 的源码（重载函数二）

当我们的闭包参数返回的类型不是 `SequenceType` 时，就会匹配上第二个重载的 `flatMap` 函数。以下是函数的源码。

```
public func flatMap<T>(
    @noescape transform: (${GElement}) throws -> T?
    ) rethrows -> [T] {
        var result: [T] = []
        for element in self {
            if let newElement = try transform(element) {
                result.append(newElement)
            }
        }
        return result
}
```

我们也用同样的方式，把该函数的逻辑理一下：

 1. 构造一个名为 `result` 的新数组，用于存放结果。(和另一个重载函数完全一样)
 1. 遍历自己的元素，对于每个元素，调用闭包的转换函数 `transform`，进行转换。(和另一个重载函数完全一样)
 1. 将转换的结果，判断结果是否是 nil，如果不是，使用使用 `append` 方法，将结果放入 `result` 数组中。（唯一差别的地方）

所以，该 `flatMap` 函数可以过滤闭包执行结果为 nil 的情况，仅收集那些转换后非空的结果。

对于这种重载的 `flatMap` 函数，它和 `map` 函数的逻辑非常相似，仅仅多做了一个判断是否为 nil 的逻辑。

所以，面试题来了：「什么情况下数组的 `map` 可以和 `flatMap` 等价替换？」

答案是：当 `map` 的闭包函数返回的结果不是 `SequenceType` 的时候。因为这样的话，`flatMap` 就会调到我们当前讨论的这种重载形式。而这种重载形式和 `map` 的差异就仅仅在于要不要判断结果为 nil。

下面是一个示例代码，可以看出：`brr` 和 `crr` 虽然分别使用 `map` 和 `flatMap` 生成，但是结果完全一样：

```
let arr = [1, 2, 4]
// arr = [1, 2, 4]

let brr = arr.map {
    "No." + String($0)
}
// brr = ["No.1", "No.2", "No.4"]

let crr = arr.flatMap {
    "No." + String($0)
}
// crr = ["No.1", "No.2", "No.4"]
```

### Optional 的 `map` 和 `flatMap` 源码

看完数组的实现，我们再来看看 Optional 中的相关实现。源码地址是：<https://github.com/apple/swift/blob/master/stdlib/public/core/Optional.swift>，摘录如下：

```
/// If `self == nil`, returns `nil`.  
/// Otherwise, returns `f(self!)`.
public func map<U>(@noescape f: (Wrapped) throws -> U) 
        rethrows -> U? {
    switch self {
    case .Some(let y):
        return .Some(try f(y))
    case .None:
        return .None
    }
}

/// Returns `nil` if `self` is `nil`, 
/// `f(self!)` otherwise.
@warn_unused_result
public func flatMap<U>(@noescape f: (Wrapped) throws -> U?) 
        rethrows -> U? {
    switch self {
    case .Some(let y):
        return try f(y)
    case .None:
        return .None
    }
}

```

Optional 的这两函数真的是惊人的相似，如果你只看两段函数的注释的话，甚至看不出这两个函数的差别。

这两函数实现的差别仅仅只有两处：

 1. `f` 函数一个返回 `U`，另一个返回 `U?` 。
 1. 一个调用的结果直接返回，另一个会把结果放到 .Some 里面返回。

两个函数最终都保证了返回结果是 Optional 的。只是将结果转换成 Optional 的位置不一样。

这就像我老婆给我说：「我喜欢这个东西，你送给我吗？不送的话我就直接刷你卡买了！」。。。买东西的结果本质上是一样的，谁付钱本质上也是一样的，差别只是谁动手而已。

既然 Optional 的 `map` 和 `flatMap` 本质上是一样的，为什么要搞两种形式呢？这其实是为了调用者更方便而设计的。调用者提供的闭包函数，既可以返回 Optional 的结果，也可以返回非 Optional 的结果。对于后者，使用 `map` 方法，即可以将结果继续转换成 Optional 的。结果是 Optional 的意味着我们可以继续链式调用，也更方便我们处理错误。

我们来看一段略烧脑的代码，它使用了 Optional 的 `flatMap` 方法：

```
var arr = [1, 2, 4]
let res = arr.first.flatMap {
    arr.reduce($0, combine: max)
}
````

这段代码的功能是：计算出数组中的元素最大值，按理说，求最大值直接使用 `reduce` 方法就可以了。不过有一种特殊情况需要考虑：即数组中的元素个数为 0 的情况，在这种情况下，没有最大值。

我们使用 Optional 的 `flatMap` 方法来处理了这种情况。arr 的 `first` 方法返回的结果是 Optional 的，当数组为空的时候，`first` 方法返回 .None，所以，这段代码可以处理数组元素个数为 0 的情况了。

## 烧脑的 `map` 和 `flatMap`

### 关于取名

![](http://ww1.sinaimg.cn/large/65dc76a3gw1f0sygrb8chj20c606egmg.jpg)

>There are only two hard things in Computer Science: cache invalidation and naming things.
>
>-- Phil Karlton

有一位大师说，计算机世界真正称得上难题的就只有两个：第一个是缓存过期问题，第二个就是取名字。作为文章最后的烧脑环节，我们来聊聊取名字这个事吧。

我来提几个看起来「无厘头」的问题：

 * 数组的 `map` 函数和 Optinal 的 `map` 函数的实现差别巨大？但是为什么都叫 `map` 这个名字？
 * 数组的 `flatMap` 函数和 Optinal 的 `flatMap` 函数的实现差别巨大？但是为什么都叫 `flatMap` 这个名字？
 * 数组的 `flatMap` 有两个重载的函数，两个重载的函数差别巨大，但是为什么都叫 `flatMap` 这个名字？

在我看来，这样的取名其实都是有背后的原因的，我试着分享一下我的理解。我们先说结论，然后再解释。这段结论来自：<http://www.mokacoding.com/blog/functor-applicative-monads-in-pictures/>。

 * 数组和 Optional 的 `map` 函数都叫一样的名字，是因为它们都是 [Functor](https://en.wikipedia.org/wiki/Functor)。
 * 数组和 Optinal 的 `flatMap` 函数都叫一样的名字，是因为它们都是 [Monad](https://en.wikipedia.org/wiki/Monad_(functional_programming))。

![](http://ww3.sinaimg.cn/large/65dc76a3gw1f0scj26hf9j205805k3yk.jpg)

好吧，我猜你心里开始骂娘了：「为了解释一个问题，引入了两个新问题：谁知道什么是 Functor 和 Monad ！」

不要着急，我们先说严谨的结论有助于更好地总结和归纳，我下面试着解释一下 Functor 和 Monad 。

### Functor

Functor 在 [Wikipedia](https://en.wikipedia.org/wiki/Functor) 上的定义非常学术。我想了一个相对比较容易理解的定义：所谓的 Functor，就是可以把一个函数应用于一个「封装过的值」上，得到一个新的「封装过的值」。通常情况下，我们会把这个函数叫做 `map`。

什么叫做「封装过的值」呢？数组就是对值的一种封装，Optional 也是对值的一种封装。如果你愿意，你也可以自己封装一些值，比如把网络请求的结果和网络异常封装在一起，做成一个 enum（如下所示）。

```
enum Result<T> {
    case Success(T)
    case Failure(ErrorType)
}
```

一个值能否成为「封装过的值」，取决于这个值的类型所表示的集合，通过 `map` 函数，能否映射到一个新集合中。这个新集合，也要求能够继续使用 `map` 函数，再映射到另外一个集合。

我们拿数组和 Optional 类型来检查这个规则，就会发现是符合的：

 * 数组可以通过 `map` 函数，生成一个新的数组，新的数组可以继续使用 `map` 函数。
 * Optional 可以通过 `map` 函数，生成一个新的 Optional 变量，新的 Optional 变量可以继续使用 `map` 函数。

所以，数组 和 Optional 都是 Functor。

### Monad

如果你能理解 [Functor](https://en.wikipedia.org/wiki/Functor)，那么 [Monad](https://en.wikipedia.org/wiki/Monad_(functional_programming)) 就相对容易一些了。所谓的 Monad，和 Functor 一样，也是把一个函数应用于一个「封装过的值」上，得到一个新的「封装过的值」。不过差别在于:

 * Functor 的函数定义是从「未封装的值」到「未封装的值」的
 * Monad   的函数定义是从「未封装的值」到「封装后的值」的。

下面我举例解释一下：

刚刚我们说，数组 和 Optional 都是 Functor，因为它们支持用 `map` 函数做「封装过的值」所在集合的变换。那么，你注意到了吗？map 函数的定义中，输入的参数和返回的结果，都不是「封装过的值」，而是「未封装的值」。什么是「未封装的值」？

 * 对于数组来说，「未封装的值」是数组里面一个一个的元素，map 函数的闭包接受的是一个一个的元素，返回的也是一个一个的元素。
 * 对于 Optional 来说，「未封装的值」是 Optional 解包出来的值，map 函数的闭包接受的是解包出来的值，返回的也是解包出来的值。

下面是数组的示例代码，我故意加上了闭包的参数，我们再观察一下。我们可以发现，`map` 的闭包接受的是 Int 类型，返回的是 String 类型，都是一个一个的元素类型，而不是数组。

```
// map 的闭包接受的是 Int 类型，返回的是 String 类型，都是一个一个的元素类型，而不是数组。
let arr = [1, 2, 4]
let brr = arr.map {
    (element: Int) -> String in
    "No." + String(element)
}
```

下面是 Optional 的示例代码，我也故意加上了闭包的参数。我们可以发现，`map` 的闭包接受的是 Int 类型，返回的是 Int 类型，都是非 Optional 的。

```
// map 的闭包接受的是 Int 类型，返回的是 Int 类型，都是非 Optional 的。
let tq: Int? = 1
tq.map { (a: Int) -> Int in
    a * 2
}
```

我们刚刚说，对于 Monad 来说，它和 Functor 的差异实在太小，小到就只有闭包的参数类型不一样。数组实现了 `flatMap` ，它就是一种 Monad，下面我们就看看 `flatMap` 在数组中的函数定义，我们可以看出，闭包接受的是数组的元素，返回的是一个数组（封装后的值）。

```
// 闭包接受的是数组的元素，返回的是一个数组（封装后的值）
let arr = [1, 2, 3]
let brr = arr.flatMap {
    (element:Int) -> [Int] in
    return [element * 2]
}
```

下面是 `flatMap` 在 Optional 中的定义，我们可以看出，闭包接受的是 Int 类型，返回的是一个 Optional（封装后的值）。

```。
// 闭包接受的是 Int 类型，返回的是一个 Optional（封装后的值）
let tq: Int? = 1
tq.flatMap { (a: Int) -> Int? in
    if a % 2 == 0 {
        return a
    } else {
        return nil
    }
}
```

所以本质上，`map` 和 `flatMap` 代表着一类行为，我们把这类行为叫做 Functor 和 Monad。它们的差异仅仅在于闭包函数的参数返回类型不一样。所以，我们才会把数组和 Optional 这两个差别很大的类型，都加上两个实现差别很大的函数，但是都取名叫 `map` 和 `flatMap`。

### 多重 Optional

我们在第一节烧脑文章中提到过多重 Optional，在使用 `map` 的时候不仔细，就会触发多重 Optional 的问题。比如下面这个代码，变量 `b` 因为是一个两层嵌套的 nil，所以 `if let` 失效了。

```
let tq: Int? = 1
let b = tq.map { (a: Int) -> Int? in
    if a % 2 == 0 {
        return a
    } else {
        return nil
    }
}
if let _ = b {
    print("not nil")
}
```

解决办法是把 `map` 换成 `flatMap` 即可。

## 总结

讨论完了，我们总结一下：

 * 数组和 Optional 都能支持 `map` 和 `flatMap` 函数。
 * 数组的 `flatMap` 有两个重载的实现，一个实现等价于先 `map` 再 `flatten`，另一个实现用于去掉结果中的 nil。
 * 通过阅读源码，我们更加深入理解了 `map` 和 `flatMap` 函数内部的机制。
 * 我们讨论了 `map` 和 `flatMap` 的取名问题，最后得出：一个类型如果支持 `map`，则表示它是一个 [Functor](https://en.wikipedia.org/wiki/Functor)；一个类型如果支持 `flatMap`，则表示它是一个 [Monad](https://en.wikipedia.org/wiki/Monad_(functional_programming)。
 * 我们讨论了 `map` 中使用不当造成的多重 Optional 问题。
