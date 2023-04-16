

from selenium import webdriver
from selenium.webdriver.common.by import By
import time


def code():
    for no in range(1,131):
        if web.find_element(By.XPATH,
                            '//*[@id="pane-15"]/div/section[%d]/div/div[2]/section/div[2]/div/span' % no).text == "未开始":
            web.find_element(By.XPATH,
                             '//*[@id="pane-15"]/div/section[%d]/div[2]/div[2]/section/div[1]/div/h2' % no).click()
            web.implicitly_wait(10)
            web.find_element(By.XPATH, '//*[@id="app"]/div[2]/div/div[2]/div/div/div/section[1]/div[2]/span').click()
            mtime = web.find_element(By.XPATH,
                                     '//*[@id="app"]/div[2]/div/div[2]/div[2]/div/div/div[2]/div/div[2]/ul/li[4]').text
            web.find_element(By.XPATH, '//*[@id="app"]/div[2]/div/div[2]/div[2]/div/div/div[3]/span/button').click()
            time.sleep((int(mtime) / 60))
            web.find_element(By.XPATH, '//*[@id="app"]/div[1]/div[1]/ul/li[1]/span').click()
            web.find_element(By.XPATH, '//*[@id="tab-student"]').click()
            web.find_element(By.XPATH, '//*[@id="pane-student"]/div[2]/div/div[2]/div/div[1]/div').click()
            if web.current_url=="https://www.yuketang.cn/v2/web/studentLog/14843501":
                web.find_element(By.XPATH, '//*[@id="pane-log"]/div[1]/div[1]/label[3]/span').click()
                web.implicitly_wait(10)
        else:
            continue
url = "https://www.yuketang.cn/web"
web = webdriver.Firefox()
web.get(url)
web.implicitly_wait(10)
web.quit()
web.find_element(By.XPATH, '//*[@id="app"]/div[1]/div[1]/ul/li[1]/span').click()
web.implicitly_wait(10)
web.find_element(By.XPATH, '//*[@id="tab-student"]').click()
web.implicitly_wait(10)
web.find_element(By.XPATH, '//*[@id="pane-student"]/div[2]/div/div[2]/div/div[1]/div').click()
web.implicitly_wait(10)
web.find_element(By.XPATH, '//*[@id="pane-log"]/div[1]/div[1]/label[3]/span').click()
# //*[@id="pane-15"]/div/section[5]/div/div[2]/section/div[2]/div/span
# //*[@id="pane-15"]/div/section[1]/div[2]/div[2]/section/div[1]/div/h2
# //*[@id="pane-15"]/div/section[1]/div[2]/div[2]/section/div[1]/span/svg/use
# //*[@id="pane-15"]/div/section[131]/div[1]/div[2]/section/div[1]/span/svg
try:
    code()
except:
    print("err")
else:
    web.quit()


