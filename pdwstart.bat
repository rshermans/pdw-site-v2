@echo off
echo Iniciando o servidor de desenvolvimento para PDW Site V1...

IF NOT EXIST "node_modules" (
    echo.
    echo =======================================================
    echo As dependencias nao foram encontradas na pasta node_modules.
    echo Instalando as dependencias agora, por favor aguarde...
    echo =======================================================
    echo.
    call npm install
)

echo.
echo =======================================================
echo Iniciando o Next.js no modo de desenvolvimento...
echo =======================================================
echo.
call npm run dev
