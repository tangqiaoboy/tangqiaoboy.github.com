---
title: CSPJ 教学思考：枚举
date: 2025-04-06 11:20:47
tags: cspj
---

枚举就是把所有情况都尝试一遍。比较简单的用 for 循环即可，较复杂的枚举，需要用到递归。

## 例题：[P1304 哥德巴赫猜想](https://www.luogu.com.cn/problem/P1304)

此题直接枚举每个合数拆解成两个质数和的所有可能性。为了避免重复计算质数，我们用一个 map 将其运算结果保存下来。

```c++
/**
 * Author: Tang Qiao
 */
#include <bits/stdc++.h>
using namespace std;

map<int, bool> rec;
bool isPrime(int n) {
    if (rec.find(n) != rec.end()) {
        return rec[n];
    }
    for (int i = 2; i*i <= n; ++i) {
        if (n % i == 0) return rec[n] = false;
    }
    return rec[n] = true;
}

int main() {
    int n;
    cin >> n;
    for (int i = 4; i <= n; i+=2) {
        for (int j = 2; j <= i; ++j) {
            if (isPrime(j) && isPrime(i-j)) {
                printf("%d=%d+%d\n", i, j, i-j);
                break;
            }
        }
    }
	return 0;
}
```

## [P2089 烤鸡](https://www.luogu.com.cn/problem/P2089)

此题初看起来 N 很大，但是每种配料最多 3 克，一共 10 种，总克数最多为 30 克。所以超过 30 克的情况答案都为 0。

每种配料 3 种情况，一共 10 种配料，所以暴力枚举的时间复杂度 3^10 约为 59000，不会超时。

枚举的参考代码如下：

```c++
/**
 * Author: Tang Qiao
 */
#include <bits/stdc++.h>
using namespace std;

vector<vector<int> > ans;
vector<int> a(10);
int n;
void dfs(int pt, int tot) {
    if (pt == 10) {
        if (tot == n)ans.push_back(a);
        return;
    }
    if (tot >= n) return;
    for (int i = 1; i<=3; i++) {
        a[pt] = i;
        dfs(pt+1, tot+i);
    }
}
int main() {
    cin >> n;
    dfs(0, 0);
    cout << ans.size() << endl;
    for (int i = 0; i < ans.size(); i++) {
        for (int j = 0; j < ans[i].size(); j++) {
            cout << ans[i][j] << " ";
        }
        cout << endl;
    }
    return 0;
}
```

## [P1706 全排列问题](https://www.luogu.com.cn/problem/P1706)

全排列的问题有多种写法，此题可以直接用 STL 中的 `next_permutation` 函数。

```c++
/**
 * P1706 全排列问题
 */
#include <bits/stdc++.h>
using namespace std;

int n, v[11];

int main() {
    cin >> n;
    for (int i = 0; i < n; ++i) {
        v[i] = i+1;
    }
    do {
        for (int i = 0; i < n; ++i) {
            printf("%5d", v[i]);
        }
        printf("\n");
    } while (next_permutation(v, v+n));
    return 0;
}
```

## [P1157 组合的输出](https://www.luogu.com.cn/problem/P1157)

其实组合也可以用 `next_permutation` 来实现。以 n=5,r=3 为例，具体方法是：

 - 构造一个只有 0 和 1 的数组，0 表示选中，1 表示未选中。
 - 数组初始状态：`0 0 0 1 1`，这样对应输出的是 `1, 2, 3`
 - 下一个状态： `0 0 1 0 1`， 输出 `1, 2, 4`
 - 结束状态：  `1 1 0 0 0`，输出 `3, 4, 5`


以下是实现代码：

```c++
/**
 * Author: Tang Qiao
 */
#include <bits/stdc++.h>
using namespace std;

int n, r;
int v[25]={0};

int main() {
    cin >> n >> r;
    for (int i = r; i < n; ++i) {
        v[i] = 1;
    }
    do {
        for (int i = 0; i < n; ++i) {
            if (v[i] == 0) printf("%3d", i+1);
        }
        printf("\n");
    } while (next_permutation(v, v+n));
    return 0;
}
```

更多全排列的练习：
 - [P1088 NOIP 2004 普及组 火星人](https://www.luogu.com.cn/problem/P1088)

## [P3392 涂条纹](https://www.luogu.com.cn/problem/P3392)

 - 这道题可以枚举蓝色色块开始的行号和结束的行号，时间复杂度为 O(N^2)。
 - 对于每一种情况，我们需要 N 的时间复杂度来检查。
 - 所以一共的时间复杂度是 N^3。

我们先预保存下来每行的各种颜色的色块数量，这样检查的时候就可以快速求解。

```c++
/**
 * Author: Tang Qiao
 */
#include <bits/stdc++.h>
using namespace std;

int cnt[55][128];

int main() {
    int n, m;
    cin >> n >> m;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) {
            char ch;
            cin >> ch;
            cnt[i][ch]++;
        }
    }
    int ans = INT_MAX;
    // 枚举蓝色行的起止
    for (int i = 1; i < n; ++i) {
        for (int j = i; j < n-1; ++j) {
            int cost = 0;
            for (int k = 0; k < i; ++k)
                cost += m - cnt[k]['W'];
            for (int k = i; k <= j; ++k)
                cost += m - cnt[k]['B'];
            for (int k = j+1; k < n; ++k)
                cost += m - cnt[k]['R'];
            ans = min(ans, cost);
        }
    }
    cout << ans << endl;
    return 0;
}
```

## [P3654 First Step](https://www.luogu.com.cn/problem/P3654)

直接枚举每个起点。但是 `k==1` 时需要特判，因为 `k==1` 意味着向下和向右重复计算，需要除以 2。

```c++
/**
 * 
 * 陷阱：
 *  k=1时需要特判，因为k=1意味着向下和向右重复计算，需要除以2。
 * 
 * Author: Tang Qiao
 */
#include <bits/stdc++.h>
using namespace std;

int n, m, k, ans;
char tu[110][110];

bool check(int x, int y, int dx, int dy) {
    int nx = x, ny = y;
    for (int i = 0; i < k; i++) {
        if (nx >= n || ny >= m) return false;
        if (tu[nx][ny] == '#') return false;
        nx += dx;
        ny += dy;
    }
    return true;
}

int main() {
    ios::sync_with_stdio(false);
    cin >> n >> m >> k;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) {
            cin >> tu[i][j];
        }
    }
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) {
            if (check(i, j, 1, 0)) ans++;
            if (check(i, j, 0, 1)) ans++;
        }
    }
    if (k == 1) ans /= 2;
    cout << ans << endl;
    return 0;
}
```