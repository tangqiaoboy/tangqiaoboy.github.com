#!/usr/bin/env python
# coding=utf-8
from __future__ import print_function
import os, sys

def checkValid(line):
    startString = "![](assets/"
    endString1 = "jpg)"
    endString2 = "png)"

    stPos = line.find(startString)
    edPos1 = line.find(endString1)
    edPos2 = line.find(endString2)
    if stPos == -1:
        return False
    if edPos1 == -1 and edPos2 == -1:
        return False
    return True

def process(fileName):
    print('start')

    # open files
    infile = open(fileName, 'r')
    outfile = open(fileName+".out.txt", 'w')
    
    startOri = "![](assets/"
    startTarget = "{% img /images/"
    endOri = "g)"
    endTarget = "g %}"

    line = infile.readline()
    while len(line) != 0:
        if checkValid(line):
            # sys.stdout.write("repalcing... " + line)
            print("replacing...", line, end="")
            line = line.replace(startOri, startTarget)
            line = line.replace(endOri, endTarget)

        outfile.write(line)
        line = infile.readline()
    
    # close files
    infile.close()
    outfile.close()
    print("complete")

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("usage: move_image_path.py <filename>")
    else:
        process(sys.argv[1])

    # move image
    print("\nmoving image...")
    os.system("mv source/_posts/assets/* source/images")
    print('over')
    

