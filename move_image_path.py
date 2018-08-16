#!/usr/bin/env python
# coding=utf-8
import os, sys

def process(fileName):
    print 'start'
    infile = open(fileName, 'r')
    outfile = open(fileName+".out.txt", 'w')
    line = infile.readline()

    startOri = "![](assets/"
    startTarget = "{% img /images/"
    endOri = "g)"
    endTarget = "g %}"
    while len(line) != 0:
        pos1 = line.find(startOri)
        pos2 = line.find(endOri, pos1 + len(startOri) + 1)
        if pos1 != -1 and pos2 != -1:
            line = line.replace(startOri, startTarget)
            line = line.replace(endOri, endTarget)

        outfile.write(line)
        line = infile.readline()
        print line
    infile.close()
    outfile.close()

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print "usage: move_image_path.py <filename>"
    else:
        process(sys.argv[1])
    print 'over'

