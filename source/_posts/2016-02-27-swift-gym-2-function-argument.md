---
title: Swift 烧脑体操（二） - 函数的参数
date: 2016-02-27 09:23:29
categories: iOS
tags: Swift
---

{% img /images/swift-gym-5-1.png %}

## 索引

Swift 烧脑系列文章列表：
 * [Swift 烧脑体操（一） - Optional 的嵌套](/2016/02/27/swift-gym-1-nested-optional/)
 * [Swift 烧脑体操（二） - 函数的参数](/2016/02/27/swift-gym-2-function-argument/)
 * [Swift 烧脑体操（三） - 高阶函数](/2016/02/27/swift-gym-3-higher-order-function/)
 * [Swift 烧脑体操（四） - map 和 flatMap](/2016/03/05/swift-gym-4-map-and-flatmap/)
 * [Swift 烧脑体操（五）- Monad](/2016/04/05/swift-gym-5-monad/)
 * [Swift 烧脑体操（六）- 类型推断](/2016/05/22/swift-gym-6-type-infer/)

## 前言

Swift 其实比 Objective-C 复杂很多，相对于出生于上世纪 80 年代的 Objective-C 来说，Swift 融入了大量新特性。这也使得我们学习掌握这门语言变得相对来说更加困难。不过一切都是值得的，Swift 相比 Objective-C，写出来的程序更安全、更简洁，最终能够提高我们的工作效率和质量。

Swift 相关的学习资料已经很多，我想从另外一个角度来介绍它的一些特性，我把这个角度叫做「烧脑体操」。什么意思呢？就是我们专门挑一些比较费脑子的语言细节来学习。通过「烧脑」地思考，来达到对 Swift 语言的更加深入的理解。

这是本体操的第二节，练习前请做好准备运动，保持头脑清醒。

## 准备运动：基础知识


### 面向对象语言的世界观

对于很多面向对象的编程语言来说，在思考问题时，总是把「对象」作为考虑问题的基本出发点。

面向对象的程序设计通过以下三大规则，构建出程序设计的基础，它们是：

 1. 封装（Encapsulation），将一个相对独立的逻辑涉及的变量和函数放到一个类中，然后对外暴露少量接口，使其高内聚，低耦合。
 1. 继承（Inheritance），子类可以继承父类的变量和函数，并且可以修改或扩展父类的行为。
 1. 多态（Polymorphism），父类的指针可以指向子类的实例，在运行时程序语言支持找到子类对应的函数实现。

在以上三大准则的基础上，再引入一些设计原则，比如：

 1. 单一职责原则（Single Responsibility），每个类只应该做一件事情。
 1. 不要重复原则（Don't Repeat Yourself），相同（或相似）的代码不应该重复两次。
 1. 好的组合优于继承（Better Composition over Inheritance），尽量使用组合而不是继承来设计。

于是，程序世界就基于这些规则和原则，产生出了设计模式，进而能更加精准地指导我们的编程行为。这就像我们学习几何，先学习几条公理，然后以后的大量定理都通过公理证明而来。

举个例子，单例模式（Singleton Pattern）其实就是封装和单一职责原则的产物。代理模式（Delegate Pattern) 也是单一职责和封装中的面向接口设计的思想的产物。

但是，在面向对象语言的世界观里面，函数都是作为一个附属物存在的。函数通常附属于一个具体类的某个方法中。或许有一个函数它根本都不需要任何对象作为容器，为了这个世界的统一，我们还是会构造一个类，把这个函数放进去。比如，在小猿搜题中，我们就有一个叫 ImageUtils 的类，里面放了操作图像的各种各样的静态方法，有一些图象操作函数其实也不太通用，但是总得找一个类放不是。

在一些面向对象语言的世界中，如果把对象称作 OOP 的一等公民的话，那么函数就是二等公民。

### 函数式编程

在 Swift 的世界中，函数并不是二等公民。是的，Swift 引入了大量函数式编程的特性，使得我们能够把函数当作一等公民来对待。

一等公民有什么权利呢？那就是函数可以像对象一样，被赋值、被当作参数传递、参与计算或者当作结果被返回。

我们先来看一段函数被赋值的例子，在下例中，我们将一个函数赋值给一个名为 `myFunc` 的变量，然后调用它。

```
let myFunc = { 
    () -> String in
    return "Tang Qiao"
}

let value = myFunc()
// value 的值为 "Tang Qiao"
```

我们再来看一个函数被当作运算结果返回的例子。在这个例子中，我们希望构造一个「加法器」工厂，这个工厂能够接受一个参数 addValue，返回一个加法器函数，这个加法器函数能够将传递的参数加 addValue 之后返回。以下是实现的代码：

```
func addFactory(addValue: Int) -> (Int -> Int) {
    func adder(value: Int) -> Int {
        return addValue + value
    }
    return adder
}
```

有了上面这个函数，我们就可以构造一个 `+2` 的函数，然后使用它，如下所示：

```
let add2 = addFactory(2) // 构造一个 +2 的函数
let result = add2(3) // 运算，传入 3，得到 5
```

## 函数的参数

但是在本次「烧脑体操」中，全面介绍函数式编程明显不太现实，所以我们仅从函数的参数来深入学习一下，看看在 Swift 语言中，函数的参数能够有多复杂。

<!--
这里多说一句题外话，有部分同学看了「烧脑体操」第一节后，留言说：本来简单的 Swift 语言，被你这么一说，弄得都不敢学了，你是不是在吓大家？还有一些人留言：你搞这么绕还不是为了装逼？

对此，我想回答说：我研究这些仅仅是为了避免在语言细节的地方掉坑里，如果你对此不感兴趣，有一个动作叫做「取消关注」，我写文章并没有收费，如果你不喜欢，取关即可，犯不着在后台留言恶心我吧？
-->

### 参数的省略

我们先来简单看看函数参数的省略吧，因为有类型推导，函数的参数在 Swift 中常常可以被省略掉，特别以匿名函数（闭包）的形式存在的时候。

我们来看一个数组排序的例子：

```
let array = [1, 3, 2, 4]
let res = array.sort {
    (a: Int, b: Int) -> Bool in
    return a < b
}

```

如果一个函数返回类型可以通过推导出来，则返回类型可以省略。所以以上代码中的 `-> Bool` 可以删掉，变成：

```
let array = [1, 3, 2, 4]
let res = array.sort {
    (a: Int, b: Int) in
    return a < b
}
```
如果一个函数的参数类型可以推导出来，则参数的类型可以省略。所以以上代码中的 `: Int` 可以删掉，变成：

```
let array = [1, 3, 2, 4]
let res = array.sort {
    (a, b) in
    return a < b
}

```

如果函数参数的个数可以推导出来，也可以不写参数。那怎么使用这些参数呢？可以用 `$0`, `$1` 这样的方式来引用参数。所以以上代码中的 `(a, b)` 可以删掉，因为这样的话，参数和返回值都省略了，所以`in`也可以省略了，变成：

```
let array = [1, 3, 2, 4]
let res = array.sort {
    return $0 < $1
}
```

Swift 还有一个规则，如果函数的 body 只有一行，则可以把 `return` 关键字省略了，所以以上代码可以进一步简化成：

```
let array = [1, 3, 2, 4]
let res = array.sort {
    $0 < $1
}
```

最后一个简化规则更加暴力，因为 `<` 符号也是一个函数，它接受的参数个数，类型和返回值与 sort 函数需要的一样，所以可以直接简化成：

```
let array = [1, 3, 2, 4]
let res = array.sort( < )
```

拿这个的方法，同样可以把我们刚刚写的 `addFactory` 做简化，最后简化成如下的形式：


```
// 简化前
func addFactory(addValue: Int) -> (Int -> Int) {
    func adder(value: Int) -> Int {
        return addValue + value
    }
    return adder
}
// 简化后
func addFactory(addValue: Int) -> (Int -> Int) {
    return { addValue + $0 }
}
```

### 函数参数中的其它关键字

有些时候，我们的函数接受的参数就是另外一个函数，例如 sort，map，所以我们在看代码的时候，需要具备熟悉这种写法的能力。

我们来看看数组的 map 函数的定义吧：

```
public func map<T>(@noescape transform: (Self.Generator.Element) throws -> T) rethrows -> [T]
```

这个函数定义中出现了几个我们刚刚没提到的关键词，我们先学习一下。

#### `@noescape`

`@noescape`，这是一个从 Swift 1.2 引入的关键字，它是专门用于修饰函数闭包这种参数类型的，当出现这个参数时，它表示该闭包不会跳出这个函数调用的生命期：即函数调用完之后，这个闭包的生命期也结束了。以下是苹果的文档原文：

>A new @noescape attribute may be used on closure parameters to functions. This indicates that the parameter is only ever called (or passed as an @noescape parameter in a call), which means that it cannot outlive the lifetime of the call. This enables some minor performance optimizations, but more importantly disables the self. requirement in closure arguments.

什么情况下一个闭包参数会跳出函数的生命期呢？很简单，我们在函数实现内，将一个闭包用 `dispatch_async` 嵌套，这样这个闭包就会在另外一个线程中存在，从而跳出了当前函数的生命期。这样做主要是可以帮助编译器做性能的优化。

如果你对此感兴趣，这里有一些更详细的介绍供你学习：

 * <https://stackoverflow.com/questions/28427436/noescape-attribute-in-swift-1-2/28428521#28428521>
 * http://nshint.io/blog/2015/10/23/noescape-attribute/

#### `throws` 和 `rethrows`

`throws` 关键字表示：这个函数（闭包）可能抛出异常。而 `rethrows` 关键字表示：这个函数如果抛出异常，仅可能是因为传递给它的闭包的调用导致了异常。

`throws` 关键字的存在大家都应该能理解，因为总有一些异常可能在设计的时候希望暴露给上层，`throws` 关键字的存在使得这种设计成为可能。

那么为什么会有 `rethrows` 关键字呢？在我看来，这是为了简化很多代码的书写。因为一旦一个函数会抛出异常，按 Swift 类型安全的写法，我们就需要使用 try 语法。但是如果很多地方都需要写 try 的话，会造成代码非常啰嗦。 `rethrows` 关键字使得一些情况下，如果你传进去的闭包不会抛出异常，那么你的调用代码就不需要写 try。

如果你对此感兴趣，这里有一些更详细的介绍供你学习：

 * http://robnapier.net/re-throws

### 函数作为函数的参数

刚刚说到，函数作为一等公民，意味着函数可以像对象一样，被当作参数传递或者被当作值返回。对此，我们专门有一个名称来称呼它，叫做[高阶函数（higher-order function）](https://en.wikipedia.org/wiki/Higher-order_function)。

在刚刚那个数组的 map 函数中，我们就看到了它接着另外一个函数作为参数，这个函数接受数组元素类型作为参数，返回一个新类型。

```
public func map<T>(@noescape transform: (Self.Generator.Element) throws -> T) rethrows -> [T]
```

有了 map 函数，我们就可以轻松做数组元素的变换了。如下所示：

```
let arr = [1, 2, 4]
// arr = [1, 2, 4]

let brr = arr.map {
    "No." + String($0)
}
// brr = ["No.1", "No.2", "No.4"]
```

## 烧脑的参数

好了，现在进入参数烧脑游戏的正式环节。

我们需要构造一个工厂函数，这个函数接受两个函数作为参数，返回一个新的函数。新函数是两个函数参数的叠加作用效果。

举一个具体的例子，假如我们有一个 `+2` 的函数，有一个 `+3` 的函数，那用这个工厂函数，我们可以得到一个 `+5` 的函数。

又比如我们有一个 `*2` 的函数，有一个 `*5` 的函数，用这个工厂函数，我们就可以得到一个 `*10` 的函数。

那这个函数如何写呢？我们先看答案吧：

```
func funcBuild(f: Int -> Int, _ g: Int -> Int) 
    -> Int -> Int {
    return {
        f(g($0))
    }
}

let f1 = funcBuild({$0 + 2}, {$0 + 3})
f1(0) // 得到 5
let f2 = funcBuild({$0 * 2}, {$0 * 5})
f2(1) // 得到 10

```

这个函数充分反映了函数作为一等公民的地位。但是，我们同时也看出来，函数作为参数存在时，对于程序的可读性带来了挑战。好在我们有 `typealias`，通过 `typealias`，我们可以将函数的类型写得更加易读，比如上面的代码，就可以修改成如下形式：

```
typealias IntFunction = Int -> Int

func funcBuild(f: IntFunction, _ g: IntFunction)
    -> IntFunction {
    return {
        f(g($0))
    }
}

```

现在看看代码，是不是清晰了很多？

## 参数中的范型

当函数中的参数再引入范型之后，函数的功能更加强大，但是可读性进一步下降。比如刚刚的例子，限制函数只能是 `Int -> Int` 其实是没有必要的，我们将两个函数拼成一个函数，只需要保证一个函数的输出类型，与另一个函数的输入类型匹配即可。所以，刚刚的例子，可以进一步用范型改造：

```
func funcBuild<T, U, V>(f: T -> U, _ g: V -> T)
    -> V -> U {
        return {
            f(g($0))
        }
}
let f3 = funcBuild({ "No." + String($0) }, {$0 * 2})
f3(23) // 结果是 "No.46"
```

在上面这个例子中，我们保证函数 g 的输出类型是 T，函数 f 的输入类型是 T。这样，在例子中，我们将一个 `*2` 的函数与一个数字转字符串的函数拼接起来，构造出一个先乘 2，再转字符串的函数。

相应的例子还有很多，比如 WWDC 中就介绍过一个给函数增加缓存机制的代码，在该代码中，任意一个不带缓存功能的函数，经过改造，都可以变成一个带缓存功能的函数。代码如下，大家可以自行学习一下：

```
func memoize<T: Hashable, U>( body: (T)->U ) -> (T->U) {
    var memo = Dictionary<T, U>()
    return { x in
        if let q = memo[x] { return q }
        let r = body(x)
        memo[x] = r
        return r
    }
}
```

## 总结

总结一下本次烧脑锻炼到的脑细胞：

 * Swift 是一个结合面向对象编程和函数式编程特性的语言。
 * 函数在 Swift 中是一等公民，可以被赋值、被当作参数传递、参与计算、当作结果被返回或被动态创建。
 * 因为有类型推导，函数的参数有各种省略规则。
 * 函数作为参数时，有 @noescape，throw 和 rethrow 关键字需要了解。
 * 函数作为参数时，不易阅读。合理使用 typealias 可以使源码结构更清晰。

