/* ==========================================================================
   NHÓM 4 - SQL SERVER DATABASE CONNECTOR (CSDL: QLGRAB)
   Real-time Query Engine & Simulated SQL Server State Manager
   ========================================================================== */

const QLGRAB_CONFIG = {
  server: 'localhost',
  database: 'QLGRAB',
  port: 1433,
  user: 'sa',
  password: 'Password123!',
  status: 'CONNECTED'
};

// In-Memory Real-time State representing SQL Server QLGRAB Tables
window.QLGRAB_DB = {
  NguoiDung: [
    { ma_nguoi_dung: 1, ho_ten: 'Lê Văn An', so_dien_thoai: '0901234567', email: 'an.le@gmail.com', vai_tro: 'KHACH_HANG', trang_thai_tai_khoan: 'HOAT_DONG', diem_danh_gia_trung_binh: 5.00 },
    { ma_nguoi_dung: 2, ho_ten: 'Nguyễn Văn Hùng', so_dien_thoai: '0908123456', email: 'hung.nguyen@gmail.com', vai_tro: 'TAI_XE', trang_thai_tai_khoan: 'HOAT_DONG', diem_danh_gia_trung_binh: 4.90 },
    { ma_nguoi_dung: 3, ho_ten: 'Trần Minh Tuấn', so_dien_thoai: '0937888999', email: 'tuan.tran@gmail.com', vai_tro: 'TAI_XE', trang_thai_tai_khoan: 'HOAT_DONG', diem_danh_gia_trung_binh: 4.95 }
  ],

  HoSoTaiXe: [
    { ma_tai_xe: 2, so_bang_lai: 'B2-892104912', bien_so_xe: '51H-892.41', ten_dong_xe: 'Honda City (Trắng)', loai_xe: 'OTO_4_CHO', trang_thai: 'TRUC_TUYEN', vi_do_hien_tai: 10.774000, kinh_do_hien_tai: 106.659000 },
    { ma_tai_xe: 3, so_bang_lai: 'B2-341902811', bien_so_xe: '51F-341.88', ten_dong_xe: 'Toyota Vios (Bạc)', loai_xe: 'OTO_4_CHO', trang_thai: 'TRUC_TUYEN', vi_do_hien_tai: 10.771000, kinh_do_hien_tai: 106.655000 }
  ],

  ViTaiXe: [
    { ma_vi: 1, ma_tai_xe: 2, so_du: 1850000.00 },
    { ma_vi: 2, ma_tai_xe: 3, so_du: 2400000.00 }
  ],

  LichSuGiaoDichVi: [
    { ma_giao_dich: 1005, ma_vi: 1, so_tien: -13200.00, loai_giao_dich: 'TRU_HOA_HONG', noi_dung: 'Chiết khấu 15% CuocXe #9080', thoi_gian: '2026-08-25 10:15' },
    { ma_giao_dich: 1004, ma_vi: 1, so_tien: 500000.00, loai_giao_dich: 'NAP_TIEN', noi_dung: 'Nạp tiền vào ví qua Banking', thoi_gian: '2026-08-25 08:30' }
  ],

  BangGiaCuoc: [
    { ma_gia_cuoc: 1, loai_xe: 'XE_MAY', gia_mo_cua: 14000.00, gia_moi_km_tiep_theo: 5500.00, he_so_gio_cao_diem: 1.00 },
    { ma_gia_cuoc: 2, loai_xe: 'OTO_4_CHO', gia_mo_cua: 24000.00, gia_moi_km_tiep_theo: 10500.00, he_so_gio_cao_diem: 1.00 },
    { ma_gia_cuoc: 3, loai_xe: 'OTO_7_CHO', gia_mo_cua: 30000.00, gia_moi_km_tiep_theo: 13500.00, he_so_gio_cao_diem: 1.00 }
  ],

  MaGiamGia: [
    { ma_khuyen_mai: 1, code_giam_gia: 'GRAB20', phan_tram_giam: 20, giam_toi_da: 30000.00, gia_tri_don_toi_thieu: 50000.00 },
    { ma_khuyen_mai: 2, code_giam_gia: 'GOJEKMOI', phan_tram_giam: 50, giam_toi_da: 50000.00, gia_tri_don_toi_thieu: 60000.00 }
  ],

  CuocXe: [
    { ma_cuoc_xe: 9080, ma_khach_hang: 1, ma_tai_xe: 2, dia_chi_don: 'Vincom Đồng Khởi (Q.1)', dia_chi_tra: 'Thảo Điền (Q.2)', quang_duong_km: 5.4, tong_tien_thanhtoan: 88000.00, trang_thai: 'HOAN_THANH' },
    { ma_cuoc_xe: 9079, ma_khach_hang: 1, ma_tai_xe: 3, dia_chi_don: 'Bến Xe Miền Đông', dia_chi_tra: 'Bách Khoa (Q.10)', quang_duong_km: 9.2, tong_tien_thanhtoan: 125000.00, trang_thai: 'HOAN_THANH' }
  ],

  ThanhToan: [
    { ma_thanh_toan: 501, ma_cuoc_xe: 9080, phuong_thuc: 'MOMO', so_tien: 88000.00, trang_thai: 'THANH_CONG', ma_giao_dich_cong: 'MM_992104' },
    { ma_thanh_toan: 502, ma_cuoc_xe: 9079, phuong_thuc: 'TIEN_MAT', so_tien: 125000.00, trang_thai: 'THANH_CONG', ma_giao_dich_cong: 'CASH_01' }
  ],

  DanhGia: [
    { ma_danh_gia: 301, ma_cuoc_xe: 9080, ma_nguoi_danh_gia: 1, ma_nguoi_nhan_danh_gia: 2, so_sao: 5, noi_dung_binh_luan: 'Tài xế lái xe cẩn thận, êm ái!' }
  ]
};

// SQL Query Parser & Execution Engine for QLGRAB
window.executeSqlOnQlgrab = function(sqlQuery) {
  const query = sqlQuery.trim();
  const upperQuery = query.toUpperCase();

  if (upperQuery.startsWith('SELECT')) {
    if (upperQuery.includes('FROM NGUOIDUNG')) return window.QLGRAB_DB.NguoiDung;
    if (upperQuery.includes('FROM HOSOTAIXE')) return window.QLGRAB_DB.HoSoTaiXe;
    if (upperQuery.includes('FROM VITAIXE')) return window.QLGRAB_DB.ViTaiXe;
    if (upperQuery.includes('FROM LICHSUGIAODICHVI')) return window.QLGRAB_DB.LichSuGiaoDichVi;
    if (upperQuery.includes('FROM BANGGIACUOC')) return window.QLGRAB_DB.BangGiaCuoc;
    if (upperQuery.includes('FROM MAGIAMGIA')) return window.QLGRAB_DB.MaGiamGia;
    if (upperQuery.includes('FROM CUOCXE')) return window.QLGRAB_DB.CuocXe;
    if (upperQuery.includes('FROM THANHTOAN')) return window.QLGRAB_DB.ThanhToan;
    if (upperQuery.includes('FROM DANHGIA')) return window.QLGRAB_DB.DanhGia;

    // Default SELECT
    return window.QLGRAB_DB.CuocXe;
  }

  if (upperQuery.startsWith('INSERT INTO CUOCXE')) {
    const newId = Math.floor(Math.random() * 9000) + 1000;
    const newRecord = {
      ma_cuoc_xe: newId,
      ma_khach_hang: 1,
      ma_tai_xe: 2,
      dia_chi_don: 'Bách Khoa (Q.10)',
      dia_chi_tra: 'Sân Bay TSN',
      quang_duong_km: 7.4,
      tong_tien_thanhtoan: 80700.00,
      trang_thai: 'DANG_DAT'
    };
    window.QLGRAB_DB.CuocXe.unshift(newRecord);
    return { status: 'SUCCESS', affectedRows: 1, insertedId: newId, message: '1 row inserted into CuocXe' };
  }

  return { status: 'SUCCESS', affectedRows: 1, message: `Executed query on database QLGRAB successfully.` };
};
