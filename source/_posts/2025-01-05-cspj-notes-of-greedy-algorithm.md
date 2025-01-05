---
title: CSPJ 教学思考：贪心算法
date: 2025-01-05 10:28:04
tags: cspj
---

## 1、概述

贪心算法讲起来容易，就是问题求解的每一步，都用一个局部最佳的策略，如果能够证明局部最佳的策略最终能够保证全局最佳，则可以用贪心算法。

在实际 CSPJ 比赛中，我们不用严谨的求解和证明，只需要尝试做一些反例，如果反例中找不到问题，就可以先用贪心求解。毕竟比赛中时间的权重因素比较高。

在教学中，我们先通过简单的题目让学生理解贪心的概念。之后就可以逐步增加难度，让学生意识到，写出贪心可能容易，但是想到贪心这种解法在比赛中并不那么显而易见。

贪心通常伴随着排序，所以对 STL 的 `sort` 以及 `priority_queue` 的熟练应用也是快速解决贪心题目的必备基础，在学习相关题目的时候，可以重点加强巩固相关知识点。

## 2、sort 函数

sort 函数内部使用快速排序实现，时间复杂度为 `O(N*log(N))`。对于数据规模为 10 万左右的题目，出题人有可能是希望你用这个时间复杂度来解题的，所以可以留意一下是否需要排序。

对于普通类型，STL 自带了 `greater<T>`和`less<T>` 两个比较器，以下是相关代码：

```c++
int v[100];
sort(v, v+n, greater<int>);
```

sort 函数通常和自定义的结构体排序搭配使用，以下是相关代码：

```c++
struct Person {
	int idx;
	int v;
};
bool operator < (Person a, Person b) {
	return a.v < b.v;
}

Person v[1100];
// 使用时直接用 sort
sort(v, v+n);
```
## 3、教学题目

推荐的教学题目如下：

| 题目名      | 说明 |
| ----------- | ----------- |
|[P2240 部分背包问题](https://www.luogu.com.cn/problem/P2240) | 较简单的一道贪心题 |
| [P1223 排队接水](https://www.luogu.com.cn/problem/P1223)| 贪心进阶|
| [P1803 凌乱的yyy](https://www.luogu.com.cn/problem/P1803) | 贪心进阶 |
|[P5019 铺设道路](https://www.luogu.com.cn/problem/P5019) | NOIP2018 提高组真题|
| | |

## 4、例题代码

### P2240 部分背包问题

[P2240 部分背包问题](https://www.luogu.com.cn/problem/P2240) 是较简单的一道贪心题。唯一的陷阱是，学过动态规划的同学可能误以为这个是背包问题。但是在教学中，贪心算法的学习比动态规划更早，所以不会有这个误解。

此题的解题思路是：将金币按单位重量的价值排序，如果能放则放；放不了，则分割放部分。

我们定义了一个结构体，结构体中的 `double p`用于保存单位重量的价值。在排序的时候，按 p 的大小来由大到小排序。

参考代码如下：

```c++
#include <bits/stdc++.h>
using namespace std;

struct Gold {
	int w, v;
	double p;
};
bool operator<(Gold a, Gold b) {
	return a.p > b.p;
}

int n, t;
Gold v[110];

int main() {
	scanf("%d%d", &n, &t);
	for (int i = 0; i < n; ++i) {
		scanf("%d%d", &v[i].w, &v[i].v);
		v[i].p = v[i].v*1.0 / v[i].w;
	}
	sort(v, v+n);
	double ans = 0;
	for (int i = 0; i < n; ++i) {
		if (t>=v[i].w) {
			ans += v[i].v;
			t -= v[i].w;
		} else {
			ans += v[i].p * t;
			break;
		}
	}
	printf("%.2f\n", ans);
	return 0;
}
```

### P1223 排队接水

[P1223 排队接水](https://www.luogu.com.cn/problem/P1223) 此题的难度是需要推导出贪心的策略。具体推导过程如下：

{% img /images/greedy-1.jpg %}

由以上推导，我们只需要将打水时间按从小到大排序，然后加总时间即可。参考代码如下：

```c++
#include <bits/stdc++.h>
using namespace std;

struct Person {
	int idx;
	int v;
};
bool operator <(Person a, Person b) {
	return a.v < b.v;
}

int n;
Person v[1100];
int main() {
	cin >> n;
	for (int i = 0; i < n; ++i) {
		v[i].idx = i+1;
		cin >> v[i].v;
	}
	sort(v, v+n);
	long long cnt = 0;
	for (int i = 0; i < n; ++i) {
		printf("%d ", v[i].idx);
		cnt += v[i].v * (n-i-1);
	}
	printf("\n%.2f\n", cnt*1.0/n);
	
	return 0;
}
```

### P1803 凌乱的yyy

此题有两种贪心的思路，分别是：

 - 按开始时间排序贪心
 - 按结束时间排序贪心

#### 按开始时间排序贪心

此贪心的方法如下：
 - 左端点排序（小的在前），左端点相同的，按右端点排序(小的在前）

 - 比较当前区间和下一区间，如果下一区间与当前区间没有相交，则由于我们是按左端点排序的，后面的都不会相交，直接选择当前区间；否则这两个区间显然必须抛弃一个，由于我们是按左端点排序的，后面的区间左端点都是大于它们的，因此这两个的左端点已经没有意义了，为了留出更多的空间，留下右端点靠左的那一个即可。

参考代码如下：
```c++
/**
 * 按开始时间排序
 */
#include <bits/stdc++.h>
using namespace std;

struct Line{
	int left, right;
};
bool operator<(Line a, Line b) {
	if (a.left != b.left) return a.left < b.left;
	return a.right < b.right;
}
int n, ans;
Line v[1000010];

int main() {
	scanf("%d", &n);
	for (int i = 0; i < n; ++i) {
		scanf("%d%d", &v[i].left, &v[i].right);
	}
	sort(v, v+n);
	ans = 0;
	int border = 0;
	for (int i = 0; i < n; ++i) {
		if (v[i].left >= border) {
			ans++;
			border = v[i].right;
		} else {
			border = min(border, v[i].right);
		}
	}
	printf("%d\n", ans);
	return 0;
}

```

#### 按结束时间排序贪心

此贪心的方法如下：
 - 右端点排序（小的在前），右端点相同的，按左端点排序(大的在前）

这种贪心的思路是：对于每一个结束时间，如果能排（开始时间在上一个结束时间之后），就尽量安排。如果不能排，则尝试下一个结束时间。

参考代码如下：

```c++
/**
 * 按结束时间排序
 */
#include <bits/stdc++.h>
using namespace std;

struct Line{
	int left, right;
};
bool operator<(Line a, Line b) {
	if (a.right != b.right) return a.right < b.right;
	return a.left < b.left;
}
int n, ans;
Line v[1000010];

int main() {
	scanf("%d", &n);
	for (int i = 0; i < n; ++i) {
		scanf("%d%d", &v[i].left, &v[i].right);
	}
	sort(v, v+n);
	ans = 0;
	int border = -1;
	for (int i = 0; i < n; ++i) {
		if (border <= v[i].left) {
			ans++;
			border = v[i].right;
		}
	}
	printf("%d\n", ans);
	return 0;
}
```

### P5019 铺设道路

[P5019 铺设道路](https://www.luogu.com.cn/problem/P5019)是 NOIP2018 提高组真题。之所以作为提高组题目，是因为很难想到这种贪心策略，不过一旦想清楚，写起来是很简单的。

贪心策略是：
 - 第一个坑直接填满
 - 从第二坑开始，考虑能不能被左边顺带给填上。
 - 如果第二个坑比第一个坑小，肯定就顺带填上了。不需要任何成本。
 - 如果第二个坑比第一个坑大，那么就只能顺带填一部分，多出来的差额，需要额外的填补。

参考代码：

```c++
#include <bits/stdc++.h>
using namespace std;

int n;
int v[100010];
long long ans = 0;

int main() {
	scanf("%d", &n);
	for (int i = 0; i < n; ++i) {
		scanf("%d", v+i);
	}
	ans = v[0];
	for (int i = 1; i < n; ++i) {
		if (v[i]>v[i-1]) {
			ans += v[i] - v[i-1];
		}
	}
	cout << ans << endl;
	return 0;
}
```

以上。
