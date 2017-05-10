rmdir "build" /s /q
call tsc
cd app
call tsc
cd ..
xcopy "app" "build/app" /e /i /h /y
xcopy "printer" "build/printer" /e /i /h /y
cd build/app
rmdir "@types" /s /q
rmdir "models" /s /q
rmdir "views" /s /q
del "app.ts"
del "tsconfig.json"
cd ../..