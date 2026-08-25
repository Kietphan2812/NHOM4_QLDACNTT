/* ==========================================================================
   GRAB RIDE PLATFORM - USER APP INTERACTIVE LOGIC
   Real-World Geocoding Autocomplete (OpenStreetMap Nominatim), Distance & GPS Map
   ========================================================================== */

const BANG_GIA_CUOC = {
  'XE_MAY': { name: 'GrabBike', icon: '🛵', gia_mo_cua: 14000, gia_moi_km_tiep_theo: 5500, he_so_gio_cao_diem: 1.0 },
  'OTO_4_CHO': { name: 'GrabCar 4 Chỗ', icon: '🚗', gia_mo_cua: 24000, gia_moi_km_tiep_theo: 10500, he_so_gio_cao_diem: 1.0 },
  'OTO_7_CHO': { name: 'GrabCar 7 Chỗ', icon: '🚐', gia_mo_cua: 30000, gia_moi_km_tiep_theo: 13500, he_so_gio_cao_diem: 1.0 },
  'OTO_PREMIUM': { name: 'GrabCar Premium (VF8)', icon: '🚘', gia_mo_cua: 45000, gia_moi_km_tiep_theo: 18000, he_so_gio_cao_diem: 1.2 }
};

const MA_GIAM_GIA_DB = {
  'GRAB20': { phan_tram: 20, giam_toi_da: 30000, don_toi_thieu: 50000, code: 'GRAB20' },
  'GOJEKMOI': { phan_tram: 50, giam_toi_da: 50000, don_toi_thieu: 60000, code: 'GOJEKMOI' },
  'HE2026': { phan_tram: 15, giam_toi_da: 25000, don_toi_thieu: 40000, code: 'HE2026' }
};

let bookingState = {
  step: 'SELECT_LOCATION',
  khachHang: { id: 1, ten: 'Lê Văn An', phone: '0901234567' },
  diaChiDon: 'Đại Học Bách Khoa TP.HCM',
  viDoDon: 10.7721,
  kinhDoDon: 106.6578,
  diaChiTra: 'Sân Bay Tân Sơn Nhất',
  viDoTra: 10.8185,
  kinhDoTra: 106.6588,
  quangDuongKm: 7.4,
  thoiGianDuKienPhut: 18,
  loaiXe: 'OTO_4_CHO',
  appliedPromo: null,
  phuongThucThanhToan: 'MOMO',
  
  giaCuocGoc: 80700,
  soTienGiam: 0,
  tongTienThanhToan: 80700,
  
  cuocXeId: null,
  driver: null,
  tripInterval: null,
  progressPercent: 0
};

const MOCK_DRIVERS_SQL = [
  { maTaiXe: 101, hoTen: 'Nguyễn Văn Hùng', phone: '0908.123.456', bienSoXe: '51H-892.41', tenDongXe: 'Honda City (Trắng)', loaiXe: 'OTO_4_CHO', diemDanhGia: 4.9 },
  { maTaiXe: 102, hoTen: 'Trần Minh Tuấn', phone: '0937.888.999', bienSoXe: '51F-341.88', tenDongXe: 'Toyota Vios (Bạc)', loaiXe: 'OTO_4_CHO', diemDanhGia: 4.95 }
];

let leafletMap = null;
let pickupMarker = null;
let dropoffMarker = null;
let routePolyline = null;
let carMarker = null;

let pickupDebounceTimer = null;
let dropoffDebounceTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  initUserApp();
  setupGeocodingAutocomplete();
});

function initUserApp() {
  updateFareEstimates();
  initLeafletRealMap();
}

/* HAVERSINE REAL DISTANCE CALCULATION (in KM) */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in KM
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return Math.max(0.5, Math.round(distance * 10) / 10);
}

/* NOMINATIM OPENSTREETMAP GEOCODING AUTOCOMPLETE */
function setupGeocodingAutocomplete() {
  const pickupInput = document.getElementById('input-pickup');
  const dropoffInput = document.getElementById('input-dropoff');
  const pickupSuggestions = document.getElementById('pickup-suggestions');
  const dropoffSuggestions = document.getElementById('dropoff-suggestions');

  if (pickupInput) {
    pickupInput.addEventListener('input', (e) => {
      clearTimeout(pickupDebounceTimer);
      const query = e.target.value.trim();
      if (query.length < 3) {
        if (pickupSuggestions) pickupSuggestions.style.display = 'none';
        return;
      }
      pickupDebounceTimer = setTimeout(() => {
        fetchRealWorldLocations(query, pickupSuggestions, 'PICKUP');
      }, 350);
    });
  }

  if (dropoffInput) {
    dropoffInput.addEventListener('input', (e) => {
      clearTimeout(dropoffDebounceTimer);
      const query = e.target.value.trim();
      if (query.length < 3) {
        if (dropoffSuggestions) dropoffSuggestions.style.display = 'none';
        return;
      }
      dropoffDebounceTimer = setTimeout(() => {
        fetchRealWorldLocations(query, dropoffSuggestions, 'DROPOFF');
      }, 350);
    });
  }

  // Close suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (pickupSuggestions && !pickupInput.contains(e.target) && !pickupSuggestions.contains(e.target)) {
      pickupSuggestions.style.display = 'none';
    }
    if (dropoffSuggestions && !dropoffInput.contains(e.target) && !dropoffSuggestions.contains(e.target)) {
      dropoffSuggestions.style.display = 'none';
    }
  });
}

function fetchRealWorldLocations(query, container, type) {
  // Nominatim OpenStreetMap Search API
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (!data || data.length === 0) {
        container.innerHTML = `<div class="suggestion-item">Không tìm thấy địa điểm '${query}'</div>`;
        container.style.display = 'block';
        return;
      }

      container.innerHTML = data.map(item => {
        const shortName = item.display_name.split(',')[0];
        return `
          <div class="suggestion-item" onclick="selectGeocodedLocation('${type}', '${escapeQuotes(item.display_name)}', ${item.lat}, ${item.lon})">
            <span>📍</span>
            <div>
              <strong style="color:#fff; display:block;">${shortName}</strong>
              <span style="font-size:0.75rem; color:#94a3b8;">${item.display_name}</span>
            </div>
          </div>
        `;
      }).join('');

      container.style.display = 'block';
    })
    .catch(err => {
      console.warn('Geocoding error:', err);
    });
}

function escapeQuotes(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function selectGeocodedLocation(type, fullName, lat, lon) {
  lat = parseFloat(lat);
  lon = parseFloat(lon);

  if (type === 'PICKUP') {
    bookingState.diaChiDon = fullName;
    bookingState.viDoDon = lat;
    bookingState.kinhDoDon = lon;
    document.getElementById('input-pickup').value = fullName;
    const box = document.getElementById('pickup-suggestions');
    if (box) box.style.display = 'none';
  } else {
    bookingState.diaChiTra = fullName;
    bookingState.viDoTra = lat;
    bookingState.kinhDoTra = lon;
    document.getElementById('input-dropoff').value = fullName;
    const box = document.getElementById('dropoff-suggestions');
    if (box) box.style.display = 'none';
  }

  // Recalculate real Haversine distance
  const realDist = calculateHaversineDistance(
    bookingState.viDoDon, bookingState.kinhDoDon,
    bookingState.viDoTra, bookingState.kinhDoTra
  );

  bookingState.quangDuongKm = realDist;
  bookingState.thoiGianDuKienPhut = Math.max(5, Math.round(realDist * 2.2));

  updateFareEstimates();
  updateLeafletRealMap();
  showToast(`Đã chọn địa điểm thật: ${fullName.split(',')[0]} (${realDist} km)`, 'success', 'GPS Real Location');
}

function selectPresetLocations(pickup, dropoff, distance, duration, lat1, lng1, lat2, lng2) {
  bookingState.diaChiDon = pickup;
  bookingState.diaChiTra = dropoff;
  bookingState.quangDuongKm = distance;
  bookingState.thoiGianDuKienPhut = duration;
  if (lat1) bookingState.viDoDon = lat1;
  if (lng1) bookingState.kinhDoDon = lng1;
  if (lat2) bookingState.viDoTra = lat2;
  if (lng2) bookingState.kinhDoTra = lng2;

  document.getElementById('input-pickup').value = pickup;
  document.getElementById('input-dropoff').value = dropoff;

  updateFareEstimates();
  updateLeafletRealMap();
  showToast(`Tuyến đường preset: ${pickup} ➔ ${dropoff}`, 'info');
}

function updateFareEstimates() {
  const dist = bookingState.quangDuongKm;

  Object.keys(BANG_GIA_CUOC).forEach(key => {
    const v = BANG_GIA_CUOC[key];
    let rawPrice = (dist <= 2) ? v.gia_mo_cua * v.he_so_gio_cao_diem : (v.gia_mo_cua + ((dist - 2) * v.gia_moi_km_tiep_theo)) * v.he_so_gio_cao_diem;
    const price = Math.round(rawPrice / 1000) * 1000;
    const priceElem = document.getElementById(`price-${key}`);
    if (priceElem) priceElem.innerText = `${price.toLocaleString('vi-VN')} VNĐ`;
  });

  const selectedConfig = BANG_GIA_CUOC[bookingState.loaiXe];
  let rawBasePrice = (dist <= 2) ? selectedConfig.gia_mo_cua * selectedConfig.he_so_gio_cao_diem : (selectedConfig.gia_mo_cua + ((dist - 2) * selectedConfig.gia_moi_km_tiep_theo)) * selectedConfig.he_so_gio_cao_diem;
  bookingState.giaCuocGoc = Math.round(rawBasePrice / 1000) * 1000;

  if (bookingState.appliedPromo) {
    const promo = bookingState.appliedPromo;
    if (bookingState.giaCuocGoc >= promo.don_toi_thieu) {
      let discount = Math.round((bookingState.giaCuocGoc * (promo.phan_tram / 100)) / 1000) * 1000;
      if (discount > promo.giam_toi_da) discount = promo.giam_toi_da;
      bookingState.soTienGiam = discount;
    } else {
      bookingState.soTienGiam = 0;
    }
  } else {
    bookingState.soTienGiam = 0;
  }

  bookingState.tongTienThanhToan = bookingState.giaCuocGoc - bookingState.soTienGiam;

  const basePriceElem = document.getElementById('base-fare-display');
  if (basePriceElem) basePriceElem.innerText = `${bookingState.giaCuocGoc.toLocaleString('vi-VN')} VNĐ`;

  const discountElem = document.getElementById('discount-fare-display');
  if (discountElem) discountElem.innerText = `-${bookingState.soTienGiam.toLocaleString('vi-VN')} VNĐ`;

  const totalPriceElem = document.getElementById('total-fare-display');
  if (totalPriceElem) totalPriceElem.innerText = `${bookingState.tongTienThanhToan.toLocaleString('vi-VN')} VNĐ`;

  const estInfoElem = document.getElementById('est-info-display');
  if (estInfoElem) {
    estInfoElem.innerText = `Khoảng cách địa lý thật: ${dist} km • Thời gian di chuyển dự kiến: ~${bookingState.thoiGianDuKienPhut} phút`;
  }
}

function applyPromoCode() {
  const codeInput = document.getElementById('input-promo-code');
  if (!codeInput) return;
  const code = codeInput.value.trim().toUpperCase();

  if (!code) {
    bookingState.appliedPromo = null;
    updateFareEstimates();
    showToast('Đã hủy mã giảm giá', 'info');
    return;
  }

  if (MA_GIAM_GIA_DB[code]) {
    bookingState.appliedPromo = MA_GIAM_GIA_DB[code];
    updateFareEstimates();
    showToast(`Áp dụng mã khuyễn mãi [${code}] thành công! Giảm ${bookingState.soTienGiam.toLocaleString('vi-VN')} VNĐ`, 'success');
  } else {
    showToast(`Mã giảm giá '${code}' không tồn tại!`, 'error');
  }
}

function setVehicle(key) {
  bookingState.loaiXe = key;
  document.querySelectorAll('.vehicle-option').forEach(el => el.classList.remove('selected'));
  const target = document.getElementById(`vehicle-opt-${key}`);
  if (target) target.classList.add('selected');
  updateFareEstimates();
}

function setPayment(method) {
  bookingState.phuongThucThanhToan = method;
  document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected'));
  const target = document.getElementById(`pay-opt-${method.toLowerCase()}`);
  if (target) target.classList.add('selected');
  showToast(`Phương thức thanh toán: ${method}`, 'success');
}

function startBookingProcess() {
  bookingState.step = 'SEARCHING_DRIVER';
  bookingState.cuocXeId = Math.floor(Math.random() * 9000) + 1000;
  
  document.getElementById('booking-main-card').style.display = 'none';
  document.getElementById('searching-card').style.display = 'block';
  document.getElementById('driver-matched-card').style.display = 'none';

  showToast(`Quét vị trí tài xế quanh tọa độ GPS (${bookingState.viDoDon}, ${bookingState.kinhDoDon})...`, 'info', 'Grab GPS');

  setTimeout(() => {
    matchDriver();
  }, 3500);
}

function matchDriver() {
  bookingState.step = 'ON_TRIP';
  const randomDriver = MOCK_DRIVERS_SQL[Math.floor(Math.random() * MOCK_DRIVERS_SQL.length)];
  bookingState.driver = randomDriver;

  document.getElementById('searching-card').style.display = 'none';
  document.getElementById('driver-matched-card').style.display = 'block';

  document.getElementById('driver-name').innerText = randomDriver.hoTen;
  document.getElementById('driver-plate').innerText = randomDriver.bienSoXe;
  document.getElementById('driver-model').innerText = randomDriver.tenDongXe;
  document.getElementById('driver-rating').innerText = `⭐ ${randomDriver.diemDanhGia} (1,420 chuyến)`;
  document.getElementById('driver-phone').innerText = randomDriver.phone;

  showToast(`Tài xế ${randomDriver.hoTen} đang đến điểm đón!`, 'success');
  simulateTripProgress();
}

function simulateTripProgress() {
  bookingState.progressPercent = 0;
  if (bookingState.tripInterval) clearInterval(bookingState.tripInterval);

  const statusText = document.getElementById('trip-status-text');
  const progressBar = document.getElementById('trip-progress-bar');

  bookingState.tripInterval = setInterval(() => {
    bookingState.progressPercent += 5;
    if (progressBar) progressBar.style.width = `${bookingState.progressPercent}%`;

    if (bookingState.progressPercent < 30) {
      if (statusText) statusText.innerText = '🛵 Tài xế đang di chuyển đến điểm đón (Cập nhật GPS thật)';
    } else if (bookingState.progressPercent < 90) {
      if (statusText) statusText.innerText = `🚗 Đang trong chuyến đi hướng về: ${bookingState.diaChiTra}`;
    } else if (bookingState.progressPercent >= 100) {
      clearInterval(bookingState.tripInterval);
      if (statusText) statusText.innerText = '✅ Đã đến điểm đến! Chuyến đi hoàn tất.';
      setTimeout(() => {
        completeTripAndShowRating();
      }, 1000);
    }
    
    animateCarOnRealMap(bookingState.progressPercent);
  }, 400);
}

function completeTripAndShowRating() {
  document.getElementById('driver-matched-card').style.display = 'none';
  document.getElementById('rating-modal').style.display = 'flex';
}

function submitRating(ratingStars) {
  document.getElementById('rating-modal').style.display = 'none';
  document.getElementById('booking-main-card').style.display = 'block';
  showToast(`Đã gửi đánh giá ${ratingStars} sao cho chuyến đi!`, 'success');
  bookingState.step = 'SELECT_LOCATION';
  animateCarOnRealMap(0);
}

/* LEAFLET REAL MAP RENDERER */
function initLeafletRealMap() {
  const container = document.getElementById('user-map-container');
  if (!container) return;

  container.innerHTML = `<div id="leaflet-real-map" style="width:100%; height:100%; border-radius: var(--radius-lg);"></div>`;

  if (typeof L === 'undefined') return;

  const pickupLat = bookingState.viDoDon;
  const pickupLng = bookingState.kinhDoDon;

  leafletMap = L.map('leaflet-real-map', {
    center: [pickupLat, pickupLng],
    zoom: 13,
    zoomControl: true
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(leafletMap);

  updateLeafletRealMap();
}

function updateLeafletRealMap() {
  if (!leafletMap || typeof L === 'undefined') return;

  const lat1 = bookingState.viDoDon;
  const lng1 = bookingState.kinhDoDon;
  const lat2 = bookingState.viDoTra;
  const lng2 = bookingState.kinhDoTra;

  if (pickupMarker) leafletMap.removeLayer(pickupMarker);
  if (dropoffMarker) leafletMap.removeLayer(dropoffMarker);
  if (routePolyline) leafletMap.removeLayer(routePolyline);
  if (carMarker) leafletMap.removeLayer(carMarker);

  const greenPinIcon = L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="background:#00b14f; width:34px; height:34px; border-radius:50%; border:3px solid #fff; display:flex; align-items:center; justify-content:center; font-size:17px; box-shadow:0 0 15px rgba(0,177,79,0.7);">📍</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });

  const redPinIcon = L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="background:#ef4444; width:34px; height:34px; border-radius:50%; border:3px solid #fff; display:flex; align-items:center; justify-content:center; font-size:17px; box-shadow:0 0 15px rgba(239,68,68,0.7);">🏁</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });

  pickupMarker = L.marker([lat1, lng1], { icon: greenPinIcon }).addTo(leafletMap)
    .bindPopup(`<b>📍 Điểm Đón:</b><br>${bookingState.diaChiDon}`).openPopup();

  dropoffMarker = L.marker([lat2, lng2], { icon: redPinIcon }).addTo(leafletMap)
    .bindPopup(`<b>🏁 Điểm Đến:</b><br>${bookingState.diaChiTra}`);

  const routeCoords = [
    [lat1, lng1],
    [lat1 + (lat2 - lat1) * 0.5, lng1 + (lng2 - lng1) * 0.5],
    [lat2, lng2]
  ];

  routePolyline = L.polyline(routeCoords, {
    color: '#00b14f',
    weight: 6,
    opacity: 0.85,
    dashArray: '8, 8'
  }).addTo(leafletMap);

  const bounds = L.latLngBounds([lat1, lng1], [lat2, lng2]);
  leafletMap.fitBounds(bounds, { padding: [50, 50] });
}

function animateCarOnRealMap(progressPercent) {
  if (!leafletMap || typeof L === 'undefined') return;

  const t = progressPercent / 100;
  const lat1 = bookingState.viDoDon;
  const lng1 = bookingState.kinhDoDon;
  const lat2 = bookingState.viDoTra;
  const lng2 = bookingState.kinhDoTra;

  const currentLat = lat1 + (lat2 - lat1) * t;
  const currentLng = lng1 + (lng2 - lng1) * t;

  if (carMarker) leafletMap.removeLayer(carMarker);

  if (progressPercent > 0) {
    const carIcon = L.divIcon({
      className: 'custom-car-marker',
      html: `<div style="background:#06b6d4; width:36px; height:36px; border-radius:50%; border:3px solid #fff; display:flex; align-items:center; justify-content:center; font-size:18px; box-shadow:0 0 20px rgba(6,182,212,0.8);">🚗</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    carMarker = L.marker([currentLat, currentLng], { icon: carIcon }).addTo(leafletMap);
    leafletMap.panTo([currentLat, currentLng]);
  }
}
