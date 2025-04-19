---
title: CSPJ 教学总结：STL
date: 2025-04-12 22:00:46
tags: cspj
---

STL 库是 C++ 语言的标准库，我们在比赛中主要用到的有如下内容。

## [string 类](https://zh.cppreference.com/w/cpp/string/basic_string)
 - substr
 - find
 - replace
 - insert
 - erase
 - c_str


## [容器](https://zh.cppreference.com/w/cpp/container)

 - pair
 - vector
 - deque
 - list
 - stack
 - queue
 - priority_queue
 - map
 - unordered_map
 - set
 - unordered_set

## [算法库](https://zh.cppreference.com/w/cpp/algorithm)

| 函数      | 调用示意 |  说明 |
| ----------- |----------- | ----------- |
| sort      | `sort(v.begin(), v.end())`       | 快速排序 |
| stable_sort   | `stable_sort(v.begin(), v.end())`  | 稳定排序 |
| [unique](https://zh.cppreference.com/w/cpp/algorithm/unique) |`unique(v.begin(), v.end())` | 去重，返回的是去重后的元素末地址。可以结合 erase 函数来把多余数据删除 |
| next_permutation | `next_permutation(v, v+n)` | 返回全排列的下一个值，当没有下一个排列时，函数返回 false |
| prev_permutation| `prev_permutation(v, v+n)` | 返回全排列的上一个值，当没有上一个排列时，函数返回 false|
| nth_element | `nth_element(v.begin(), v.begin() + k, v.end()),`| 函数执行后，v.begin()+k 位置的数为排序后的最终位置，即左边的数都小于它，后面的数都大于它 |
| lower_bounds | `lower_bounds(v, v+n, a)` | 查找大于或等于 a 的第一个位置，如果没找到则返回 end() |
| upper_bounds | `upper_bounds(v, v+n, a)` | 查找大于 a 第一个位置，如果没找到则返回 end() |
| [equal_range](https://en.cppreference.com/w/cpp/algorithm/equal_range) | `equal_range(v, v+n, a)` | equal_range 返回一个 pair，`first` 元素是查找到的匹配 a 值的左边界，`second` 元素是匹配到的 a 值的右边界，边界为左闭右开原则。当 `first == second` 的时候，相当于没找到目标值 |
| \_\_gcd | `__gcd(a, b)` | 返回 a 和 b 的最大公约数 |
| reverse | `reverse(v.begin(), v.end())`| 将原序列逆序 |


