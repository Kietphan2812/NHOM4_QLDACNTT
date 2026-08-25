/* ==========================================================================
   GRAB RIDE PLATFORM - COMMON JAVASCRIPT
   Clean Navigation Header, Toast System & Footer
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
  renderFooter();
});

function renderNavbar() {
  const navContainer = document.getElementById('app-header');
  if (!navContainer) return;

  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  const navItems = [
    { href: 'index.html', label: 'Trang Chủ', icon: '🏠' },
    { href: 'user_app.html', label: 'Đặt Xe Khách Hàng', icon: '🚗' },
    { href: 'driver_app.html', label: 'Ứng Dụng Tài Xế', icon: '🛵' },
    { href: 'sql_management.html', label: 'Quản Lý CSDL QLGRAB (11 Bảng)', icon: '🗄️', badge: '11 Tables' }
  ];

  const linksHtml = navItems.map(item => {
    const isActive = (currentPath === item.href || (item.href === 'sql_management.html' && currentPath === 'architecture.html')) ? 'active' : '';
    const badgeHtml = item.badge ? `<span class="nav-badge">${item.badge}</span>` : '';
    return `
      <li class="nav-item">
        <a href="${item.href}" class="${isActive}">
          <span>${item.icon}</span>
          <span>${item.label}</span>
          ${badgeHtml}
        </a>
      </li>
    `;
  }).join('');

  navContainer.innerHTML = `
    <nav class="navbar">
      <a href="index.html" class="nav-brand">
        <div class="nav-logo-icon">🚖</div>
        <div class="nav-brand-title">
          <span>Grab</span>Ride
        </div>
      </a>
      <ul class="nav-links">
        ${linksHtml}
      </ul>
    </nav>
  `;
}

function renderFooter() {
  const footerContainer = document.getElementById('app-footer');
  if (!footerContainer) return;

  footerContainer.innerHTML = `
    <footer class="footer">
      <div class="container">
        <p style="font-weight: 700; color: #fff; font-size: 1rem; margin-bottom: 0.5rem;">
          <span style="color: var(--grab-green);">Grab</span>Ride - Nền Tảng Đặt Xe Công Nghệ Hàng Đầu Việt Nam
        </p>
        <p>© 2026 Dự Án Quản Lý Dự Án CNTT (Nhóm 4) • Kết nối CSDL SQL Server: <strong style="color:var(--grab-green);">QLGRAB</strong> (11 Bảng chuẩn 3NF)</p>
      </div>
    </footer>
  `;
}

window.showToast = function (message, type = 'info', title = 'Thông báo') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '🚨'
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div style="font-size: 1.2rem;">${icons[type] || 'ℹ️'}</div>
    <div>
      <div style="font-weight: 700; font-size: 0.85rem; color: #fff;">${title}</div>
      <div style="font-size: 0.8rem; color: #cbd5e1;">${message}</div>
    </div>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
};
