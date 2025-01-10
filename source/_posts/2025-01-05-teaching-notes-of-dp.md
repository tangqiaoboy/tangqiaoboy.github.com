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

# 动态规划解题的核心问题

虽然动态规划没有模版可以套，但是动态规划有三个核心问题：

 - 状态的定义
 - 状态转移方程
 - 初始状态的设置

一般思考动态规划就是思考以上三个问题，这三个问题解决了，动态规划的程序也可以写出来了。

# 教学题目 

推荐的教学题目如下：

| 题目名      | 说明 |
| ----------- | ----------- |
| [P2842 纸币问题 1](https://www.luogu.com.cn/problem/P2842)| 基础 DP，记忆化搜索 |
| [P1216 数字三角形](https://www.luogu.com.cn/problem/P1216)| 基础 DP，记忆化搜索 【经典 DP】 |
|[P2840 纸币问题 2](https://www.luogu.com.cn/problem/P2840) |基础 DP |
|[P2834 纸币问题 3](https://www.luogu.com.cn/problem/P2834)|基础 DP，有多处可优化的点 |
|[P1048 采药](https://www.luogu.com.cn/problem/P1048) | NOIP2005 普及组第三题。01 背包问题。【经典 DP】 |
|[P1616 疯狂的采药](https://www.luogu.com.cn/problem/P1616) |完全背包问题。【经典 DP】 |
|[P2196 挖地雷](https://www.luogu.com.cn/problem/P2196) |NOIP1996 提高组第三题。涉及输出路径技巧。 |
|[P1434 滑雪](https://www.luogu.com.cn/problem/P1434) | 上海市省队选拔 2002 |
|[P1115 最大子段和](https://www.luogu.com.cn/problem/P1115) | 最大子段和。【经典 DP】|
| | |
| | |

适合的作业：

| 题目名      | 说明 |
| ----------- | ----------- |
|[P4017 最大食物链计数](https://www.luogu.com.cn/problem/P4017)| 记忆化搜索|

# 例题代码

## P2842 纸币问题 1

此题可以带着孩子一步步推导和演进。具体步骤如下。

先引导孩子用最暴力的 DFS 的方式来做此题，建立基础的解题框架，虽然会超时，但是也帮助我们后面引导孩子学会记忆化搜索。代码如下：

```c++
/**
 * DFS，超时
 */
#include <bits/stdc++.h>
using namespace std;

int n, w;
int v[1100];

int dfs(int pt) {
	if (pt == 0) return 0;
	int ret = 1e9;
	for (int i = 0; i < n; ++i) {
		if (pt>=v[i]) {
			ret = min(ret, dfs(pt-v[i]) + 1);
		}
	}
	return ret;
}

int main() {
	scanf("%d%d", &n, &w);
	for (int i = 0; i < n; ++i) {
		scanf("%d", v+i);
	}
	int ans = dfs(w);
	printf("%d\n", ans);
	return 0;
}
```

有了上面的代码，通过分析，发现大部分的超时是因为有重复的计算过程。以下是一个以 10,5,1 为例的示意：

{% img /images/dp-1.jpg %}

所以，我们可以将重复计算的过程保存下来，以后再次需要计算的时候，直接读取保存的结果即可。在此思想下，我们只需要在上面改动三行，即可将超时的程序改为通过。具体代码如下：

```c++
/**
 * DFS，记忆化搜索
 */
#include <bits/stdc++.h>
using namespace std;

int n, w;
int v[1100];
int r[10010]; // 改动 1

int dfs(int pt) {
	if (pt == 0) return 0;
	if (r[pt] != 0) return r[pt]; // 改动 2

	int ret = 1e9;
	for (int i = 0; i < n; ++i) {
		if (pt>=v[i]) {
			ret = min(ret, dfs(pt-v[i]) + 1);
		}
	}
	return (r[pt]=ret); // 改动 3
}

int main() {
	scanf("%d%d", &n, &w);
	for (int i = 0; i < n; ++i) {
		scanf("%d", v+i);
	}
	int ans = dfs(w);
	printf("%d\n", ans);
	return 0;
}
```

有了以上两段代码的尝试，我们能够发现：
 - dfs(pt) 只与 dfs( 0 ~ pt-1) 有关,与 dfs(pt+1~w)无关。
 - 如果我们知道了 dfs(0~pt)，就可以推出 dfs(pt+1)

那么，我们就可以思考，如果我们用 dp[i] 来表示钱币总额为 i 的结果数。那么，dp[i] 的计算过程（即：状态转移方程）为：`dp[i] = min( dp[i-v[j]] )+1`，其中`j=0~N`。

这样，我们就可以引导学生写出第一个动态规划程序。

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

[P1216 数字三角形](https://www.luogu.com.cn/problem/P1216)同样可以用记忆化搜索引入。先写记忆化搜索的代码有助于我们理解动态规划的状态转移方程。

搜索的代码为：

```c++
/**
 * DFS，记忆化
 */
#include <bits/stdc++.h>
using namespace std;

int n;
int v[1010][1010];
int r[1010][1010];

int dfs(int x, int y) {
	if (r[x][y] != -1) return r[x][y];
	if (x == n-1) return 
		r[x][y] = v[x][y];
	else return 
		r[x][y] = v[x][y]+max(dfs(x+1,y), dfs(x+1,y+1));
}

int main() {
	scanf("%d", &n);
	for (int i = 0; i < n; ++i) {
		for (int j = 0; j <= i; ++j) {
			scanf("%d", &v[i][j]);
		}
	}
	memset(r, -1, sizeof(r));
	printf("%d\n", dfs(0, 0));
	return 0;
}
```

由搜索代码可知，每一个位置的最价结果由它下面两个结点的最价结果构成。于是，我们可以构造出状态转移方程：`dp[i][j] = v[i][j] + max(dp[i+1][j], dp[i+1][j+1])`

另外，我们可以引导学生：上层的依赖于下层的数据，那应该怎么推导呢？让学生想到用倒着 for 循环的方式来从下往上推导。

最后，我们再引导学生构建一下初始值。由此，我们建立起动态规划解题的三个核心问题：
 - 状态的定义
 - 状态转移方程
 - 初始状态的设置

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
				dp[j] = dp[j]; //此行可以删除，但为了教学示意保留
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

## P1434 滑雪

这道题的麻烦点是如何定义状态转移的阶段，因为没有明显的阶段。

可以考虑的办法是：将点按高度排序，这样从高度低的点开始，往高的点做状态转移。

所以：
 - 定义：dp[i][j] 表示从 (i,j) 这个位置开始滑的最长坡。
 - 转移方程：
	- `dp[x][y] = max(dp[x'][y'])+1`
	- `dp[x'][y']` 为上下左右相邻并且高度更低的点
 - 初始化：无

```c++
#include <bits/stdc++.h>
using namespace std;

int r, c;
int tu[110][110];
int dp[110][110];
int movex[]={-1,1,0,0};
int movey[]={0,0,-1,1};
bool debug = false;

struct Node {
	int x, y, h;
	Node(int _x, int _y, int _h) {
		x = _x; y = _y; h = _h;
	}
};
bool operator<(Node a, Node b) {
	return a.h < b.h;
}
vector<Node> v;

int main() {
	scanf("%d%d", &r, &c);
	v.reserve(r*c);
	for (int i = 0; i < r; ++i) {
		for (int j = 0; j < c; ++j) {
			scanf("%d", &tu[i][j]);
			v.push_back(Node(i, j, tu[i][j]));
		}
	}
	sort(v.begin(), v.end());
	memset(dp, 0, sizeof(dp));
	int ans = 0;
	for (int i = 0; i < r*c; ++i) {
		Node node = v[i];
		int x = node.x;
		int y = node.y;
	    for (int j = 0; j < 4; ++j) {
	    	int tox = x + movex[j];
	    	int toy = y + movey[j];
	    	if (tox >=0 && tox <r && toy >=0 && toy<c &&
	    		node.h > tu[tox][toy]) {
	    		dp[x][y] = max(dp[x][y], dp[tox][toy]);
	    	}
	    }
	    dp[x][y] += 1;
	    ans = max(ans, dp[x][y]);
	    if (debug) {
	    	printf("dp[%d][%d]=%d\n", x, y, dp[x][y]);
	    }
	}
	printf("%d\n", ans);
	return 0;
}
```

此题更容易想到的写法还是记忆化搜索：对每一个点作为开始点进行一次 DFS，同时在进行递归调用的时候，如果当前点处理过，则返回上次的结果。

参考代码如下：

```c++
/**
 * DFS, 记忆化
 */
#include <bits/stdc++.h>
using namespace std;

int r, c;
int tu[110][110];
int rem[110][110];

int movex[]={-1,1,0,0};
int movey[]={0,0,-1,1};

int dfs(int x, int y) {
	if (rem[x][y] != 0) return rem[x][y];
	int mm = 0;
	for (int i = 0; i < 4; ++i) {
		int tox = x + movex[i];
		int toy = y + movey[i];
		if (tox >=0 && tox <r && toy >=0 && toy<c &&
	    		tu[x][y] > tu[tox][toy]) {
			mm = max(mm, dfs(tox, toy));
		}
	}
	return (rem[x][y] = mm + 1);
}

int main() {
	scanf("%d%d", &r, &c);
	for (int i = 0; i < r; ++i) {
		for (int j = 0; j < c; ++j) {
			scanf("%d", &tu[i][j]);
		}
	}
	int ans = 0;
	for (int i = 0; i < r; ++i) {
		for (int j = 0; j < c; ++j) {
			ans = max(ans, dfs(i, j));
		}
	}
	printf("%d\n", ans);
	return 0;
}
```

## P1115 最大子段和

[P1115 最大子段和](https://www.luogu.com.cn/problem/P1115) 是最经典的一类动态规划问题。思路如下：

 - dp[i] 表示包含 i 这个数，并且以 i 结尾的最大子段和。
 - 状态转移方程：
   - 如果 dp[i-1] 为负数，那么 `dp[i] = v[i]`
   - 如果 dp[i-1] 为正数，那么 `dp[i] = dp[i-1]+v[i]`

因为 dp[i] 在转移方程上只与 dp[i-1]相关，所以它最终结构上被可以被化简成类似贪心的策略，即：
 - 用一个变量记录当前的累加值，如果当前累加值为负数，则重新计算。
 - 在累加过程中随时判断，记录最大的累加值为最终答案。

```c++
#include <bits/stdc++.h>
using namespace std;

int n;
int v[200100];

int main() {
	scanf("%d", &n);
	for (int i = 0; i < n; ++i) {
		scanf("%d", v+i);
	}
	int cnt = 0;
	int ans = -1e9;
	for (int i = 0; i < n; ++i) {
		cnt += v[i];
		ans = max(ans, cnt);
		if (cnt < 0) cnt = 0;
	}
	printf("%d\n", ans);
	return 0;
}
```



# 作业代码

## P4017 最大食物链计数

[P4017 最大食物链计数](https://www.luogu.com.cn/problem/P4017)最佳的做法是做记忆化的搜索。

记录下出度为 0 的结点，从这些结点开始去寻找，把各种可能的路径加总。同时在 DFS 的时候，记录下搜索的结果。

参考代码如下：

```c++
/**
 * 记忆化搜索
 */
#include <bits/stdc++.h>
using namespace std;

#define MOD 80112002

int n, m;
vector<vector<int> > v;
int r[5010], out[5010];

int dfs(int a) {
	if (r[a] != -1) return r[a];
	// 如果是头部，算一种情况
	if (v[a].size() == 0) return (r[a]=1);
	// 如果不是头部，则求和
	int cnt = 0;
	for (int i = 0; i < v[a].size(); ++i) {
		cnt = (cnt + dfs(v[a][i])) % MOD;
	}
	return r[a] = cnt;
}

int main() {
	memset(r, -1, sizeof(r));
	scanf("%d%d", &n, &m);
	v.resize(n+1);
	for (int i = 0; i < m; ++i) {
		int a, b;
		scanf("%d%d", &a, &b);
		v[a].push_back(b); // a 被 b 吃
		out[b]++; // b 的出度+1
	}
	int ans = 0;
	for (int i = 1; i <=n ; ++i) {
		// 如果 i 出度为 0，就表示只能被吃，为底部
		if (out[i] == 0) { 
			ans += dfs(i);
			ans %= MOD;
		}
	}
	printf("%d\n", ans);
	return 0;
}
```





