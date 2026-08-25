@echo off
chcp 65001 > nul
echo =========================================================================
echo   GRABRIDE - TỰ ĐỘNG NẠP DỮ LIỆU VÀO SQL SERVER DATABASE [QLGRAB]
echo =========================================================================
echo.

set SQLCMD="C:\Program Files\Microsoft SQL Server\Client SDK\ODBC\180\Tools\Binn\SQLCMD.EXE"

if exist %SQLCMD% (
    echo [1/2] Dang ket noi toi SQL Server va nap file schema_QLGRAB.sql...
    %SQLCMD% -S "." -d "QLGRAB" -E -C -i "schema_QLGRAB.sql"
    echo.
    echo [2/2] HOAN TAT! Tat ca 11 bang va du lieu da duoc nap vao SQL Server QLGRAB!
) else (
    echo [ERROR] Khong tim thấy sqlcmd.exe tai C:\Program Files\Microsoft SQL Server\Client SDK\ODBC\180\Tools\Binn\SQLCMD.EXE
)

echo.
echo Hay quay lai SSMS va bam Execute (F5) de xem du lieu trong dbo.HoSoTaiXe, dbo.CuocXe, dbo.NguoiDung!
pause
