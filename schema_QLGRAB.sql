-- ============================================================================
-- HỆ THỐNG CƠ SỞ DỮ LIỆU: QLGRAB (RIDE-HAILING APP)
-- Chuẩn hóa 3NF - T-SQL Microsoft SQL Server
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'QLGRAB')
BEGIN
    CREATE DATABASE QLGRAB;
END
GO

USE QLGRAB;
GO

-- ----------------------------------------------------------------------------
-- 1. EPIC: USER & AUTHENTICATION
-- ----------------------------------------------------------------------------

IF OBJECT_ID('ThongBao', 'U') IS NOT NULL DROP TABLE ThongBao;
IF OBJECT_ID('DanhGia', 'U') IS NOT NULL DROP TABLE DanhGia;
IF OBJECT_ID('ThanhToan', 'U') IS NOT NULL DROP TABLE ThanhToan;
IF OBJECT_ID('NhatKyDiChuyen', 'U') IS NOT NULL DROP TABLE NhatKyDiChuyen;
IF OBJECT_ID('CuocXe', 'U') IS NOT NULL DROP TABLE CuocXe;
IF OBJECT_ID('LichSuGiaoDichVi', 'U') IS NOT NULL DROP TABLE LichSuGiaoDichVi;
IF OBJECT_ID('ViTaiXe', 'U') IS NOT NULL DROP TABLE ViTaiXe;
IF OBJECT_ID('HoSoTaiXe', 'U') IS NOT NULL DROP TABLE HoSoTaiXe;
IF OBJECT_ID('NguoiDung', 'U') IS NOT NULL DROP TABLE NguoiDung;
IF OBJECT_ID('BangGiaCuoc', 'U') IS NOT NULL DROP TABLE BangGiaCuoc;
IF OBJECT_ID('MaGiamGia', 'U') IS NOT NULL DROP TABLE MaGiamGia;
GO

CREATE TABLE NguoiDung (
    ma_nguoi_dung INT IDENTITY(1,1) PRIMARY KEY,
    ho_ten NVARCHAR(100) NOT NULL,
    so_dien_thoai VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NULL,
    mat_khau_hash VARCHAR(255) NOT NULL,
    vai_tro VARCHAR(20) NOT NULL CHECK (vai_tro IN ('KHACH_HANG', 'TAI_XE', 'QUAN_TRI')),
    trang_thai_tai_khoan VARCHAR(20) DEFAULT 'HOAT_DONG' CHECK (trang_thai_tai_khoan IN ('HOAT_DONG', 'KHOA', 'CHO_DUYET')),
    diem_danh_gia_trung_binh DECIMAL(3,2) DEFAULT 5.00,
    ngay_tao DATETIME DEFAULT GETDATE(),
    ngay_cap_nhat DATETIME DEFAULT GETDATE()
);

CREATE TABLE ThongBao (
    ma_thong_bao INT IDENTITY(1,1) PRIMARY KEY,
    ma_nguoi_dung INT NOT NULL,
    tieu_de NVARCHAR(200) NOT NULL,
    noi_dung NVARCHAR(MAX) NOT NULL,
    da_doc BIT DEFAULT 0,
    thoi_gian_gui DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ma_nguoi_dung) REFERENCES NguoiDung(ma_nguoi_dung) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- 2. EPIC: DRIVER
-- ----------------------------------------------------------------------------

CREATE TABLE HoSoTaiXe (
    ma_tai_xe INT PRIMARY KEY,
    so_bang_lai VARCHAR(50) UNIQUE NOT NULL,
    bien_so_xe VARCHAR(20) NOT NULL,
    ten_dong_xe NVARCHAR(50) NOT NULL,
    loai_xe VARCHAR(20) NOT NULL CHECK (loai_xe IN ('XE_MAY', 'OTO_4_CHO', 'OTO_7_CHO')),
    trang_thai VARCHAR(20) DEFAULT 'NGOAI_TUYEN' CHECK (trang_thai IN ('NGOAI_TUYEN', 'TRUC_TUYEN', 'DANG_BAN')),
    vi_do_hien_tai DECIMAL(9,6) NULL,
    kinh_do_hien_tai DECIMAL(9,6) NULL,
    cap_nhat_vi_tri_lan_cuoi DATETIME NULL,
    FOREIGN KEY (ma_tai_xe) REFERENCES NguoiDung(ma_nguoi_dung) ON DELETE CASCADE
);

CREATE TABLE ViTaiXe (
    ma_vi INT IDENTITY(1,1) PRIMARY KEY,
    ma_tai_xe INT UNIQUE NOT NULL,
    so_du DECIMAL(12,2) DEFAULT 0.00,
    ngay_cap_nhat DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ma_tai_xe) REFERENCES NguoiDung(ma_nguoi_dung) ON DELETE CASCADE
);

CREATE TABLE LichSuGiaoDichVi (
    ma_giao_dich INT IDENTITY(1,1) PRIMARY KEY,
    ma_vi INT NOT NULL,
    so_tien DECIMAL(12,2) NOT NULL,
    loai_giao_dich VARCHAR(20) CHECK (loai_giao_dich IN ('NAP_TIEN', 'TRU_HOA_HONG', 'RUT_TIEN', 'THUONG')),
    noi_dung NVARCHAR(255) NULL,
    thoi_gian DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ma_vi) REFERENCES ViTaiXe(ma_vi)
);

-- ----------------------------------------------------------------------------
-- 3. EPIC: ROUTING & TRIP MANAGEMENT
-- ----------------------------------------------------------------------------

CREATE TABLE BangGiaCuoc (
    ma_gia_cuoc INT IDENTITY(1,1) PRIMARY KEY,
    loai_xe VARCHAR(20) NOT NULL CHECK (loai_xe IN ('XE_MAY', 'OTO_4_CHO', 'OTO_7_CHO')),
    gia_mo_cua DECIMAL(12,2) NOT NULL,
    gia_moi_km_tiep_theo DECIMAL(12,2) NOT NULL,
    he_so_gio_cao_diem DECIMAL(3,2) DEFAULT 1.00,
    ngay_cap_nhat DATETIME DEFAULT GETDATE()
);

CREATE TABLE MaGiamGia (
    ma_khuyen_mai INT IDENTITY(1,1) PRIMARY KEY,
    code_giam_gia VARCHAR(20) UNIQUE NOT NULL,
    phan_tram_giam INT DEFAULT 0 CHECK (phan_tram_giam BETWEEN 0 AND 100),
    giam_toi_da DECIMAL(12,2) NOT NULL,
    gia_tri_don_toi_thieu DECIMAL(12,2) DEFAULT 0,
    ngay_bat_dau DATETIME NOT NULL,
    ngay_ket_thuc DATETIME NOT NULL,
    so_luong_con_lai INT NOT NULL
);

CREATE TABLE CuocXe (
    ma_cuoc_xe INT IDENTITY(1,1) PRIMARY KEY,
    ma_khach_hang INT NOT NULL,
    ma_tai_xe INT NULL,
    ma_khuyen_mai INT NULL,
    dia_chi_don NVARCHAR(255) NOT NULL,
    vi_do_don DECIMAL(9,6) NOT NULL,
    kinh_do_don DECIMAL(9,6) NOT NULL,
    dia_chi_tra NVARCHAR(255) NOT NULL,
    vi_do_tra DECIMAL(9,6) NOT NULL,
    kinh_do_tra DECIMAL(9,6) NOT NULL,
    quang_duong_km DECIMAL(5,2) NOT NULL,
    thoi_gian_du_kien_phut INT NOT NULL,
    gia_cuoc_goc DECIMAL(12,2) NOT NULL,
    so_tien_giam DECIMAL(12,2) DEFAULT 0.00,
    tong_tien_thanhtoan DECIMAL(12,2) NOT NULL,
    trang_thai VARCHAR(20) DEFAULT 'DANG_DAT' 
        CHECK (trang_thai IN ('DANG_DAT', 'DA_NHAN', 'DA_DEN_DIEM_DON', 'DANG_DI', 'HOAN_THANH', 'HUY_BO')),
    ly_do_huy NVARCHAR(255) NULL,
    thoi_gian_dat DATETIME DEFAULT GETDATE(),
    thoi_gian_hoan_thanh DATETIME NULL,
    FOREIGN KEY (ma_khach_hang) REFERENCES NguoiDung(ma_nguoi_dung),
    FOREIGN KEY (ma_tai_xe) REFERENCES NguoiDung(ma_nguoi_dung),
    FOREIGN KEY (ma_khuyen_mai) REFERENCES MaGiamGia(ma_khuyen_mai)
);

CREATE TABLE NhatKyDiChuyen (
    ma_nhat_ky BIGINT IDENTITY(1,1) PRIMARY KEY,
    ma_cuoc_xe INT NOT NULL,
    vi_do DECIMAL(9,6) NOT NULL,
    kinh_do DECIMAL(9,6) NOT NULL,
    thoi_gian_ghi_nhan DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ma_cuoc_xe) REFERENCES CuocXe(ma_cuoc_xe) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- 4. EPIC: PAYMENT
-- ----------------------------------------------------------------------------

CREATE TABLE ThanhToan (
    ma_thanh_toan INT IDENTITY(1,1) PRIMARY KEY,
    ma_cuoc_xe INT UNIQUE NOT NULL,
    phuong_thuc VARCHAR(20) NOT NULL CHECK (phuong_thuc IN ('TIEN_MAT', 'MOMO', 'THE_NGAN_HANG', 'VI_DIEN_TU')),
    so_tien DECIMAL(12,2) NOT NULL,
    trang_thai VARCHAR(20) DEFAULT 'CHO_THANH_TOAN' CHECK (trang_thai IN ('CHO_THANH_TOAN', 'THANH_CONG', 'THAT_BAI', 'HOAN_TIEN')),
    ma_giao_dich_cong VARCHAR(100) NULL,
    thoi_gian_thanh_toan DATETIME NULL,
    FOREIGN KEY (ma_cuoc_xe) REFERENCES CuocXe(ma_cuoc_xe)
);

-- ----------------------------------------------------------------------------
-- 5. EPIC: RATING & REVIEWS
-- ----------------------------------------------------------------------------

CREATE TABLE DanhGia (
    ma_danh_gia INT IDENTITY(1,1) PRIMARY KEY,
    ma_cuoc_xe INT NOT NULL,
    ma_nguoi_danh_gia INT NOT NULL,
    ma_nguoi_nhan_danh_gia INT NOT NULL,
    so_sao INT NOT NULL CHECK (so_sao BETWEEN 1 AND 5),
    noi_dung_binh_luan NVARCHAR(500) NULL,
    ngay_danh_gia DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ma_cuoc_xe) REFERENCES CuocXe(ma_cuoc_xe),
    FOREIGN KEY (ma_nguoi_danh_gia) REFERENCES NguoiDung(ma_nguoi_dung),
    FOREIGN KEY (ma_nguoi_nhan_danh_gia) REFERENCES NguoiDung(ma_nguoi_dung)
);
GO

-- ----------------------------------------------------------------------------
-- SEED DATA SETUP FOR DATABASE QLGRAB
-- ----------------------------------------------------------------------------

INSERT INTO NguoiDung (ho_ten, so_dien_thoai, email, mat_khau_hash, vai_tro, trang_thai_tai_khoan, diem_danh_gia_trung_binh)
VALUES 
(N'Lê Văn An', '0901234567', 'an.le@gmail.com', '$2b$10$hashedpass1', 'KHACH_HANG', 'HOAT_DONG', 5.00),
(N'Nguyễn Văn Hùng', '0908123456', 'hung.nguyen@gmail.com', '$2b$10$hashedpass2', 'TAI_XE', 'HOAT_DONG', 4.90),
(N'Trần Minh Tuấn', '0937888999', 'tuan.tran@gmail.com', '$2b$10$hashedpass3', 'TAI_XE', 'HOAT_DONG', 4.95),
(N'Quản Trị Viên Nhóm 4', '0999888777', 'admin@qlgrab.vn', '$2b$10$hashedpass4', 'QUAN_TRI', 'HOAT_DONG', 5.00);

INSERT INTO HoSoTaiXe (ma_tai_xe, so_bang_lai, bien_so_xe, ten_dong_xe, loai_xe, trang_thai, vi_do_hien_tai, kinh_do_hien_tai)
VALUES 
(2, 'B2-892104912', '51H-892.41', N'Honda City (Trắng)', 'OTO_4_CHO', 'TRUC_TUYEN', 10.774000, 106.659000),
(3, 'B2-341902811', '51F-341.88', N'Toyota Vios (Bạc)', 'OTO_4_CHO', 'TRUC_TUYEN', 10.771000, 106.655000);

INSERT INTO ViTaiXe (ma_tai_xe, so_du)
VALUES 
(2, 1850000.00),
(3, 2400000.00);

INSERT INTO BangGiaCuoc (loai_xe, gia_mo_cua, gia_moi_km_tiep_theo, he_so_gio_cao_diem)
VALUES 
('XE_MAY', 14000.00, 5500.00, 1.00),
('OTO_4_CHO', 24000.00, 10500.00, 1.00),
('OTO_7_CHO', 30000.00, 13500.00, 1.00);

INSERT INTO MaGiamGia (code_giam_gia, phan_tram_giam, giam_toi_da, gia_tri_don_toi_thieu, ngay_bat_dau, ngay_ket_thuc, so_luong_con_lai)
VALUES 
('GRAB20', 20, 30000.00, 50000.00, GETDATE(), DATEADD(day, 30, GETDATE()), 100),
('GOJEKMOI', 50, 50000.00, 60000.00, GETDATE(), DATEADD(day, 30, GETDATE()), 50);

PRINT N'✅ Khởi tạo CSDL QLGRAB thành công với 11 Bảng chuẩn 3NF và dữ liệu mẫu!';
GO
