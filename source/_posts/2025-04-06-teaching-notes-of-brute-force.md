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

## [P1036 NOIP 2002 普及组 选数](https://www.luogu.com.cn/problem/P1036)

此题需要从小到大取数求和，然后再判断是否是素数。用递归的方式来进行枚举。

```c++
/**
 * Author: Tang Qiao
 */
#include <bits/stdc++.h>
using namespace std;

int n, k, tot, ans;
int a[22], p[22];

bool isPrime(int v) {
    for (int i = 2; i*i <= v; ++i) {
        if (v%i == 0) {
            return false;
        }
    }
    return true;
}

void di(int pt) {
    if (pt == k+1) {
        if (isPrime(tot)) {
            ans++;
        }
    } else {
        // 每一层都必须取比前一层更大的下标，防止重复取
        for (int i = p[pt-1]+1; i <= n; ++i) {
            p[pt] = i;
            tot += a[i];
            di(pt+1);
            tot -= a[i];
        }
    }
}

int main() {
    cin >> n >> k;
    for (int i = 1; i <= n; ++i) {
        cin >> a[i];
    }
    di(1);
    cout << ans << endl;
    return 0;
}
```



