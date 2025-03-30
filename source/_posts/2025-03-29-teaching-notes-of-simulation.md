---
title: CSPJ 教学思考：模拟
date: 2025-03-29 23:06:22
tags: cspj
---

模拟是最有效的练习编程熟练度的基础算法，也是有效的掌握各种编程技巧的练习方式。

本文将把各种模拟技巧与题目结合，用题目带着学生掌握这些模拟技巧。

## 二维数组包边

有些时候，我们在处理二维数组的时候，需要处理 x，y 坐标的边界。这样写起来会比较麻烦，但是，如果我们将数据从下标 1 开始保存，那么就人为在数据外面留了一圈缓冲带。这个时候，在处理 x，y 周围坐标的时候，就不会出现数据下标越界的情况了。

例题：[P2670 NOIP 2015 普及组 扫雷游戏](https://www.luogu.com.cn/problem/P2670)

该题如果正常写，需要判断每个格子周围 8 个格子的状态。如果我们把数据从 1 开始读入，在判断的时候就容易很多。以下是参考代码。

```c++
/**
 * P2670 [NOIP 2015 普及组] 扫雷游戏
 * 
 * Author: Tang Qiao
 */
#include <bits/stdc++.h>
using namespace std;

int n, m;
char tu[110][110];
int movex[] = {-1, -1, -1, 0, 0, 1, 1, 1};
int movey[] = {-1, 0, 1, -1, 1, -1, 0, 1};

int main() {
    cin >> n >> m;
    for (int i = 1; i <= n; ++i) {
        for (int j = 1; j <= m; ++j) {
            cin >> tu[i][j];
        }
    }

    for (int i = 1; i <= n; ++i) {
        for (int j = 1; j <= m; ++j) {
            if (tu[i][j] == '*') continue;
            int cnt = 0;
            for (int k = 0; k < 8; ++k) {
                int x = i + movex[k];
                int y = j + movey[k];
                if (tu[x][y] == '*') cnt++;
            }
            tu[i][j] = cnt + '0';
        }
    }

    for (int i = 1; i <= n; ++i) {
        for (int j = 1; j <= m; ++j) {
            cout << tu[i][j];
        }
        cout << endl;
    }
	return 0;
}
```

练习：[B4248 语言月赛 202503 数字棋盘](https://www.luogu.com.cn/problem/B4248)

本题也可以用包边的技巧，保证数据在检查的时候不会越界。参考代码如下：

```c++
#include <bits/stdc++.h>
using namespace std;

int n, m;
int a[1001][1001];
int x, y;

bool check(int i, int j) {
    // 检查上方格子
    if (i > 1 && a[i-1][j] == y) return true;
    // 检查下方格子
    if (i < n && a[i+1][j] == y) return true;
    // 检查左侧格子
    if (j > 1 && a[i][j-1] == y) return true;
    // 检查右侧格子
    if (j < m && a[i][j+1] == y) return true;
    return false;
}

int main() {
    ios::sync_with_stdio(false);
    cin >> n >> m;
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            cin >> a[i][j];
        }
    }
    cin >> x >> y;
    int count = 0;
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            if (a[i][j] == x && check(i, j)) {
                count++;
            }
        }
    }
    cout << count << endl;
    return 0;
}
```

## 围圈数数

有一种模拟题，要求我们把人围成一个圈，在圈上数数，然后问你数到的是谁。类似于小时候玩的“点兵点将”游戏，可能是顺时针数，也可能是逆时针数。

对于这种数数题目，最简单的做法是：直接用加减来进行目标的选择。加减之后，下标可能变负数或者超过总数，这个时候进行简单的取模调整，就可以将下标调整正常。

例题一：[P1563 NOIP 2016 提高组 玩具谜题](https://www.luogu.com.cn/problem/P1563) 

此题我们：
 - 用 `idx = (idx + b) % n;` 来完成顺时针数
 - 用 `idx = (idx - b + n) % n;` 来完成逆时针数

通过这样的简单的加减和取模，保证能够快速跳到目标位置，完成模拟操作。完整代码如下：

```c++
/**
 * Author: Tang Qiao
 */
#include <bits/stdc++.h>
using namespace std;
#define MAXN int(1e5 + 10)

int n, m;
int face[MAXN];
string name[MAXN];

int main() {
    cin >> n >> m;
    for (int i = 0; i < n; ++i) {
        cin >> face[i] >> name[i] ;
    }

    int idx = 0;
    for (int i = 0; i < m; ++i) {
        int a, b;
        cin >> a >> b;
        // 圈内向左 == 圈外向右
        if ((face[idx] == 0 && a == 0)
           || (face[idx] == 1 && a == 1)) {
            idx = (idx - b + n) % n;
        } else {
            idx = (idx + b) % n;
        }
    }
    cout << name[idx] << endl;
	return 0;
}
```

例题二：[B4246 语言月赛 202503 环形游走](https://www.luogu.com.cn/problem/B4246)

此题有个技巧：就是走的时候可能绕多圈，这个时候我们先把要走的步数模 n: `step % n`, 这样就把前面的多圈跳过了，也不会把坐标减成特别特别小的负数。

参考代码如下：

```c++
/**
 * Author: Tang Qiao
 */
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;
    vector<int> a(n);
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }
    int current = 0;
    for (int i = 0; i < m; i++) {
        int step = a[current] % n;
        current = (current - step + n) % n;
    }
    cout << current + 1 << endl;
	return 0;
}
```

## 矩阵变换

矩阵变换这类模拟题，会要求我们在一个二维的数组上进行各种操作，包括填充，旋转，查找，合并等。需要我们熟悉各种矩阵变换的技巧。

例题：[P5725【深基4.习8】求三角形](https://www.luogu.com.cn/problem/P5725)

此题是一道基础的填充题。
 - 对于第一种要求，我们用在二维数组上填充实现。
 - 对于第二种要求，我们直接输出结果，在合适的位置加上一些空格。

示例代码如下：

```c++
/**
 * Author: Tang Qiao
 */
#include <bits/stdc++.h>
using namespace std;

int tu[11][11];
int n;
int main() {
    cin >> n;

    // 处理第一种要求
    int cnt = 1;
    for (int i = 1; i <= n; ++i) {
        for (int j = 1; j <= n; ++j) {
            tu[i][j] = cnt++;
        }
    }
    for (int i = 1; i <= n; ++i) {
        for (int j = 1; j <= n; ++j) {
            printf("%02d", tu[i][j]);
        }
        printf("\n");
    }
    printf("\n");
    // 处理第二种要求
    cnt = 1;
    int bk = n-1;
    for (int i = 1; i <= n; ++i, bk--) {
        for (int j = 1; j <= bk; ++j) printf("  ");
        for (int j = 1; j <= i; ++j) {
            printf("%02d", cnt++);
        }
        printf("\n");
    }
    
	return 0;
}

```


例题：[P5731 蛇形方阵](https://www.luogu.com.cn/problem/P5731)

蛇形方阵是一道基础题，用于练习二维数组上的操作。我使用的模拟技巧是：

 - 定义一个 order 变量，表示当前方向
 - 与 order 变量配合，定义一个 movex 和 movey 数组，表示当前方向的移动

相关代码是：

```c++
int order;
int movex[] = {0, 1, 0, -1};
int movey[] = {1, 0, -1, 0};
```

每次移动，先判断是否越界或者已经填充过值：
 - 如果越界或已经填充过值，则改变方向再移动
 - 如果没越界，则移动

关键代码如下：
```c++
if (nx < 1 || nx > n || ny < 1 || ny > n || tu[nx][ny] != 0) {
    order = (order + 1) % 4;
    nx = x + movex[order];
    ny = y + movey[order];
}
```

因为要填充 `n*n` 个数，所以循环一共执行 `n*n` 次。

完整的参考代码如下：

```c++
/**
 * Author: Tang Qiao
 */
#include <bits/stdc++.h>
using namespace std;

int n, x, y, order;
int tu[15][15];
int movex[] = {0, 1, 0, -1};
int movey[] = {1, 0, -1, 0};
int main() {
    cin >> n;
    memset(tu, 0, sizeof(tu));
    x = 1;
    y = 0;
    order = 0;
    for (int i = 1; i <= n*n; i++) {
        int nx = x + movex[order];
        int ny = y + movey[order];
        if (nx < 1 || nx > n || ny < 1 || ny > n || tu[nx][ny] != 0) {
            order = (order + 1) % 4;
            nx = x + movex[order];
            ny = y + movey[order];
        }
        x = nx;
        y = ny;
        tu[x][y] = i;
    }
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++) {
            printf("%3d", tu[i][j]);
        }
        printf("\n");
    }
    return 0;
}
```

例题：[P4924 1007 魔法少女小Scarlet](https://www.luogu.com.cn/problem/P4924)

本题涉及矩阵的旋转，实际操作起来还是有点麻烦。这里我们按旋转的中心来重建坐标系的话，可以观察到如下规律：

 - 顺时针旋转：`(a, b) -> (b, -a)`
 - 逆时针旋转：`(a, b) -> (-b, a)`

{% img /images/simulation-1.jpg %}

这样，我们就可以构建关键的旋转代码了，假如我们是基于中心点 `(x, y)` 半径是 r 的顺时针旋转的话，那么，对于坐标 `(a, b)`，我们：
 - 首先：把它移动到以 `(x, y)` 为中心：`(a-x, b-y)`
 - 然后：我们把坐标按上面的规则变换成 `(b-y, x-a)`
 - 最后：我们把坐标加上 `(x, y)` 的偏移，还原成原始坐标：`(b-y+x, x-a+y)`

以上逻辑写成代码是：`g[b-y+x][x-a+y]=f[a][b]`

同理，如果是逆时针旋转：
 - 首先：把它移动到以 `(x, y)` 为中心：`(a-x, b-y)`
 - 然后：我们把坐标按上面的规则变换成 `(y-b, a-x)`
 - 最后：我们把坐标加上 `(x, y)` 的偏移，还原成原始坐标：`(y-b+x, a-x+y)`

以上逻辑写成代码是：`g[y-b+x][a-x+y]=f[a][b]`

本题保证了数据不会在旋转时越界，整体的参考代码如下：

```c++
/**
 * Author: Tang Qiao
 */
#include <bits/stdc++.h>
using namespace std;

#define MAXN 510
int f[MAXN][MAXN], g[MAXN][MAXN];
int n, m;
int main() {
    cin >> n >> m;
    int cnt = 1;
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++) {
            f[i][j] = cnt++;
        }
    }
    for (int i = 1; i <=m; ++i) {
        int x, y, r, z;
        cin >> x >> y >> r >> z;
        if (z == 0) {
            for (int a = x-r; a <= x+r; ++a)
                for (int b = y-r; b <= y+r; ++b)
                    g[b-y+x][x-a+y]=f[a][b];

        } else {
            for (int a = x-r; a <= x+r; ++a)
                for (int b = y-r; b <= y+r; ++b)
                    g[y-b+x][a-x+y]=f[a][b];
        }
        
        for (int a = x-r; a <= x+r; ++a)
            for (int b = y-r; b <= y+r; ++b)
                f[a][b] = g[a][b];
    } // end of m
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++) {
            cout << f[i][j] << " ";
        }
        cout << endl;
    }
	return 0;
}
```

## 游戏模拟

游戏模拟类的题目通常会告诉你一个相对复杂一点的游戏规则，然后让你用程序将这个游戏规律实现，最终将游戏的结果输出出来。

这种题目一方面考查了读题能力，需要对游戏规则的理解清楚，另一方面则是要对游戏规则进行建模，用合适的数据结构实现游戏中的模拟。

以下是一些相关的题目。

| 题号      | 描述 |
| ----------- | ----------- |
| [P1042](https://www.luogu.com.cn/problem/P1042) |  NOIP 2003 普及组 乒乓球      |
| [P1328](https://www.luogu.com.cn/problem/P1328) | NOIP 2014 提高组 生活大爆炸版石头剪刀布 |
| [P1518](https://www.luogu.com.cn/problem/P1518)| USACO2.4 两只塔姆沃斯牛 The Tamworth Two |

## 其它模拟题目

| 题号      | 描述 |
| ----------- | ----------- |
|       |        |
|       |        |
|       |        |
|       |        |





