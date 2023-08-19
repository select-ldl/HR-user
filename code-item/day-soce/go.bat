pip install openpyxl
pip install os
pip install pandas
pip install glob
pip install shutil

timeout/T 3

@echo off 
echo  %~dp0 
cd %~dp0 
start one.py

timeout/T 5

cd %~dp0/bin
start op.py
pause