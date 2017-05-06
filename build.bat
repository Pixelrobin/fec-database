call tsc
cd app
call tsc
cd ..
xcopy "app" "build/app" /e /i /h /y
cd build/app
rmdir "@types" /s /q
cd ../..