import os.path
import os
import pandas as pd
import glob
import shutil
import smtplib
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

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
            # print(name)
            conta=[]
            for i in (pd.DataFrame.to_string(group).split(" ")):
                if i == "":
                    continue
                conta.append(i)
            gose={}
            prps=round(len(conta)/2)
            for o in range(prps):
                gose[conta[o]]=conta[prps+o]
            elmie(gose, name,'2144745569@qq.com')
            init_delete(name)
            # 进行比对

            # print(gose)
            # print(pd.DataFrame.to_string(group))
def init_delete(name):
    """delect文件"""
    file = os.path.abspath('./')
    for m in glob.glob("%s/%s.xlsx"%(file,name)):
        os.remove(m)
        # shutil.rmtree(m, ignore_errors=True, onerror=None)


def elmie(msg,name,id):
    title = "上月份工资条"
    file = ("%s/%s.xlsx" % (os.path.abspath('./'), name))
    elmi_file=r"%s"%file
    elmi_file=MIMEApplication(open(elmi_file,mode="rb").read())
    elmi_file.add_header('Content-Disposition', 'attachment', filename="%s.xlsx"%name)  # 为附

    mg = MIMEMultipart()
    messg = MIMEText(str(msg), "plain", "utf8")
    # 发送
    mg["From"] = "{}".format("2144745569@qq.com")
    # messg["From"] = "{}".format("2144745569@qq.com")
    # 接受
    mg["To"] = ",".join([id])
    mg["Subject"] = title
    mg.attach(messg)
    mg.attach(elmi_file)

    sever = smtplib.SMTP_SSL('smtp.qq.com', 465)  # 587 465
    sever.login("2144745569@qq.com", "qbrdhjzdfdyscbcc")  # qbrdhjzdfdyscbcc
    sever.sendmail("2144745569@qq.com", id, mg.as_string())
    sever.quit()
    # star00star99@dingtalk.com
if __name__ == '__main__':
    init_ks()
    # elmie()
