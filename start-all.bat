@echo off
echo ==================================================================
echo DANG KHOI DONG HE THONG MOVIE BOOKING (MICROSERVICES)
echo ==================================================================
echo.
echo Dam bao ban da bat:
echo 1. WampServer (MySQL) o port 3306
echo 2. Redis (Docker hoac local) o port 6379
echo.
echo Dang mo cac dich vu trong cung mot terminal bang thu vien concurrently...
echo Nhan Ctrl+C bat cu luc nao de tat toan bo cac dich vu.
echo.

cd backend\movie-system
npm run start:all

pause
