@echo off
chcp 65001 > nul
title Moumy Recettes - Serveur de dev

echo.
echo  ╔═══════════════════════════════════╗
echo  ║   Les recettes de Moumy - Dev     ║
echo  ╚═══════════════════════════════════╝
echo.

:: Check si bun est installé
where bun > nul 2>&1
if %errorlevel% neq 0 (
    echo  [!] Bun n'est pas installé.
    echo  [.] Installe-le ici : https://bun.sh
    echo.
    pause
    exit /b 1
)

echo  [*] Lancement du serveur...
echo.

start "" http://localhost:5173
bun dev
