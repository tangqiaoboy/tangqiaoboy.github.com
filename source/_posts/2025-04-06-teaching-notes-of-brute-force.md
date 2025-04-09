---
title: CSPJ 教学思考：枚举
date: 2025-04-06 11:20:47
tags: cspj
---

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

