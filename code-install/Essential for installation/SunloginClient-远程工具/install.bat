@echo off
cd  "%CD%"
for /f "tokens=4,5 delims=. " %%a in ('ver') do if %%a%%b geq 60 goto new

:old
cmd /c netsh firewall delete allowedprogram program="%CD%\SunloginClient.exe" profile=ALL
cmd /c netsh firewall add allowedprogram program="%CD%\SunloginClient.exe" name="SunloginClient" ENABLE
cmd /c netsh firewall add allowedprogram program="%CD%\SunloginClient.exe" name="SunloginClient" ENABLE profile=ALL

cmd /c netsh firewall delete allowedprogram program="%CD%\agent\SunloginClient.exe" profile=ALL
cmd /c netsh firewall add allowedprogram program="%CD%\agent\SunloginClient.exe" name="SunloginDesktopAgent" ENABLE
cmd /c netsh firewall add allowedprogram program="%CD%\agent\SunloginClient.exe" name="SunloginDesktopAgent" ENABLE profile=ALL
goto end
:new
cmd /c netsh advfirewall firewall delete rule name="SunloginClient"
cmd /c netsh advfirewall firewall add rule name="SunloginClient" dir=in action=allow program="%CD%\SunloginClient.exe" protocol=tcp enable=yes profile=public
cmd /c netsh advfirewall firewall add rule name="SunloginClient" dir=in action=allow program="%CD%\SunloginClient.exe" protocol=udp enable=yes profile=public
cmd /c netsh advfirewall firewall add rule name="SunloginClient" dir=in action=allow program="%CD%\SunloginClient.exe" protocol=tcp enable=yes profile=domain
cmd /c netsh advfirewall firewall add rule name="SunloginClient" dir=in action=allow program="%CD%\SunloginClient.exe" protocol=udp enable=yes profile=domain
cmd /c netsh advfirewall firewall add rule name="SunloginClient" dir=in action=allow program="%CD%\SunloginClient.exe" protocol=tcp enable=yes profile=private
cmd /c netsh advfirewall firewall add rule name="SunloginClient" dir=in action=allow program="%CD%\SunloginClient.exe" protocol=udp enable=yes profile=private

cmd /c netsh advfirewall firewall delete rule name="SunloginDesktopAgent"
cmd /c netsh advfirewall firewall add rule name="SunloginDesktopAgent" dir=in action=allow program="%CD%\agent\SunloginClient.exe" protocol=tcp enable=yes profile=public
cmd /c netsh advfirewall firewall add rule name="SunloginDesktopAgent" dir=in action=allow program="%CD%\agent\SunloginClient.exe" protocol=udp enable=yes profile=public
cmd /c netsh advfirewall firewall add rule name="SunloginDesktopAgent" dir=in action=allow program="%CD%\agent\SunloginClient.exe" protocol=tcp enable=yes profile=domain
cmd /c netsh advfirewall firewall add rule name="SunloginDesktopAgent" dir=in action=allow program="%CD%\agent\SunloginClient.exe" protocol=udp enable=yes profile=domain
cmd /c netsh advfirewall firewall add rule name="SunloginDesktopAgent" dir=in action=allow program="%CD%\agent\SunloginClient.exe" protocol=tcp enable=yes profile=private
cmd /c netsh advfirewall firewall add rule name="SunloginDesktopAgent" dir=in action=allow program="%CD%\agent\SunloginClient.exe" protocol=udp enable=yes profile=private
:end