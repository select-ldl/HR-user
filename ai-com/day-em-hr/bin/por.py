import os.path
import os
import pandas as pd
import glob
import shutil

def init_fille():
    """读文件"""
    xml_files = []
    for root, dirs, files in os.walk(os.getcwd()):
        for file in files:
            if os.path.splitext(file)[1] == '.xlsx':
                xml_file = os.path.join(os.getcwd(), file)  # 文件
                """处理数据"""
                xml_files.append(xml_file)
    return xml_files


def init_ks():
    # 指定要操作的路径和文件名
    for a in init_fille():
        path = "%s" % a
        # 获取文件名和扩展名
        filename, ext = os.path.splitext(os.path.basename(path))
        # 读取xlsx文件
        df = pd.read_excel(filename + ext)
        # 按照名称列分组
        groups = df.groupby("工号")
        # 创建新文件夹
        # new_folder = filename + '_file'
        # os.mkdir(new_folder)
        # # # 遍历分组，将每个分组保存到不同文件中
        for name, group in groups:
            # filenames = "%s/{%s}.xlsx" % (new_folder, name)
            # group.to_excel(filenames, index=False)
            print(name)
            conta=[]
            for i in (pd.DataFrame.to_string(group).split(" ")):
                if i == "":
                    continue
                conta.append(i)
            gose={}
            prps=round(len(conta)/2)
            for o in range(prps):
                gose[conta[o]]=conta[prps+o]
            init_delete(name)
            # 进行比对
            print(gose,prps,len(conta))
            # print(pd.DataFrame.to_string(group))
def init_delete(name):
    """delect文件"""
    file = os.path.abspath('./')
    for m in glob.glob("%s/%s.xlsx"%(file,name)):
        os.remove(m)
        # shutil.rmtree(m, ignore_errors=True, onerror=None)
if __name__ == '__main__':
    init_ks()

