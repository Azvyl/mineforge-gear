/**
 * Modul Tur Panduan Interaktif (Guided Tour) - Vanilla JS
 * Menampilkan sorotan (bounding box highlight) bertema Bedrock Ore UI
 */

export const DEFAULT_TOUR_STEPS = [
  {
    selector: '#tourSortingPanel',
    title: '1. PANEL PENGURUTAN (SORTING)',
    description: 'Pilih algoritma Insertion Sort atau Selection Sort, tentukan properti (Harga, Rating, ID, atau Nama Produk) beserta arah urutannya, lalu klik "JALANKAN SORTING".'
  },
  {
    selector: '#tourSearchingPanel',
    title: '2. PANEL PENCARIAN (SEARCHING)',
    description: 'Gunakan Linear Search untuk pencarian sekuensial bebas, atau Binary Search untuk pencarian cepat (pastikan katalog sudah diurutkan terlebih dahulu).'
  },
  {
    selector: '#tourExecutionBar',
    title: '3. KONTROL GENERATOR & KECEPATAN',
    description: 'Atur jeda kecepatan animasi secara real-time, atau gunakan tombol << PREV, PAUSE/CONTINUE, NEXT >>, dan LEWATI >> untuk menganalisis langkah algoritma satu per satu.'
  },
  {
    selector: null,
    title: '4. TOMBOL PINTAS (KEYBOARD SHORTCUTS)',
    description: `
      <p style="margin-bottom: 0.65rem;">Kendalikan simulasi secara cepat menggunakan tombol keyboard:</p>
      <div class="tour-shortcuts-table">
        <div class="tour-shortcut-row">
          <span class="tour-key-badge"><kbd>[Space]</kbd></span>
          <span class="tour-key-desc">: Jeda / Lanjut animasi</span>
        </div>
        <div class="tour-shortcut-row">
          <span class="tour-key-badge"><kbd>[←]</kbd> (ArrowLeft)</span>
          <span class="tour-key-desc">: Langkah sebelumnya (Prev)</span>
        </div>
        <div class="tour-shortcut-row">
          <span class="tour-key-badge"><kbd>[→]</kbd> (ArrowRight)</span>
          <span class="tour-key-desc">: Langkah berikutnya (Next)</span>
        </div>
        <div class="tour-shortcut-row">
          <span class="tour-key-badge"><kbd>[Esc]</kbd></span>
          <span class="tour-key-desc">: Menutup modal/keranjang aktif</span>
        </div>
      </div>
    `
  },
  {
    selector: '#tourCatalogSection',
    title: '5. ETALASE KATALOG & DUALISASI MEMORI',
    description: 'Setiap kartu produk menampilkan alamat fisik slot memori array yang statis (Slot Addr: 0x7FFE...) dan alamat pointer objek struct di memori heap (Obj Ptr: 0x7FFE...).'
  },
  {
    selector: '#tourTerminalSection',
    title: '6. TERMINAL EKSEKUSI LOG',
    description: 'Mencatat setiap operasi perbandingan (COMPARE), pergeseran (SHIFT), pertukaran (SWAP), penyisipan (INSERT), dan pencocokan data secara berurutan.'
  },
  {
    selector: '#cartDrawer',
    title: '7. KERANJANG SINGLY LINKED LIST',
    description: 'Memvisualisasikan rantai pointer objek nyata di Heap Memory ([Head] -> Node -> [Tail] NULL) setiap kali Anda menambah atau menghapus barang belanjaan.'
  }
];

export class GuidedTour {
  constructor(steps = DEFAULT_TOUR_STEPS, callbacks = {}) {
    this.steps = steps;
    this.callbacks = callbacks;
    this.currentIndex = 0;
    this.isActive = false;

    this.overlayEl = null;
    this.spotlightEl = null;
    this.tooltipEl = null;

    this.boundReposition = () => {
      if (this.isActive) this.updatePosition();
    };

    this.boundKeyHandler = (e) => {
      if (!this.isActive) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        this.stop();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (this.currentIndex < this.steps.length - 1) {
          this.showStep(this.currentIndex + 1);
        } else {
          this.stop();
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (this.currentIndex > 0) {
          this.showStep(this.currentIndex - 1);
        }
      }
    };
  }

  initDOM() {
    if (this.overlayEl) return;

    this.overlayEl = document.createElement('div');
    this.overlayEl.className = 'ore-tour-overlay hidden';

    this.spotlightEl = document.createElement('div');
    this.spotlightEl.className = 'ore-tour-spotlight';

    this.tooltipEl = document.createElement('div');
    this.tooltipEl.className = 'ore-tour-tooltip';
    this.tooltipEl.setAttribute('role', 'dialog');
    this.tooltipEl.setAttribute('aria-modal', 'true');

    this.overlayEl.appendChild(this.spotlightEl);
    this.overlayEl.appendChild(this.tooltipEl);
    document.body.appendChild(this.overlayEl);

    window.addEventListener('resize', this.boundReposition);
    window.addEventListener('scroll', this.boundReposition, { passive: true });
  }

  start() {
    this.initDOM();
    this.isActive = true;
    this.currentIndex = 0;
    this.overlayEl.classList.remove('hidden');
    window.addEventListener('keydown', this.boundKeyHandler);
    this.showStep(0);
  }

  stop() {
    if (!this.isActive) return;
    this.isActive = false;
    window.removeEventListener('keydown', this.boundKeyHandler);
    if (this.overlayEl) {
      this.overlayEl.classList.add('hidden');
      this.overlayEl.classList.remove('ore-tour-modal-mode');
    }
    if (this.spotlightEl) {
      this.spotlightEl.style.display = 'block';
    }
    if (this.tooltipEl) {
      this.tooltipEl.style.transform = '';
    }
    if (this.callbacks.onFinish) {
      this.callbacks.onFinish();
    }
  }

  showStep(index) {
    if (index < 0 || index >= this.steps.length) {
      this.stop();
      return;
    }

    this.currentIndex = index;
    const step = this.steps[index];

    if (typeof step.beforeEnter === 'function') {
      step.beforeEnter();
    }

    const targetEl = step.selector ? document.querySelector(step.selector) : null;
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    setTimeout(() => {
      if (!this.isActive) return;
      this.renderTooltipContent(step);
      this.updatePosition();
    }, 240);
  }

  renderTooltipContent(step) {
    const isFirst = this.currentIndex === 0;
    const isLast = this.currentIndex === this.steps.length - 1;

    this.tooltipEl.innerHTML = `
      <div class="tour-header">
        <span class="tour-step-badge">PANDUAN ${this.currentIndex + 1} / ${this.steps.length}</span>
        <button type="button" class="ore-close-btn tour-close-btn" data-tour-action="close" aria-label="Tutup Panduan">X</button>
      </div>
      <div class="tour-body">
        <h3 class="tour-title">${step.title}</h3>
        <div class="tour-desc">${step.description}</div>
      </div>
      <div class="tour-footer">
        <button type="button" class="btn btn-secondary btn-sm" data-tour-action="prev" ${isFirst ? 'disabled' : ''}>
          &lt;&lt; SEBELUMNYA
        </button>
        <button type="button" class="btn btn-primary btn-sm" data-tour-action="next">
          ${isLast ? 'SELESAI [OK]' : 'LANJUT &gt;&gt;'}
        </button>
      </div>
    `;

    this.tooltipEl.querySelector('[data-tour-action="close"]').addEventListener('click', () => this.stop());
    this.tooltipEl.querySelector('[data-tour-action="prev"]').addEventListener('click', () => this.showStep(this.currentIndex - 1));
    this.tooltipEl.querySelector('[data-tour-action="next"]').addEventListener('click', () => {
      if (isLast) this.stop();
      else this.showStep(this.currentIndex + 1);
    });
  }

  updatePosition() {
    const step = this.steps[this.currentIndex];
    const targetEl = step.selector ? document.querySelector(step.selector) : null;

    if (!targetEl) {
      this.spotlightEl.style.display = 'none';
      this.overlayEl.classList.add('ore-tour-modal-mode');

      const modalWidth = Math.min(480, window.innerWidth - 32);
      this.tooltipEl.style.width = `${modalWidth}px`;
      this.tooltipEl.style.top = '50%';
      this.tooltipEl.style.left = '50%';
      this.tooltipEl.style.transform = 'translate(-50%, -50%)';
      return;
    }

    this.spotlightEl.style.display = 'block';
    this.overlayEl.classList.remove('ore-tour-modal-mode');
    this.tooltipEl.style.transform = '';

    const rect = targetEl.getBoundingClientRect();
    const pad = 6;
    const top = Math.max(4, rect.top - pad);
    const left = Math.max(4, rect.left - pad);
    const width = Math.min(window.innerWidth - 8, rect.width + pad * 2);
    const height = rect.height + pad * 2;

    this.spotlightEl.style.top = `${top}px`;
    this.spotlightEl.style.left = `${left}px`;
    this.spotlightEl.style.width = `${width}px`;
    this.spotlightEl.style.height = `${height}px`;

    const tooltipWidth = Math.min(380, window.innerWidth - 24);
    this.tooltipEl.style.width = `${tooltipWidth}px`;
    const tooltipRect = this.tooltipEl.getBoundingClientRect();

    const isCartTarget = step.selector === '#cartDrawer' || rect.left > window.innerWidth / 2;

    let tooltipTop;
    let tooltipLeft;

    if (isCartTarget && rect.left - tooltipWidth - 16 >= 12) {
      tooltipLeft = rect.left - tooltipWidth - 16;
      tooltipTop = Math.max(16, Math.min(rect.top + 24, window.innerHeight - tooltipRect.height - 16));
    } else {
      tooltipTop = rect.bottom + 14;
      if (tooltipTop + tooltipRect.height > window.innerHeight - 12) {
        tooltipTop = Math.max(12, rect.top - tooltipRect.height - 14);
      }

      tooltipLeft = rect.left;
      if (tooltipLeft + tooltipWidth > window.innerWidth - 12) {
        tooltipLeft = window.innerWidth - tooltipWidth - 12;
      }
      tooltipLeft = Math.max(12, tooltipLeft);
    }

    this.tooltipEl.style.top = `${tooltipTop}px`;
    this.tooltipEl.style.left = `${tooltipLeft}px`;
  }
}
