---
title: 我为什么不喜欢 Core Data
date: 2016-08-04 22:47:06
categories: iOS
tags:
---

{% img /images/core-data-head.jpg %}


我一直不喜欢 Core Data，以前不太敢明目张胆地这么表达，现在收集到越来越多相关的信息，所以给大家分享一下，我为什么不喜欢 Core Data。

## Core Data 太复杂

在今年刚刚结束的 [GMTC 大会](<http://gmtc.geekbang.org/>)上，来自澳洲的李剑做了题为《iOS 遗留系统上的架构重构》的演讲，其中就提到 Core Data 给他们 500 万用户带来了 300 万次崩溃。我想任何产品都是不能接受这样的崩溃率的。

这 300 万次崩溃是 Core Data 的问题吗？可能也不是。在现场我没有看到具体的代码细节，我更觉得这可能是 Core Data 在使用中的各种坑，需要大家注意避免的。但是 Core Data 的坑是如此之多，使得像李剑这样的资深 iOS 开发者也不得不考虑将其直接替换掉。一个好的技术框架应该是不容易出现使用错误的，所以从这个角度讲，Core Data 本身的设计就是不好的。

## Core Data 学习成本高

很多人觉得 Core Data 简单易学，我听了简直觉得自己的智商得到了 1 万点的伤害。反正我学习 Core Data 那阵子，Core Data 的各种概念着实让我郁闷了好久。在 OhMyStar 的作者 yu 的博客[文章](http://www.iiiyu.com/2016/01/19/CoreData-VS-Realm/)上，yu 这么写道：

>CoreData 是一个博大精深的技术，不要妄想几天之内可以用的很溜。
>CoreData 是一个博大精深的技术，不要妄想几天之内可以用的很溜。
>CoreData 是一个博大精深的技术，不要妄想几天之内可以用的很溜。
>
>如果没有足够的时间和精力去接入 Core Data。 那选型的时候应当慎重考虑。

我想那些觉得 Core Data 很简单的人，可能更多时候是自己学了一点皮毛，就以为懂了全部吧。反正我是学不会 Core Data。

## Core Data 的收益并不大

如果一门技术方案学习成本高，那么我们有动力继续学习的它的唯一理由就是：它的收益也非常大。但是，Core Data 在各种性能测试中，表现出
来的收益是相当差的。在这一点上，Realm 是最喜欢拿来说事的，拿查阅来说，Core Data 的性能是 FMDB 的六分之一不到，Realm 的十分之一不到。

{% img /images/coredata-vs-realm.jpg %}


Core Data 带来的另外的特性：例如可视化的编辑界面，关联关系的创建，数据库升级的支持，我个人觉得都不是非常大的收益。相对它带来的麻烦，这些收益微不足道。

## Core Data 的这层抽象没必要

其实 Core Data 是构建在 SQLite 之上，对数据存储层进行了进一步的抽象。而我个人认为，对于一个计算机专业的人员来说，掌握 SQL 就像掌握 BASIC 一样容易，关系型数据库实在太容易理解了，完全没有必要在这上面再做一层抽像，带来额外的理解成本。

所以我更喜欢用 FMDB，它只是将 SQLite 的一些方法进行了 Objective-C 语言更加友好的调用封装，除此之外，你就完全是在操作一个 SQLite 数据库。

## 总结

使用复杂，学习复杂，坑多，收益小成本大，基本没有意义的抽象，我们还有什么理由继续学习和使用 Core Data ？

哦，对了，我也不喜欢  Realm，有机会下次再说它。

对于我来说，FMDB 以及构建在 FMDB 上的简单的 Key-Value 存储就足够了。我之前在 GitHub 开源过一个简单的基于 FMDB 的 KeyValue 存储 [YTKKeyValueStore](https://github.com/yuantiku/YTKKeyValueStore)，感兴趣的可以翻翻。