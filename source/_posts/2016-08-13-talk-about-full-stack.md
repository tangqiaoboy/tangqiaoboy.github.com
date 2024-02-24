---
title: 谈谈 T 型人才
categories: summary
tags: startup
date: 2016-08-13 11:10:25
---

## 「全栈」工程师

前一段时间，「全栈」工程师的概念很火，不过大多数时候，「全栈」工程师指的是一个人同时写 Web 前端和后端，顶多加上一些运维工作。通常情况下，我很少见到一个人能够同时写 Web 前端 + 后端 +iOS 端 +Android 端。

在猿题库（我们现在改名叫猿辅导了）创业初期，我曾经试图同时写 iOS 和服务器端，但是我很快就放弃了。因为当时服务器端的代码量还是很大，同时有好几个人在编写。有些时候我需要加逻辑时，会涉及到他们的代码修改，这个时候我就会需要花费额外的精力来看懂他们原来的逻辑。

当时正值创业初期，我们的 Code Review 并不严格，代码的相关设计文档也不多，我只能通过阅读源码来跟上另外几个服务器端开发同学的逻辑。很快我就放弃了，因为在创业阶段，效率是第一位的，同时做 iOS 和 服务器端，使得我在服务器端不够专注，效率变得低下。

从那之后，我就意识到，「全栈」工程师可能最适合的场景就是 Web 前端 + 后端的偏前端的逻辑。因为那个场景下，前端工程师可以省掉沟通接口的时间，也可以自己统一前后端的模版，甚至他可以尝试统一语言，同时用 JavaScript 写前后端（在后端使用 nodejs）。

而在别的职位上，是很不适合全栈的，因为这样工作产出会下降。

## T 型人才

那我为什么又想聊 T 型人才呢？是因为我觉得 T 型人才和全栈不一样。在我看来，T 型人才有一门自己擅长和精通的语言，同时又有足够宽的视野，使得他在合作的时候，能够更多地站在对方的立场上考虑问题。

打个比方，做过服务器端开发的同学，再转而做客户端开发，就会更加注意 Restful 接口的设计合理性。相互之间协商接口时，知道什么样的方式服务器端好实现，什么样的方式不好实现，然后定出来的接口就会让对方非常舒适。

与此同时，T 型人才对于自己理解和学习新东西，也是有很大帮助的。我之前做过 Java 语言的服务器端开发和 JavaScript 语言的前端开发，之后才转做 iOS 开发。各种语言和开发环境接触多了就发现：其实很多概念都是相通的。我想我之所以当时学 iOS 开发上手那么快，也是由于在别的语言上有积累。

其实对于移动开发来说，iOS 和 Android 也有很多相同的概念，比如 iOS 的 UIViewController 和 Android 的 Activity。当然，它们也有很多不同的技术细节，比如对界面排版设计，iOS 因为设备屏幕单一，所以刚开始选择了简单的绝对定位，后面选择了 size class 的方式。而 Android 因为屏幕分裂严重，所以选择了更加流式的排版设计。

iOS 因为追求界面的流畅和性能，选择了引用计数这种相对麻烦的内存管理方式，而 Android 因为需要借力 Java 语言本身的生态和苹果竞争，所以采用了垃圾回收这种会带来潜在卡顿风险的内存管理方式。
每年的 Google IO 大会出现的新技术，并不比 WWDC 逊色。今年 iOS 10 的一些改进，也看到了不少 Android 的影子。

## 如何成为 T 型人才

那么如何成为 T 型人才呢？我们老大郭常圳想了一个办法：轮岗。轮岗的意思是，当你成为某一方面的专家后，跳出自己的舒适区，转而到一个新的技术领域从头学起。

在我们公司，很多早期员工都经历过轮岗。比如我曾经从服务器端转到前端和 iOS 端，也是轮岗这个激励带动的。yangyz 从服务器端转到 Android，xuhf 从 Android 转到服务器端，zhangyc 从 Web 前端转到后端。每一个轮岗工作，都是对我们极大的挑战，但是让我们都成长为 T 型人才。

但是，轮岗的意思绝不是做一个技术方向「三心二意」，每一次转换技术方向，都应该是对前一个技术方向至少做到熟练掌握的程度才行，而我自己觉得，不经过一到两年的实践，很难称作熟练掌握。所以，轮岗的行为应该是低频的，而且是面向那些最优秀的开发者的。

这一点有点像大学的换专业，在我们学校，大一的学生可以在一学期后申请换专业，但是前提是这个同学在愿专业成绩达到前 10%。

换专业和换技术方向一样，机会只会给做得最好的人，公司不会因为一个人在 iOS 开发上做得不好，就把他轮换到别的开发岗位。

## 创业初期

在创业初期，很多时候技术创始团队由于缺人，每个人都是多面手。上次一个朋友说，他自己完全了服务器和网站的开发，然后又自己开发了 iOS 和 Android 端，实现了真正的「全栈」。

对此，我完全不否认有这样的人存在，而且我认为创业初期这么做也是完全合理的。因为创业初期重要的是做出东西，而招不到人的情况下，自己动手干是最简单直接的方式。

我想我更想表达的是一个词：效率。举个例子，假如这个创业公司做大了，变成 20 人的技术团队时，你会让每个人都同时做服务器，iOS，Android 开发呢，还是每个人只做某一方面？我想从效率上讲，每个人只做某一个具体的平台，效率是最大化的。这其实就是我想表达的，「全栈」工程师在理想情况下，并不是高效运作的公司期望的，只有某些特别情况下，「全栈」才有它存在的理由。

但是反过来，T 型人才是每个公司都期望拥有的，因为这样的人才视野更广，学习能力更强，沟通时会从对方角度考虑技术方案，甚至在某些技术方向没落之后，也会迅速地成功转型，这才是互联网公司理想的人才。
