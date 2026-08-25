/* ==========================================================================
   NHÓM 4 - JIRA PROJECT MANAGEMENT BOARD (5 SQL EPICS ALIGNED)
   Epics: USER, DRIVER, ROUTING, PAYMENT, RATING
   ========================================================================== */

let jiraTasks = [
  // EPIC: USER & AUTH (NguoiDung, ThongBao)
  { id: 'USR-101', epic: 'USER', title: 'Thiết kế Bảng NguoiDung (xác thực Bcrypt & phân vai_tro)', priority: 'P0', points: 5, assignee: 'Lê Hoàng C', status: 'DONE' },
  { id: 'USR-102', epic: 'USER', title: 'Tạo Bảng ThongBao & Dịch vụ push thông báo hệ thống', priority: 'P1', points: 3, assignee: 'Vũ Hoàng E', status: 'DONE' },

  // EPIC: DRIVER (HoSoTaiXe, ViTaiXe, LichSuGiaoDichVi)
  { id: 'DRV-201', epic: 'DRIVER', title: 'Bảng HoSoTaiXe (Xác thực bằng lái, biển số, loai_xe)', priority: 'P0', points: 5, assignee: 'Lê Hoàng C', status: 'DONE' },
  { id: 'DRV-202', epic: 'DRIVER', title: 'Tích hợp ViTaiXe & Tự động trừ chiết khấu 15% (LichSuGiaoDichVi)', priority: 'P0', points: 8, assignee: 'Trần Thị B', status: 'IN PROGRESS' },

  // EPIC: ROUTING & TRIP (BangGiaCuoc, MaGiamGia, CuocXe, NhatKyDiChuyen)
  { id: 'ROUT-301', epic: 'ROUTING', title: 'Thuật toán tính cước tự động theo BangGiaCuoc & HeSoGioCaoDiem', priority: 'P0', points: 13, assignee: 'Trần Thị B', status: 'DONE' },
  { id: 'ROUT-302', epic: 'ROUTING', title: 'Xử lý mã giảm giá MaGiamGia (phan_tram_giam, giam_toi_da)', priority: 'P0', points: 5, assignee: 'Trần Thị B', status: 'IN PROGRESS' },
  { id: 'ROUT-303', epic: 'ROUTING', title: 'Ghi log tọa độ GPS realtime vào bảng NhatKyDiChuyen', priority: 'P1', points: 8, assignee: 'Phạm Minh D', status: 'TO DO' },

  // EPIC: PAYMENT (ThanhToan)
  { id: 'PAY-401', epic: 'PAYMENT', title: 'Tích hợp Cổng thanh toán ThanhToan (MOMO, TIEN_MAT, THE_NGAN_HANG)', priority: 'P0', points: 8, assignee: 'Trần Thị B', status: 'IN REVIEW' },
  { id: 'PAY-402', epic: 'PAYMENT', title: 'Dịch vụ Đối soát giao dịch tự động & Hoàn tiền (HOAN_TIEN)', priority: 'P2', points: 5, assignee: 'Nguyễn Văn A', status: 'TO DO' },

  // EPIC: RATING & REVIEWS (DanhGia)
  { id: 'RAT-501', epic: 'RATING', title: 'Bảng DanhGia (Gửi 1-5 so_sao & noi_dung_binh_luan sau chuyến)', priority: 'P1', points: 3, assignee: 'Vũ Hoàng E', status: 'DONE' }
];

let currentEpicFilter = 'ALL';

document.addEventListener('DOMContentLoaded', () => {
  renderJiraBoard();
});

function filterByEpic(epic) {
  currentEpicFilter = epic;
  document.querySelectorAll('.epic-filter-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`btn-epic-${epic.toLowerCase()}`);
  if (activeBtn) activeBtn.classList.add('active');

  renderJiraBoard();
  showToast(`Lọc Jira Board theo SQL Epic: ${epic}`, 'info');
}

function renderJiraBoard() {
  const columns = {
    'TO DO': document.getElementById('col-todo'),
    'IN PROGRESS': document.getElementById('col-in-progress'),
    'IN REVIEW': document.getElementById('col-in-review'),
    'DONE': document.getElementById('col-done')
  };

  Object.values(columns).forEach(col => {
    if (col) col.innerHTML = '';
  });

  const filteredTasks = jiraTasks.filter(t => currentEpicFilter === 'ALL' || t.epic === currentEpicFilter);

  const epicBadges = {
    USER: 'badge-green',
    DRIVER: 'badge-blue',
    ROUTING: 'badge-purple',
    PAYMENT: 'badge-amber',
    RATING: 'badge-red'
  };

  filteredTasks.forEach(task => {
    const card = document.createElement('div');
    card.className = 'card jira-task-card';
    card.style.padding = '1rem';
    card.style.marginBottom = '1rem';
    card.style.background = 'rgba(15, 23, 42, 0.7)';

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
        <span class="badge ${epicBadges[task.epic] || 'badge-blue'}">${task.epic}</span>
        <span style="font-family: var(--font-code); font-size: 0.75rem; color: var(--text-dim);">${task.id}</span>
      </div>
      
      <div style="font-weight: 700; color: #fff; font-size: 0.9rem; margin-bottom: 0.75rem; line-height: 1.4;">
        ${task.title}
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: var(--text-muted); border-top: 1px solid var(--border-color); padding-top: 0.6rem;">
        <div style="display: flex; align-items: center; gap: 0.4rem;">
          <span style="background: rgba(255,255,255,0.08); padding: 0.1rem 0.4rem; border-radius: 4px; font-weight: 600;">${task.priority}</span>
          <span>⚡ ${task.points} pts</span>
        </div>
        <div style="color: var(--secondary); font-weight: 600;">👤 ${task.assignee}</div>
      </div>

      <div style="display: flex; justify-content: space-around; margin-top: 0.75rem; padding-top: 0.5rem; border-top: 1px dashed rgba(255,255,255,0.08);">
        <button onclick="moveTaskStatus('${task.id}', -1); event.stopPropagation();" class="btn btn-secondary btn-sm" title="Chuyển sang cột trước">◀</button>
        <button onclick="moveTaskStatus('${task.id}', 1); event.stopPropagation();" class="btn btn-secondary btn-sm" title="Chuyển sang cột sau">▶</button>
      </div>
    `;

    if (columns[task.status]) {
      columns[task.status].appendChild(card);
    }
  });

  document.getElementById('count-todo').innerText = jiraTasks.filter(t => t.status === 'TO DO').length;
  document.getElementById('count-in-progress').innerText = jiraTasks.filter(t => t.status === 'IN PROGRESS').length;
  document.getElementById('count-in-review').innerText = jiraTasks.filter(t => t.status === 'IN REVIEW').length;
  document.getElementById('count-done').innerText = jiraTasks.filter(t => t.status === 'DONE').length;
}

function moveTaskStatus(taskId, direction) {
  const statusOrder = ['TO DO', 'IN PROGRESS', 'IN REVIEW', 'DONE'];
  const task = jiraTasks.find(t => t.id === taskId);
  if (!task) return;

  let currentIndex = statusOrder.indexOf(task.status);
  let newIndex = currentIndex + direction;

  if (newIndex >= 0 && newIndex < statusOrder.length) {
    task.status = statusOrder[newIndex];
    renderJiraBoard();
    showToast(`Task [${task.id}] ➔ Trạng thái: ${task.status}`, 'success');
  }
}

function openAddTaskModal() {
  document.getElementById('add-task-modal').style.display = 'flex';
}

function closeAddTaskModal() {
  document.getElementById('add-task-modal').style.display = 'none';
}

function createNewTask(event) {
  event.preventDefault();
  const title = document.getElementById('new-task-title').value;
  const epic = document.getElementById('new-task-epic').value;
  const priority = document.getElementById('new-task-priority').value;
  const points = parseInt(document.getElementById('new-task-points').value) || 3;
  const assignee = document.getElementById('new-task-assignee').value;

  const newId = `${epic.substring(0, 3)}-${Math.floor(Math.random() * 900) + 100}`;
  
  jiraTasks.push({
    id: newId,
    epic: epic,
    title: title,
    priority: priority,
    points: points,
    assignee: assignee,
    status: 'TO DO'
  });

  closeAddTaskModal();
  renderJiraBoard();
  showToast(`Đã tạo Task Jira mới: [${newId}] trong Epic SQL ${epic}!`, 'success', 'Jira Sprint Backlog');
}
