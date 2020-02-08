#! /bin/zsh

# hexo clean

# hexo generate
cd public
# git init
git add .
git commit -m "update at `date` "

git remote add origin git@github.com:tangqiaoboy/tangqiaoboy.github.com.git >> /dev/null 2>&1
echo "### Pushing to Github..."
git push origin master -f
echo "### Done"
