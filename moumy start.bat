@echo off

start "bun Server" cmd /k "bun dev"

timeout /t 2 /nobreak > nul

start http://localhost:5173