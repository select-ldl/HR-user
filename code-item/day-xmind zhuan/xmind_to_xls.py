import os
import xlwt
import re  
from xmindparser import xmind_to_dict

class xmind_to_xls():
    def __init__(self):
        self.find_xmind_file()

    def find_xmind_file(self):
        '''读取当前目录下的xmind文件'''
        for root,dirs,files in os.walk(os.getcwd()):
            for file in files:
                if os.path.splitext(file)[1] == '.xmind':
                    xmind_file = os.path.join(os.getcwd(),file)
                    self.xmind_list = xmind_to_dict(xmind_file) # 读取xmind文件
                    #print(self.xmind_list)
                    self.cases = []     # 保存用例,  每读取到一个xmind文件都要初始化各变量
                    self.cases_keywords = []    # 保存用例关键字,  每读取到一个xmind文件都要初始化各变量
                    self.xls_name = os.path.splitext(file)[0]   # 保存的Excel文件名
                    self.xmind_to_keywords(self.xmind_list)
                    self.keywords_to_cases()
                    self.write_xls()
                    
            break

    def xmind_to_keywords(self,list,title=[]):
        '''从xmind文件中提取出每条用例的所有关键字'''
        for d in list:
            if d.__contains__('topics'):
                d['title'] = str(d['makers'])+str(d['title']) if d.__contains__('makers') else d['title']
                self.xmind_to_keywords(d['topics'],title+[d['title']])  # 递归读取每个关键字
            elif d.__contains__('topic'):
                self.xmind_to_keywords([d['topic']])
            else:
                d['title'] = str(d['makers'])+d['title'] if d.__contains__('makers') else d['title']
                self.cases_keywords.append(title+[d['title']])   # 保存每个画布的用例
                
    
    def keywords_to_cases(self,t=None,s=None,r=None):
        '''由关键字生成用例格式'''
        cases = self.compose_case()
        for case in cases:      # case格式：[title,[step],[[rlt]],priority,warn]
            step = '\n'.join(map(lambda i:str(i+1)+'. '+case[1][i],range(0,len(case[1]))))
            rlt = '\n'.join(map(lambda i:str(i+1)+'. '+'\n'.join(case[2][i]),range(0,len(case[2]))))
            warn = '；'.join(set(case[4]))
            case = ['','',case[0],'',step,rlt,'',case[3],'功能测试','功能测试阶段','正常',warn]
            self.cases.append(case)
            
    def compose_case(self,t=None,s=None,r=None):
        '''组合用例,将同一个测试点的多个步骤和预期合并到一起'''
        cases = []
        title_list=[]   # 临时保存用例标题
        for titles in self.cases_keywords:
            title,step,rlt,priority,warn = self.pickup_case(titles)    # 返回用例标题、步骤、预期、优先级、用例警告
            if (t,s) == (title,[step]):   # 当属同一个步骤的时候，要合并用例预期
                case = cases[-1]
                case[2][-1] = case[2][-1] + ['(%d) %s'%(len(r[-1])+1,rlt)]
                case[4] = case[4] + warn
            elif title in title_list:   # 当属同一个用例时，要合并用例步骤
                s = [step]
                case = cases[title_list.index(title)]
                case[1] = case[1] + [step]
                case[2] = case[2] + [['(1) %s'%rlt] if rlt else [],]
                case[4] = case[4] + warn
            else:
                t,s,r,p,w = title,[step],[['(1) %s'%rlt] if rlt else [],],priority,warn
                title_list.append(t)
                cases.append([t,s,r,p,w])
        return cases    # 返回的用例格式：[[title,[step],[[rlt]],priority,warn],...]
      
    def pickup_case(self,titles):
        '''根据xmind中的标识提取用例标题、步骤、预期、优先级，并设置用例警告'''
        step = []   # 临时保存步骤
        case_title,case_step,case_rlt,case_prio,case_warn = '','','',3,[]  # 用例标题、用例步骤、用例预期、用例查错警告,0为正常1为警告
        # 设置警告
        case_warn.append('title含有空字符串') if None in titles else []
        if '[Image]' in titles:
            case_warn.append('含有图片:[Image]')
        for i in range(len(titles)-1,0,-1):
            case_prio,title = self.flag_status(titles[i])
            if title == 'None':
                case_warn.append('title含有空字符串')
            # 先提取出用例预期
            if not case_rlt:
                case_rlt = title
                if case_prio:     # 标识在最后一个分支上时
                    case_step,case_rlt = '--','--'
                    case_warn.append('无用例预期')
                    break
            # 再提取出用例步骤
            elif not case_step:
                if case_prio:     # 标识在倒数第二个分支上时
                    case_step = '--'
                    break
                else:
                    case_step = title
            # 最后查找标识位置
            else:
                if case_prio:     # 标识在倒数第三个分支上时
                    break
                else:
                    step.append(title)
        else:   # 没有标识时
            i = len(titles)-3
            step = None
            case_prio = 3
            case_warn.append('未标识优先级符号')
            
        if step:    # 用例步骤分多级时
            step.reverse()
            step.append(case_step)
            case_step = '  —>  '.join(step)
            case_warn.append('用例步骤含有多级')
        case_title = '，'.join(map(lambda x: self.flag_status(x)[1],titles[:i+1]))
        return case_title,case_step,case_rlt,case_prio,case_warn   # 返回用例标题、步骤、预期、优先级、用例警告

    def flag_status(self,title):
        '''判断是否含有标记'''
        pattern = re.compile(r"\[(.*?)\]")
        flag = pattern.findall(str(title))   # list ["'star-red'"]
        title = str(title)  # 将None转成’None‘
        if flag:
            pattern = re.compile(r"'(.*?)'")
            flag = pattern.findall(flag[0])
            title = title.replace(str(flag),'')
            for f in flag:
                if f in ('priority-1','priority-2','priority-3','priority-4','priority-5','priority-6','priority-7'):   # 再判断该标志是否为测试点 
                    priority = int(f[-1])
                    return priority if priority<=3 else 4,title
            else:
                return False,title
        else:
            return False,title
        
    def write_xls(self):
        '''用例写入excel'''
        self.init_xls()
        self.cases.reverse()    #将用例倒序，导入禅道后的用例顺序就会变成正序了
        for i in range(0,len(self.cases)):
            pattern = xlwt.Pattern()        # 设置背景色
            pattern.pattern = xlwt.Pattern.SOLID_PATTERN
            pattern.pattern_fore_colour = 22
            font = xlwt.Font()
            font.height = 20*9
            font.colour_index = 0
            borders = xlwt.Borders()    # 设置边框
            borders.right = xlwt.Borders.THIN
            borders.bottom = xlwt.Borders.THIN
            style = xlwt.XFStyle()     # 设置单元格风格
            style.font = font
            style.borders = borders
            if i%2:
                pattern.pattern_fore_colour = 27
            style.pattern = pattern
            if self.cases[i][-1]:   # 警告高亮显示
                pattern.pattern_fore_colour = 5
                style.pattern = pattern
                self.sheet1.write(i+1,len(self.cases[i])-1,self.cases[i][-1],style)
            for j in range(0,len(self.cases[i])-1):
                self.sheet1.write(i+1,j,self.cases[i][j],style)
        self.xls.save(self.xls_file)
        
    def init_xls(self):
        '''初始化excel文件'''
        self.xls_file = self.xls_name + '.xls'
        self.xls = xlwt.Workbook()
        self.sheet1 = self.xls.add_sheet('sheet1',cell_overwrite_ok=True)
        self.row0 = ['所属模块','相关需求','用例标题','前置条件','步骤','预期','关键词','优先级','用例类型','适用阶段','用例状态']
        self.sheet1.row(0).set_style(xlwt.easyxf('font:height 120;'))    # 设置行高
        pattern = xlwt.Pattern()        # 设置背景色
        pattern.pattern = xlwt.Pattern.SOLID_PATTERN
        pattern.pattern_fore_colour = 30
        font = xlwt.Font()  # 设置字体
        font.colour_index = 1	# 字体颜色
        font.height = 20*9 # 11为字号，20为衡量单位
        font.bold = True
        borders = xlwt.Borders()    # 设置边框
        borders.left = xlwt.Borders.THIN
        borders.right = xlwt.Borders.THIN
        borders.top = xlwt.Borders.THIN
        borders.bottom = xlwt.Borders.THIN
        style = xlwt.XFStyle()     # 设置单元格风格
        style.font = font
        style.borders = borders
        style.pattern = pattern
        collum_len = [8,8,50,8,60,60,6,6,8,12,8]	# 列宽
        for i in range(0,len(self.row0)):
            self.sheet1.write(0,i,self.row0[i],style)
            self.sheet1.col(i).width = 256*collum_len[i]   # 设置列宽
        self.sheet1.col(len(self.row0)).width = 256*16

if __name__ == '__main__':
    xmind_to_xls()
    