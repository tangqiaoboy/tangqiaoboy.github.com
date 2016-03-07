#! /bin/zsh

hexo generate
cd public
git co -- blog
