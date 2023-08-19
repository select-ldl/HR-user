go mod init main.go
go mod download
go env -w GOPROXY=https://goproxy.cn,direct
@REM go mod edit -droprequire=golang.org/x/text 
go get github.com/tools/godep
go get -u github.com/gin-gonic/gin