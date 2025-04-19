---
title: CSPJ 教学思考：枚举
date: 2025-04-06 11:20:47
tags: cspj
---

枚举就是把所有情况都尝试一遍。比较简单的用 for 循环即可，较复杂的枚举，需要用到递归。

## [P1304 哥德巴赫猜想](https://www.luogu.com.cn/problem/P1304)

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

## [P1149 火柴棒等式](https://www.luogu.com.cn/problem/P1149)

NOIP 2008 提高组第二题。推导如下：
 - n 最大为 24。
 - 24 减去加号（2根火柴）和等号（2 根火柴），还剩 20 根。
 - 20 根分配到 3 个数字（A+B=C）上，平均每个数字 7 根，但也可能一个数特别大（10 根），另一个数特别小（2 根）。
 - 每个数字最少用量为 2 根火柴（数字 1）。

枚举办法：
 - 第 1 个数字 A 从 0 - 10000，计算出 A 用的火柴数 t1
 - 第 2 个数字 B 从 A - 10000，计算出 B 用的火柴数 t2
 - 算出来 A+B 的和 C，检查 C 用的火柴数是不是刚好是  n-t1-t2-4
 - 每找到一种，如果 A!=B，则计算两次答案，因为 B+A=C 是另一个对称的答案。

用以上的枚举之后，我们将所有答案输出，发现 A 其实在 N 最大（N=24）的时候也不会超过 1000，测试如下（只输出了 A<=B 的情况）。所以我们就可以将 A 的范围改小，或者直接打表输出答案。

```c++
0+8=8
0+12=12
0+13=13
0+15=15
0+21=21
0+31=31
0+47=47
0+51=51
0+74=74
0+117=117
0+171=171
0+711=711
1+20=21
1+30=31
1+42=43
1+47=48
1+50=51
1+112=113
1+117=118
1+170=171
1+710=711
2+8=10
2+10=12
2+19=21
2+41=43
2+72=74
2+77=79
2+111=113
3+10=13
3+13=16
3+44=47
3+114=117
4+43=47
4+57=61
4+70=74
4+113=117
4+117=121
5+10=15
5+16=21
5+17=22
6+15=21
7+15=22
7+27=34
7+40=47
7+41=48
7+54=61
7+72=79
7+77=84
7+110=117
7+111=118
7+114=121
9+12=21
11+13=24
11+14=25
11+16=27
11+31=42
11+41=52
11+61=72
14+27=41
14+77=91
17+24=41
17+57=74
17+74=91
41+71=112
```

完成的程序如下：

```c++
/**
 * 把 A 和 B 的范围改成 10000，同时把 debug 改成 true 可以输出所有可能的组合。
 * 经过测试发现 A和 B的答案范围小于 1000，所以可以改成 1000。
 * 
 * Author: Tang Qiao
 */
#include <bits/stdc++.h>
using namespace std;

int num[] = {6,2,5,5,4,5,6,3,7,6};
unordered_map<int, int> record;
int n, ans;
bool debug = false;

int main() {
    cin >> n;
    // 初始化
    for (int i = 0; i < 20000; i++) {
        int tmp = i;
        int cnt = 0;
        do {
            cnt += num[tmp % 10];
            tmp /= 10;
        }while (tmp > 0);;
        record[i] = cnt;
    }
    
    n -= 4;
    for (int i = 0; i < 1000; i++) {
        for (int j = i; j < 1000; j++) {
            int c = i + j;
            if (record[i] + record[j] + record[c] == n) {
                if (i != j) ans+=2;
                else ans++;
                if (debug) {
                     cout << i << "+" << j << "=" << c << endl;
                }
            }
            
        }
    }
    cout << ans << endl;
    return 0;
}
```

## [P3799 小 Y 拼木棒](https://www.luogu.com.cn/problem/P3799)

思路如下：
 - 4 根木棒，先选出三根。肯定是有两根的和等于第三根。
 - 最后一根显然是和第三根一样长。
 - 所以，问题转换成：选两根木棒，同时再选两根他们的和，一共有多少种。

在选两根木棒的时候，我们又可以转化为：选一根木棒，然后选另一根大于等于它的木棒。

因为 a 的值在 5000 以内，而 N 最大是 10 万，所以可以把值放到一个计数的桶里面。这样枚举的时候效率更高。

解法：
 - 拿一个 cnt[] 数组保存每个数字出现的次数，同时记录最大值 maxv。
 - 从 1 到 maxv 枚举 a 和 b（其中保证 b 大于等于 a）
 - 计算两个数字的和 c，然后取 c 的次数。
 - 计算一共的组合数，结果对 10^9+7 取模。

参考代码如下：
```c++
/**
 * Author: Tang Qiao
 */
#include <bits/stdc++.h>
using namespace std;
#define MOD (int)(1e9 + 7)

unordered_map<int, int> cnt;
int n, x, maxv;
long long ans;

// 从 a 个数中选 2 个数的组合数
long long C(long long a) {
    return a * (a - 1) / 2;
}

int main() {
    ios::sync_with_stdio(false);
    cin >> n;
    for (int i = 0; i < n; i++) {
        cin >> x;
        cnt[x]++;
        maxv = max(maxv, x);
    }
    for (int a = 1; a <= maxv; a++) {
        for (int b = a; b <= maxv; b++) {
            if (a == b && cnt[a] < 2) continue;
            int c = a + b;
            if (cnt[c] >= 2) {
                long long base = C(cnt[c]) % MOD;
                if (a == b)  
                    base = base * C(cnt[a]) % MOD;
                else  
                    base = base * ((cnt[a] * cnt[b]) % MOD) % MOD;
                ans = (ans + base) % MOD;
            }
        }
    }
    cout << ans << endl;
    return 0;
}
```

## [P1028 数的计算](https://www.luogu.com.cn/problem/P1028)

NOIP 2001 普及组 题目。在暴力枚举的时候，需要记住重复的计算。

参考代码：

```c++
/**
 * Author: Tang Qiao
 */
#include <bits/stdc++.h>
using namespace std;

int n, ans, record[1010];

int dfs(int a) {
    if (record[a] != 0) return record[a];
    int ret = 1;
    for (int i = 1; i <= a/2; ++i) {
        ret += dfs(i);
    }
    record[a] = ret;
    return ret;
}

int main() {
    cin >> n;
    ans = dfs(n);
    cout << ans << endl;
    return 0;
}
```

## 更多练习

 - [P1464 Function](https://www.luogu.com.cn/problem/P1464)
 - [P2437 蜜蜂路线](https://www.luogu.com.cn/problem/P2437)


### [P2437 蜜蜂路线](https://www.luogu.com.cn/problem/P2437)

需要用到高精度。

参考代码：
```c++
/**
 * Author: Tang Qiao
 */
#include <bits/stdc++.h>
using namespace std;

string record[1001][1001];

string add(string a, string b) {
    int len_a = a.length();
    int len_b = b.length();
    int len_max = max(len_a, len_b);
    int carry = 0;
    string ret = "";
    for (int i = 0; i < len_max; i++) { 
        int num_a = i < len_a ? a[len_a - i - 1] - '0' : 0;
        int num_b = i < len_b ? b[len_b - i - 1] - '0' : 0;
        int sum = num_a + num_b + carry;
        ret = to_string(sum % 10) + ret;
        carry = sum / 10;
    }
    if (carry > 0) ret = to_string(carry) + ret;
    return ret;
}

string dfs(int n, int m) {
    if (n > m) return "0";
    if (n == m) return "1";
    if (record[n][m] != "") return record[n][m];
    return record[n][m] = add(dfs(n+1, m), dfs(n+2, m));
}

int main() {
    int n, m;
    cin >> n >> m;
    cout << dfs(n, m) << endl;
    return 0;
}
```
