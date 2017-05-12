rmdir "build" /s /q
call tsc
cd app
call tsc
cd ..
xcopy "app" "build/app" /e /i /h /y
xcopy "printer" "build/printer" /e /i /h /y
copy "package.json" "./build"
copy "icon.ico" "./build"
cd build
call npm install
call electron-rebuild
cd app
rmdir "@types" /s /q
rmdir "models" /s /q
rmdir "views" /s /q
del "app.ts"
del "tsconfig.json"
cd ..
call electron-packager . --overwrite --asar=true --platform=win32 --arch=x64 --icon=icon.ico --prune=true --out=release-builds --version-string.FileDescription="FEC Database"
cd ..