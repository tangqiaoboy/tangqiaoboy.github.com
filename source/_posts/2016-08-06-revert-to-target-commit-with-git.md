---
title: 如何用 Git 将代码恢复到一个历史的版本
date: 2016-08-06 17:39:43
categories: 
tags: Git
---

## 需求

有些时候，在一些特殊情况下，我们需要将代码恢复到一个历史的提交版本上。而这个历史提交版本，离最新的提交已经比较久远了。

比如，我希望将如下的仓库的提交，恢复到上上上上次提交。当然，我可以一次一次的 revert，但是有没有更快更简单的办法呢？

{% img /images/git-revert-1.jpg %}


## 暴力的方式

如果你的仓库是自己在用（不影响别人），那么你可以使用 `git reset --hard <target_commit_id>` 来恢复到指定的提交，再用 `git push -f` 来强制更新远程的分支指针。为了保证万一需要找回历史提交，我们可以先打一个 tag 来备份。

对于刚刚的例子，需要执行的命令就是：

```
// 备份当前的分支到 backup_commit
git tag backup_commit
git push origin backup_commit
// 重置 source 分支
git reset --hard 23801b2
// 强制 push 更新远程分支
git push origin source -f
```

## 温和的方式

如果你的仓库是多人在协作，那么你这么操作会使用别人本地的代码库混乱，所以只能建一个新的提交，这个新的提交中把想取消的提交都 revert 掉，那么具体应该如何做呢？方法如下：

首先，和刚刚一样，用 `git reset --hard 23801b2` 将代码切换到目标提交的 id。接下来，用 `git reset --soft origin/source` 命令，将当前代码切换回最新的提交。

执行完上面两步后，你的仓库还是最新的提交，但是工作区变成了历史的提交内容，这个时候用 `git add` 和 `git commit` 即可。最终完成的效果如下：

{% img /images/git-revert-2.jpg %}

虽然用到的时候很少，但是理解它的原理有助于大家理解 Git 的工作区，暂存区和版本库的各种指针操作的意义，希望对大家有用。
