---
title: CSPJ 教学思考：背包问题
date: 2026-01-11 22:41:29
tags: cspj
---

## 引言

背包问题是动态规划中的经典问题，也是 GESP 六级必考的知识点。其原理虽然需要花一些时间，但大多数孩子都能掌握，但是到了具体的题目时，因为背包问题变化较多，就不那么容易写出代码来。

本文将试图把背包问题的各种考法都列举出来，帮助大家巩固练习。

## 背包问题

背包问题之所以叫这个名字，是因为其背景故事是：往一个容量有限的背包里面，放入一些物品。每个物品有不同的体积大小，所以会占用相应的背包的容量。物品不能被分割，所以要么整个放入背包中，要么不放入。我们需要找出放入背包的价值最大的方案。

举一个简单的例子，背包容量是 10L：
 - 物品 1：体积 7 L，价值 8
 - 物品 2：体积 5 L，价值 5
 - 物品 3：体积 4 L，价值 4

虽然物品 1 的价值最大，价值/体积(即单位体积的价值)也最大，但是因为放入物品 1 之后，剩余的空间 3L 无法再放入别的物品而浪费掉了。就不如不放物品 1，而放入物品 2 和物品 3 带来的总价值大。

由此我们也能看出，背包问题不能用简单的贪心来解决，而需要用动态规划。

## 解题思路

背包问题的转移方程可以被优化为一维，但为了方便理解，我们先看没有优化的版本。我们定义：
 - 每个元素的体积为 `a[i]`，价值为 `v[i]`。
 - `dp[i][j]` 表示用前 i 个物品，放入容量为 j 的背包时，所能达到的最大价值

那对于第 i 个物品，如果我们已经知道了前面的结果，那么我们有两种选择：
 - 不放入 第 i 个物品，这样 `dp[i][j] = dp[i-1][j]`
 - 放入 第 i 个物品，这样 `dp[i][j] = dp[i-1][j-a[i]] + v[i]`
 
而以上就是状态转移方程，我们在上面两种情况下取最优的情况：`dp[i][j] = max(dp[i-1][j], dp[i-1][j-a[i]] + v[i])` 。

另外我们需要考虑一下初始化的情况，即 `dp[0][1~n]` 应该怎么赋值。因为前 0 个物品什么都没选，那么价值肯定都是 0，所以让它们都等于 0 即可。

将以上逻辑写成代码如下：

```c++
memset(dp, 0, sizeof dp);
for (int i = 1; i <= 3; ++i)
    for (int j = 1; j <= 10; ++j) {
        dp[i][j] = dp[i-1][j];
        if (j-a[i]>=0)
            dp[i][j] = max(dp[i][j], dp[i-1][j-a[i]] + v[i]);
    }
```

在这段代码中，为了保证 `j-a[i]` 的值为正，加了一个 if 来检查，保证没有下标越界的代码。如果下标越界，有可能会读取到随机值，也可能读取到非法地址，造成运行异常（Runtime Error）。

我们再用刚刚的例子来做一下表格演示：背包容量是 10L。
 - 物品 1：体积 7 L，价值 8
 - 物品 2：体积 5 L，价值 5
 - 物品 3：体积 4 L，价值 4

经过转移方程的计算，最终，我们可以填出下面这个二维表格，表格中的每一项都计算出来了用前 i 个物品，体积为 j 时的最优化方案。这也是符合动态规划的最优子结构的特征。

{% img /images/pack-dp.jpg %}

## 01 背包

所谓的 01 背包，就是指物品的数量只有 1 个，只有选与不选两种方案。刚刚的例子就是一个 01 背包的例子。

我们发现 `dp[i][j]` 只与两个值相关 `dp[i-1][j]` 和 `dp[i-1][j-a[i]]`，这样的二维数组利用的效率很低。所以，我们就想到，能不能把第 i 维省略掉，这样可以节省存储空间（但没有节省运算时间）。

压缩后的代码如下：

```c++
memset(dp, 0, sizeof dp);
for (int i = 1; i <= 3; ++i)
    for (int j = 10; j >= a[i]; --j) {
        dp[j] = max(dp[j], dp[j-a[i]] + v[i]);
    }
```

我们注意到，j 的循环方式从正序变成了逆序。之所以要这么操作，读者可以用表格的方式，把正着循环的结果填一下就能明白。

如果 j 不是倒着循环，在一轮 j 的循环过程中，`dp[j]` 的值会在修改后，再一次被访问到，这样就会使得一个物品实际上已经计算了放入的价值，又被重复计算第二次。

## 完全背包

一个物品被多次重复放入和重复计算价值，其实是我们在完全背包问题中需要的效果。所以，刚刚的代码，如果我们把 j 正序循环，就是完全背包的代码，如下所示：

```c++
memset(dp, 0, sizeof dp);
for (int i = 1; i <= 3; ++i)
    for (int j = a[i]; j <= 10; ++j) {
        dp[j] = max(dp[j], dp[j-a[i]] + v[i]);
    }
```

但是为了方便理解，我们还是把完全背包的非压维代码也一并看一下：

```c++
memset(dp, 0, sizeof dp);
for (int i = 1; i <= 3; ++i)
    for (int j = 1; j <= 10; ++j) {
        dp[i][j] = dp[i-1][j];
        if (j-a[i]>=0) {
            dp[i][j] = max(dp[i][j], dp[i-1][j-a[i]] + v[i]);
            dp[i][j] = max(dp[i][j], dp[i][j-a[i]] + v[i]);
        }
    }
```

因为 `dp[i][j-a[i]] >= dp[i-1][j-a[i]]`，所以以上代码可以省略成：

```c++
memset(dp, 0, sizeof dp);
for (int i = 1; i <= 3; ++i)
    for (int j = 1; j <= 10; ++j) {
        dp[i][j] = dp[i-1][j];
        if (j-a[i]>=0) {
            dp[i][j] = max(dp[i][j], dp[i][j-a[i]] + v[i]);
        }
    }
```

我们可以记住这个写法，因为后面有一些题因为各种情况可能无法压维，就会需要这种写法。

我们还是用刚刚的例子来填写二维表格，背包容量是 10L。物品数量改为无限。
 - 物品 1：体积 7 L，价值 8
 - 物品 2：体积 5 L，价值 5
 - 物品 3：体积 4 L，价值 4

以下是填写出来的值：

{% img /images/pack-dp-2.jpg %}

题目变为完全背包后，可以看到最后答案变了，最优方案变成了放入两个物品 2，得到最大价值 10。

学习完以上内容后，可以让学生练习以下两道题：

| 题目名      | 说明 |
| ----------- | ----------- |
|[P1048 采药](https://www.luogu.com.cn/problem/P1048) | 01 背包问题。NOIP2005 普及组第三题|
|[P1616 疯狂的采药](https://www.luogu.com.cn/problem/P1616) | 完全背包问题|

以下是更多的背包基础练习题：

| 题目名      | 说明 |
| ----------- | ----------- |
|[P2871 Charm Bracelet S](https://www.luogu.com.cn/problem/P2871)| 01 背包, USACO 07 DEC |
|[P1802 5 倍经验日](https://www.luogu.com.cn/problem/P1802) | 01 背包|
|[P1060 开心的金明](https://www.luogu.com.cn/problem/P1060) |  01 背包，NOIP 2006 普及组第二题 |
|[P1049 装箱问题](https://www.luogu.com.cn/problem/P1049) | 01 背包，NOIP2001 普及组 |
|[P2639 Bessie's Weight Problem G](https://www.luogu.com.cn/problem/P2639)| 01 背包变型，容量与价值相同 |
|[P13015 学习小组](https://www.luogu.com.cn/problem/P13015) | 完全背包，GESP 202506 六级 |
|[P10721 计算得分](https://www.luogu.com.cn/problem/P10721) |背包问题变种，GESP 202406 六级 |
|[P1926 小书童——刷题大军](https://www.luogu.com.cn/problem/P1926) | 01 背包，需拆成两个子问题 |

## 多重背包

多重背包描述了这样一种场景，一个物品将同时受两个限制条件的制约，例如：一个背包，即有体积限制，又有重量限制，让你往里放物品，求最大化物品价值的放法。

[P1794 装备运输](https://www.luogu.com.cn/problem/P1794) 就是多重背包的一道典型例题，在题目中，每件武器有体积和重量两个限制条件。

对于多重背包，我们同样用前 i 个物品来划分阶段：
 - `dp[i][j]` 表示 i 体积 j 重量下的最大火力。
 - 转移方程：`dp[i][j] = max(dp[i][j], dp[i-v[k]][j-g[k]] + t[k]);`

同理，如果物品的数量是无限的，则正着 for，如果物品的数量是有限的，则倒着 for。

[P1794 装备运输](https://www.luogu.com.cn/problem/P1794) 的参考代码如下：

```c++
#include <bits/stdc++.h>
using namespace std;

int V, G, N, dp[510][510], v[510], g[510], t[510];

int main() {
    cin >> V >> G >> N;
    for (int i = 1; i <= N; ++i)
        cin >> t[i] >> v[i] >> g[i];
    for (int k = 1; k <= N; ++k)
        for (int i = V; i>= v[k]; i--)
            for (int j = G; j >= g[k]; j--)
                dp[i][j] = max(dp[i][j], dp[i-v[k]][j-g[k]] + t[k]);
    cout << dp[V][G];
    return 0;
}
```

如果把 01 背包和完全背包想像成填一个一维的表格，那么多重背包就在填一个二维的表格。我们需要保证表格的填写过程符合动态规划的阶段性，表格总是从一个方向往另一个方向填，填过的数字不会再次被修改（在没压维的情况下），这样才能保证状态无后效性。

动态规划题目能够划分出清晰的阶段，后一个阶段只依赖于前面的阶段，问题就解决了一大部分。

可供练习的题目如下：

| 题目名      | 说明 |
| ----------- | ----------- |
|[P1794 装备运输](https://www.luogu.com.cn/problem/P1794) | 多重背包 |
|[P1910 L 国的战斗之间谍](https://www.luogu.com.cn/problem/P1910) | 多重背包 |
|[P1855 榨取kkksc03](https://www.luogu.com.cn/problem/P1855) | 多重背包 |
|[P2663 越越的组队](https://www.luogu.com.cn/problem/P2663) | 非多重背包的 DP |

## 背包变型一：物品的相互依赖

[P1064 金明的预算方案](https://www.luogu.com.cn/problem/P1064) 描述了一种背包问题的变型：在此题中，物品不是简单的 1 个或多个，而是分为主件或附件，每个主件可以有 0 个、1 个或 2 个附件。

应该如何表示这种复杂的物品关系呢？其实，我们可以把物品的每种组合都枚举出来，因为附件数量最多为 2 个，所以情况就可以枚举出以下情况：
 - 不选主件（当然也就没有附件）
 - 选主件，不选附件
 - 选主件+附件 1
 - 选主件+附件 2
 - 选主件+附件 1+附件 2

于是，我们就可以在处理主件的时候，把以上几种情况都比较一下，选最优的方案。

参考代码如下：

```c++
#include <bits/stdc++.h>
using namespace std;

struct Node {
    int m;
    int w;
    int t;
};

int n, m;
vector<Node> va;
vector<vector<Node> > vb;
int dp[40000];

void updateDP(int i, int m, int w) {
    if (i-m >= 0) {
        dp[i] = max(dp[i], dp[i-m] + w);
    }
}

int main() {
    scanf("%d%d", &n, &m);
    va.resize(m);
    vb.resize(m);
    for (int i = 0; i < m; ++i) {
        Node node;
        scanf("%d%d%d", &node.m, &node.w, &node.t);
        node.w = node.w*node.m; 
        va[i] = node;
        if (node.t != 0) {
            vb[node.t - 1].push_back(node);
        }
    }
    memset(dp, 0, sizeof(dp));
    for (int i = 0; i < m; ++i) {
        // 只处理主件，附件与主体一并处理
        if (va[i].t == 0) {
            for (int j = n; j > 0; j--) {
                // 选主件，不选附件
                updateDP(j, va[i].m,va[i].w);
                // 选主件+附件 1
                if (vb[i].size() > 0) {
                    int money = va[i].m + vb[i][0].m;
                    int weight = va[i].w + vb[i][0].w;
                    updateDP(j, money, weight);
                }
                // 选主件+附件 2
                if (vb[i].size() == 2) {
                    int money = va[i].m + vb[i][1].m;
                    int weight = va[i].w + vb[i][1].w;
                    updateDP(j , money, weight);
                }
                // 选主件+附件 1+附件 2
                if (vb[i].size() == 2) {
                    int money = va[i].m + vb[i][0].m + vb[i][1].m;
                    int weight = va[i].w + vb[i][0].w + vb[i][1].w;
                    updateDP(j, money, weight);
                }
            }   
        }
    }
    cout << dp[n] << endl;
    return 0;
}
```

## 背包变型二：求最小值

有些时候，我们不是求背包能够装的物品的最大价值，而是求最小价值。例如 [B3873 小杨买饮料](https://www.luogu.com.cn/problem/B3873) 这题，此题我们可以把饮料的容量当作背包的容量，把饮料的价格当作价值，但是此题相对于标准的背包问题有两个变化：

 - 1、题目希望求最小的费用，相当于背包所装的物品价值需要最低。
 - 2、题目给定的背包容量不固定，而是“不低于 L”。

针对以上的变化，我们的状态定义虽然不变，用 `dp[i][j]` 表示前 i 种饮料在 j 容量下的最小价值，但是状态转移变成了：
`dp[i][j] = min(dp[i-1][j-l[i]] + c[i], dp[i-1][j])`

在这种情况下，初始的第 0 种饮料什么都喝的值为 0，即：`dp[0][0] = 0`。

但是其它的值就不能设置成 0 了，如果设置成 0，那么任何情况下 `dp[i][j]`就已经是最小的值了，就不能被更新了。我们需要把 `dp[i][j]`默认的值设置成“无穷大”，这样才可能更新出有意义的值。

在设置无穷大这件事情上，有一个使用 memset 的技巧，即：`memset(dp, 0x7f, sizeof dp);`，此技巧将每个字节都填充成了二进制的 `01111111`（即 `0x7f`），因为最高为是符号位，所以保留成 0。这种 memset 技巧虽然初始化的值比 `INT_MAX` 略小一点，但是写起来更快，另外在进行加法运算的时候，也不用担心结果溢出成负数。

以上方案解决了变化一。我们再来看变化二。

变化二使得答案不一定在 `dp[i][L]`，因为答案不一定是刚好 L 升，所以要取 `L ~ L+max(l[i])` 这一段范围。这样就解决了变化二。

最后我们用滚动数组压维，然后因为是 01 背包（每个饮料只能选一次），我们压维之后需要倒着 for 循环背包大小。

以下是参考代码，代码中用 STL 的 `min_element` 来求最小值，读者也可以参考这种写法：

```c++
/**
 * 01 背包问题的变化
 * 
 * 假设第 i 种饮料的费用是 c[i], 容量是 l[i]
 * dp[i][j] 表示用前 i 种饮料，凑成 j 升的最小费用。
 * 
 * 则，转移方程为：
 *  - dp[i][j] = min( dp[i-1][j-l[i]] + c[i] , dp[i-1][j] ) 
 * 
 * 因为 i 只与 i-1 相关，所以这一层可以压缩。转移方式优化为：
 *  - dp[j] = min(dp[j- l[i]] + c[i], dp[j])
 * 
 * 初使化：
 *  - dp[0] = 0;
 *  - dp[1-L] = memset(0x7f)
 * 
 * 其它：
 *  - 倒着 dp，因为每种饮料只能用一次
 *  - 最大值检查了一下，不会超 int，就不用 long long 了
 *  - 因为答案不一定是刚好 L 升，所以要取 L ~ L+max(l[i]) 这一段范围
 *  - 因为是取最小值，所以初使化设置成 0x7f7f7f7f（接近 21 亿，但是又没到 INT_MAX），
 *    这样运算不会超 int，又可以是较大值
 * 
 * Author: Tang Qiao
 */
#include <bits/stdc++.h>
using namespace std;

int dp[1010000], c[550], l[550], N, L, maxL;

int main() {
    ios::sync_with_stdio(0);       
    cin >> N >> L;
    for (int i = 0; i < N; ++i) {
        cin >> c[i] >> l[i];
        maxL = max(maxL, l[i]);
    }
    maxL += L;
    memset(dp, 0x7f, sizeof dp);
    dp[0] = 0;
    for (int i = 0; i < N; ++i) {
        for (int j = maxL; j - l[i] >= 0; --j) {
            dp[j] = min(dp[j], dp[j - l[i]] + c[i]);
        }
    }
    // 因为答案不一定是刚好 L 升，所以要取 L ~ L+max(l[i]) 这一段范围
    int ans = *min_element(dp+L, dp+maxL+1);
    if (ans == 0x7f7f7f7f) cout << "no solution" << endl;
    else cout << ans << endl;

    return 0;
}
```

以上代码虽然解决了问题，但是还有一点不完美，就是 dp 数组实在太大了。有没有可能 dp 数组更小呢？我们可以想到，因为每种饮料的价格都是正数，所以，如果有一个答案是超过 `2*L` 升的情况，同时它的价格极低，这种情况下，我们的答案就是只喝这一种饮料。不会出现超过 `2*L` 升，我们还叠加喝了两种饮料的情况。

我们可以反证：假如有一个答案是喝两种饮料，总容量超过 `2*L` 升，那么必定有一个饮料的容量是大于等于 L 升的。那么，我们只喝那个大于等于 L 升的饮料，肯定总价格更低。

所以，我们的优化方案就是：我们只需要把 dp 数组的大小开到 `2*L` 即 4000 即可（题目规定 L 最大为 2000）。在此优化方案下，我们再特判一下每个大于 L 升的饮料，看是不是更便宜。

以下是参考代码，时间和空间复杂度都更优：

```c++
#include <bits/stdc++.h>
using namespace std;

int dp[4100], c[550], l[550], N, L;

int main() {
    ios::sync_with_stdio(0);       
    cin >> N >> L;
    for (int i = 0; i < N; ++i) {
        cin >> c[i] >> l[i];
    }
    memset(dp, 0x7f, sizeof dp);
    dp[0] = 0;
    for (int i = 0; i < N; ++i) {
        for (int j = 4000; j - l[i] >= 0; --j) {
            dp[j] = min(dp[j], dp[j - l[i]] + c[i]);
        }
    }
    int ans = *min_element(dp+L, dp+4000);
    // 如果单个饮料就可以超 L，则判断一下
    for (int i = 0; i < N; ++i)
        if (l[i] >= L) 
            ans = min(ans, c[i]);

    if (ans == 0x7f7f7f7f) cout << "no solution" << endl;
    else cout << ans << endl;

    return 0;
}
```

小结：对于求最小值的背包问题，除了 `dp[0][0] = 0` 外，我们需要把别的初始值设置为 `0x7f`，以保证递推求 min 的过程中，每个 dp 数组值可以得到更新。

相关的练习题目还有：
 - [P2918 Buying Hay S](https://www.luogu.com.cn/problem/P2918)
 - [P1679 神奇的四次方数](https://www.luogu.com.cn/problem/P1679)

## 背包变型三：求平均值

有一类题，虽然看着不像是背包问题，但是最后可以抽象成背包问题。而且，他们背包大小都是 sum/2。

[P2392 考前临时抱佛脚](https://www.luogu.com.cn/problem/P2392) 就是一道典型的例题。

在此题中，每一科的复习都可以看成两个并行的任务，而任务最短的时间就是让一个任务的时间尽可能接近 sum/2。这样，我们就可以把 sum/2 当成背包的容量，把每道题的价值和体积看成相等即可。

因为在本题中，sum 最大值为 `20*60 = 1200`，所以背包大小最大是 600 即可。

参考代码：
```c++
/**
此题可以用动态规划，也可以用搜索，因为每科只有最多 20 个题目，所以搜索空间最大是 2^20 等于约 100 万。

用动态规划解题时，此题可以把每次复习看作一次 01 背包的选择。每道题的价值和成本相同。背包的目标是尽可能接近 sum/2，因为sum 最大值为 `20*60 = 1200`，所以背包大小最大是 600。
 */
#include <bits/stdc++.h>
using namespace std;

int s[4], v[25], ans, dp[610];

int dpAns(int n) {
    int cnt = 0;
    for (int i = 0; i < n; ++i) {
        cnt += v[i];
    }
    int m = cnt / 2;
    memset(dp, 0, sizeof(dp));
    for (int i = 0; i < n; ++i) {
        for (int j = m; j>=v[i]; --j) {
            dp[j] = max(dp[j], dp[j-v[i]] + v[i]);
        }
    }
    int ret = max(dp[m], cnt - dp[m]);
    return ret;
}

int main() {
    scanf("%d%d%d%d", s, s+1, s+2, s+3);
    for (int i = 0; i < 4; ++i) {
        memset(v, 0, sizeof(v));
        for (int j = 0; j < s[i]; ++j) {
            scanf("%d", v+j);   
        }
        ans += dpAns(s[i]);
    }
    printf("%d\n", ans);
    return 0;
}
```

相关的练习：

| 题目名      | 说明 |
| ----------- | ----------- |
|[P12207 划分](https://www.luogu.com.cn/problem/P12207) |01 背包的变型，蓝桥杯 2023 国 |

## 背包变型四：计数

有一类背包问题，不是问你最大的价值，而是问你相关的计数。

例如：[P1832 A+B Problem](https://www.luogu.com.cn/problem/P1832) 就是其中的典型例题。

要解此题，我们可以先把质数算出来保存下来，接下来，我们需要用背包的思路，对表格进行计数:

 * `dp[i][j]` 表示用前 i 个质数组成 j 一共的可能数
 * 转移方程：`dp[i][j] = dp[i-1][j] + dp[i-1][j-a[i]] + dp[i-1][j-a[i]*2]...`

参考代码如下：

```c++
/**
 * 解法：
 *  - 无穷背包
 *  - 先把质数算出来，保存在数组里面
 * 
 * dp[i][j] 表示用前 i 个质数组成 j 一共的可能数
 * dp[i][j] = dp[i-1][j] + dp[i-1][j-a[i]] + dp[i-1][j-a[i]*2]...
 * 
 * 初始化：dp[0][0] = 1
 * 
 * 注意：答案需要用 long long 保存。
 * 
 * Author: Tang Qiao
 */
#include <bits/stdc++.h>
using namespace std;
#define MAXN 1010

int a[200];
long long dp[200][MAXN];

bool isPrime(int a) {
    for (int i = 2; i*i<=a; ++i)
        if (a%i == 0) return false;
    return true;
}

int main() {
    int n;
    cin >> n;
    for (int i = 2; i <= n; ++i)
        if (isPrime(i)) 
            a[++a[0]] = i;     

    dp[0][0] = 1;
    for (int i = 1; i <= a[0]; ++i) // 第 i 个质数 a[i]
        for (int j = 0; j<= n; ++j) { // 组成 j 这个值
            for (int p = j; p >= 0; p -= a[i]) { // 完全背包，试着放 0-n 个 a[i]
                dp[i][j] += dp[i-1][p];
            }
        }

    cout << dp[a[0]][n] << endl;
    return 0;
}
```

## 背包变型五：负数体积

有一些题目，元素的体积会是负数。

[P13018 调味平衡](https://www.luogu.com.cn/problem/P13018) 就是一道典型的例题。它也是 GESP 202506 七级题目。

### 第一种解法（空间占用过大）

用上面提到的计数类的方法。

`dp[i][j][k]` 表示前 i 种食材，达到酸度 j，甜度 k 是否可能。

`dp[i][j][k] = dp[i-1][j-a[i]][k-b[i]]` 是否可能。

把 i 这一层简化`dp[j][k] = dp[j - a[i]][k - b[i]]`

初始化：`dp[0][0] = 1`

但是以上的方法时间和空间消耗(500000x500000)太大。

### 正确的解法

考虑到可以把一种食材的酸度和甜度求差，得出酸和甜的差值。如果两种食材的差值加起来为零，则刚好酸度=甜度。

这样就可以把 dp 简化。

 - `dp[j]`表示前 i 种食材的酸甜度差值 j 是否存在，如果存在，其值为酸甜度的和。
 - `dp[j] = dp[j - dif[i]] + a[i] + b[i]`

相当于背包元素的体积变成了差值，价值变成了 `a[i] + b[i]`。

因为 `dif[i]` 有正有负，所以为了保证值不会覆盖，我又恢复成二维的 dp：
 - `dp[i][j]` 表示前 i 种食物，凑成 j 的酸甜度差的最大和。

因为 j 可能为负值，所以我们把平衡点设置成 50000（可以想像成刚开始差值就是 50000，求最后差值不变）

这样 j 中间最多从 50000 减成 0（因为每个食材差值最大为 500，最多有 100 个食材），所以不会变成负数。

参考代码：

```c++
/* 
 * Author: Tang Qiao
 */
#include <bits/stdc++.h>
using namespace std;
#define MAXN int(100*500+10)

int dp[110][MAXN*2], n, a, b, c, d;

int main() {
    ios::sync_with_stdio(0);    
    cin >> n;
    memset(dp, 0x8f, sizeof dp);
    dp[0][50000] = 0;
    for (int i = 1; i <= n; ++i) {
        cin >> a >> b;
        c = a-b;
        d = a+b;
        for (int j = 0; j <= 50000*2; j++)
            if (j-c >= 0)
                dp[i][j] = max(dp[i-1][j], dp[i-1][j-c] + d);    
    }
    cout << dp[n][50000] << endl;
    return 0;
}
```

## 相关练习题目

除了以上的变化，更多变化的练习：

| 题目名      | 说明 |
| ----------- | ----------- |
|[P1510 精卫填海](https://www.luogu.com.cn/problem/P1510) | 01 背包，但是输出要求有变化 |
|[P2430 严酷的训练](https://www.luogu.com.cn/problem/P2430) | 01 背包，题目较长，需要仔细读题 |
|[P11377 武器购买](https://www.luogu.com.cn/problem/P11377)| 01 背包的变型，GESP202412 七级  |

