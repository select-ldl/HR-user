#! /env/bin/python3
# -*- coding: UTF-8 -*-
import zmail

mail_server = zmail.server(username='your mailbox@qq.com',password='your password')
mail = mail_server.get_latest()

print("邮件主题：", mail['Subject'])
print("邮件发送时间：", mail['Date'])
print("发送者：", mail['From'])
print("接收者：", mail['To'])
print("内容：\n", mail['content_text'])

#获取指定id的邮件
mail = mail_server.get_mail(30)
zmail.show(mails=mail)
#获取所有邮件
mails = mail_server.get_mails(start_time='2022-04-24',end_time='2022-04-25')
for mail in mails:
    print('-'*20)
    zmail.show(mail)

#发送邮件(带附件)
file_path = 'D://temp/1.jpg'
mail_info = {
    'subject': '邮件主题',
    'content_text': '测试发送邮件',
    'attachments': file_path,
}
mail_server.send_mail('revice@qq.com',mail_info)

