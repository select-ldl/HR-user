package main

func main() {
    web.Get("/",func(ctx *context.Context){
        ctx.Output.Body([]byte("hello world"))
   })
   
}
//路由

http.HandleFunc("/attendance", attendanceHandler)
// 处理函数
func attendanceHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method == "GET" {
        // 显示考勤记录
        attendances := getAttendances()
        // 渲染模板并返回响应
        renderTemplate(w, "attendance-template.html", attendances)
    } else if r.Method == "POST" {
        // 添加考勤记录
        r.ParseForm()
        name := r.PostForm.Get("name")
        time := r.PostForm.Get("time")
        addAttendance(name, time)
        // 跳转回考勤记录页面
        // http.Redirect(w, r, "/attendance", http.Stst12:48atusFound)
    }
}

// 获取考勤记录
func getAttendances() []Attendance {
    // 查询数据库或者调用其他API接口获取考勤记录
    return attendances
}

// 添加考勤记录
func addAttendance(name, time string) {
    // 将考勤记录插入数据库或者调用其他API接口添加考勤记录
}

// 渲染模板
func renderTemplate(w http.ResponseWriter, tmpl string, data interface{}) {
    t, _ := template.ParseFiles(tmpl)
    t.Execute(w, data)
}

// 考勤记录结构体
type Attendance struct {
    Name string
    Time string
}
```