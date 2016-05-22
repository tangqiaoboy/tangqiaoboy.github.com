---
title: Swift 烧脑体操（六）- 类型推断
date: 2016-05-22 13:46:26
categories: iOS
tags: Swift
---

前几天，一个朋友在微博上通过私信问了我一个问题，如下的代码，为什么变量 `crr` 没能把值为 nil 的元素过滤掉？

```
let arr:[Int?] = [1, 2, 3, nil, 4, 5]
let brr = arr.flatMap { $0 }
brr
// brr = [1, 2, 3, 4, 5]

let crr:[Int?] = arr.flatMap { $0 }
crr
// crr = [{Some 1}, {Some 2}, {Some 3}, nil, {Some 4}, {Some 5}]
```

简单来看，同样是使用 `flatMap` 函数，brr 变量成功过滤掉了值为 nil 的元素，变量 crr 过滤失败。而 brr 和 crr 的区别就是它们的类型不一样，brr 的类型是 `[Int]` ，而 crr 的类型是 `[Int?]`，想必其中原因与此有关，那到底是为什么呢？

在和一些朋友讨论之后，我大概想明白了，这和类型推断有关系。在 crr 相关的代码中，因为 crr 的类型已经被程序员指定为 `[Int?]`，所以为了编译通过，编译器需要推断出 `flatMap` 中的闭包的输入和输出变量类型。我们回顾一下 `flatMap` 在数据中的定义：

```
extension SequenceType {
    public func flatMap<T>(@noescape transform: (Self.Generator.Element) throws -> T?)
                rethrows -> [T]
}
```
可以看出，flatMap 返回的结果是 `[T]`，而闭包 transform 返回的结果是 `T?`。而在 crr 这个例子中，T 被推断出是 `Int?` , 因此 tranform 中 `T?` 就被代入，变成了 `(Int?)?` 。所以，如果完善一下上面例子的代码，编译器推断出来的类型是这样的：

```
let crr:[Int?] = arr.flatMap {
    (element: Int?) -> (Int?)? in
    return element
}
```

注意这里，返回的变量 element 其实类型并不是 `(Int?)?`，但是 Optional 是有 conversion 的方法，允许将一个类型的 `S` 的变量，自动转成 `S?`，所以转换被自动做了，并没有编译错误发生。

怎么改这个代码呢？

有人说把闭包的类型手工指定成 `Int?`，我试了一下，确实能够正常了，不过我感觉这更像是一个编译器的 Bug，我们再看看这个接口：

```
extension SequenceType {
    public func flatMap<T>(@noescape transform: (Self.Generator.Element) throws -> T?)
                rethrows -> [T]
}
```

按照 `flatMap` 的接口定义，如果闭包返回的是 Int?，那么按照这个定义，最终 `flatMap` 的结果就必须是 `[Int]`，而我们要强制要求结果是 `[Int?]`，除非这里有自动的转换，否则就应该编译失败。而我自己的试验代码失败，确认出并没有从 [Int] 到 `[Int?]` 的自动转换。所以我暂时认为这么改能正常工作是一个编译器的 Bug（如有错误，欢迎指出）。

```
error: cannot convert value of type '[Int]' to specified type '[Int?]'
```

另外，也有朋友说，在这种场景下并不应该使用 `flatMap` 函数。确实是这样，flatMap 函数本来就有着 flat 的作用在里面，在数组的 `flatMap` 实现中，有两个重载：

  * 一个重载版本是为了打平嵌套的多维数据。
  * 另一个重载版本，就是我们刚刚讨论的版本，flat 是为了去掉 Optional 的封包，同时把 nil 元素去掉。

而这个示例代码调用了 `flatMap` 函数，却希望仍然得到 Optional 的数组，实在是不应该使用 `flatMap` 来做这个事情。如果只是为了去掉 Optional 中的 nil 元素，使用 `filter` 方法可能更为合适一些：

```

let arr:[Int?] = [1, 2, 3, nil, 4, 5]
let drr:[Int?] = arr.filter {
    if let _ = $0 {
        return true
    } else {
        return false
    }
}
drr
// drr = [{Some 1}, {Some 2}, {Some 3}, {Some 4}, {Some 5}]
```

其实函数式编程的方法不止 `map`, `flatMap`, `filter` 这些，在一个名为 [reactiveX](http://reactivex.io/) 的网站上，列举了 Reactive 编程实践下的一些 [常见的函数](http://reactivex.io/documentation/operators.html)，里面的很多方法都挺有意思，这些方法也被实现在了 [RxSwift](https://github.com/ReactiveX/RxSwift) 中，感兴趣的同学可以看看。

祝玩得开心！
