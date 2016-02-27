---
title: Swift 烧脑体操（三） - 高阶函数
date: 2016-02-27 09:25:51
categories: iOS
tags: Swift
---

![](http://ww2.sinaimg.cn/mw690/65dc76a3gw1f08hrkcyydj20i40cigv2.jpg)

## 版权说明

本文为 InfoQ 中文站特供稿件，首发地址为：[文章链接](http://www.infoq.com/cn/articles/swift-brain-gym-high-order-function)。如需转载，请与 InfoQ 中文站联系。

## 前言

Swift 其实比 Objective-C 复杂很多，相对于出生于上世纪 80 年代的 Objective-C 来说，Swift 融入了大量新特性。这也使得我们学习掌握这门语言变得相对来说更加困难。不过一切都是值得的，Swift 相比 Objective-C，写出来的程序更安全、更简洁，最终能够提高我们的工作效率和质量。

Swift 相关的学习资料已经很多，我想从另外一个角度来介绍它的一些特性，我把这个角度叫做「烧脑体操」。什么意思呢？就是我们专门挑一些比较费脑子的语言细节来学习。通过「烧脑」地思考，来达到对 Swift 语言的更加深入的理解。

这是本体操的第三节，练习前请做好准备运动，保持头脑清醒。

## 准备运动：基础知识

![](http://ww1.sinaimg.cn/mw690/65dc76a3gw1f0sz14hv65j20er08t0tz.jpg)

在上一节里面，我们其实已经涉及到了高阶函数了。在 [Wikipedia](https://en.wikipedia.org/wiki/Higher-order_function) 中，是这么定义高阶函数（higher-order function）的，如果一个函数：

 * 接受一个或多个函数当作参数
 * 把一个函数当作返回值

那么这个函数就被称作高阶函数。下面是一个简单的排序的例子，在这个例子中，传进去的参数就是一个函数：

```
let numbers = [1, 4, 2, 3]
let res = numbers.sort {
    $0 < $1
}
```

### Trailing Closure Syntax

上面的代码看着不像是函数作为参数存在，这是因为 Swift 的 Trailing Closure 特性。Swift 允许当函数的最后一个参数是闭包的时候，以紧跟 `{ }` 的形式，将最后一个闭包的内容附加在函数后面。

所以，以下两行代码是等价的：

```
// 正常写法，函数是作为 sort 的参数
arr.sort({ $0 < $1 })

// Trailing Closure 写法，更简洁明了
arr.sort { $0 < $1 } 
```

## 常见用法示例

高阶函数在 Swift 语言中有大量的使用场景，我们先来看一看常见的用法：

### 遍历

我们可以用 `map` 方法来对数组元素进行某种规则的转换，例如：

```
let arr = [1, 2, 4]
// arr = [1, 2, 4]

let brr = arr.map {
    "No." + String($0)
}
// brr = ["No.1", "No.2", "No.4"]
```

### 求和

我们可以用 `reduce` 方法，来对数组元素进行某种规则的求和（不一定是加和）。

```
let arr = [1, 2, 4]
// arr = [1, 2, 4]

let brr = arr.reduce(0) {
    (prevSum: Int, element: Int) in
    return prevSum + element
}
// brr = 7
let crr = arr.reduce("") {
    if $0 == "" {
        return String($1)
    } else {
        return $0 + " " + String($1)
    }
}
// crr = "1 2 4"
```

### 筛选

我们可以利用 `filter` 方法，来对数组元素进行某种规则的过滤，例如：

```
let arr = [1, 2, 4]
// arr = [1, 2, 4]

let brr = arr.filter {
    $0 % 2 == 0
}
// brr = [2, 4]
```

### 遍历

即使是以前最简单的遍历，我们也可以用高阶函数的写法，将遍历需要的操作，以函数参数的形式传入 `forEach` 方法中，例如：

```
let arr = [1, 2, 4]
arr.forEach {
    print($0)
}
```

## 烧脑体操

下面我们来看看高阶函数一些比较烧脑的细节。

### 用高阶函数来隐藏私有变量

高阶函数使得代码逻辑可以用函数为主体来进行封装，下面我将详细解释一下这句话。

在面向对象的世界里，逻辑存在的基本单元是对象，每个对象代表着一个最小可复用模块。在对象的内部，由高内聚的成员变量和成员函数构成。这些函数相互调用，并且操作对象的内部成员变量，最终对外产生可预期的行为。

但是利用高阶函数，我们可以同样做到与对象类似的，高内聚的成员变量和成员函数，下面我就举一个具体的例子。

下面的代码中，我们用类的方式，实现了一个 `Clock` 类， `Clock` 类实现了一个 `getCount` 方法，每次调用的时候返回的值 `+1`。为了测试代码，我们定义了两个实例 c1 和 c2，它们都可以正常输出预期的值。

```
class Clock {
    var count: Int = 0
    func getCount() -> Int {
        return ++count;
    }
}

let c1 = Clock()
c1.getCount() // 得到 1
c1.getCount() // 得到 2
let c2 = Clock()
c2.getCount() // 得到 1
```

那么接下来，我们用高阶函数的方式，来做一下同样的事情。我们先看代码：

```
func getClock() -> () -> Int {
    var count: Int = 0
    let getCount = { () -> Int in
        ++count;
    }
    return getCount
}

let c1 = getClock()
c1()  // 得到 1
c1()  // 得到 2
let c2 = getClock()
c2()  // 得到 1
```

在上面的代码中，我们这里定义了一个 `getClock` 函数，这个函数可以返回一个 `getCount` 函数。然后，不太一样的地方是，这个 `getCount` 函数持有了一个外部的变量 `count`。于是，这个函数也变得有了状态（或者你也可以说它有了 Side Effect）。每次调用这个函数的时候，返回的值都会变化。

另一方面，因为`count`变量是 `getClock` 这个高阶函数的内部变量，所以它并没有像全局变量一样使得封装性被打破。`getClock`函数仍然可以看作一个高内部的可复用模块，并且对外隐藏了实现细节。

所以，Swift 语言的高阶函数以及闭包可以 capture 外部变量的特性，使得代码逻辑可以以函数作为主体来进行封装，这将使得我们的代码组织更加灵活。

当然，如果滥用，这也会造成代码组织变得更加混乱。

### 面试题

#### 题目一

另一个烧脑的故事是来自于一个朋友的面试题。在面试中，面试官要求他用数组的 `reduce` 方法实现 `map` 的功能。

这个题目实在是非常蛋疼，不过用来烧脑倒是不错，大家感兴趣的话可以先想想，再翻下面的参考答案。

#### 题目二

不过说回来，虽然题目一有些奇怪，但是它确实考查了对于高阶函数灵活使用以及对 `reduce` 方法的理解。大家还可以试试这些题目：

 * 问题一：用 `reduce` 方法找出数组中的最大值。
 * 问题二：用 `reduce` 方法一次求出数组中奇数的和、以及偶数乘积。

#### 题目三

高阶函数另一个魔力就是可以链式调用，大家可以尝试这么一道题目：求一个数组中偶数的平方和。

### 参考答案

#### 题目一

```
let arr = [1, 3, 2]
let res = arr.reduce([]) {
    (a: [Int], element: Int) -> [Int] in
    var t = Array(a)
    t.append(element * 2)
    return t
}
// res = [2, 6, 4]

```

#### 题目二

问题二的参考答案：

```
let arr = [1, 3, 2, 4]

let res: (Int, Int) = arr.reduce((0, 1)) {
    (a :(Int, Int), element: Int) -> (Int, Int) in
    if element % 2 == 0 {
        return (a.0, a.1 * element)
    } else {
        return (a.0 + element, a.1)
    }
}
// res = (4, 8)
```
#### 题目三

以下是参考答案：

```
let arr = [1, 3, 2, 4]
let res = arr.filter {
        $0 % 2 == 0
    }.map {
        $0 * $0
    }.reduce(0) {
        $0 + $1
    }

```

## 总结

总结一下本次烧脑锻炼到的脑细胞：

 * 学习了 Swift 语言中的一些使用高阶函数的示例，包括 `map`, `reduce`, `filter` 等。
 * 学习了利用高阶函数来构造以函数为主体的功能模块。
 * 练习了一些奇怪的面试题。
