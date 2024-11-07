---
title: 五分钟弄懂 CSP-J 
date: 2024-09-17 21:51:36
tags: cspj
---

>本文约 1500 字，阅读需用时 5 分钟。

## 什么是 CSP-J

CSP（Certified Software Professional）全称是中国计算机学会（CCF）主办的“软件能力认证”，它是中国计算机学会为了提高计算机软件人才的专业水平而设立的一项专业技能认证。CSP 认证分为两个级别：CSP-J（Junior，入门级）和CSP-S（Senior，提高级）。

因为该认证主要用于选拔 NOIP 选手，所以认证的报名通道仅向各中小学的计算机老师开放。

比赛在每年的 9 月开学之后进行，比赛分为两轮。第一轮为笔试，第二轮为上机。第一轮通过之后，才能参加第二轮。2023 年 CSP-J 第一轮的通过分数线为 63 分。

比赛报名的官方网站为 <https://www.noi.cn/>，[这里](https://www.noi.cn/xw/2024-07-16/827939.shtml)有官方关于 CSP-J 的更多介绍。

## 信息学相关比赛的分类

参加信息学比赛，按打怪升级的过程，可以是从 GESP 考级开始。GESP 每 3 个月就有一次考级，可以及时检验学习成果。平均 3 个月就可以完成一个级别的知识学习，在学习初期，正反馈的频率还比较高。

以下是各个比赛面向的人群和获奖难度。

| 比赛名      | 面向人群 | 获奖难度 |
| ----------- | ----------- | ----------- |
| GESP      | 小学生+初中生 | 共 8 级。GESP 7 级 80 分或 8 级 60 分，可[跳过 CSP 第一轮](https://gesp.ccf.org.cn/101/1002/10144.html)      |
| CSP-J   | 小学生+初中生 | 各省约前 20% 可拿省一等奖      |
| CSP-S   | 高中生 | 各省约前 20% 可拿省一等奖        |
| NOIP   |  高中生 | 各省约前 20% 可拿省一等奖   |
| NOI   |  高中生 | 2024 年总获奖率为 85%，前 50 可获金奖    |
| IOI   |  高中生 | 代表中国参加全球的比赛   |

大部分小学生和初中生的目标是 CSP-J，获得一等奖可以被各大重点高中点招。

大部分高中孩子的目标可能在 NOIP 的一等奖，因为有了这个奖项，就可以被保送或者自主招生降分录取，高考的压力会小很多。我当年就是有 NOIP 的奖项，获得了北师大的自主招生参考资格（当时全国只有 50 个资格），然后考试通过了北师大的自主招生。

## CSP-J 的获奖难度

我做了一个《北京 CSP-J 近五年比赛情况》表，如下：

{% img /images/cspj-1.jpg %}

从中可以看到：

 - 初赛报名人数逐年增长，每年增长都在 10% 以上。22 年和 23 年分别增长了62% 和39%
 - 第一轮初赛的通过率逐年下降，每年最少下降 2pp，23 年通过率为 24%
 - 复赛获奖率非常高，即便是最低的 2023 年，也有71% 的孩子在复赛中获奖

虽然报名人数在增加，但好消息是：复赛中一等奖的获奖人数是基本按照复赛人数来计算的，得奖比例约为 20%，所以参赛人数越多，一等奖的名额就越多。

## 几年级可以拿到 CSP-J 一等奖

获得 CSP-J 一等奖的年级分布如下，绝大多数（74%）的孩子都是在初二或者初三，才能获得 CSP-J 一等奖。

{% img /images/cspj-2.jpg %}

但是，也有少量的优秀小学生（约6%），可以在小学阶段就拿到 CSP-J 一等奖，这样的学生在 2022 年有 146 人。

{% img /images/cspj-3.jpg %}

## CSP-J 的备赛准备

CSP-J 的最佳备赛年龄是 4 年级的上学期。因为，CSP-J 的比赛在每年的 9 月份，如果从 4 年级上学期开始备赛，那么就可以有整整两年来准备。但如果从 5 年级开始备赛，那么备赛时间就只有 1 年了。

是 4 年级不是 3 年级或更早的原因是：孩子在 4 年级的智力水平发育程度相对比较容易接受 C++ 这种比较抽象的编程语言。更早的年龄还是以兴趣培养为主较好，编程语言也可以选择 Scratch 或者 Python。但到了 4 年级，就应该学 C++ 了。

因为 C++ 语言是官方比赛语言，所以准备的时候应该直接从 C++开始，否则后期还涉及语言的切换，会浪费更多的备赛时间。

CSP-J 的备赛分为如下 3 个阶段，总共约 600 小时（240 小时上课，360 小时练习）：
 - C++ 语言学习。约 24 课时。
 - 数据结构。约 24 课时。
 - 算法。约 192 课时。

总课时约 240 小时，再加 360 小时以上的练习。

一般孩子如果从 4 年级开始，每周上 2 小时的课，完成作业 3 小时，那么就需要 120 周，差不多两年的时间还差一点。如果暑假再补一些时间进去，就刚刚够学习时长。

以上是冲着全国只有 146 人达成的“小学生阶段拿一等奖”为目标的训练方式。如果目标不那么激进，按大部分学生的学习进度，在初二获奖一等奖。那么准备时间就多了 1 倍，有 6 年级和初一整整两年。而且中间可以多次参赛，积累比赛经验。这样获奖的可能性就大大增加了。

所以，理性一点的目标是：

 - 小学 4 年级开始准备
 - 小学 6 年级能够进入复赛
 - 初中 1 年级保二等奖，争一等奖
 - 初中 2 年级争一等奖
 - 初中 3 年级参加 CSP-S
 - 高中 1 年级争 CSP-S 和 NOIP 二等奖
 - 高中 2 年级争 CSP-S 和 NOIP 一等奖

## 其它

我也在指导一个北京的五年级孩子学习编程，准备 CSP-J，现在学习完 40 课时（约 5 个月时间），已经通过了 GESP 2 级。欢迎同行和家长联系我一起交流，我的微信：tangqiaoboy 。

{% img /images/cspj-4.jpg %}

以上。
