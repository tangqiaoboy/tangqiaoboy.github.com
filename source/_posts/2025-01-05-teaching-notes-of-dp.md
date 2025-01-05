---
title: CSPJ 教学思考：动态规划
date: 2025-01-05 18:03:48
tags: cspj
---

# 引言

动态规划是 CSPJ 拉分的关键知识点。

之所以这样，是因为动态规划不像 DFS、BFS、二分那样有固定的模版格式。学生要在动态规划问题上融汇贯通，需要花费大量的练习，也需要足够的聪明。

笔者自己在高中阶段，也是在动态规划问题上困扰许久。我自己的学习经验是：动态规划还是需要多练，练够 100 道题目，才能够熟悉动态规划的各种变型。之后在比赛中看到新的题目，才会有点似曾相识的感觉，进一步思考出状态转移方程。

所以，我打算写 100 道动态规划方程的题解，希望有志攻破此难关的学生和家长一起加油！

# 教学题目 

推荐的教学题目如下：

| 题目名      | 说明 |
| ----------- | ----------- |
| [P2842 纸币问题 1](https://www.luogu.com.cn/problem/P2842)| 基础 DP，记忆化搜索 |
| [P1216 数字三角形](https://www.luogu.com.cn/problem/P1216)| 基础 DP，记忆化搜索|
|[P2840 纸币问题 2](https://www.luogu.com.cn/problem/P2840) |基础 DP |
|[P2834 纸币问题 3](https://www.luogu.com.cn/problem/P2834)|基础 DP，有多处可优化的点 |
|[P1048 采药](https://www.luogu.com.cn/problem/P1048) | NOIP2005 普及组第三题。01 背包问题。 |
|[P2196 挖地雷](https://www.luogu.com.cn/problem/P2196) |NOIP1996 提高组第三题。涉及输出路径技巧。 |
| | |
| | |

# 例题代码

## P2842 纸币问题 1

状态转移方程为：`dp[i] = min( dp[i-v[j]] )  + 1 `

```c++
/**
 * dp[i] = min( dp[i-v[j]] )  + 1 
 */
#include <bits/stdc++.h>
using namespace std;

int n, w;
int v[1100], dp[11000];

int main() {
	scanf("%d%d", &n, &w);
	for (int i = 0; i < n; ++i) {
		scanf("%d", v+i);
	}
	memset(dp, 0x3f, sizeof(dp));
	dp[0] = 0;
	for (int i = 1; i <=w ; ++i) {
		for (int j = 0; j < n; ++j) {
			if (i-v[j]>=0) {
				dp[i] = min(dp[i], dp[i-v[j]]+1);
			}
		}
	}
	printf("%d\n", dp[w]);
	return 0;
}
```

## P1216 数字三角形

状态转移方程为：`dp[i][j] = v[i][j] + max(dp[i+1][j], dp[i+1][j+1])`

```c++
/**
 * 动态规划：
 * dp[i][j] = v[i][j] + max(dp[i+1][j], dp[i+1][j+1])
 */
#include <bits/stdc++.h>
using namespace std;

int n;
int v[1010][1010];
int dp[1010][1010];

int main() {
	scanf("%d", &n);
	for (int i = 0; i < n; ++i) {
		for (int j = 0; j <= i; ++j) {
			scanf("%d", &v[i][j]);
		}
	}
	// 初始状态
	for (int j = 0; j < n; ++j) {
		dp[n-1][j] = v[n-1][j];
	}
	// dp
	for (int i = n-2; i>=0; --i) {
		for (int j = 0; j <= i; ++j) {
			dp[i][j] = v[i][j] + max(dp[i+1][j], dp[i+1][j+1]);
		}
	}
	printf("%d\n", dp[0][0]);
	return 0;
}

```

## P2840 纸币问题 2

状态转移方程为：`dp[i] = sum(dp[i- v[j]]), j = 0~N`，结果需要每次模 1000000007。

```c++
#include <bits/stdc++.h>
using namespace std;

int n, w;
int v[1010], dp[10010];

int main() {
	scanf("%d%d", &n, &w);
	for (int i = 0; i < n; ++i) {
		scanf("%d", v+i);
	}
	dp[0] = 1;
	for (int i = 1; i <= w ; ++i) {
		dp[i] = 0;
		for (int j = 0; j < n; ++j) {
			if (i >= v[j]) {
				dp[i] = (dp[i] + dp[i-v[j]])%1000000007;
			}
		}
	}
	printf("%d\n", dp[w]);
	return 0;
}
```

## P2834 纸币问题 3

此题不能像之前的题目那样，用金钱数为阶段。因为此题是计算的组合数，所以 1,5 和 5,1 是一种答案。如果以金钱数为阶段，就无法方便将这种重复计算的排除掉。

那么，以什么为阶段，可以保证每个阶段可以基于过去的阶段推导出来？可以用不同的钱币种类为阶段！

接下来就是思考这种情况下的状态转移方程。可以得出，状态转移方程如下：

 - `dp[i][j]` 表示用前 i 种钱币组成金额 j 的组合数
 - `dp[i][j] = dp[i-1][j-v[i]] + dp[i-1][j - v[i]*2] + …. dp[i-1][j-v[i]*n]; (j >= v[i]*n)`
 - 初始状态：`dp[1][0] = 1; dp[1][v[1]] = 1; dp[1][v[1]*2] = 1;` 

参考程序如下：

```c++
#include <bits/stdc++.h>
using namespace std;

const int MOD = 1000000007;
int n, w;
int v[1010], dp[1010][10010];

int main() {
	scanf("%d%d", &n, &w);
	for (int i = 0; i < n; ++i) {
		scanf("%d", v+i);
	}
	memset(dp, 0, sizeof(dp));
	// dp[0][0] = 1; dp[0][v[0]] = 1;dp[0][v[0]*2] = 1;….
	int cnt = 0;
	while (cnt <= w) {
		dp[0][cnt] = 1;
		cnt += v[0];
	}
	for (int i=1; i<n; ++i) {
		for (int j=0; j<=w; ++j) {
			cnt = 0;
			while (j - cnt >= 0) {
				dp[i][j] = (dp[i][j]+dp[i-1][j-cnt]) % MOD;
				cnt += v[i];
			}
		}
	}
	printf("%d\n", dp[n-1][w]);
	return 0;
}
```

此题还有另外一种状态转移方程，把阶段分为没有用过 a，和至少用过一张 a。

这样的话，状态转移方程优化为：`dp[i][j] = dp[i-1][j] + dp[i][j-v[i]]`

这样，代码的复杂度进一步降低，代码如下：

```c++
#include <bits/stdc++.h>
using namespace std;

const int MOD = 1000000007;
int n, w;
int v[1010], dp[1010][10010];

int main() {
	scanf("%d%d", &n, &w);
	for (int i = 0; i < n; ++i) {
		scanf("%d", v+i);
	}
	memset(dp, 0, sizeof(dp));
	int cnt = 0;
	while (cnt <= w) {
		dp[0][cnt] = 1;
		cnt += v[0];
	}
	for (int i=1; i<n; ++i) {
		for (int j=0; j<=w; ++j) {
			if (j-v[i]>=0) {
				dp[i][j] = (dp[i-1][j]+dp[i][j-v[i]])% MOD;	
			} else {
				dp[i][j] = dp[i-1][j];
			}
		}
	}
	printf("%d\n", dp[n-1][w]);
	return 0;
}
```
此题还可以进一步简化，因为 dp[i] 那一层算完之后 dp[i-1] 层就没有用了。有没有可能我们将 dp[i]层和 dp[i-1]都合并在一起呢？

答案是可以的。我们可以将关键代码进一步简化如下，把 dp 改成一个一维数组。状态转移方程变为了:`dp[j] = dp[j] + dp[j-v[i]]`

```c++
#include <bits/stdc++.h>
using namespace std;

const int MOD = 1000000007;
int n, w;
int v[1010], dp[10010];

int main() {
	scanf("%d%d", &n, &w);
	for (int i = 0; i < n; ++i) {
		scanf("%d", v+i);
	}
	memset(dp, 0, sizeof(dp));
	int cnt = 0;
	while (cnt <= w) {
		dp[cnt] = 1;
		cnt += v[0];
	}
	for (int i=1; i<n; ++i) {
		for (int j=0; j<=w; ++j) {
			if (j-v[i]>=0) {
				dp[j] = (dp[j]+dp[j-v[i]]) % MOD;	
			} else {
				dp[j] = dp[j];
			}
		}
	}
	printf("%d\n", dp[w]);
	return 0;
}
```

## P1048 采药

[P1048 采药](https://www.luogu.com.cn/problem/P1048)这题是经典的 01 背包问题。为了方便教学，我们还是从最简单的动态规划思路开始推导。

我们把每个草药是一个阶段，这样：
 - `dp[i][j]` 表示前 i 个草药，花费 j 时间可以得到的最大价值
 - 状态转移方程为：`dp[i][j] = max(dp[i-1][j], dp[i-1][j-v[i]])`

这样写出来的参考程序如下：

```c++
/**
dp[i][j] 表示前 i 个草药，花费 j 时间可以得到的最大价值
dp[i][j] = max(dp[i-1][j], dp[i-1][j-t[i]] 
 */
#include <bits/stdc++.h>
using namespace std;

int T, M;
int t[110], v[110];
int dp[110][1010];

int main() {
	scanf("%d%d", &T, &M);
	for (int i = 1; i <= M; ++i) {
		scanf("%d%d", t+i, v+i);
	}
	// 下标从 1 开始，这样不用考虑 i-1 越界了
	for (int i = 1; i <= M; ++i) {
		for (int j = 1; j <= T; ++j) {
			dp[i][j] = dp[i-1][j];
			if (j - t[i] >= 0) {
				dp[i][j] = max(dp[i][j], dp[i-1][j - t[i]]+v[i]);
			}
		}
	}
	printf("%d\n", dp[M][T]);
	return 0;
}
```
与上一题一样，通过分析，我们发现 dp[i][j] 中的 i 一层可以优化掉，变成只有 dp[j]。

这样，状态转移方程被优化成：`dp[j]=max(dp[j],dp[j-t[i]]+v[i])`。

但是，因为每一个草药只能用一次，如果我们正着循环 j 的话，会出现多次使用第 i 个草药的情况。所以，我们倒着进行递推，就可以避免这种情况。

最终实现的代码如下：

```c++
/**
dp[j] 花费 j 时间可以得到的最大价值
dp[j] = max(dp[j], dp[j-t[i]])
 */
#include <bits/stdc++.h>
using namespace std;

int T, M;
int t[110], v[110];
int dp[1010];

int main() {
	scanf("%d%d", &T, &M);
	for (int i = 1; i <= M; ++i) {
		scanf("%d%d", t+i, v+i);
	}
	for (int i = 1; i <= M; ++i) {
		for (int j = T; j >= t[i]; --j) {
			dp[j] = max(dp[j], dp[j - t[i]]+v[i]);
		}
	}
	printf("%d\n", dp[T]);
	return 0;
}
```

## P2196 挖地雷

[P2196 挖地雷](https://www.luogu.com.cn/problem/P2196) 是 NOIP1996 提高组第三题。这道题的解法有点类似于[P1216 数字三角形](https://www.luogu.com.cn/problem/P1216)。

但是，这道题更难的是：它需要我们输出路径。

我们先说状态转移方程：
 - dp[i] 表示第 i 个地窖能够挖到的最多地雷数。
 - w[i] 表示第 i 个地窖的地雷数。
 - 转移方程：`dp[i] = max(dp[i+1~N]中能够与 dp[i] 连通的地窖) + w[i]` 与 `dp[i] = w[i]`中的较大者。

我们再说说如何输出路径。因为计算之后 dp 数组中保存了每个结点能够挖的最大地雷数。所以，我们从答案 dp[ans]开始，找哪一个地窖与当前相连，同时值又等于 dp[ans] - w[ans],则表示那个地窖是下一个点。

参数代码：

```c++
#include <bits/stdc++.h>
using namespace std;

int n;
int w[30];
int v[30][30];
int dp[30];

int main() {
	scanf("%d", &n);
	for (int i = 1; i <= n; ++i) {
		scanf("%d", w+i);
	}
	for (int i = 1; i <=n ; ++i) {
		for (int j = i+1; j<=n; ++j) {
			scanf("%d", &v[i][j]);
		}
	}
	int ans = 0;
	for (int i = n; i>=1; --i) {
		dp[i] = w[i];
		for (int j = i+1; j<=n; ++j) {
			if (v[i][j]) {
				dp[i] = max(dp[i], dp[j]+w[i]);
			}
		}
		if (dp[ans] < dp[i]) ans = i;
	}
	int cnt = dp[ans];
	int idx = ans;
	while (cnt) {
		printf("%d ", idx);
		cnt -= w[idx];
		for (int i = idx + 1; i<=n; ++i) {
			if (v[idx][i] && cnt == dp[i]) {
				idx = i;
				break;
			}
		}
	}
	printf("\n%d\n", dp[ans]);
	return 0;
}
```


