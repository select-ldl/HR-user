# -*- coding:utf-8 -*-
# @Author: start.liu
# @Email: start.liu@stert.liu
# @Date: 2022/7/8 20:17
# @File: ios
# @Project: gutuibai
# @Desc:
import os.path
import pandas as pd
import re

def init_fille():
    """读文件"""
    xml_files=[]
    for root, dirs, files in os.walk(os.getcwd()):
        for file in files:
            if os.path.splitext(file)[1] == '.strings':
                xml_file = os.path.join(os.getcwd(), file)#文件
                """处理数据"""
                xml_files.append(xml_file)
    return xml_files
def init_ck(xml_file,dyy):
    """遍历数据"""
    with open(xml_file, "rt", encoding="utf8") as f:
        k = f.read()
        a=k.split('\n')
        dyy.append(a)
        f.close()
    # en=[]#英语
    # ms=[]#马来西亚
    # th=[]#泰语
    # zw=[]#中文
    # tw=[]#台湾
def init_strings():
    """处理文件数据"""
    xml_files=(init_fille())
    dyy=[]
    for xml_file in xml_files:
        # print(xml_file)
        #'YouXinZhengQuan_uSmartOversea_zh-Hant.lproj_Localizable.strings'==xml_files[0]
        if  xml_files[0]in xml_file:
            init_ck(xml_file,dyy=dyy)
        if xml_files[1]in xml_file:
            init_ck(xml_file, dyy=dyy)
        if xml_files[2] in xml_file:
            init_ck(xml_file, dyy=dyy)
        if xml_files[3] in xml_file :
            init_ck(xml_file,dyy=dyy)
        if xml_files[4] in xml_file:
            init_ck(xml_file,dyy=dyy)
        if xml_files[5] in xml_file:
            init_ck(xml_file,dyy=dyy)
    # print(dyy)
    datas=[]
    def k(key):
        data = []
        ab = []
        for i in key:
            if '=' in i:
                a = re.sub(r'[.!?:;()（）" ]', "", i)
                data.append(a)
        for k1 in data:
            a1 = k1.split('=')
            ab.append(a1)
        return ab
    a1=k(dyy[0])
    a2=k(dyy[1])
    a3=k(dyy[2])
    a4=k(dyy[3])
    a5=k(dyy[4])
    a6=k(dyy[5])
    for dy1 in a1:
        for dy2 in a2:
            if dy1[0] == dy2[0]:
                for dy3 in a3:
                    if dy1[0] == dy3[0]:
                        for dy4 in a4:
                            if dy1[0] == dy4[0]:
                                for dy5 in a5:
                                    if dy1[0] == dy5[0]:
                                        for dy6 in a6:
                                            if dy1[0]==dy6[0]:
                                                b=[dy1[0],dy5[1],dy6[1],dy1[1],dy3[1],dy4[1],dy2[1]]
                                                datas.append(b)
    columns=["ios_key", "简体", "繁体","英语","马来语","泰语","日语"]
    dt = pd.DataFrame(datas, columns=columns)
    dt.to_excel("ios_xlsx.xlsx", index=0)#xlsx
    return datas
# if __name__ == '__main__':
#     """调试"""
#     a=init_strings()
#     print(a)
#
