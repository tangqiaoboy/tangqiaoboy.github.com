---
layout: post
title: "粉笔网的架构和项目管理"
date: 2012-10-15 10:56
comments: true
categories: summary
---

10 月 10 日，在 [CMDN 炫姐姐](http://weibo.com/cmdnclub) 的邀请下，我们粉笔网团队通过 CSDN 的 CMDN Club, 对外进行了第一次 [技术分享](http://hui.csdn.net/MeetingInfo.aspx?MID=137)。分享的内容主要包括 2 部分:

第一部分是关于粉笔网使用 Scrum 进行快速开发的故事。我们分享了如何在 3 个多月完成了全平台的开发的经验分享，其中也包括我们对 Scrum 的具体使用方式和其中遇到的各种问题。CSDN 整理出来的报道文章在 [这里](http://www.csdn.net/article/2012-10-11/2810658)。

{% img /images/fenbi-scrum.jpg %}

第二部分是关于粉笔网的技术架构方案。粉笔网在技术上还是一个微博类的 [UGC](http://baike.baidu.com/view/713949.htm) 信息聚合系统。一方面，我们的团队之前做过 [网易微博](http://t.163.com) 和 [爱转角](http://izhuanjiao.com) 这 2 个微博类系统，积累了很多经验。另一方面，我们作为创业团队，没有在大公司里可以使用的内部开发的成熟的分布式存储系统，所以，我们只有借助于开源社区。最终，我们比较了现在各种方案的优缺点后，提出了我们自己的能够支持千万级用户的系统架构方案。这个方案最终通过了我们自己的压力测试，并且在上线后运行良好。CSDN 整理出来的报道文章在 [这里](http://www.csdn.net/article/2012-10-11/2810661?bsh_bid=145141477)。


{% img /images/fenbi-arch.jpg %}

我们将演示的 PDF 文件在此分享给大家。下载链接：<a href="http://blog.fenbi.com/assets/fenbi-scrum.pdf"> 第一部分 </a> , <a href="http://blog.fenbi.com/assets/fenbi-arch.pdf"> 第二部分 </a> 。

## 2016.02.27 更新

原粉笔网已关闭，相关演示的 PDF 文件不再可下载。

