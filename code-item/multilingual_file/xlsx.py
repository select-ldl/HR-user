# -*- coding:utf-8 -*-
# @Author: start.liu
# @Email: start.liu@stert.liu
# @Date: 2022/8/19 11:11
# @File: xlsx
# @Project: appiumsd.py
# @Desc:
import xlrd
import xlwt
import os
import pandas as pd
'海外版-SG-APP(iOS+安卓).xlsx'
def init_fille():
    """读文件"""
    xml_files=[]
    for root, dirs, files in os.walk(os.getcwd()):
        for file in files:
            if os.path.splitext(file)[1] == '.xlsx':
                xml_file = os.path.join(os.getcwd(), file)#文件
                """处理数据"""
                xml_files.append(xml_file)
    return xml_files
def init_ck(xml_file,dyy):
    """遍历数据"""
    datas = []
    data = xlrd.open_workbook(xml_file)
    shet = data.sheet_by_index(0)
    # tables=shet.row_values()
    row = shet.nrows
    for i in range(row):
        rowdate = shet.row_values(i)  # i行的list
        datas.append(rowdate)

    dyy.append(datas)
def init_xml():
    """处理文件数据"""
    """文件夹可以自己修改"""
    xml_files=(init_fille())
    dyy=[]
    for xml_file in xml_files:
        if  xml_files[0]in xml_file:#安卓
            init_ck(xml_file,dyy=dyy)
        if xml_files[1]in xml_file:#ios
            init_ck(xml_file, dyy=dyy)
        if '海外版-SG-APP(iOS+安卓).xlsx'in xml_files[2]:#修改后的结果
            init_ck(xml_file, dyy=dyy)
        if xml_files[3] in xml_file :
            init_ck(xml_file,dyy=dyy)
        if xml_files[4] in xml_file:
            init_ck(xml_file,dyy=dyy)
        # if xml_files[5] in xml_file:
        #     init_ck(xml_file,dyy=dyy)
    k = []
    def andsdsd():
        for a00 in dyy[2]:
            for a1 in dyy[0]:
                # if a1[0] == a00[0]:
                #     if a1[6]!=a00[6]:
                #         print(a1[0],a1[1],a1[6],"00error00",a00[1],a00[6])
                #         k.append([a1[0],a1[1],a1[6],a00[6]])
                if a1[0] == a00[0]:
                    if a1[6] != a00[6]:
                        k.append([a1[0], a1[1], a1[6], a00[6]])
                if a1[1] == a00[1]:
                    if a1[6] != a00[6]:
                        k.append([a1[0], a1[1], a1[6], a00[6]])
        columns = ["android_key", "简体", "开发给的日语", "文档日语"]
        dt = pd.DataFrame(k, columns=columns)
        dt.to_excel("错误报告and.xlsx", index=0)  # xlsx
    def iosdes():
        for a00 in dyy[2]:
            for a1 in dyy[1]:
                # if a1[0] == a00[0]:
                #     if a1[6]!=a00[6]:
                #         print(a1[0],a1[1],a1[6],"00error00",a00[1],a00[6])
                #         k.append([a1[0],a1[1],a1[6],a00[6]])
                if a1[0] == a00[0]:
                    if a1[6] != a00[6]:
                        k.append([a1[0], a1[1], a1[6], a00[6]])
                if a1[1] == a00[1]:
                    if a1[6] != a00[6]:
                        k.append([a1[0], a1[1], a1[6], a00[6]])
        # print(k)
        columns = ["android_key", "简体", "开发给的日语", "文档日语"]
        dt = pd.DataFrame(k, columns=columns)
        dt.to_excel("错误报告ios.xlsx", index=0)  # xlsx
    iosdes()
    andsdsd()
# if __name__ == '__main__':
#     # print(init_fille())
#     init_xml()


# for m in enumerate(rowdate)[0]:
#     print(i,m)
# for a, b in enumerate(rowdate):

# if a==0:
#     print(i,b)
#     if b=='common_close1':
#         if a==6:
#             k=b  # 第i行，a列，数据b