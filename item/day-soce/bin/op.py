import os.path
import os
import pandas as pd


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
        groups = df.groupby("业务机构门店")
        # 创建新文件夹
        new_folder = filename + '_file'
        os.mkdir(new_folder)
        # # 遍历分组，将每个分组保存到不同文件中
        for name, group in groups:
            filenames = "%s/{%s}.xlsx" % (new_folder, name)
            group.to_excel(filenames, index=False)

if __name__ == '__main__':
    init_ks()



