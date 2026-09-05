/* ===================================================================
   GITMANHWA - UI.JS
   Komponen UI reusable: Toast, Modal, dan Loading
   =================================================================== */

// ===== TOAST NOTIFICATION =====
const Toast = {
  show(message, type = 'info', duration = 3000) {
    // Hapus toast lama jika ada
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    // Buat elemen toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = message;

    // Tambahkan ke body
    document.body.appendChild(toast);

    // Animasi masuk
    setTimeout(() => toast.classList.add('show'), 10);

    // Hapus setelah duration
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  success(message) {
    this.show(message, 'success');
  },
  error(message) {
    this.show(message, 'error');
  },
  info(message) {
    this.show(message, 'info');
  }
};

// ===== MODAL GENERIC =====
const Modal = {
  // Tampilkan modal dengan konten custom
  show(content, title = '') {
    let modal = document.querySelector('.custom-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'custom-modal';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-box">
        ${title ? `<h3 class="modal-title">${title}</h3>` : ''}
        <div class="modal-body">${content}</div>
        <button class="modal-close-btn">✕</button>
      </div>
    `;

    modal.style.display = 'flex';
    modal.querySelector('.modal-close-btn').addEventListener('click', () => this.hide());
    modal.querySelector('.modal-overlay').addEventListener('click', () => this.hide());
  },

  hide() {
    const modal = document.querySelector('.custom-modal');
    if (modal) modal.style.display = 'none';
  }
};

// ===== LOADING SPINNER =====
const Loading = {
  show() {
    let spinner = document.querySelector('.loading-overlay');
    if (!spinner) {
      spinner = document.createElement('div');
      spinner.className = 'loading-overlay';
      spinner.innerHTML = '<div class="spinner"></div>';
      document.body.appendChild(spinner);
    }
    spinner.style.display = 'flex';
  },

  hide() {
    const spinner = document.querySelector('.loading-overlay');
    if (spinner) spinner.style.display = 'none';
  }
};
