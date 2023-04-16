添加公钥
cd ~/.ssh
cat id_rsa/pud

生成ssh  ssh-keygen -t rsa -C"XXX@qq.com"

初始化页面
echo "# code1" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin git@github.com:select-ldl/HR-user.git
git push -u origin main

克隆：
git clone git@github.com:select-ldl/HR-user.git
git add .
git commit -m "sa"
git push

克隆单个分支 
git clone -b clear --single-branch git@github.com:select-ldl/HR-user.git
git add .
git commit -m "ds"
git push