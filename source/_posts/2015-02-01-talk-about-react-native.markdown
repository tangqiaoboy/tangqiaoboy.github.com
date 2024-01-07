---
layout: post
title: "谈谈 React Native"
date: 2015-02-01 16:27:43 +0800
comments: true
categories: iOS
---

{% img /images/react-js.jpg %}

## 前言

几天前，Facebook 在 React.js Conf 2015 大会上推出了 React Native（[视频链接](https://www.youtube.com/watch?v=7rDsRXj9-cU)）。我发了一条微博([地址](http://www.weibo.com/1708947107/C1WHHwqZv?from=page_1005051708947107_profile&wvr=6&mod=weibotime&type=comment#_rnd1422782358309)），结果引来了 100 多次转发。为什么 React Native 会引来如此多的关注呢？我在这里谈谈我对 React Native 的理解。

一个新框架的出现总是为了解决现有的一些问题，那么对于现在的移动开发者来说，到底有哪些问题 React Native 能涉及呢？

### 人才稀缺的问题

首先的问题是：移动开发人才的稀缺。看看那些培训班出来的人吧，经过 3 个月的培训就可以拿到 8K 甚至上万的工作。在北京稍微有点工作经验的 iOS 开发，就要求 2 万一个月的工资。这说明当前移动互联网和创业的火热，已经让业界没有足够的开发人才了，所以大家都用涨工资来抢人才。而由于跨平台的框架（例如 PhoneGap，RubyMotion）都还是不太靠谱，所以对于稍微大一些的公司，都会选择针对 iOS 和 Android 平台分别做不同的定制开发。而 JavaScript 显然是一个群众基础更广的语言，这将使得相关人才更容易获得，同时由于后面提到的代码复用问题得到解决，也能节省一部分开发人员。

### 代码复用的问题

React Native 虽然强调自己不是 “Write once, run anywhere" 的框架，但是它至少能像 Google 的 [j2objc](https://github.com/google/j2objc) 那样，在 Model 层实现复用。那些底层的、与界面无关的逻辑，相信 React Native 也可以实现复用。这样，虽然 UI 层的工作还是需要做 iOS 和 Android 两个平台，但如果抽象得好，Logic 和 Model 层的复用不但可以让代码复用，更可能实现底层的逻辑的单元测试。这样移动端的代码质量将更加可靠。

其实 React Native 宣传的 "Learning once, write anywhere" 本身也是一种复用的思想。大家厌烦了各种各样的编程语言，如果有一种语言真的能够统一移动开发领域，对于所有人都是好事。

### UI 排版的问题

我自己一直不喜欢苹果新推出的 AutoLayout 那套解决方案，其实 HTML 和 CSS 在界面布局和呈现上深耕多年，Android 也是借鉴的 HTML 的那套方案，苹果完全可以也走这套方案的。但是苹果选择发明了一个 Constraint 的东西来实现排版。在企业的开发中，其实大家很少使用 Xib 的，而手写 Constraint 其实是非常痛苦的。所以出现了 [Masonry](https://github.com/Masonry/Masonry) 一类的开源框架来解决这类同行的痛苦。

我一直在寻找使用类似 HTML + CSS 的排版，但是使用原生控件渲染的框架。其实之前 [BeeFramework](https://github.com/gavinkwoe/BeeFramework) 就做了这方面的事情。所以我还专门代表 InfoQ 对他进行过采访。BeeFramework 虽然开源多年，而且有 2000 多的 star 数，但是受限于它自身的影响力以及框架的复杂性，一直没有很大的成功。至少我不知道有什么大的公司采用。

这次 Facebook 的 React Native 做的事情相比 [BeeFramework](https://github.com/gavinkwoe/BeeFramework) 更加激进。它不但采用了类似 HTML + CSS 的排版，还把语言也换成了 JavaScript，这下子改变可以称作巨大了。但是 Facebook 有它作为全球互联网企业的光环，相信会有不少开发者跟进采用 React Native。

不过也说回来，Facebook 开源的也不一定都好，比如 [three20](https://github.com/facebookarchive/three20) 就被 Facebook 放弃了，但是不可否认 [three20](https://github.com/facebookarchive/three20) 作为一个框架，在那个时期的特定价值。所以 React Native 即使没有成功，它也将人们关注的焦点放在了移动开发的效率上了。很可能会有越来越多相关的框架因此涌现出来。

### MVVM

MVVM 在 Web 开发领域相当火热，而 iOS 领域的 [ReactiveCocoa](https://github.com/ReactiveCocoa/ReactiveCocoa) 虽然很火，但是还是非常小众。纠其原因，一方面是 ReactiveCocoa 带来的编程习惯上的改变实在太大，ReactiveCocoa 和 MVVM 的学习成本还是很高。另一方面是 ReactiveCocoa 在代码可读性、可维护性和协作上不太友好。

而 Web 开发领域对 MVVM 编程模式的接受程度就大不相同了，在 Web 开发中有相当多的被广泛使用的 MVVM 的框架，例如 [AngularJS](http://en.wikipedia.org/wiki/AngularJS)。相信 React Native 会推动 MVVM 应用在移动端的开发。

### 动态更新

终于说到最 "鸡冻人心" 的部分了。你受够了每次发新版本都要审核一个星期吗？苹果的审核团队在效率上的低下，使得我们这一群狠不得每天迭代更新一版的敏捷开发团队被迫每 2 周或 1 个月更新一次版本。很多团队上一个版本还没审核结束，下一个版本就做好了。

React Native 的语言是基于 JavaScript，这必然会使得代码可以从服务器端动态更新成为可能。到时候，每天更新不再是梦想。当然，代码的安全性将更一步受到挑战，如何有效保护核心代码的安全将是一个难题。

## 总结

不管怎么样，这确确实实是一个移动互联网的时代，我相信随着几年的发展，移动互联网的开发生态也会积累出越来越多宝贵的框架，以支撑出更加伟大的 App 出现。作为一个移动开发者，我很高兴能够成为这个时代的主角，用移动开发技术改变人们的生活。

愿大家珍惜这样的机会，玩得开心～

