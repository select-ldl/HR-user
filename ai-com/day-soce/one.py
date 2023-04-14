import os.path
import os
import pandas as pd
import glob
import shutil


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

def init_delete():
    """delect文件"""
    aks_file=init_fille()
    file = os.path.abspath('./bin')
    # li=os.listdir(file)
    for k in glob.glob("%s/*"%file):
        if 'op.py' not in k :
            shutil.rmtree(k,ignore_errors=True,onerror=None)
    for m in glob.glob("%s/*.xlsx"%file):
        os.remove(m)
        # shutil.rmtree(m, ignore_errors=True, onerror=None)
def init_ksmain():
    # 指定要操作的路径和文件名
    path = "%s" % init_fille()
    # 获取文件名和扩展名
    filename, ext = os.path.splitext(os.path.basename(path))
    # 读取xlsx文件
    df = pd.read_excel("./%s"%(filename+".xlsx"))
    # 按照名称列分组
    groups = df.groupby("片区")
    # # 遍历分组，将每个分组保存到不同文件中
    for name, group in groups:
        filenamse = "bin/{%s}.xlsx" %(name)
        group.to_excel(filenamse, index=False)

if __name__ == '__main__':

    # init_delete()
    try:
        init_delete()
    except:
        print("请运行bin文件夹的op.py")
    else:
        init_ksmain()


