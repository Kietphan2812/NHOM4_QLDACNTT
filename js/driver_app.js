/* ==========================================================================
   GRAB RIDE PLATFORM - DRIVER APP INTERACTIVE LOGIC
   Real Leaflet OpenStreetMap GPS Integration for Driver Navigation
   ========================================================================== */

let driverState = {
  maTaiXe: 101,
  soBangLai: 'B2-892104912',
  bienSoXe: '51H-892.41',
  tenDongXe: 'Honda City (Trắng)',
  loaiXe: 'OTO_4_CHO',
  trangThai: 'TRUC_TUYEN',
  viDoHienTai: 10.7740,
  kinhDoHienTai: 106.6590,
  
  soDuVi: 1850000.00,
  earningsToday: 685000,
  tripsToday: 9,
  rating: 4.92,
  acceptanceRate: 98,

  currentTrip: null,
  countdownSec: 15,
  countdownInterval: null
};

let driverLeafletMap = null;
let driverPosMarker = null;

let lichSuGiaoDichViList = [
  { id: 1005, loaiGiaoDich: 'TRU_HOA_HONG', soTien: -13200, noi_dung: 'Chiết khấu 15% CuocXe #9080', thoiGian: '10:15 - Hôm nay' },
  { id: 1004, loaiGiaoDich: 'NAP_TIEN', soTien: 500000, noi_dung: 'Nạp tiền vào ví qua Banking', thoiGian: '08:30 - Hôm nay' }
];

const MOCK_INCOMING_RIDES_SQL = [
  { id: 'TRIP-9081', passenger: 'Nguyễn Thu Trang', pickup: '184 Nam Kỳ Khởi Nghĩa, Q.3', dropoff: 'Thảo Điền Pearl, Q.2', fare: 95000, distance: '6.2 km' },
  { id: 'TRIP-9082', passenger: 'Phạm Quốc Bảo', pickup: 'Chợ Bến Thành, Q.1', dropoff: 'Bệnh Viện Chợ Rẫy, Q.5', fare: 68000, distance: '4.5 km' }
];

document.addEventListener('DOMContentLoaded', () => {
  initDriverApp();
});

function initDriverApp() {
  updateDriverMetrics();
  renderWalletLedger();
  initDriverLeafletMap();
}

function toggleOnlineStatus() {
  driverState.trangThai = (driverState.trangThai === 'TRUC_TUYEN') ? 'NGOAI_TUYEN' : 'TRUC_TUYEN';

  const statusBadge = document.getElementById('driver-status-badge');
  const toggleBtn = document.getElementById('online-toggle-btn');

  if (driverState.trangThai === 'TRUC_TUYEN') {
    statusBadge.className = 'badge badge-green';
    statusBadge.innerText = '🟢 TRỰC TUYẾN (SẴN SÀNG NHẬN CUỐC)';
    toggleBtn.innerText = '🔴 Tắt Trực Tuyến';
    toggleBtn.className = 'btn btn-secondary';
    showToast('Tài xế đã BẬT trực tuyến GPS!', 'success');
  } else {
    statusBadge.className = 'badge badge-red';
    statusBadge.innerText = '🔴 NGOẠI TUYẾN (TẮT NHẬN CUỐC)';
    toggleBtn.innerText = '🟢 Bật Trực Tuyến';
    toggleBtn.className = 'btn btn-primary';
    showToast('Tài xế đã TẮT trực tuyến.', 'warning');
  }
}

function triggerMockRideRequest() {
  if (driverState.trangThai !== 'TRUC_TUYEN') {
    showToast('Vui lòng BẬT trực tuyến trước khi nhận cuốc!', 'warning');
    return;
  }

  const ride = MOCK_INCOMING_RIDES_SQL[Math.floor(Math.random() * MOCK_INCOMING_RIDES_SQL.length)];
  driverState.currentTrip = ride;
  driverState.countdownSec = 15;

  document.getElementById('modal-passenger-name').innerText = ride.passenger;
  document.getElementById('modal-pickup-loc').innerText = ride.pickup;
  document.getElementById('modal-dropoff-loc').innerText = ride.dropoff;
  document.getElementById('modal-fare').innerText = `${ride.fare.toLocaleString('vi-VN')} VNĐ`;
  document.getElementById('modal-dist').innerText = ride.distance;

  document.getElementById('ride-request-modal').style.display = 'flex';

  if (driverState.countdownInterval) clearInterval(driverState.countdownInterval);

  const countdownElem = document.getElementById('modal-countdown-num');
  countdownElem.innerText = driverState.countdownSec;

  driverState.countdownInterval = setInterval(() => {
    driverState.countdownSec--;
    countdownElem.innerText = driverState.countdownSec;
    if (driverState.countdownSec <= 0) {
      clearInterval(driverState.countdownInterval);
      rejectRideRequest(true);
    }
  }, 1000);
}

function acceptRideRequest() {
  if (driverState.countdownInterval) clearInterval(driverState.countdownInterval);
  document.getElementById('ride-request-modal').style.display = 'none';

  driverState.trangThai = 'DANG_BAN';
  const statusBadge = document.getElementById('driver-status-badge');
  if (statusBadge) {
    statusBadge.className = 'badge badge-amber';
    statusBadge.innerText = '🟡 ĐANG BẬN (DANG_BAN)';
  }

  const activeTripCard = document.getElementById('driver-active-trip-card');
  if (activeTripCard) {
    activeTripCard.style.display = 'block';
    document.getElementById('active-passenger').innerText = driverState.currentTrip.passenger;
    document.getElementById('active-pickup').innerText = driverState.currentTrip.pickup;
    document.getElementById('active-dropoff').innerText = driverState.currentTrip.dropoff;
    document.getElementById('active-fare').innerText = `${driverState.currentTrip.fare.toLocaleString('vi-VN')} VNĐ`;
  }

  showToast(`Tài xế đã nhận cuốc xe của ${driverState.currentTrip.passenger}!`, 'success', 'Nhận Cuốc Thành Công');
}

function rejectRideRequest(isTimeout = false) {
  if (driverState.countdownInterval) clearInterval(driverState.countdownInterval);
  document.getElementById('ride-request-modal').style.display = 'none';

  if (isTimeout) {
    showToast('Hết 15s đếm ngược! Chuyển cuốc sang tài xế khác.', 'warning');
  } else {
    showToast('Đã từ chối cuốc xe.', 'info');
  }
}

function completeDriverTrip() {
  const activeTripCard = document.getElementById('driver-active-trip-card');
  if (activeTripCard) activeTripCard.style.display = 'none';

  driverState.trangThai = 'TRUC_TUYEN';
  const statusBadge = document.getElementById('driver-status-badge');
  if (statusBadge) {
    statusBadge.className = 'badge badge-green';
    statusBadge.innerText = '🟢 TRỰC TUYẾN (SẴN SÀNG NHẬN CUỐC)';
  }

  if (driverState.currentTrip) {
    const fare = driverState.currentTrip.fare;
    const commission = Math.round(fare * 0.15);
    
    driverState.earningsToday += fare;
    driverState.tripsToday += 1;
    driverState.soDuVi -= commission;

    lichSuGiaoDichViList.unshift({
      id: Math.floor(Math.random() * 9000) + 1000,
      loaiGiaoDich: 'TRU_HOA_HONG',
      soTien: -commission,
      noi_dung: `Chiết khấu 15% cuốc xe ${driverState.currentTrip.id}`,
      thoiGian: 'Vừa xong'
    });

    updateDriverMetrics();
    renderWalletLedger();
  }

  showToast('Đã hoàn thành chuyến đi và cập nhật doanh thu vào Ví!', 'success');
}

function topupWallet() {
  const amount = 200000;
  driverState.soDuVi += amount;
  
  lichSuGiaoDichViList.unshift({
    id: Math.floor(Math.random() * 9000) + 1000,
    loaiGiaoDich: 'NAP_TIEN',
    soTien: amount,
    noi_dung: 'Nạp tiền vào Ví tài xế qua Banking',
    thoiGian: 'Vừa xong'
  });

  updateDriverMetrics();
  renderWalletLedger();
  showToast(`Nạp 200.000 VNĐ vào Ví thành công!`, 'success');
}

function withdrawWallet() {
  if (driverState.soDuVi < 100000) {
    showToast('Số dư Ví phải có ít nhất 100.000 VNĐ để rút!', 'warning');
    return;
  }

  const amount = 300000;
  driverState.soDuVi -= amount;

  lichSuGiaoDichViList.unshift({
    id: Math.floor(Math.random() * 9000) + 1000,
    loaiGiaoDich: 'RUT_TIEN',
    soTien: -amount,
    noi_dung: 'Rút tiền về Tài khoản Ngân hàng',
    thoiGian: 'Vừa xong'
  });

  updateDriverMetrics();
  renderWalletLedger();
  showToast(`Rút 300.000 VNĐ từ Ví thành công!`, 'success');
}

function updateDriverMetrics() {
  const earningsElem = document.getElementById('driver-earnings-today');
  const tripsElem = document.getElementById('driver-trips-today');
  const walletElem = document.getElementById('driver-wallet-balance');

  if (earningsElem) earningsElem.innerText = `${driverState.earningsToday.toLocaleString('vi-VN')} VNĐ`;
  if (tripsElem) tripsElem.innerText = `${driverState.tripsToday} chuyến`;
  if (walletElem) walletElem.innerText = `${driverState.soDuVi.toLocaleString('vi-VN')} VNĐ`;
}

function renderWalletLedger() {
  const ledgerContainer = document.getElementById('wallet-ledger-list');
  if (!ledgerContainer) return;

  const badgeTypes = {
    'NAP_TIEN': { class: 'badge-green', label: '+ NẠP TIỀN' },
    'TRU_HOA_HONG': { class: 'badge-red', label: '- CHIẾT KHẤU 15%' },
    'RUT_TIEN': { class: 'badge-purple', label: '- RÚT TIỀN' }
  };

  ledgerContainer.innerHTML = lichSuGiaoDichViList.slice(0, 4).map(item => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 0.8rem; background: rgba(15,23,42,0.6); border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
      <div>
        <div style="font-weight: 700; color: #fff; font-size: 0.85rem;">${item.noi_dung}</div>
        <div style="font-size: 0.75rem; color: var(--text-dim);">${item.thoiGian}</div>
      </div>
      <div style="text-align: right;">
        <div style="font-family: var(--font-code); font-weight: 800; font-size: 0.95rem; color: ${item.soTien > 0 ? 'var(--grab-green)' : 'var(--accent-red)'};">
          ${item.soTien > 0 ? '+' : ''}${item.soTien.toLocaleString('vi-VN')} VNĐ
        </div>
      </div>
    </div>
  `).join('');
}

/* LEAFLET REAL MAP FOR DRIVER */
function initDriverLeafletMap() {
  const container = document.getElementById('driver-map-container');
  if (!container) return;

  container.innerHTML = `<div id="driver-real-map" style="width:100%; height:100%; border-radius: var(--radius-lg);"></div>`;

  if (typeof L === 'undefined') return;

  const lat = driverState.viDoHienTai;
  const lng = driverState.kinhDoHienTai;

  driverLeafletMap = L.map('driver-real-map', {
    center: [lat, lng],
    zoom: 14,
    zoomControl: false
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(driverLeafletMap);

  const driverIcon = L.divIcon({
    className: 'custom-driver-icon',
    html: `<div style="background:#00b14f; width:34px; height:34px; border-radius:50%; border:3px solid #fff; display:flex; align-items:center; justify-content:center; font-size:16px; box-shadow:0 0 15px rgba(0,177,79,0.8);">🛵</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });

  driverPosMarker = L.marker([lat, lng], { icon: driverIcon }).addTo(driverLeafletMap)
    .bindPopup(`<b>📍 Vị Trí GPS Tài Xế:</b><br>${lat}, ${lng}`).openPopup();
}
