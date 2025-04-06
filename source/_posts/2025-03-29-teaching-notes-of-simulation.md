---
title: CSPJ 教学思考：模拟
date: 2025-03-29 23:06:22
tags: cspj
---

模拟是最有效的练习编程熟练度的基础算法，也是有效的掌握各种编程技巧的练习方式。

本文将把各种模拟技巧与题目结合，用题目带着学生掌握这些模拟技巧。

## 二维数组包边

有些时候，我们在处理二维数组的时候，需要处理 x，y 坐标的边界。这样写起来会比较麻烦，但是，如果我们将数据从下标 1 开始保存，那么就人为在数据外面留了一圈缓冲带。这个时候，在处理 x，y 周围坐标的时候，就不会出现数据下标越界的情况了。

### 例题：[P2670 NOIP 2015 普及组 扫雷游戏](https://www.luogu.com.cn/problem/P2670)

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

### 例题：[B4248 语言月赛 202503 数字棋盘](https://www.luogu.com.cn/problem/B4248)

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

### 例题：[P1563 NOIP 2016 提高组 玩具谜题](https://www.luogu.com.cn/problem/P1563) 

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

### 例题：[B4246 语言月赛 202503 环形游走](https://www.luogu.com.cn/problem/B4246)

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

更多练习：
 - [P1914 小书童——凯撒密码](https://www.luogu.com.cn/problem/P1914)

## 矩阵操作

矩阵操作这类模拟题，会要求我们在一个二维（或三维）的数组上进行各种操作，包括填充，旋转，查找，合并等。需要我们熟悉各种矩阵操作的技巧。

### 例题：[P5725 求三角形](https://www.luogu.com.cn/problem/P5725)

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

### 例题：[P5461 赦免战俘](https://www.luogu.com.cn/problem/P5461)

此题我们需要熟练使用递归来进行标记。参考代码如下：

```c++
/**
 * Author: Tang Qiao
 */
#include <bits/stdc++.h>
using namespace std;

int n, m;
char v[1100][1100];

void mark(int x, int y, int size) {
    if (size == 1) return;
    int half = size/2;
    for (int i = x; i < x+half; ++i) {
        for (int j = y; j < y+half; ++j) {
            v[i][j] = '0';
        }
    }
    mark(x, y+half, half);
    mark(x+half, y, half);
    mark(x+half, y+half, half);
}

int main() {
    cin >> n;
    m = 1<<n;
    memset(v, '1', sizeof(v));
    mark(0, 0, m);
    for (int i = 0; i < m; ++i) {
        for (int j = 0; j < m; ++j) {
            cout << v[i][j] << " ";
        }
        cout << endl;
    }
    return 0;
}

```

### 例题：[P5731 蛇形方阵](https://www.luogu.com.cn/problem/P5731)

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

### 例题：[P4924 魔法少女小Scarlet](https://www.luogu.com.cn/problem/P4924)

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

### 例题：[P1205 USACO1.2 方块转换 Transformations](https://www.luogu.com.cn/problem/P1205)

此题需要推导矩阵旋转的规律。我们可以把原坐标和新坐标写下来，做成一个表格。

{% img /images/simulation-3.jpg %}

然后，我们把坐标的变化写成下面的表格形式：

{% img /images/simulation-4.jpg %}

通过观察，我们发现：
 - 黄色和红色的坐标在变换前后刚好相等，即： `新 x = 原 y`
 - 两侧的白色的坐标加和刚好等于 n-1，即：`原 x + 新 y = n - 1` => `新 y = n - 原 x - 1`

综上，坐标变换公式为：`新(x, y) = 原(y, n-x-1)`。

所以，坐标变换相关代码为：

```c++
for (int i = 0; i < n; ++i) {
    for (int j = 0; j < n; ++j) {
        tmp[i][j] = ori[j][n-i-1];
    }
}
```

与此类似，我们可以推出“反射”的代码关系是 `新(x,n-y-1)=原(x,y)`，相关变换代码为：

```c++
for (int i = 0; i < n; ++i) {
    for (int j = 0; j < n; ++j) {
        tmp[i][n-j-1] = ori[i][j];
    }
}
```


更多练习：
 - [P5729 深基5.例7 工艺品制作](https://www.luogu.com.cn/problem/P5729)
 - [P5732 深基5.习7 杨辉三角](https://www.luogu.com.cn/problem/P5732)
 - [P5730 深基5.例10 显示屏](https://www.luogu.com.cn/problem/P5730)
 - [P1789 我的世界-插火把](https://www.luogu.com.cn/problem/P1789)
 - [P1319 压缩技术](https://www.luogu.com.cn/problem/P1319)
 - [P1320 压缩技术 续集版](https://www.luogu.com.cn/problem/P1320)
 - [P2615 NOIP 2015 提高组 神奇的幻方](https://www.luogu.com.cn/problem/P2615)

## 游戏模拟

游戏模拟类的题目通常会告诉你一个相对复杂一点的游戏规则，然后让你用程序将这个游戏规律实现，最终将游戏的结果输出出来。

这种题目一方面考查了读题能力，需要对游戏规则的理解清楚，另一方面则是要对游戏规则进行建模，用合适的数据结构实现游戏中的模拟。

以下是一些相关的题目。

| 题号      | 描述 |
| ----------- | ----------- |
| [P1042](https://www.luogu.com.cn/problem/P1042) |  NOIP 2003 普及组 乒乓球      |
| [P1328](https://www.luogu.com.cn/problem/P1328) | NOIP 2014 提高组 生活大爆炸版石头剪刀布 |
| [P1518](https://www.luogu.com.cn/problem/P1518)| USACO2.4 两只塔姆沃斯牛 The Tamworth Two |
| [P1089](https://www.luogu.com.cn/problem/P1089) |  NOIP 2004 提高组 津津的储蓄计划      |
| [P1161](https://www.luogu.com.cn/problem/P1161) | 数组标记 |

## 滑动窗口

### 例题：[P1614 爱与愁的心痛](https://www.luogu.com.cn/problem/P1614) 

此题的解法是：构造一个“滑动的窗口”。先求出前 m 个数的和，这相当于窗口的原始位置。之后每次让窗口往右移动一格。每次移动的时候，会将最左侧的数字剔除，同时纳入一个新数字。如下图所示：

{% img /images/simulation-2.jpg %}

我们在滑动窗口的时候，需要用这个变量，分别指向：
 - 当前窗口最左的数字 p1
 - 当前窗口下一个要加入的数字 p2
 - 在滑动的时候，不断更新当前窗口的值 tot

以下是关键代码：

```c++
p1 = 0;
p2 = m;
while (p2 < n) {
    tot -= v[p1];
    tot += v[p2];
    ans = min(ans, tot);
    p1++; p2++;
}
```

完整代码如下：

```c++
/**
 * Author: Tang Qiao
 */
#include <bits/stdc++.h>
using namespace std;

int n, m, tot, ans;
int p1, p2;
int v[3300];
int main() {
    cin >> n >> m;
    for (int i = 0; i < n; ++i) {
        cin >> v[i];
    }
    // 初使化滑动窗口
    tot = 0;
    for (int i = 0; i < m; ++i) {
        tot += v[i];
    }
    ans = tot;
    p1 = 0;
    p2 = m;
    // 滑动窗口，更新值
    while (p2 < n) {
        tot -= v[p1];
        tot += v[p2];
        ans = min(ans, tot);
        p1++;
        p2++;
    }
    cout << ans << endl;
    return 0;
}
```

## 模拟输入输出

有一些模拟需要我们有比较复杂的输入和输出操作技巧。

### 例题：[P1957 口算练习题](https://www.luogu.com.cn/problem/P1957)

此题的输入长度不固定，我们需要先判断输入的长度。同时，输出的时候，我们还需要输出“输出内容”的长度。这对我们处理输入和输出都带来了挑战。

我们可以把表达式整行整行读入，再用 `sscanf` 和 `snprintf` 来进行分析处理。

 - `sscanf` 允许我们从一个字符串中读入内容。
 - `snprintf` 允许我们将输出内容先输出到一个字符串中。

以下是相关的示意：

```c++
int a, b;
char s[100], out[100];
sscanf(s, "%d%d", &a, &b);
snprintf(out, sizeof(out), "%d+%d=%d", a, b, a + b);
```

另外，我们还需要一次读入一整行，我用的方法是用 `scanf`, 代码如下：

```c++
scanf("%[^\n]", s);
getchar();
```
需要注意，以上代码每读入一行，需要用 `getchar()` 将行末的换行给读掉。

我们也可以用 `cin.getline(s, sizeof(s));` 来读取数据。

以下是完整的示意代码：

```c++
/**
 * Author: Tang Qiao
 */
#include <bits/stdc++.h>
using namespace std;

int T, a, b;
char ch, s[100], out[100];

int main() {
    scanf("%d", &T); getchar();
    while (T--) {
        scanf("%[^\n]", s); getchar();
        if (s[0] >='0' && s[0] <= '9') { // 也可使用函数： isdigit(s[0])
            sscanf(s, "%d%d", &a, &b);
        } else {
            sscanf(s, "%c%d%d", &ch, &a, &b);
        }
        memset(out, 0, sizeof(out));
        if (ch == 'a') {
            snprintf(out, sizeof(out), "%d+%d=%d", a, b, a + b);
        } else if (ch == 'b') {
            snprintf(out, sizeof(out), "%d-%d=%d", a, b, a - b);
        } else if (ch == 'c') {
            snprintf(out, sizeof(out), "%d*%d=%d", a, b, a * b);
        }
        printf("%s\n", out);
        printf("%lu\n", strlen(out));
    }
    return 0;
}
```

以上的 scanf 部分如果替换成 cin，示意代码如下：

```c++
int main() {
    cin >> T;
    cin.getline(s, sizeof(s));
    while (T--) {
        cin.getline(s, sizeof(s));
        // 省略
    }
    return 0;
}
```

更多练习：
 - [P5734 深基6.例6 文字处理软件](https://www.luogu.com.cn/problem/P5734)
 - [P1308 NOIP 2011 普及组 统计单词数](https://www.luogu.com.cn/problem/P1308)

## 其它模拟题目

| 题号      | 描述 |
| ----------- | ----------- |
|       |        |
|       |        |
|       |        |





