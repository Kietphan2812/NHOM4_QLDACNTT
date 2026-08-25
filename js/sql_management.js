/* ==========================================================================
   GRAB RIDE PLATFORM - SQL DATABASE MANAGEMENT HUB (11 TABLES)
   Direct Live Sync with SQL Server Database: QLGRAB
   ========================================================================== */

let activeSqlTable = 'BangGiaCuoc';

let qlgrabDatabaseState = {
  BangGiaCuoc: [
    { ma_gia_cuoc: 1, loai_xe: 'XE_MAY', gia_mo_cua: 14000, gia_moi_km_tiep_theo: 5500, he_so_gio_cao_diem: 1.0, ngay_cap_nhat: '2026-08-25' },
    { ma_gia_cuoc: 2, loai_xe: 'OTO_4_CHO', gia_mo_cua: 24000, gia_moi_km_tiep_theo: 10500, he_so_gio_cao_diem: 1.0, ngay_cap_nhat: '2026-08-25' },
    { ma_gia_cuoc: 3, loai_xe: 'OTO_7_CHO', gia_mo_cua: 30000, gia_moi_km_tiep_theo: 13500, he_so_gio_cao_diem: 1.0, ngay_cap_nhat: '2026-08-25' }
  ],
  CuocXe: [
    { ma_cuoc_xe: 1, ma_khach_hang: 1, ma_tai_xe: 2, dia_chi_don: 'Đại Học Bách Khoa (Q.10)', vi_do_don: 10.7721, kinh_do_don: 106.6578, dia_chi_tra: 'Sân Bay Tân Sơn Nhất', vi_do_tra: 10.8185, kinh_do_tra: 106.6588, quang_duong_km: 7.4, thoi_gian_du_kien_phut: 18, gia_cuoc_goc: 80700, so_tien_giam: 0, tong_tien_thanhtoan: 80700, trang_thai: 'HOAN_THANH' }
  ],
  DanhGia: [
    { ma_danh_gia: 1, ma_cuoc_xe: 1, ma_nguoi_danh_gia: 1, ma_nguoi_nhan_danh_gia: 2, so_sao: 5, noi_dung_binh_luan: 'Tài xế lái xe an toàn, phục vụ tốt!', ngay_danh_gia: '2026-08-25' }
  ],
  HoSoTaiXe: [
    { ma_tai_xe: 2, so_bang_lai: 'B2-892104912', bien_so_xe: '51H-892.41', ten_dong_xe: 'Honda City (Trắng)', loai_xe: 'OTO_4_CHO', trang_thai: 'TRUC_TUYEN', vi_do_hien_tai: 10.7740, kinh_do_hien_tai: 106.6590 },
    { ma_tai_xe: 3, so_bang_lai: 'B2-341902811', bien_so_xe: '51F-341.88', ten_dong_xe: 'Toyota Vios (Bạc)', loai_xe: 'OTO_4_CHO', trang_thai: 'TRUC_TUYEN', vi_do_hien_tai: 10.7710, kinh_do_hien_tai: 106.6550 }
  ],
  LichSuGiaoDichVi: [
    { ma_giao_dich: 1, ma_vi: 1, so_tien: -12105, loai_giao_dich: 'TRU_HOA_HONG', noi_dung: 'Chiết khấu 15% CuocXe #1', thoi_gian: '2026-08-25 09:28' }
  ],
  MaGiamGia: [
    { ma_khuyen_mai: 1, code_giam_gia: 'GRAB20', phan_tram_giam: 20, giam_toi_da: 30000, gia_tri_don_toi_thieu: 50000, ngay_bat_dau: '2026-08-01', ngay_ket_thuc: '2026-09-01', so_luong_con_lai: 100 },
    { ma_khuyen_mai: 2, code_giam_gia: 'GOJEKMOI', phan_tram_giam: 50, giam_toi_da: 50000, gia_tri_don_toi_thieu: 60000, ngay_bat_dau: '2026-08-01', ngay_ket_thuc: '2026-09-01', so_luong_con_lai: 50 }
  ],
  NguoiDung: [
    { ma_nguoi_dung: 1, ho_ten: 'Lê Văn An', so_dien_thoai: '0901234567', email: 'an.le@gmail.com', vai_tro: 'KHACH_HANG', trang_thai_tai_khoan: 'HOAT_DONG', diem_danh_gia_trung_binh: 5.0 },
    { ma_nguoi_dung: 2, ho_ten: 'Nguyễn Văn Hùng', so_dien_thoai: '0908123456', email: 'hung.nguyen@gmail.com', vai_tro: 'TAI_XE', trang_thai_tai_khoan: 'HOAT_DONG', diem_danh_gia_trung_binh: 4.9 },
    { ma_nguoi_dung: 3, ho_ten: 'Trần Minh Tuấn', so_dien_thoai: '0937888999', email: 'tuan.tran@gmail.com', vai_tro: 'TAI_XE', trang_thai_tai_khoan: 'HOAT_DONG', diem_danh_gia_trung_binh: 4.95 },
    { ma_nguoi_dung: 4, ho_ten: 'Quản Trị Viên Nhóm 4', so_dien_thoai: '0999888777', email: 'admin@qlgrab.vn', vai_tro: 'QUAN_TRI', trang_thai_tai_khoan: 'HOAT_DONG', diem_danh_gia_trung_binh: 5.0 }
  ],
  NhatKyDiChuyen: [
    { ma_nhat_ky: 1, ma_cuoc_xe: 1, vi_do: 10.7721, kinh_do: 106.6578, thoi_gian_ghi_nhan: '2026-08-25 09:20' }
  ],
  ThanhToan: [
    { ma_thanh_toan: 1, ma_cuoc_xe: 1, phuong_thuc: 'MOMO', so_tien: 80700, trang_thai: 'THANH_CONG', ma_giao_dich_cong: 'MOMO_8819231' }
  ],
  ThongBao: [
    { ma_thong_bao: 1, ma_nguoi_dung: 1, tieu_de: 'Mã giảm giá GRAB20', noi_dung: 'Bạn được tặng mã giảm 20% max 30k', da_doc: 0, thoi_gian_gui: '2026-08-25' }
  ],
  ViTaiXe: [
    { ma_vi: 1, ma_tai_xe: 2, so_du: 1850000, ngay_cap_nhat: '2026-08-25' },
    { ma_vi: 2, ma_tai_xe: 3, so_du: 2400000, ngay_cap_nhat: '2026-08-25' }
  ]
};

document.addEventListener('DOMContentLoaded', async () => {
  await loadLiveSqlData();
  renderActiveSqlTable();
});

async function loadLiveSqlData() {
  if (window.SqlConnector) {
    const liveData = await window.SqlConnector.getTableData(activeSqlTable);
    if (liveData && liveData.length > 0) {
      qlgrabDatabaseState[activeSqlTable] = liveData;
    }
  }
}

async function switchSqlTable(tableName) {
  activeSqlTable = tableName;
  document.querySelectorAll('.sql-table-tab').forEach(tab => tab.classList.remove('active'));
  
  const currentTabBtn = Array.from(document.querySelectorAll('.sql-table-tab')).find(b => b.innerText.includes(tableName));
  if (currentTabBtn) currentTabBtn.classList.add('active');

  await loadLiveSqlData();
  renderActiveSqlTable();
}

function renderActiveSqlTable() {
  const titleElem = document.getElementById('active-table-title');
  const countBadge = document.getElementById('active-table-count-badge');
  const wrapper = document.getElementById('sql-table-data-wrapper');

  if (!wrapper) return;

  const dataList = qlgrabDatabaseState[activeSqlTable] || [];

  if (titleElem) titleElem.innerText = `Danh Sách Bản Ghi: dbo.${activeSqlTable}`;
  if (countBadge) countBadge.innerText = `${dataList.length} Bản Ghi`;

  if (dataList.length === 0) {
    wrapper.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: #94a3b8;">
        <div>📭 Chưa có bản ghi nào trong bảng dbo.${activeSqlTable}</div>
        <button class="btn btn-grab btn-sm" style="margin-top: 1rem;" onclick="openAddDataModal()">➕ Thêm Bản Ghi Mới</button>
      </div>
    `;
    return;
  }

  const columns = Object.keys(dataList[0]);

  const headersHtml = columns.map(col => `<th>${col}</th>`).join('') + '<th style="text-align: right;">Thao tác</th>';
  
  const rowsHtml = dataList.map((row, idx) => {
    const cellsHtml = columns.map(col => {
      let val = row[col];
      if (typeof val === 'number' && col.includes('tien')) val = `${val.toLocaleString('vi-VN')} VNĐ`;
      return `<td>${val !== null && val !== undefined ? val : '<span style="color:#64748b;">NULL</span>'}</td>`;
    }).join('');

    return `
      <tr>
        ${cellsHtml}
        <td style="text-align: right; white-space: nowrap;">
          <button class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;" onclick="editRecordIndex(${idx})">✏️ Sửa</button>
          <button class="btn btn-danger btn-sm" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;" onclick="deleteRecordIndex(${idx})">🗑️ Xóa</button>
        </td>
      </tr>
    `;
  }).join('');

  wrapper.innerHTML = `
    <table class="custom-table">
      <thead><tr>${headersHtml}</tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  `;
}

function openAddDataModal() {
  const modal = document.getElementById('add-record-modal');
  const title = document.getElementById('modal-form-title');
  const container = document.getElementById('form-fields-container');

  if (!modal || !container) return;

  if (title) title.innerText = `➕ Thêm Bản Ghi Mới Vào dbo.${activeSqlTable}`;

  const dataList = qlgrabDatabaseState[activeSqlTable] || [];
  let sampleRecord = dataList[0] || { ma_id: 1, ten: '' };

  const fieldsHtml = Object.keys(sampleRecord).map(key => `
    <div>
      <label style="display: block; font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.3rem; font-weight: 600;">
        ${key}:
      </label>
      <input type="text" name="${key}" placeholder="Nhập giá trị cho ${key}" 
        style="width: 100%; padding: 0.7rem; background: #090d16; border: 1px solid var(--border-color); border-radius: var(--radius-sm); color: #fff; font-family: var(--font-main);">
    </div>
  `).join('');

  container.innerHTML = fieldsHtml;
  modal.style.display = 'flex';
}

function closeAddDataModal() {
  const modal = document.getElementById('add-record-modal');
  if (modal) modal.style.display = 'none';
}

async function saveRecordToSql(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const newObj = {};

  formData.forEach((val, key) => {
    if (val !== '') {
      newObj[key] = isNaN(val) ? val : Number(val);
    }
  });

  if (!qlgrabDatabaseState[activeSqlTable]) qlgrabDatabaseState[activeSqlTable] = [];
  qlgrabDatabaseState[activeSqlTable].push(newObj);

  closeAddDataModal();
  renderActiveSqlTable();

  // DIRECT REAL-TIME SAVE TO POWERSHELL SERVER & SQL SERVER QLGRAB
  if (window.SqlConnector) {
    const saved = await window.SqlConnector.insertRecord(activeSqlTable, newObj);
    if (saved) {
      showToast(`ĐÃ LƯU TRỰC TIẾP VÀO SQL SERVER DATABASE QLGRAB!`, 'success', 'SQL Server Live Sync');
    } else {
      showToast(`Đã thêm bản ghi trên Web (Hãy bật server.ps1 để đồng bộ tự động)`, 'info');
    }
  }
}

function deleteRecordIndex(idx) {
  if (confirm(`Bạn có chắc muốn xóa bản ghi #${idx + 1} khỏi dbo.${activeSqlTable}?`)) {
    qlgrabDatabaseState[activeSqlTable].splice(idx, 1);
    renderActiveSqlTable();
    showToast(`Đã xóa bản ghi khỏi dbo.${activeSqlTable}`, 'info');
  }
}

function exportInsertStatements() {
  const dataList = qlgrabDatabaseState[activeSqlTable] || [];
  if (dataList.length === 0) {
    showToast('Bảng này chưa có dữ liệu để xuất script!', 'warning');
    return;
  }

  const columns = Object.keys(dataList[0]).join(', ');
  const valuesSql = dataList.map(row => {
    const vals = Object.values(row).map(v => typeof v === 'string' ? `N'${v.replace(/'/g, "''")}'` : v).join(', ');
    return `INSERT INTO dbo.[${activeSqlTable}] (${columns}) VALUES (${vals});`;
  }).join('\n');

  const fullSqlScript = `-- SCRIPT INSERT INTO BẢNG dbo.[${activeSqlTable}] CSDL QLGRAB\nUSE QLGRAB;\nGO\n\n${valuesSql}\nGO\n`;

  const blob = new Blob([fullSqlScript], { type: 'text/sql' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `INSERT_${activeSqlTable}_QLGRAB.sql`;
  a.click();

  showToast(`Đã xuất file script SQL cho dbo.${activeSqlTable}`, 'success');
}
