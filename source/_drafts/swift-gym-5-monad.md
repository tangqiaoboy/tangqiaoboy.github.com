---
title: Swift 烧脑体操（五）- Monad
categories: iOS
tags: Swift
---

![](http://ww2.sinaimg.cn/mw690/65dc76a3gw1f08hrkcyydj20i40cigv2.jpg)

## 前言

Swift 其实比 Objective-C 复杂很多，相对于出生于上世纪 80 年代的 Objective-C 来说，Swift 融入了大量新特性。这也使得我们学习掌握这门语言变得相对来说更加困难。不过一切都是值得的，Swift 相比 Objective-C，写出来的程序更安全、更简洁，最终能够提高我们的工作效率和质量。

Swift 相关的学习资料已经很多，我想从另外一个角度来介绍它的一些特性，我把这个角度叫做「烧脑体操」。什么意思呢？就是我们专门挑一些比较费脑子的语言细节来学习。通过「烧脑」地思考，来达到对 Swift 语言的更加深入的理解。

这是本体操的第五节，练习前请做好准备运动，保持头脑清醒。

![](http://ww4.sinaimg.cn/mw690/65dc76a3gw1f0sz15ou0fj20cx07d0u3.jpg)

## Why Monad?

因为 Monad 的定义有点复杂，我们先说为什么要理解和学习它。业界对于 Monad 的用处有着各种争论，特别是学术派喜欢用 Haskell 来解释它，因为「Haskell 是纯函数式编程语言」。但这往往让问题更加复杂了----我为了理解一个概念，还需要先学习一门新语言。

所以我希望就 Swift 这门语言，分享一下理解 Monad 有什么用。实际上，即使在 Wikipedia 上，[Monad](https://en.wikipedia.org/wiki/Monad_(functional_programming)) 也没有被强行用 Haskell 来解释。所以我相信基于 Swift 语言，还是可以把 Monad 的概念讲清楚。

在我看来，之所以有 Monad 这种结构，实际上是为了链式调用服务的。什么是链式调用呢？我们来看看下面一段代码：

```
let tq: Int? = 1
tq.flatMap {
    $0 * 100
}.flatMap {
    "image" + String($0)
}.flatMap {
    UIImage(named: $0)
}
```

所以，如果一句话解释 Monad，那就是：Monad 是一种设计模式，使得业务逻辑可以用链式调用的方式来书写。

在某些情况下，链式调用的方式组织代码会特别有效，比如当你的调用步骤是异步的时候，很容易写成多层嵌套的 `dispatch_async`，使用 Monad 可以使得多层嵌套被展开成链式调用，逻辑更加清楚。除了异步调用之外，编程中涉及输入输出、异常处理、并发处理等情况，使用 Monad 也可以使得代码逻辑更清晰。

## 基础知识

### 封装过的值（wrapped value)

这个中文词是我自己想出来的，有一些人把它叫做「上下文中的值」（value with a context），有一些人把它叫做「容器中的值」（value in a container)，意思是一样的。

什么叫做「封装过的值」呢？即把裸露的数据放到另一个结构中。例如：

* 数组就是对值的一种封装，因为数组把裸露的元素放到了一个线性表结构中。
* Optional 也是对值的一种封装，因为 Optional 把值和空放到了一个枚举（enum）类型中。

如果你愿意，你也可以自己封装一些值，比如把网络请求的结果和网络异常封装在一起，做成一个 enum (如下所示）。

```
enum Result<T> {
    case Success(T)
    case Failure(ErrorType)
}
```

判断一个数据类型是不是「封装过的值」，有一个简单的办法：就是看这个数据类型能不能「被打开」，拿出里面的裸露的元素。

 * 数组可以被打开，拿出里面的数组元素。
 * Optional 可以被打开，拿出里面的值或者 .None。
 * 一个 Int 类型的值，无法「被打开」，所以它不是「封装过的值」。

一个字符串是不是「封装过的值」呢？前提是你如何定义它「被打开」，如果你把它的打开定义成获得字符串里面的每个字符，那么字符串也可以是一个「封装过的值」。

<!--
那要这么说，其实 Int 也可以被看作一个「封装过的值」，如果你把它的打开，定义成获得这个 Int 的每个 bit 位的值就行。
-->

### flatMap

在上一篇烧脑文章中我们也提到过，要识别一个类型是不是 Monad，主要就是看它是否实现了 `flatMap` 方法。但是，如果你像下面这么实现 `flatMap`，那也不能叫 Monad：

```
class TangQiao {
    func flatMap() {
        print("Hello world")
    }
}
```

Monad 对于 `flatMap` 函数有着严格的定义，在 Haskell 语言中，这个函数名叫 bind，但是定义是一样的，这个函数应该：

 * 作用在一个「封装过的值」M 上。
 * 它的参数应该是另一个闭包 F，这个闭包 F：接受一个解包后的值，返回一个「封装过的值」。

具体在执行的时候，`flatMap` 会对 M 进行解包得到 C，然后调用闭包 F，传入解包后的 C，获得新的「封装过的值」。

我们来看看 Optional 的 `flatMap` 实现，验证一下刚刚说的逻辑。源码地址是：<https://github.com/apple/swift/blob/master/stdlib/public/core/Optional.swift>。

```
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

Optional 的 `flatMap`：

 * 作用在一个「封装过的值」：`self` 身上。
 * 接受一个闭包参数 `f`，这个 `f` 的定义是：接受解包后的值，返回一个「封装过的值」: `U?` 。
 * 在执行时，`flatMap` 先对 `self` 进行解包，代码是 `case .Some(let y)`。
 * 如果解包成功，则调用函数 f，得到一个新的「封装过的值」，代码是 `try f(y)`。
 * 如果解包出来是 .None，则返回 .None。

## 设计背后的追问

`flatMap` 接受的这个闭包参数，直观看起来很奇怪。接受的是解包的值，返回的又是封装过的值，一点都没有对称的美！

为什么要这么设计？不这么设计就不能完成链式调用吗？我想了半天，答案就是一个字：懒！

为什么这么说呢？因为「封装过的值」大多数时候不能直接计算，所以要计算的时候都要先解包，如果我们为了追求「对称的美」，使得函数接受的参数和返回的值都是「封装过的值」，当然是可以的。不过如果这么设计的话，你就会写大量雷同的解包代码。程序设计的时候追求「Don't Repeat Yourself」原则，这么做当然是不被接受的。

## Functor

刚刚我们说，在设计上为了复用代码，我们必须保证闭包的参数是解包后的值。

那么，同样的道理，每次返回之前都封包一下，不一样很重复么？我们返回的值能不能是解包后的原始值，然后自动封装它？

答案是可以的，但是这就不是 Monad 了，这成了 Functor 了。我们上一讲提到过，Functor 中实现的 `map` 方法，就是一个接受解包后的值，返回结果仍然是解包后的值。为了保证链式调用，map 会自动把结果再封包一次。

我们再来回顾一下 `map` 的源码吧：

```
public func map<U>(@noescape f: (Wrapped) throws -> U) 
        rethrows -> U? {
    switch self {
    case .Some(let y):
        return .Some(try f(y))
    case .None:
        return .None
    }
}
```

在该源码中，函数 `f` 在被执行完后，结果会被封包成 Optional 类型，相关代码是：`.Some(try f(y))`。

所以，Optional 的 `map` 和 `flatMap` 差别真的非常非常小，就看你的闭包想不想自己返回封装后的值了。

在具体业务中，我们也有一些实际的需求，需要我们自己控制返回封装后的值。比如 Optional 在操作的时候，如果要返回 .None，则需要使用 `flatMap`，错误的使用了 `map` 函数的话，就会带来多重嵌套 nil 的问题。比如下面这个代码，变量 `b` 因为是一个两层嵌套的 nil，所以 `if let` 失效了。

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

归根结底，你在编程时使用 Monad 还是 Functor，取决于你的具体业务需求：

 * 如果你在处理「封装过的值」时，不会（或不需要）返回异常数据，则可以使用 Functor，让数据的封装过程交给 `map` 函数来处理。
 * 如果你在处理「封装过的值」时，需要在闭包函数里返回类似 nil（或 ErrorType）一类的数据，则可以使用 Monad，自己返回新的「封装过的值」。

## Applicative

Swift 语言中并没有原生的 Applicative，但是 Applicative 和 Functor、Monad 算是三个形影不离的三兄弟，另外它们三者的差异都很小，所以干脆一并介绍了。

刚刚我们讨论 Functor 与 Monad 时，都是说把值放在一个容器里面。但是我们别忘了，Swift 是函数式语言，函数是一等公民，所以，函数本身也是一种值，它也可以放到一个容器里面，而我们要讨论的 Applicative，就是一种关于「封装过的函数」的规则。

Applicative 的定义是：使用「封装过的函数」处理「封装过的值」。这个「封装过的函数」解包之后的参数类型和 Functor 的要求是一样的。

按照这个定义，我们可以自己改造数组和 Optional，使它们成为 Applicative，以下代码就是一个示例，来自 [这里](http://www.mokacoding.com/blog/functor-applicative-monads-in-pictures/)。

```
extension Optional {
    func apply<U>(f: (T -> U)?) -> U? {
        switch f {
        case .Some(let someF): return self.map(someF)
        case .None: return .None
        }
    }
}

extension Array {
    func apply<U>(fs: [Element -> U]) -> [U] {
        var result = [U]()
        for f in fs {
            for element in self.map(f) {
                result.append(element)
            }
        }
        return result
    }
}
```

我们为数组和 Optional 增加了一个 `apply` 方法，而这个方法符合 Applicative 的定义。如果和 `map` 方法对比，它们的唯一差别就是闭包函数是封装过后的了：

 * 对于 Optional 来说，`apply` 的闭包函数也变成 Optinoal 的了。
 * 对于数组来说，`apply` 的闭包函数也是一个数组（我们之前介绍过，数组也是对数据的一种封装）。

## Monad 的应用

理论都离不开应用，否则就是「然并卵」了，讲完了概念，我们来看看除了 Swift 语言中的数组和 Optional，业界还有哪些对于 Monad 的应用。

### Promise

[PromiseKit](http://promisekit.org/) 是一个同时支持 Objective-C 和 Swift 的异步库。它用 Promise 来表示一个未来将要执行的操作，使用它可以简化我们的异步操作。因为篇幅有限，本文并不打算展开详细介绍 Promise，我们就看一个实际的使用示例吧。

假设我们有一个业务场景，需要用户先登录，然后登录成功后发API获取数据，获取数据后更新 UITableView 的内容，整个过程如果有错误，显示相应的错误信息。

传统情况下，我们需要把每个操作都封装起来，然后我们可以选择：

 * 方法一：用多层嵌套的 `dispatch_async` 把逻辑写到一起，但是这样嵌套代码，可读性和可维护性很差。
 * 方法二：每一步有一个 delegate 回调函数，把业务逻辑分散到各个回调函数中。但是这样不但逻辑分散了，而且关键的函数调用的依赖关系被我们隐藏起来了。

另外，以上两种方法处理错误逻辑都可能会有多处，虽然我们可以把报错也封装成一个函数，但是在多个地方调用也不太舒服。使用 PromiseKit 之后，刚刚提到的业务场景可以用如下的示意代码来完成：

```
login().then {
    return API.fetchKittens()
}.then { fetchedKittens in
    self.kittens = fetchedKittens
    self.tableView.reloadData()
}.catch { error in
    UIAlertView(…).show()
}
```

另外，如果你的逻辑涉及并发，PromiseKit 也可以很好地处理，例如，你希望发两个网络请求，当两个网络请求都结束时，做相应的处理。那就可以让 PromiseKit 的 `when` 方法与 `then` 结合工作：

```
let search1 = MKLocalSearch(request: rq1).promise()
let search2 = MKLocalSearch(request: rq2).promise()

when(search1, search2).then { response1, response2 in
    //…
}.catch { error in
    // called if either search fails
}
```

在 PromiseKit 的设计中，`then` 方法接受的闭包的类型和 `flatMap` 是一样的，所以它本质上就是 `flatMap`。Promise 其实就是一种 Monad。

### ReactiveCocoa

比起 PromiseKit，[ReactiveCocoa](https://github.com/ReactiveCocoa/ReactiveCocoa) 的名气要大得多。最新的 ReactiveCocoa 4.0 同时支持 Objective-C 和 Swift，我们在源码中发现了 RAC 的 `SignalType` 就是一个 Monad：

```
extension SignalType {

    public func flatMap<U>(strategy: FlattenStrategy, transform: Value -> SignalProducer<U, Error>)
        -> Signal<U, Error> {
        return map(transform).flatten(strategy)
    }

    public func flatMap<U>(strategy: FlattenStrategy, transform: Value -> Signal<U, Error>) 
        -> Signal<U, Error> {
        return map(transform).flatten(strategy)
    }
}
```

## 总结

我们再次总结一下 Monad、Functor、Applicative：

 * Monad：对一种封装过的值，使用 `flatMap` 函数。
 * Functor：对一种封装过的值，使用 `map` 函数。
 * Applicative：对一种封装过的值，使用 `apply` 函数。

我们再对比一下`flatMap`、`map` 和 `apply`：

 * `flatMap`：对自己解包，然后应用到一个闭包上，这个闭包：接受一个「未封装的值」，返回一个「封装后的值」。
 * `map`：对自己解包，然后应用到一个闭包上，这个闭包：接受一个「未封装的值」，返回一个「未封装的值」。
 * `apply`：对自己解包，然后对闭包解包，解包后的闭包：接受一个「未封装的值」，返回一个「未封装的值」。

## 参考链接

 * [Swift Functors, Applicatives, and Monads in Pictures](http://www.mokacoding.com/blog/functor-applicative-monads-in-pictures/)
 * [Functor、Applicative 和 Monad](http://blog.leichunfeng.com/blog/2015/11/08/functor-applicative-and-monad/)
 * [Promises are the monad of asynchronous programming](https://blog.jcoglan.com/2011/03/11/promises-are-the-monad-of-asynchronous-programming/)

