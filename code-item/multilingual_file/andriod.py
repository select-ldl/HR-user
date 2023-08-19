# -*- coding:utf-8 -*-
# @Author: start.liu
# @Email: start.liu@stert.liu
# @Date: 2022/7/8 19:48
# @File: andriod
# @Project: gutuibai
# @Desc:
import os.path
import xmltodict
import pandas as pd

def init_fille():
    """读文件"""
    xml_files=[]
    for root, dirs, files in os.walk(os.getcwd()):
        for file in files:
            if os.path.splitext(file)[1] == '.xml':
                xml_file = os.path.join(os.getcwd(), file)#文件
                """处理数据"""
                xml_files.append(xml_file)
    return xml_files
def init_ck(xml_file,dyy):
    """遍历数据"""
    with open(xml_file, "rt", encoding="utf8") as f:
        k = f.read()
        d = xmltodict.parse(k)
        data = d['resources']['string']
        zw = (data)
        dyy.append(zw)
        f.close()
    # en=[]#英语
    # ms=[]#马来西亚
    # th=[]#泰语
    # zw=[]#中文
    # tw=[]#台湾
def init_xml():
    """处理文件数据"""
    """文件夹可以自己修改"""
    xml_files=(init_fille())
    dyy=[]
    for xml_file in xml_files:
        if  xml_files[1]in xml_file:
            init_ck(xml_file,dyy=dyy)
        if xml_files[2]in xml_file:
            init_ck(xml_file, dyy=dyy)
        if xml_files[0] in xml_file:
            init_ck(xml_file, dyy=dyy)
        if xml_files[3] in xml_file :
            init_ck(xml_file,dyy=dyy)
        if xml_files[4] in xml_file:
            init_ck(xml_file,dyy=dyy)
        if xml_files[5] in xml_file:
            init_ck(xml_file,dyy=dyy)
    # print(dyy)
    datas=[]

    for dy1 in dyy[0]:
        for dy2 in dyy[1]:
            if dy1['@name'] == dy2['@name']:
                for dy3 in dyy[2]:
                    if dy1['@name'] == dy3['@name']:
                        for dy4 in dyy[3]:
                            if dy1['@name'] == dy4['@name']:
                                for dy5 in dyy[4]:
                                    if dy1['@name']==dy5['@name']:
                                        for dy6 in dyy[5]:
                                            if dy1['@name'] == dy6['@name']:
                                                # print(dy6.get('#text','null'))
                                                a=dy6.get('#text', 'null')
                                                if a=='null':
                                                    a=None
                                                b = [dy1['@name'], dy1['#text'], dy5['#text'], dy2['#text'],
                                                     dy3['#text'], dy4['#text'],a]
                                                datas.append(b)
    columns=["android_key", "简体", "繁体","英语","马来语","泰语","日语"]
    dt = pd.DataFrame(datas, columns=columns)
    dt.to_excel("android_xlsx.xlsx", index=0)#xlsx
# if __name__ == '__main__':
#     """调试"""
#     init_xml()

