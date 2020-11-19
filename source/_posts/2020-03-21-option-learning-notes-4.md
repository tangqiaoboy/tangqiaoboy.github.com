---
title: 美股期权学习笔记（四）
date: 2020-03-22 21:40:01
categories: summary
tags: books
---

前面写完了 3 篇笔记之后，说说我的一些体会吧。

## 期权不适合大部分人

期权的操作太复杂，不适合大部分人，特别是通过期权组合来建立各种头寸，对非专业人士来说很难掌握。

我感觉如果要成为这方面的专家，应该需要投入非常多的时间，对于普通人来说不但不划算，而且即便投入了也不一定能挣到钱。

## 用裸卖看跌（PUT)期权来买入股票

用裸卖看跌（PUT)期权来尝试降低买入股票的价格，是我认为**唯一**适合普通投资人尝试的操作。

比如特斯拉现在股票值 450，但是你觉得只有跌到 220 你才愿意买入。那你可以裸卖出一周或一个月到期的 220 元的 PUT 期权。这样：

 * 如果到期时股价跌到 220 以下，你则以 220 完成了建仓。
 * 如果到期时股价没有跌到 220 以下，你则收取了权利金。

这个事情的风险有几个:

 * 如果股价跌得特别多（比如跌到 100），这种操作实际上把买入的价格被锁定到了 220，造成帐面上的亏损。
 * 如果股价上涨很多，这种操作会失去拥有这个股票的机会。

## 产品化的版本

该操作被一个 App 产品化了，这个 App 叫[高格证券](https://www.toweringsecurities.cn/)。高格证券把该操作称作「优买计划」，如下图所示：

{% img /images/gaoge.jpg %}

我觉得这种产品化的思路还挺好，首先它强化了这个策略应该用来长期持有看好的股票。然后它把权利金描述成现金收益，并且提供了年化收益和买入概率等信息。

如果你打算尝试，可以用我的邀请二维码（下图），这样我们俩各可以获得 5 美金的现金奖励。

{% img /images/gaoge-invite.jpg %}

也说说高格的缺点吧。高格的优势也同时是它的劣势，因为高格把它产品化了，为你隐藏了大量信息，所以你也就无法做各种各样期权的组合以及中途回购期权。另外从保证金角度，如果是深度的虚值期权，保证金会动态变化，大多时候不会到 100%，而高格因为是鼓励以购买为目标来使用「优买计划」，所以你需要交 100% 的保证金。

## 该操作的风险

《麦克米伦谈期权》的 2.5.3 章节提到了这种操作。作者认为，如果你目的并不是持有股票，而是通过这种方式获取权利金，那么极端风险情况下，你会有极大的账面损失。书中也讲了一个真实的案例：

> 市场上的专业投资者在裸卖空看跌期权的时候，喜欢选择低权利金，低波动率的股票，而 IBM 就是一个这类的股票。当时，IBM 的股价是 100 ~ 105 之间，挂牌的有行价权为 90 的 IBM 长期期权。
> 许多投资者裸卖出了看跌期权，他们的理由是他们不介意有机会以 90 的价格持有 IBM 的股票。
> 结果，IBM 的股价意外下跌到了 45。这个期权由虚值变为了深度实值。虽然期权没有到期，但是因为它是深度实值，很多被对手方提前行权了。
> 最后分析发现，其中很多投资者并没有打算真正地在熊市中持有 IBM 的股票。

所以，这个故事告诉我们，再好的股票也有经历它自己的熊市的时候，而当事件发生时，裸卖空看跌期权就会遭受损失。

如果你想控制这种情况发生时的风险，有一个办法是用更低的成本买入深度虚值看跌期权，这样就形成了一个牛市价差的期权组合，这将控制你的下行风险。下图是牛市价差的盈亏图。

{% img /images/sell-put_buy-put.jpg %}

## 我自己的一些体会

我自己尝试了一段时间裸卖空看跌（PUT)期权，以下是一些感悟：

 * 期权的到期时间不要过长。最好不要超过 3 个月。主要的原因一个是 3 个月时间波动可能非常大，另一个原因是你的保证金锁定时间太长。我建议过期时间选择 1 周 ~ 1 个月这个范围。

 * 想清楚自己是为了挣权利金还是持有。如果是为了持有，不要将卖空的价格设置得特别低，否则大概率是不可能完成建仓的。而一些极端情况下完成的建仓，真正发生的时候，可能跌幅就不止是当时设置的那个买入价了。

 * 如果是为了挣权利金而裸卖空看跌（PUT)期权。那么需要关注好 Theta 指标和 Vega 指标。因为 Theta 是时间价值指标。如果 Theta 指标特别低，而期权收益又高的话，那很可能是由于波动率（Vega）高带来的。那么这么高的波动率本身可能就意味着买入的风险。最好选低波动率的，同时时间价值高的期权。例如：下图中的一周到期的 Tesla 期权，Theta 值就很高：

{% img /images/theta-tesla.jpg %}

## 最后

一些朋友告诫我不要操作任何期权，我觉得他们说的很可能是对的。我的以上总结大概率是有一些片面性的，未来我也有极大可能交一些学费。

不过，如果使用完全不影响生活质量的钱，抱着学习的心态，不上杠杠，心里能够接受最后全部赔光，我想这样也没什么大不了。人生苦短，生活总得有些事情不试试不死心，对吧。

愿大家玩得开心！

本系列文章汇总：
 * [美股期权学习笔记（一）](/2020/02/08/option-learning-note/)
 * [美股期权学习笔记（二）](/2020/03/15/option-learning-notes-1/)
 * [美股期权学习笔记（三）](/2020/03/21/option-learning-notes-3/)
 * [美股期权学习笔记（四）](/2020/03/22/option-learning-notes-4/)
