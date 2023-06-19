1、新建一个分支

git branch newBranch

2、检查分支是否创建成功

git branch

3、然后切换到新建的分支

git checkout newBranch

4、将改动提交到新分支

git add .
git commit -m "the new branch"

5、然后git status检查是否提交新分支成功
git status

6、切回到主分支

git checkout master

7、新分支提交的改动合并到主分支

git merge newBranch

8、然后就可以push代码到远端仓库

git push -u origin master

如果不放心，在这里可以再git status检查下

9、删除新分支

git branch -D newBranch
