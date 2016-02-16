---
layout: post
title: "关于iOS测试机个数上限的详细规则"
date: 2012-04-06 16:50
comments: true
categories: iOS
---

##前言
公司的iOS测试机快达到苹果规定的100个上限了，而因为the new iPad新出，我们需要新的quota来测试新iPad，所以就仔细研究了一下苹果关于100个测试设备上限的规则。在这里分享给大家。规则的详细内容主要来自 [苹果的官网文档](https://developer.apple.com/support/ios/program-renewals.html)。

<!-- more -->

##规则

我总结出来的规则如下（附上原文以便对应）：

* 每一个开发者membership year,只能有100次增加设备的名额。如果你增加一个设备,之后又将该设备删除,并不会将用掉的名额恢复.

You can register up to 100 devices per year for development purposes. Any devices added, then later removed, still count towards your maximum number of registered devices per year.

* 在每一个开发者membership year开始的时候,Team Agent和Admin角色可以选择删掉一些设备来恢复资格, 也可以清空所有设备来恢复到最多100次设备的名额。这个操作在Team Agent和Admin在一次新的membership year开始后即可使用，在使用时，需要注意，先将需要删除的设备删掉，然后才能添加需要新增的设备。一旦开始增加新设备，删除设备以恢复名额的功能将不再可用。

At the start of a new membership year, Team Agents and Admins can remove devices and restore the available device count for their development team to 100 devices.

When Team Agents or Admins first sign in to the iOS Provisioning Portal at the start of a new membership year, they will be presented with the option to remove devices and restore the device count for those removed devices.

Important Note: At the start of your membership year, make sure to remove all devices you no longer use for development prior to adding any new devices.

* 在以后整个membership year中，删除设备不会增加新的名额。

Removing devices during your membership year will not open these slots to add new devices.

##举例
直接看规则比较晦涩，举个例子：

假如第一年，你增加了70个设备，同时删除了10个设备，这个时候，虽然你的设备数是60，但是可用的增加测试机的名额却只有30个了。

到了第二年，你续费了开发者身份，在你第一次登陆进去后，你可以看到你的可用设备恢复成 100 - 60 = 40个了。这个时候，你可以选择删除一些设备，例如你又删除了20个设备，这样你的名额数变成60个。之后你增加了一个设备，因为你选择了增加新设备，苹果认为你已经放弃删除设备以恢复设备数的机会，这样，你的名额就固定成59个。以后删除设备都不会增加新名额了，直到你的下一个membership year开始时才又会有这样的机会来删除设备释放名额。

##总结
所以说，不管怎么样，你的账号下的可用测试设备始终不会超过100个。不会象有些人想的那样，每过一年名额就直接变成100了。另外，每年删除设备以恢复名额的机会只有开始的时候，以后删除设备也不会恢复名额。

那如果万一我的设备数达到上限，我又急需要增加新设备怎么办呢？我们不久前就遇到了这种情况。我们的解决办法是给苹果的技术客服发邮件要求他们帮助我们删除所有设备并且恢复到增加100个测试设备的名额。最终在过了2天后，苹果答应并帮助我们解决了问题。

具体做法是访问：<https://developer.apple.com/contact/>，点击 Program Benefits， 然后在新出来的提交界面中将需求填上。之后苹果会发邮件过来告诉你处理结果，可能需要打电话过去和他们沟通一些细节。在沟通完成后，苹果就可以立即帮助你状态修改到“可删除设备来增加测试设备名额”。这样，你就可以选择性的删除一些不需要的设备来释放一些名额了。






