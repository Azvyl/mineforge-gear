/**
 * Modul Tur Panduan Interaktif (Guided Tour) - Vanilla JS
 * Menampilkan sorotan (bounding box highlight) bertema Bedrock Ore UI
 */
export class GuidedTour {
  constructor(steps, callbacks = {}) {
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
    this.showStep(0);
  }

  stop() {
    if (!this.isActive) return;
    this.isActive = false;
    if (this.overlayEl) {
      this.overlayEl.classList.add('hidden');
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

    const targetEl = document.querySelector(step.selector);
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
        <p class="tour-desc">${step.description}</p>
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
    const targetEl = document.querySelector(step.selector);
    if (!targetEl) return;

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
