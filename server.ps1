# ==============================================================================
#  GRABRIDE REAL-TIME POWERSHELL WEBSERVER FOR SQL SERVER [QLGRAB]
#  Serves HTTP API on http://localhost:3000 & connects directly to SQL Server!
# ==============================================================================

$port = 3000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host '==========================================================================' -ForegroundColor Green
Write-Host ' POWERSHELL SERVER IS RUNNING ON http://localhost:3000' -ForegroundColor Cyan
Write-Host ' CONNECTED DIRECTLY TO SQL SERVER DATABASE QLGRAB' -ForegroundColor Yellow
Write-Host '==========================================================================' -ForegroundColor Green

$connectionString = 'Server=.;Database=QLGRAB;Integrated Security=True;TrustServerCertificate=True;'

function Execute-SqlQuery([string]$query) {
    try {
        $conn = New-Object System.Data.SqlClient.SqlConnection($connectionString)
        $conn.Open()
        $cmd = $conn.CreateCommand()
        $cmd.CommandText = $query
        $adapter = New-Object System.Data.SqlClient.SqlDataAdapter($cmd)
        $dataset = New-Object System.Data.DataSet
        $adapter.Fill($dataset) | Out-Null
        $conn.Close()
        
        $table = $dataset.Tables[0]
        $rows = @()
        foreach ($row in $table.Rows) {
            $obj = [ordered]@{}
            foreach ($col in $table.Columns) {
                $val = $row[$col.ColumnName]
                if ($val -eq [DBNull]::Value) { $val = $null }
                $obj[$col.ColumnName] = $val
            }
            $rows += $obj
        }
        return ($rows | ConvertTo-Json -Depth 5 -Compress)
    } catch {
        Write-Host 'SQL Query Exception Error' -ForegroundColor Red
        return '[]'
    }
}

function Execute-SqlNonQuery([string]$query) {
    try {
        $conn = New-Object System.Data.SqlClient.SqlConnection($connectionString)
        $conn.Open()
        $cmd = $conn.CreateCommand()
        $cmd.CommandText = $query
        $cmd.ExecuteNonQuery() | Out-Null
        $conn.Close()
        return $true
    } catch {
        Write-Host 'SQL Execute Exception Error' -ForegroundColor Red
        return $false
    }
}

$identityCols = @('ma_cuoc_xe', 'ma_gia_cuoc', 'ma_nguoi_dung', 'ma_vi', 'ma_giao_dich', 'ma_khuyen_mai', 'ma_nhat_ky', 'ma_thanh_toan', 'ma_danh_gia', 'ma_thong_bao')

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    
    $response.AddHeader('Access-Control-Allow-Origin', '*')
    $response.AddHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
    $response.AddHeader('Access-Control-Allow-Headers', 'Content-Type')

    if ($request.HttpMethod -eq 'OPTIONS') {
        $response.StatusCode = 200
        $response.Close()
        continue
    }

    $rawUrl = $request.RawUrl.Split('?')[0]

    if ($rawUrl.StartsWith('/api/data') -and $request.HttpMethod -eq 'GET') {
        $tableName = $request.QueryString['table']
        if (-not $tableName) { $tableName = 'BangGiaCuoc' }
        
        $jsonResult = Execute-SqlQuery "SELECT * FROM dbo.[$tableName]"
        $buffer = [System.Text.Encoding]::UTF8.GetBytes($jsonResult)
        $response.ContentType = 'application/json; charset=utf-8'
        $response.ContentLength64 = $buffer.Length
        $response.OutputStream.Write($buffer, 0, $buffer.Length)
        $response.Close()
        continue
    }

    if ($rawUrl.StartsWith('/api/data') -and $request.HttpMethod -eq 'POST') {
        $reader = New-Object System.IO.StreamReader($request.InputStream, $request.ContentEncoding)
        $bodyJson = $reader.ReadToEnd()
        $reader.Close()

        $dataObj = $bodyJson | ConvertFrom-Json
        $tableName = $dataObj.table
        $fields = $dataObj.fields

        $cols = @()
        $vals = @()
        $hasIdentityCol = $false

        foreach ($prop in $fields.PSObject.Properties) {
            $colName = $prop.Name
            $val = $prop.Value

            if ($identityCols -contains $colName) {
                if ($null -ne $val -and "$val" -ne '' -and "$val" -ne '0') {
                    $hasIdentityCol = $true
                    $cols += "[$colName]"
                    $vals += "$val"
                }
                continue
            }

            $cols += "[$colName]"
            
            if ($null -eq $val -or "$val" -eq '') {
                $vals += 'NULL'
            } elseif ($val -is [int] -or $val -is [double] -or $val -is [long] -or $val -is [decimal]) {
                $vals += "$val"
            } else {
                $strVal = "$val"
                $cleanVal = $strVal.Replace("'", "''")
                $vals += "N'$cleanVal'"
            }
        }

        $colsStr = $cols -join ', '
        $valsStr = $vals -join ', '

        if ($hasIdentityCol) {
            $insertQuery = "SET IDENTITY_INSERT dbo.[$tableName] ON; INSERT INTO dbo.[$tableName] ($colsStr) VALUES ($valsStr); SET IDENTITY_INSERT dbo.[$tableName] OFF;"
        } else {
            $insertQuery = "INSERT INTO dbo.[$tableName] ($colsStr) VALUES ($valsStr);"
        }
        
        Write-Host "Executing SQL: $insertQuery" -ForegroundColor Green
        $success = Execute-SqlNonQuery $insertQuery

        $resObj = @{ success = $success; message = 'Saved directly to SQL Server QLGRAB' }
        $resJson = $resObj | ConvertTo-Json
        $buffer = [System.Text.Encoding]::UTF8.GetBytes($resJson)
        $response.ContentType = 'application/json; charset=utf-8'
        $response.ContentLength64 = $buffer.Length
        $response.OutputStream.Write($buffer, 0, $buffer.Length)
        $response.Close()
        continue
    }

    $response.StatusCode = 404
    $response.Close()
}
