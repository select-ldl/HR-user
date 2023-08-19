# -*- coding:utf-8 -*-
# @Author: start.liu
# @Email: start.liu@stert.liu
# @Date: 2022/7/11 16:28
# @File: mains
# @Project: gutuibai
# @Desc:
from multilingual_file import ios
from multilingual_file import andriod
from multilingual_file import xlsx
import threading
import os
def open_fille():
    t1 =threading.Thread(target=ios.init_strings)
    t2 = threading.Thread(target=andriod.init_xml)
    t3 = threading.Thread(target=xlsx.init_xml)
    return t1,t2,t3
# def init_fille():
#     """读文件"""
#     xml_files=[]
#     for root, dirs, files in os.walk(os.getcwd()):
#         for file in files:
#             if os.path.splitext(file)[1] == '.xlsx':
#                 xml_file = os.path.join(os.getcwd(), file)#文件
#                 """处理数据"""
#                 xml_files.append(xml_file)
#     return xml_files
if __name__ == '__main__':
    try :
        for i in open_fille():
            i.start()
    except:
        print(EnvironmentError)
    else:
        print('ok')


# class a():
#     def __init__(self):
#         """"""
#     @classmethod
#     def c(cls):
#         """"""
#     def k(self):
#         global a