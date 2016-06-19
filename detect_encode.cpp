#include <iostream>
#include <stdio.h>
#include <string>
#include <cstdio>
using namespace std;

char line[10000];

void detect(char *line) {
    char target[] = {0x08, 0xE6, 0x8A, 0xA5};
    int len = strlen(line);
    bool match;
    for (int i = 0; i < len - 3; ++i) {
        match = true;
        for (int j = 0; j < 4; ++i) {
            if (line[i + j] != target[j]) {
                match = false;
                break;
            }
        }
        if (match) {
            printf("matched at line: %s", line);
            printf("col: %d", i);
        }
    }
}

void process(char *fileName) {

    FILE *f = fopen(fileName, "rb");
    int cnt = 0;
    while (fgets(line, 10000, f) != NULL) {
        //printf("%s", line);
        detect(line);
        cnt++;
    }
    printf("over, total line = %d\n", cnt);
}


int main(int argc, char **argv) {
    printf("argc = %d\n", argc);
    for (int i = 0; i < argc; ++i) {
        printf("arg %d: %s\n", i, argv[i]);
    }
    if (argc != 2) {
        printf("argument must be 2, add file name.");
        exit(0);
    }
    process(argv[1]);
    return 0;
}