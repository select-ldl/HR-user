import os
import smtplib
from email.message import EmailMessage
from pathlib import Path

# 邮箱信息，参考 https://www.runoob.com/python/python-email.html
MAIL_HOST = "smtp.xxx.com"  # SMTP服务器地址
MAIL_USER = "your_username"  # 邮箱账号
MAIL_PASS = "your_password"  # 邮箱密码
MAIL_PORT = 465  # SSL服务端口号

SENDER = 'xxx@xxx.com'  # 发件人邮箱
RECIPIENTS = []  # 收件人邮箱列表

# 文件名和邮箱地址对应关系
FILE_EMAIL_DICT = {
    'file1.txt': 'email1@example.com',
    'file2.txt': 'email2@example.com',
    # ...
}

# 文件所在目录
SEARCH_DIR = Path('../')

def send_email(file_path, email_addr):
    """发送邮件函数"""
    with open(file_path, 'r') as f:
        content = "".join(f.readlines())
    subject = f'File content of {file_path.name}'
    msg = EmailMessage()
    msg['From'] = SENDER
    msg['To'] = email_addr
    msg['Subject'] = subject
    msg.set_content(content)
    with open(file_path, 'rb') as f:
        msg.add_attachment(f.read(), maintype='application', subtype='octet-stream', filename=file_path.name)
    try:
        with smtplib.SMTP_SSL(MAIL_HOST, MAIL_PORT) as smtp_obj:
            smtp_obj.login(MAIL_USER, MAIL_PASS)
            smtp_obj.send_message(msg)
        print('Sent email to {email_addr} for {file_path}.')
    except Exception as e:
        print(f'Error sending email: {e}')

for filename, email_addr in FILE_EMAIL_DICT.items():
    filepath = SEARCH_DIR / filename
    if not filepath.is_file():
        print(f'Skipped {filename} because file not found.')
        continue
    send_email(filepath, email_addr)
