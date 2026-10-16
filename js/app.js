import { CartLinkedList } from './struct.js';
import { ProductRepository } from './repository.js';
import { insertionSort, selectionSort, linearSearch, binarySearch } from './algorithms.js';
import { GuidedTour } from './tour.js';

const TOUR_STORAGE_KEY = 'mineforge_tour_completed_v1';

let catalogArray = ProductRepository.getInitialClone();
const cartList = new CartLinkedList();

let stepHistory = [];
let currentStepIndex = -1;
let playbackTimer = null;
let isPaused = false;
let isPlaybackSessionActive = false;
let currentAlgorithmKind = null; // 'SORT' | 'SEARCH'
let currentAlgoMeta = { method: 'insertion', property: 'price', direction: 'asc' };
let lastExecutionDurationMs = '0.00';
let logEntryCount = 0;
let activeCodeLang = 'c';

const productGridEl = document.getElementById('productGrid');
const terminalOutputEl = document.getElementById('terminalOutput');
const logCounterBadgeEl = document.getElementById('logCounterBadge');
const engineStatusEl = document.getElementById('engineStatusIndicator');

const tourSortingPanelEl = document.getElementById('tourSortingPanel');
const tourSearchingPanelEl = document.getElementById('tourSearchingPanel');

const sortMethodEl = document.getElementById('sortMethod');
const sortPropertyEl = document.getElementById('sortProperty');
const sortDirectionEl = document.getElementById('sortDirection');
const btnRunSort = document.getElementById('btnRunSort');
const btnResetCatalog = document.getElementById('btnResetCatalog');

const searchMethodEl = document.getElementById('searchMethod');
const binaryPropertyFieldEl = document.getElementById('binaryPropertyField');
const searchPropertyEl = document.getElementById('searchProperty');
const searchKeywordEl = document.getElementById('searchKeyword');
const btnRunSearch = document.getElementById('btnRunSearch');

const speedControlBlockEl = document.getElementById('speedControlBlock');
const speedRangeInputEl = document.getElementById('speedRangeInput');
const speedValueLabelEl = document.getElementById('speedValueLabel');
const playbackModeRadios = document.querySelectorAll('input[name="playbackMode"]');

const metricActiveAlgoEl = document.getElementById('metricActiveAlgo');
const metricComparisonsEl = document.getElementById('metricComparisons');
const metricShiftsSwapsEl = document.getElementById('metricShiftsSwaps');
const metricDurationEl = document.getElementById('metricDuration');

const stepVisualizerBannerEl = document.getElementById('stepVisualizerBanner');
const stepTypeBadgeEl = document.getElementById('stepTypeBadge');
const stepProgressTextEl = document.getElementById('stepProgressText');
const stepHumanExplanationEl = document.getElementById('stepHumanExplanation');
const keyHolderBoxEl = document.getElementById('keyHolderBox');
const keyHolderLabelEl = document.getElementById('keyHolderLabel');
const keyHolderContentEl = document.getElementById('keyHolderContent');

const btnStepPrev = document.getElementById('btnStepPrev');
const btnStepPauseResume = document.getElementById('btnStepPauseResume');
const btnStepNext = document.getElementById('btnStepNext');
const btnStepStop = document.getElementById('btnStepStop');

const btnCopyLog = document.getElementById('btnCopyLog');
const btnClearLog = document.getElementById('btnClearLog');

const btnOpenCart = document.getElementById('btnOpenCart');
const btnCloseCart = document.getElementById('btnCloseCart');
const cartDrawerEl = document.getElementById('cartDrawer');
const cartDrawerBackdropEl = document.getElementById('cartDrawerBackdrop');
const cartBadgeCounterEl = document.getElementById('cartBadgeCounter');
const linkedListDiagramEl = document.getElementById('linkedListDiagram');
const linkedListNodeCountEl = document.getElementById('linkedListNodeCount');
const cartItemsContainerEl = document.getElementById('cartItemsContainer');
const cartTotalQtyEl = document.getElementById('cartTotalQty');
const cartSubtotalPriceEl = document.getElementById('cartSubtotalPrice');
const btnCheckoutOpen = document.getElementById('btnCheckoutOpen');

const checkoutModalBackdropEl = document.getElementById('checkoutModalBackdrop');
const btnCloseModal = document.getElementById('btnCloseModal');
const btnCancelCheckout = document.getElementById('btnCancelCheckout');
const btnConfirmPayment = document.getElementById('btnConfirmPayment');
const checkoutOrderListEl = document.getElementById('checkoutOrderList');
const checkoutTotalAmountEl = document.getElementById('checkoutTotalAmount');
const qrisImageEl = document.getElementById('qrisImage');

const receiptModalBackdropEl = document.getElementById('receiptModalBackdrop');
const btnCloseReceiptModal = document.getElementById('btnCloseReceiptModal');
const receiptInvoiceIdEl = document.getElementById('receiptInvoiceId');
const receiptTimestampEl = document.getElementById('receiptTimestamp');
const receiptQrImgEl = document.getElementById('receiptQrImg');
const receiptNodeListEl = document.getElementById('receiptNodeList');
const receiptGrandTotalEl = document.getElementById('receiptGrandTotal');
const btnFinishNewTransaction = document.getElementById('btnFinishNewTransaction');

const btnOpenCodeModal = document.getElementById('btnOpenCodeModal');
const codeModalBackdropEl = document.getElementById('codeModalBackdrop');
const btnCloseCodeModal = document.getElementById('btnCloseCodeModal');
const btnCloseCodeModalFooter = document.getElementById('btnCloseCodeModalFooter');
const tabBtnLangC = document.getElementById('tabBtnLangC');
const tabBtnLangJS = document.getElementById('tabBtnLangJS');
const codeTopicSelectEl = document.getElementById('codeTopicSelect');
const codeInspectorOutputEl = document.getElementById('codeInspectorOutput');
const btnCopySourceCode = document.getElementById('btnCopySourceCode');

const btnOpenInfoModal = document.getElementById('btnOpenInfoModal');
const btnCloseInfoModal = document.getElementById('btnCloseInfoModal');
const btnCloseInfoModalFooter = document.getElementById('btnCloseInfoModalFooter');
const infoModalBackdropEl = document.getElementById('infoModalBackdrop');

const btnStartTour = document.getElementById('btnStartTour');
const toastContainerEl = document.getElementById('toastContainer');

const CODE_SNIPPETS = {
  struct_pointer: {
    c: `// [BAHASA C] Definisi Struct Product & Singly Linked List CartNode
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    int id;
    char name[64];
    char category[32];
    double price;
    float rating;
    int stock;
    char simulatedAddress[16];
} Product;

typedef struct CartNode {
    Product product;
    int quantity;
    struct CartNode* next; // Pointer ke simpul berikutnya di Heap Memory
} CartNode;

void addCartNode(CartNode** headRef, Product item, int qty) {
    CartNode* newNode = (CartNode*)malloc(sizeof(CartNode));
    newNode->product = item;
    newNode->quantity = qty;
    newNode->next = NULL;

    if (*headRef == NULL) {
        *headRef = newNode;
        return;
    }
    CartNode* current = *headRef;
    while (current->next != NULL) {
        current = current->next;
    }
    current->next = newNode;
}`,
    js: `// [JAVASCRIPT ES6] Struct Product & Singly Linked List (js/struct.js)
export class Product {
  constructor(id, name, category, price, rating, stock, image, simulatedAddress) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.price = price;
    this.rating = rating;
    this.stock = stock;
    this.image = image;
    this.simulatedAddress = simulatedAddress;
  }
}

export class CartNode {
  constructor(product, quantity = 1) {
    this.product = product; // Referensi objek Product di Heap Memory
    this.quantity = quantity;
    this.next = null;       // Pointer menuju CartNode berikutnya
  }
}

export class CartLinkedList {
  constructor() {
    this.head = null;
    this.length = 0;
  }
}`
  },
  insertion_sort: {
    c: `// [BAHASA C] Algoritma Insertion Sort In-Place pada Array of Struct
void insertionSortByPrice(Product arr[], int n, int ascending) {
    for (int i = 1; i < n; i++) {
        Product key = arr[i];
        int j = i - 1;

        while (j >= 0 && (ascending ? (arr[j].price > key.price)
                                    : (arr[j].price < key.price))) {
            arr[j + 1] = arr[j]; // Geser elemen ke kanan (SHIFT)
            j = j - 1;
        }
        arr[j + 1] = key; // Sisipkan Key pada posisi yang tepat (INSERT)
    }
}`,
    js: `// [JAVASCRIPT ES6] Insertion Sort Generator (js/algorithms.js)
export function* insertionSort(items, property, direction = 'asc') {
  const arr = items;
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    yield { type: 'COMPARE', indices: { active: i, compare: j } };

    while (j >= 0 && (direction === 'asc'
      ? arr[j][property] > key[property]
      : arr[j][property] < key[property])) {
      arr[j + 1] = arr[j];
      yield { type: 'SHIFT', indices: { active: j + 1, compare: j } };
      j--;
    }
    arr[j + 1] = key;
    yield { type: 'INSERT', indices: { active: j + 1, compare: null } };
  }
}`
  },
  selection_sort: {
    c: `// [BAHASA C] Algoritma Selection Sort pada Array of Struct
void selectionSortByPrice(Product arr[], int n, int ascending) {
    for (int i = 0; i < n - 1; i++) {
        int targetIdx = i;
        for (int j = i + 1; j < n; j++) {
            int isBetter = ascending ? (arr[j].price < arr[targetIdx].price)
                                     : (arr[j].price > arr[targetIdx].price);
            if (isBetter) {
                targetIdx = j; // Kandidat nilai ekstrem baru (MIN_FOUND)
            }
        }
        if (targetIdx != i) {
            Product temp = arr[i];
            arr[i] = arr[targetIdx];
            arr[targetIdx] = temp; // Pertukaran posisi (SWAP)
        }
    }
}`,
    js: `// [JAVASCRIPT ES6] Selection Sort Generator (js/algorithms.js)
export function* selectionSort(items, property, direction = 'asc') {
  const arr = items;
  for (let i = 0; i < arr.length - 1; i++) {
    let targetIdx = i;
    for (let j = i + 1; j < arr.length; j++) {
      yield { type: 'COMPARE', indices: { active: targetIdx, compare: j } };
      const isBetter = direction === 'asc'
        ? arr[j][property] < arr[targetIdx][property]
        : arr[j][property] > arr[targetIdx][property];
      if (isBetter) {
        targetIdx = j;
        yield { type: 'MIN_FOUND', indices: { active: targetIdx, compare: i } };
      }
    }
    if (targetIdx !== i) {
      [arr[i], arr[targetIdx]] = [arr[targetIdx], arr[i]];
      yield { type: 'SWAP', indices: { active: i, compare: targetIdx } };
    }
  }
}`
  },
  searching: {
    c: `// [BAHASA C] Linear Search & Binary Search pada Array of Struct
int linearSearchById(Product arr[], int n, int targetId) {
    for (int i = 0; i < n; i++) {
        if (arr[i].id == targetId) return i; // FOUND
    }
    return -1;
}

int binarySearchById(Product arr[], int n, int targetId) {
    int low = 0, high = n - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid].id == targetId) return mid;
        if (arr[mid].id < targetId) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
    js: `// [JAVASCRIPT ES6] Linear & Binary Search Generator (js/algorithms.js)
export function* binarySearch(items, keyword, property = 'id') {
  const sortOrder = detectSortOrder(items, property);
  if (!sortOrder) {
    yield { type: 'NOT_SORTED', logMessage: 'Array belum terurut!' };
    return;
  }
  let low = 0, high = items.length - 1;
  const target = Number(keyword);
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    yield { type: 'CHECKING', indices: { active: mid, low, high } };
    if (items[mid][property] === target) {
      yield { type: 'FOUND', indices: { active: mid } };
      return;
    }
    if (items[mid][property] < target) low = mid + 1;
    else high = mid - 1;
  }
}`
  }
};

function formatIDR(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
}

function formatPropValue(product, prop) {
  if (!product) return '-';
  if (prop === 'price') return formatIDR(product.price);
  if (prop === 'rating') return `★ ${product.rating.toFixed(1)}`;
  return `ID:${product.id}`;
}

function generateVoxelProductSVG(product) {
  const paletteMap = {
    201: ['#3c8527', '#1e4513', 'CREEPER'],
    202: ['#38bdf8', '#0c4a6e', 'SWORD'],
    203: ['#52525b', '#18181b', 'ARMOR'],
    204: ['#dc2626', '#450a0a', 'REDSTONE'],
    205: ['#ec4899', '#500724', 'POTION'],
    206: ['#9333ea', '#2e1065', 'ENDER'],
    207: ['#65a30d', '#1a2e05', 'GRASS'],
    208: ['#0891b2', '#083344', 'STEVE'],
    209: ['#c026d3', '#4a044e', 'DRAGON'],
    210: ['#eab308', '#422006', 'STICKER']
  };
  const [primary, secondary, label] = paletteMap[product.id] || ['#3c8527', '#1e1e22', 'VOXEL'];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150">
    <rect width="200" height="150" fill="${secondary}"/>
    <rect x="62" y="18" width="76" height="76" fill="${primary}" stroke="#ffffff" stroke-width="4"/>
    <rect x="76" y="38" width="14" height="14" fill="#141416"/>
    <rect x="110" y="38" width="14" height="14" fill="#141416"/>
    <rect x="86" y="60" width="28" height="18" fill="#141416"/>
    <text x="100" y="122" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="14">${label} #${product.id}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function generateDummyQRISSVG() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220">
    <rect width="220" height="220" fill="#ffffff"/>
    <rect x="16" y="16" width="54" height="54" fill="none" stroke="#141416" stroke-width="8"/>
    <rect x="30" y="30" width="26" height="26" fill="#141416"/>
    <rect x="150" y="16" width="54" height="54" fill="none" stroke="#141416" stroke-width="8"/>
    <rect x="164" y="30" width="26" height="26" fill="#141416"/>
    <rect x="16" y="150" width="54" height="54" fill="none" stroke="#141416" stroke-width="8"/>
    <rect x="30" y="164" width="26" height="26" fill="#141416"/>
    <rect x="86" y="86" width="48" height="48" fill="#3c8527"/>
    <text x="110" y="115" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="13">QRIS</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

qrisImageEl.addEventListener('error', () => {
  qrisImageEl.src = generateDummyQRISSVG();
}, { once: true });

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast-item';
  toast.textContent = message;
  toastContainerEl.appendChild(toast);
  setTimeout(() => toast.remove(), 2600);
}

function getSelectedPlaybackMode() {
  return document.querySelector('input[name="playbackMode"]:checked')?.value || 'animated';
}

function getAnimationSpeedMs() {
  return Number(speedRangeInputEl.value) || 600;
}

function updateMetricsDisplay(algoLabel, comparisons = 0, shiftsOrSwaps = 0, durationMs = '0.00') {
  metricActiveAlgoEl.textContent = algoLabel;
  metricComparisonsEl.textContent = String(comparisons);
  metricShiftsSwapsEl.textContent = String(shiftsOrSwaps);
  metricDurationEl.textContent = `${durationMs} ms`;
}

function appendTerminalLog(message, stepType = 'INFO') {
  logEntryCount++;
  const line = document.createElement('div');
  line.className = 'log-line';

  if (stepType === 'COMPARE' || stepType === 'CHECKING') line.classList.add('log-compare');
  else if (stepType === 'SHIFT' || stepType === 'SWAP') line.classList.add('log-shift');
  else if (stepType === 'INSERT' || stepType === 'MIN_FOUND') line.classList.add('log-insert');
  else if (stepType === 'FOUND') line.classList.add('log-found');
  else if (stepType === 'COMPLETE') line.classList.add('log-complete');
  else if (stepType === 'NOT_SORTED') line.classList.add('log-warn');
  else line.classList.add('log-muted');

  const timeStr = new Date().toLocaleTimeString('id-ID', { hour12: false });
  line.textContent = `[${timeStr}] ${message}`;

  terminalOutputEl.appendChild(line);
  terminalOutputEl.scrollTop = terminalOutputEl.scrollHeight;
  logCounterBadgeEl.textContent = `${logEntryCount} BARIS LOG`;
}

/**
 * Mengunci atau membuka kembali seluruh input konfigurasi algoritma
 * selama proses playback (auto-run maupun dijeda) sedang aktif.
 */
function setAlgorithmControlsLock(locked) {
  isPlaybackSessionActive = locked;

  sortMethodEl.disabled = locked;
  sortPropertyEl.disabled = locked;
  sortDirectionEl.disabled = locked;
  btnRunSort.disabled = locked;

  searchMethodEl.disabled = locked;
  searchPropertyEl.disabled = locked;
  searchKeywordEl.disabled = locked;
  btnRunSearch.disabled = locked;

  playbackModeRadios.forEach(radio => {
    radio.disabled = locked;
  });

  tourSortingPanelEl.classList.toggle('panel-locked', locked);
  tourSearchingPanelEl.classList.toggle('panel-locked', locked);

  btnRunSort.textContent = locked && currentAlgorithmKind === 'SORT'
    ? 'SORTING AKTIF...'
    : 'JALANKAN SORTING';

  btnRunSearch.textContent = locked && currentAlgorithmKind === 'SEARCH'
    ? 'PENCARIAN AKTIF...'
    : 'CARI PRODUK';
}

/**
 * Sinkronisasi status slider kecepatan dan tombol playback
 * berdasarkan Mode Eksekusi (Animasi Interaktif vs Instan) serta progres langkah.
 */
function syncPlaybackAndModeUI() {
  const mode = getSelectedPlaybackMode();
  const isInstant = mode === 'instant';

  speedRangeInputEl.disabled = isInstant;
  speedControlBlockEl.classList.toggle('block-disabled', isInstant);

  if (isInstant || stepHistory.length === 0) {
    btnStepPrev.disabled = true;
    btnStepPauseResume.disabled = true;
    btnStepNext.disabled = true;
    btnStepStop.disabled = true;
    btnStepPauseResume.textContent = 'PAUSE';
    btnStepStop.textContent = 'SKIP >>';
    return;
  }

  const isAtFinalStep = currentStepIndex >= stepHistory.length - 1;
  btnStepPrev.disabled = currentStepIndex <= 0;
  btnStepNext.disabled = isAtFinalStep;
  btnStepPauseResume.disabled = false;
  btnStepStop.disabled = isAtFinalStep && !isPlaybackSessionActive;

  if (isAtFinalStep) {
    btnStepPauseResume.textContent = 'ULANGI';
    btnStepStop.textContent = 'SELESAI';
  } else {
    btnStepPauseResume.textContent = isPaused ? 'CONTINUE' : 'PAUSE';
    btnStepStop.textContent = 'SKIP >>';
  }
}

function buildEnrichedStepHistory(generator, kind, meta = {}) {
  const rawSteps = [];
  const t0 = performance.now();
  let res = generator.next();
  while (!res.done) {
    rawSteps.push(res.value);
    res = generator.next();
  }
  const t1 = performance.now();
  lastExecutionDurationMs = (t1 - t0).toFixed(2);

  const matchedSet = new Set();

  return rawSteps.map((step, index) => {
    const displayArray = [...step.arraySnapshot];
    let humanText = step.logMessage;
    const currentKeyProduct = step.keyProduct || null;

    if (kind === 'SORT') {
      const prop = meta.property || 'price';
      const isSelection = meta.method === 'selection';
      const targetRole = meta.direction === 'desc' ? 'maksimum' : 'minimum';

      if (step.type === 'COMPARE') {
        const cmpProduct = step.arraySnapshot[step.indices.compare];
        if (isSelection) {
          humanText = `Membandingkan kandidat ${targetRole} Indeks [${step.indices.active}] ('${currentKeyProduct.name}': ${formatPropValue(currentKeyProduct, prop)}) dengan Indeks [${step.indices.compare}] ('${cmpProduct.name}': ${formatPropValue(cmpProduct, prop)}).`;
        } else {
          humanText = `Membandingkan Key sementara ('${currentKeyProduct.name}': ${formatPropValue(currentKeyProduct, prop)}) pada slot [${step.indices.active}] dengan elemen Indeks [${step.indices.compare}] ('${cmpProduct.name}': ${formatPropValue(cmpProduct, prop)}).`;
        }
      } else if (step.type === 'MIN_FOUND') {
        humanText = `Kandidat ${targetRole} baru ditemukan pada Indeks [${step.indices.active}] ('${currentKeyProduct.name}' - ${formatPropValue(currentKeyProduct, prop)}).`;
      } else if (step.type === 'SHIFT') {
        const shiftedProduct = step.shiftedProduct || step.arraySnapshot[step.indices.active];
        humanText = `Menggeser elemen [${step.indices.compare}] ('${shiftedProduct.name}') ke kanan menuju Indeks [${step.indices.active}], sehingga Key sementara ('${currentKeyProduct.name}') menempati slot Indeks [${step.indices.compare}].`;
      } else if (step.type === 'SWAP') {
        const fromIdx = step.indices.active;
        const toIdx = step.indices.compare;
        const itemAtActiveNow = step.arraySnapshot[fromIdx];
        const itemAtCompareNow = step.arraySnapshot[toIdx];
        humanText = `Menukar (SWAP) elemen Indeks [${fromIdx}] ('${itemAtCompareNow.name}') dengan target ${targetRole} Indeks [${toIdx}] ('${itemAtActiveNow.name}').`;
      } else if (step.type === 'INSERT') {
        const insertedProduct = step.arraySnapshot[step.indices.active];
        humanText = `Menyisipkan (INSERT) Key sementara ('${insertedProduct.name}') secara permanen pada Indeks [${step.indices.active}].`;
      } else if (step.type === 'COMPLETE') {
        humanText = `Pengurutan ${isSelection ? 'Selection Sort' : 'Insertion Sort'} selesai tuntas! Seluruh kontrol form telah dibuka kembali.`;
      }
    } else if (kind === 'SEARCH') {
      if (step.type === 'NOT_SORTED') {
        humanText = step.logMessage;
      } else if (step.type === 'FOUND' && step.indices.active !== null) {
        matchedSet.add(step.indices.active);
        const item = step.arraySnapshot[step.indices.active];
        humanText = `COCOK! Produk '${item.name}' (ID:${item.id}) ditemukan pada Array Indeks [${step.indices.active}].`;
      } else if (step.type === 'CHECKING' && step.indices.active !== null) {
        const item = step.arraySnapshot[step.indices.active];
        if (meta.method === 'binary') {
          humanText = `Rentang Binary [${step.indices.low}..${step.indices.high}] -> Memeriksa titik tengah Mid [${step.indices.active}] ('${item.name}').`;
        } else {
          humanText = `Memeriksa Array Indeks [${step.indices.active}] ('${item.name}') -> Belum cocok dengan kata kunci.`;
        }
      } else if (step.type === 'COMPLETE') {
        humanText = `Pencarian ${meta.method === 'binary' ? 'Binary Search' : 'Linear Search'} selesai. Ditemukan ${matchedSet.size} produk yang sesuai.`;
      }
    }

    return {
      ...step,
      stepNumber: index + 1,
      totalSteps: rawSteps.length,
      displayArray,
      keyProduct: currentKeyProduct,
      matchedIndicesSnapshot: new Set(matchedSet),
      humanText
    };
  });
}

function renderCatalogGrid(items, stepContext = null, animateMovement = true) {
  const previousPositions = new Map();
  if (animateMovement) {
    productGridEl.querySelectorAll('.product-card[data-product-id]').forEach(cardEl => {
      previousPositions.set(Number(cardEl.dataset.productId), cardEl.getBoundingClientRect());
    });
  }

  productGridEl.innerHTML = '';

  const stepType = stepContext?.type || null;
  const activeIdx = stepContext?.indices?.active ?? null;
  const compareIdx = stepContext?.indices?.compare ?? null;
  const lowIdx = stepContext?.indices?.low ?? null;
  const highIdx = stepContext?.indices?.high ?? null;
  const matchedSet = stepContext?.matchedIndicesSnapshot || new Set();

  for (let idx = 0; idx < items.length; idx++) {
    const product = items[idx];
    const card = document.createElement('article');
    card.className = 'product-card';
    card.dataset.productId = product.id;

    let ribbonText = `ARRAY INDEKS [${idx}]`;

    const passStartIdx = stepContext?.indices?.passStart ?? null;
    const passIndex = stepContext?.indices?.passIndex ?? null;

    if (currentAlgorithmKind === 'SORT' && stepContext) {
      if (stepType === 'COMPLETE') {
        card.classList.add('state-sorted');
        ribbonText = `✓ TERURUT LENGKAP [${idx}]`;
      } else if (currentAlgoMeta.method === 'selection' && passStartIdx !== null && idx < passStartIdx) {
        card.classList.add('state-sorted');
        ribbonText = `✓ POSISI TERURUT [${idx}]`;
      } else if (currentAlgoMeta.method === 'selection' && passStartIdx !== null && idx === passStartIdx && stepType !== 'SWAP') {
        card.classList.add('state-target-slot');
        ribbonText = `🎯 SLOT TUJUAN [${idx}]`;
      } else if (stepType === 'COMPARE') {
        if (idx === activeIdx) {
          card.classList.add('state-key');
          ribbonText = currentAlgoMeta.method === 'selection'
            ? `★ KANDIDAT EKSTREM [${idx}]`
            : `🔑 KEY DIUJI [${idx}]`;
        } else if (idx === compareIdx) {
          card.classList.add('state-compare');
          ribbonText = `🔍 PEMBANDING [j=${idx}]`;
        }
      } else if (stepType === 'MIN_FOUND') {
        if (idx === activeIdx) {
          card.classList.add('state-insert');
          ribbonText = `★ KANDIDAT BARU [${idx}]`;
        }
      } else if (stepType === 'SHIFT') {
        if (idx === activeIdx) {
          card.classList.add('state-shift-right');
          ribbonText = `➡ DIGESER KE KANAN [${compareIdx} → ${idx}]`;
        } else if (idx === compareIdx) {
          card.classList.add('state-key-slot');
          ribbonText = `⌂ SLOT KOSONG KEY [${idx}]`;
        }
      } else if (stepType === 'SWAP') {
        if (idx === activeIdx) {
          card.classList.add('state-swap-left');
          ribbonText = `⚡ DITUKAR (SWAP [${activeIdx}] ⇄ [${compareIdx}])`;
        } else if (idx === compareIdx) {
          card.classList.add('state-swap-right');
          ribbonText = `⚡ DITUKAR (SWAP [${compareIdx}] ⇄ [${activeIdx}])`;
        }
      } else if (stepType === 'INSERT') {
        if (idx === activeIdx) {
          card.classList.add('state-insert');
          ribbonText = `✓ KEY DISISIPKAN DI [${idx}]`;
        } else if (passIndex !== null && idx <= passIndex) {
          card.classList.add('state-sorted');
          ribbonText = `✓ SUB-ARRAY RAPI [${idx}]`;
        }
      }
    } else if (currentAlgorithmKind === 'SEARCH' && stepContext) {
      if (matchedSet.has(idx)) {
        card.classList.add('state-found');
        ribbonText = `✅ COCOK / MATCH [${idx}]`;
      } else if (idx === activeIdx && stepType === 'CHECKING') {
        card.classList.add('state-compare');
        ribbonText = currentAlgoMeta.method === 'binary' ? `🔍 MID DIUJI [${idx}]` : `🔍 SEDANG DIPERIKSA [${idx}]`;
      } else if (currentAlgoMeta.method === 'binary' && lowIdx !== null && highIdx !== null && (idx < lowIdx || idx > highIdx)) {
        card.classList.add('state-dimmed');
        ribbonText = `DI LUAR RENTANG [${idx}]`;
      } else if (stepType === 'COMPLETE' || (currentAlgoMeta.method === 'linear' && activeIdx !== null && idx < activeIdx)) {
        card.classList.add('state-dimmed');
        ribbonText = `TIDAK COCOK [${idx}]`;
      }
    }

    card.innerHTML = `
      <div class="card-status-ribbon">${ribbonText}</div>
      <div class="card-top-bar">
        <span class="index-badge">Index[${idx}]</span>
        <span class="memory-badge" title="Simulasi Alamat Memori Statis">${product.simulatedAddress}</span>
      </div>
      <div class="card-image-box">
        <img src="${product.image}" alt="${product.name}">
        <span class="addon-badge">${product.category}</span>
        <span class="id-tag">ID:${product.id}</span>
      </div>
      <div class="card-body">
        <h3 class="product-title">${product.name}</h3>
        <span class="creator-line">by MineForge Official</span>
        <div class="marketplace-meta-row">
          <span class="rating-badge">★ ${product.rating.toFixed(1)}</span>
          <span class="stock-badge">Stok: ${product.stock}</span>
        </div>
        <div class="product-price">${formatIDR(product.price)}</div>
        <button class="btn btn-secondary btn-sm btn-add-cart" type="button">
          <span>+ TAMBAH KE KERANJANG</span>
        </button>
      </div>
    `;

    const imgEl = card.querySelector('img');
    imgEl.addEventListener('error', () => {
      imgEl.src = generateVoxelProductSVG(product);
    }, { once: true });

    card.querySelector('.btn-add-cart').addEventListener('click', () => handleAddToCart(product.id));
    productGridEl.appendChild(card);
  }

  if (animateMovement && previousPositions.size > 0) {
    const isSwap = stepType === 'SWAP';

    productGridEl.querySelectorAll('.product-card[data-product-id]').forEach(cardEl => {
      const pid = Number(cardEl.dataset.productId);
      const oldRect = previousPositions.get(pid);
      if (!oldRect) return;

      const newRect = cardEl.getBoundingClientRect();
      const deltaX = oldRect.left - newRect.left;
      const deltaY = oldRect.top - newRect.top;

      if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
        cardEl.style.transition = 'none';

        if (isSwap) {
          const isLeftCard = deltaX > 0;
          const arcY = isLeftCard ? -35 : 35;
          const rotateDeg = isLeftCard ? 4 : -4;
          cardEl.style.zIndex = isLeftCard ? '25' : '20';
          cardEl.style.transform = `translate(${deltaX}px, ${deltaY + arcY}px) scale(1.1) rotate(${rotateDeg}deg)`;
        } else {
          cardEl.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.02)`;
        }

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            cardEl.style.transition = 'transform 520ms cubic-bezier(0.34, 1.45, 0.64, 1)';
            cardEl.style.transform = '';
            setTimeout(() => {
              cardEl.style.zIndex = '';
            }, 520);
          });
        });
      }
    });
  }
}

function applyStepAtIndex(index, logToTerminal = true) {
  if (index < 0 || index >= stepHistory.length) return;
  currentStepIndex = index;
  const step = stepHistory[index];

  stepTypeBadgeEl.textContent = step.type;
  stepProgressTextEl.textContent = `LANGKAH ${step.stepNumber} / ${step.totalSteps}`;
  stepHumanExplanationEl.textContent = step.humanText;

  const isWarnStep = step.type === 'COMPARE' || step.type === 'SHIFT' || step.type === 'SWAP' || step.type === 'CHECKING';
  const isDangerStep = step.type === 'NOT_SORTED';
  stepVisualizerBannerEl.classList.toggle('banner-warn', isWarnStep);
  stepVisualizerBannerEl.classList.toggle('banner-danger', isDangerStep);

  if (step.metrics) {
    updateMetricsDisplay(
      currentAlgoMeta.label || 'ALGORITMA',
      step.metrics.comparisons,
      step.metrics.shiftsOrSwaps,
      lastExecutionDurationMs
    );
  }

  if (currentAlgorithmKind === 'SORT' && step.keyProduct) {
    keyHolderBoxEl.classList.remove('hidden');
    keyHolderLabelEl.textContent = currentAlgoMeta.method === 'selection'
      ? 'KANDIDAT EKSTREM AKTIF'
      : 'KEY SEMENTARA (DIPEGANG)';
    keyHolderContentEl.textContent = `${step.keyProduct.name} (${formatPropValue(step.keyProduct, currentAlgoMeta.property)})`;
  } else {
    keyHolderBoxEl.classList.add('hidden');
  }

  if (logToTerminal) {
    appendTerminalLog(step.logMessage, step.type);
  }

  if (index >= stepHistory.length - 1) {
    setAlgorithmControlsLock(false);
  }

  syncPlaybackAndModeUI();
  renderCatalogGrid(step.displayArray, step, true);
}

function stopAutoTimer() {
  if (playbackTimer) {
    clearInterval(playbackTimer);
    playbackTimer = null;
  }
}

function startAutoTimer() {
  stopAutoTimer();
  isPaused = false;
  setAlgorithmControlsLock(true);
  engineStatusEl.textContent = 'BERJALAN (AUTO)';
  syncPlaybackAndModeUI();

  playbackTimer = setInterval(() => {
    if (currentStepIndex < stepHistory.length - 1) {
      applyStepAtIndex(currentStepIndex + 1, true);
    } else {
      stopAutoTimer();
      isPaused = true;
      setAlgorithmControlsLock(false);
      engineStatusEl.textContent = 'SELESAI TUNTAS';
      syncPlaybackAndModeUI();
    }
  }, getAnimationSpeedMs());
}

function jumpToEndAndFinish() {
  stopAutoTimer();
  if (stepHistory.length === 0) return;

  for (let i = currentStepIndex + 1; i < stepHistory.length; i++) {
    appendTerminalLog(stepHistory[i].logMessage, stepHistory[i].type);
  }

  isPaused = true;
  setAlgorithmControlsLock(false);
  applyStepAtIndex(stepHistory.length - 1, false);
  engineStatusEl.textContent = 'SELESAI (STOP/END)';
  syncPlaybackAndModeUI();
}

function executeAlgorithm(generatorFn, kind, meta = {}) {
  stopAutoTimer();
  currentAlgorithmKind = kind;
  currentAlgoMeta = meta;

  const workingClone = catalogArray.map(p => p);
  stepHistory = buildEnrichedStepHistory(generatorFn(workingClone), kind, meta);

  if (stepHistory.length === 1 && stepHistory[0].type === 'NOT_SORTED') {
    isPaused = true;
    setAlgorithmControlsLock(false);
    applyStepAtIndex(0, true);
    engineStatusEl.textContent = 'PERINGATAN URUTAN!';
    showToast('URUTKAN KATALOG TERLEBIH DAHULU SEBELUM BINARY SEARCH!');
    return;
  }

  catalogArray = workingClone;
  currentStepIndex = -1;

  const mode = getSelectedPlaybackMode();
  if (mode === 'instant') {
    stepHistory.forEach(s => appendTerminalLog(s.logMessage, s.type));
    isPaused = true;
    setAlgorithmControlsLock(false);
    applyStepAtIndex(stepHistory.length - 1, false);
    engineStatusEl.textContent = 'SELESAI INSTAN';
    syncPlaybackAndModeUI();
    return;
  }

  isPaused = true;
  setAlgorithmControlsLock(true);
  engineStatusEl.textContent = 'SIAP LANGKAH (PAUSED)';
  applyStepAtIndex(0, true);
  syncPlaybackAndModeUI();
}

function handleRunSorting() {
  if (isPlaybackSessionActive) return;
  const method = sortMethodEl.value;
  const property = sortPropertyEl.value;
  const direction = sortDirectionEl.value;
  const label = `${method === 'selection' ? 'SELECTION SORT' : 'INSERTION SORT'} (${property.toUpperCase()} ${direction.toUpperCase()})`;

  executeAlgorithm(
    (arr) => method === 'selection'
      ? selectionSort(arr, property, direction)
      : insertionSort(arr, property, direction),
    'SORT',
    { method, property, direction, label }
  );
}

function handleRunSearching() {
  if (isPlaybackSessionActive) return;
  const method = searchMethodEl.value;
  const property = searchPropertyEl.value;
  const keyword = searchKeywordEl.value.trim();

  if (!keyword) {
    showToast('MASUKKAN KATA KUNCI ATAU NILAI TARGET PENCARIAN!');
    searchKeywordEl.focus();
    return;
  }

  const label = method === 'binary'
    ? `BINARY SEARCH (${property.toUpperCase()})`
    : 'LINEAR SEARCH';

  executeAlgorithm(
    (arr) => method === 'binary'
      ? binarySearch(arr, keyword, property)
      : linearSearch(arr, keyword),
    'SEARCH',
    { method, property, keyword, label }
  );
}

function handleResetCatalog() {
  stopAutoTimer();
  setAlgorithmControlsLock(false);
  currentAlgorithmKind = null;
  stepHistory = [];
  currentStepIndex = -1;
  searchKeywordEl.value = '';

  stepVisualizerBannerEl.classList.remove('banner-warn', 'banner-danger');
  stepTypeBadgeEl.textContent = 'IDLE';
  stepProgressTextEl.textContent = 'LANGKAH 0 / 0';
  stepHumanExplanationEl.textContent = 'Susunan katalog telah dikembalikan ke Array Master awal.';
  keyHolderBoxEl.classList.add('hidden');
  engineStatusEl.textContent = 'SIAP (IDLE)';
  updateMetricsDisplay('BELUM ADA', 0, 0, '0.00');
  syncPlaybackAndModeUI();

  catalogArray = ProductRepository.getInitialClone();
  renderCatalogGrid(catalogArray, null, true);
  appendTerminalLog('[SYSTEM][RESET] Katalog dikembalikan ke susunan Array Master (kondisi awal).', 'COMPLETE');
  showToast('SUSUNAN KATALOG DIRESET!');
}

function handleAddToCart(productId) {
  const targetProduct = catalogArray.find(p => p.id === productId) || ProductRepository.getById(productId);
  if (!targetProduct) return;

  const result = cartList.add(targetProduct, 1);
  if (!result.success) {
    showToast(result.message);
    return;
  }

  appendTerminalLog(
    `[LINKED-LIST][ADD] Simpul produk ID:${targetProduct.id} ("${targetProduct.name}") ditambahkan/diperbarui (Qty: ${result.quantity}).`,
    'INSERT'
  );
  updateCartUI();
  showToast(`+${targetProduct.name} MASUK KERANJANG!`);
}

function updateCartUI() {
  const items = cartList.toArray();
  let totalQty = 0;
  let subtotalPrice = 0;

  for (let i = 0; i < items.length; i++) {
    totalQty += items[i].quantity;
    subtotalPrice += items[i].product.price * items[i].quantity;
  }

  cartBadgeCounterEl.textContent = totalQty;
  linkedListNodeCountEl.textContent = `${cartList.length} NODE`;
  cartTotalQtyEl.textContent = `${totalQty} Item`;
  cartSubtotalPriceEl.textContent = formatIDR(subtotalPrice);
  btnCheckoutOpen.disabled = items.length === 0;

  if (items.length === 0) {
    linkedListDiagramEl.textContent = '[Head] NULL';
    cartItemsContainerEl.innerHTML = `
      <div class="cart-empty-state">
        Rantai Singly Linked List kosong (<code>this.head === null</code>).<br>
        Tambahkan item dari katalog.
      </div>
    `;
    return;
  }

  const chainParts = items.map((entry, idx) => {
    const prefix = idx === 0 ? '[Head] ' : '';
    return `${prefix}ID:${entry.product.id}(x${entry.quantity})`;
  });
  linkedListDiagramEl.textContent = `${chainParts.join(' -> ')} -> [Tail] NULL`;

  cartItemsContainerEl.innerHTML = '';
  items.forEach((entry, index) => {
    const { product, quantity } = entry;
    const nextNodeText = index < items.length - 1
      ? `next -> ID:${items[index + 1].product.id}`
      : 'next -> NULL';

    const nodeCard = document.createElement('div');
    nodeCard.className = 'cart-node-card';
    nodeCard.innerHTML = `
      <div class="node-pointer-header">
        <span>Node #${index + 1} [${product.simulatedAddress}]</span>
        <span>${nextNodeText}</span>
      </div>
      <div class="node-main-row">
        <div class="node-info">
          <h4>${product.name}</h4>
          <p>${formatIDR(product.price * quantity)}</p>
        </div>
        <div class="node-controls">
          <button class="btn-qty" type="button" data-action="dec">-</button>
          <span class="qty-number">${quantity}</span>
          <button class="btn-qty" type="button" data-action="inc">+</button>
          <button class="btn-remove-node" type="button" data-action="remove">X</button>
        </div>
      </div>
    `;

    nodeCard.querySelector('[data-action="dec"]').addEventListener('click', () => {
      cartList.decrease(product.id);
      appendTerminalLog(`[LINKED-LIST][DECREASE] Mengurangi kuantitas simpul produk ID:${product.id}.`, 'SHIFT');
      updateCartUI();
    });

    nodeCard.querySelector('[data-action="inc"]').addEventListener('click', () => {
      const res = cartList.add(product, 1);
      if (!res.success) return showToast(res.message);
      appendTerminalLog(`[LINKED-LIST][INCREASE] Menambah kuantitas simpul produk ID:${product.id} menjadi ${res.quantity}.`, 'INSERT');
      updateCartUI();
    });

    nodeCard.querySelector('[data-action="remove"]').addEventListener('click', () => {
      cartList.remove(product.id);
      appendTerminalLog(`[LINKED-LIST][REMOVE] Memutus pointer simpul produk ID:${product.id} dari Linked List.`, 'COMPLETE');
      updateCartUI();
    });

    cartItemsContainerEl.appendChild(nodeCard);
  });
}

function toggleCartDrawer(open) {
  cartDrawerEl.classList.toggle('open', open);
  cartDrawerBackdropEl.classList.toggle('hidden', !open);
}

function openCheckoutModal() {
  const items = cartList.toArray();
  if (items.length === 0) return;

  checkoutOrderListEl.innerHTML = '';
  let grandTotal = 0;

  items.forEach(({ product, quantity }) => {
    const lineTotal = product.price * quantity;
    grandTotal += lineTotal;
    const li = document.createElement('li');
    li.innerHTML = `<span>${product.name} <strong>x${quantity}</strong></span><span>${formatIDR(lineTotal)}</span>`;
    checkoutOrderListEl.appendChild(li);
  });

  checkoutTotalAmountEl.textContent = formatIDR(grandTotal);
  checkoutModalBackdropEl.classList.remove('hidden');
}

function closeCheckoutModal() {
  checkoutModalBackdropEl.classList.add('hidden');
}

function handleConfirmCheckout() {
  const items = cartList.toArray();
  if (items.length === 0) return;

  closeCheckoutModal();
  toggleCartDrawer(false);

  const randomHex = Math.floor(0x1000 + Math.random() * 0xEFFF).toString(16).toUpperCase();
  const invoiceId = `INV-0x7FFE-${randomHex}`;
  const nowStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'medium' });

  receiptInvoiceIdEl.textContent = invoiceId;
  receiptTimestampEl.textContent = `Waktu Transaksi: ${nowStr}`;
  receiptQrImgEl.src = generateDummyQRISSVG();

  receiptNodeListEl.innerHTML = '';
  let grandTotal = 0;

  items.forEach((entry, idx) => {
    const { product, quantity } = entry;
    const subtotal = product.price * quantity;
    grandTotal += subtotal;
    const nextPtr = idx < items.length - 1 ? `-> Node #${idx + 2}` : '-> NULL';

    const row = document.createElement('div');
    row.className = 'receipt-node-row';
    row.innerHTML = `
      <span class="receipt-node-addr">[Node #${idx + 1} @ ${product.simulatedAddress} ${nextPtr}]</span>
      <span>${product.name} (x${quantity})</span>
      <strong class="receipt-node-price">${formatIDR(subtotal)}</strong>
    `;
    receiptNodeListEl.appendChild(row);
  });

  receiptGrandTotalEl.textContent = formatIDR(grandTotal);
  receiptModalBackdropEl.classList.remove('hidden');

  appendTerminalLog(`[RECEIPT][GENERATED] Resi Digital ${invoiceId} diterbitkan untuk ${items.length} simpul Linked List.`, 'FOUND');
}

function finalizeReceiptAndClearCart() {
  receiptModalBackdropEl.classList.add('hidden');
  cartList.clear();
  updateCartUI();
  appendTerminalLog('[CHECKOUT][CLEAR] Transaksi selesai. Method cart.clear() dieksekusi (this.head = null).', 'COMPLETE');
  showToast('TRANSAKSI SELESAI & KERANJANG DIKOSONGKAN!');
}

function renderCodeInspector() {
  const topic = codeTopicSelectEl.value || 'struct_pointer';
  const snippetObj = CODE_SNIPPETS[topic];
  if (!snippetObj) return;

  codeInspectorOutputEl.textContent = snippetObj[activeCodeLang] || '';
  tabBtnLangC.className = `btn ${activeCodeLang === 'c' ? 'btn-primary' : 'btn-secondary'} btn-sm`;
  tabBtnLangJS.className = `btn ${activeCodeLang === 'js' ? 'btn-primary' : 'btn-secondary'} btn-sm`;
}

const appGuidedTour = new GuidedTour(
  [
    {
      selector: '#tourSortingPanel',
      title: '1. PANEL PENGURUTAN (SORTING)',
      description: 'Pilih algoritma Insertion Sort atau Selection Sort, tentukan properti (Harga, Rating, atau ID) beserta arah urutannya, lalu klik "JALANKAN SORTING".',
      beforeEnter: () => toggleCartDrawer(false)
    },
    {
      selector: '#tourSearchingPanel',
      title: '2. PANEL PENCARIAN (SEARCHING)',
      description: 'Gunakan Linear Search untuk pencarian sekuensial bebas, atau Binary Search untuk pencarian cepat (pastikan katalog sudah diurutkan terlebih dahulu).'
    },
    {
      selector: '#tourExecutionBar',
      title: '3. KONTROL GENERATOR & KECEPATAN',
      description: 'Atur jeda kecepatan animasi secara real-time, atau gunakan tombol << PREV, PAUSE/CONTINUE, NEXT >>, dan STOP/END untuk menganalisis langkah algoritma satu per satu.'
    },
    {
      selector: '#tourCatalogSection',
      title: '4. ETALASE KATALOG & ALAMAT MEMORI',
      description: 'Setiap kartu produk menampilkan indeks Array saat ini, simulasi alamat memori heksadesimal (0x7FFE...), serta pita indikator visual SHIFT dan SWAP.'
    },
    {
      selector: '#tourTerminalSection',
      title: '5. TERMINAL EKSEKUSI LOG',
      description: 'Mencatat setiap operasi perbandingan (COMPARE), pergeseran (SHIFT), pertukaran (SWAP), penyisipan (INSERT), dan pencocokan data secara berurutan.'
    },
    {
      selector: '#cartDrawer',
      title: '6. KERANJANG SINGLY LINKED LIST',
      description: 'Memvisualisasikan rantai pointer objek nyata di Heap Memory ([Head] -> Node -> [Tail] NULL) setiap kali Anda menambah atau menghapus barang belanjaan.',
      beforeEnter: () => toggleCartDrawer(true)
    }
  ],
  {
    onFinish: () => {
      try {
        localStorage.setItem(TOUR_STORAGE_KEY, 'true');
      } catch {
        // Abaikan jika browser memblokir akses localStorage
      }
      toggleCartDrawer(false);
    }
  }
);

function closeAllModalsOnEsc() {
  checkoutModalBackdropEl.classList.add('hidden');
  infoModalBackdropEl.classList.add('hidden');
  codeModalBackdropEl.classList.add('hidden');
  if (!receiptModalBackdropEl.classList.contains('hidden')) {
    finalizeReceiptAndClearCart();
  }
  toggleCartDrawer(false);
  if (appGuidedTour.isActive) {
    appGuidedTour.stop();
  }
}

function initApp() {
  renderCatalogGrid(catalogArray, null, false);
  updateCartUI();
  syncPlaybackAndModeUI();
  renderCodeInspector();
  appendTerminalLog('[SYSTEM][INIT] MineForge Gear (Bedrock Ore UI Edition) siap. 10 Struct Product dimuat dari js/data.js.', 'COMPLETE');

  btnRunSort.addEventListener('click', handleRunSorting);
  btnResetCatalog.addEventListener('click', handleResetCatalog);
  btnRunSearch.addEventListener('click', handleRunSearching);

  searchMethodEl.addEventListener('change', () => {
    const isBinary = searchMethodEl.value === 'binary';
    binaryPropertyFieldEl.classList.toggle('hidden', !isBinary);
    searchKeywordEl.placeholder = isBinary
      ? 'Masukkan angka ID (205), Harga (185000), atau Rating (4.8)...'
      : 'Ketik Creeper, Hoodie, atau 205...';
  });

  searchKeywordEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleRunSearching();
  });

  playbackModeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      syncPlaybackAndModeUI();
    });
  });

  speedRangeInputEl.addEventListener('input', () => {
    speedValueLabelEl.textContent = `${speedRangeInputEl.value} ms`;
    if (playbackTimer && !isPaused) {
      startAutoTimer();
    }
  });

  btnStepPrev.addEventListener('click', () => {
    stopAutoTimer();
    isPaused = true;
    setAlgorithmControlsLock(true);
    engineStatusEl.textContent = 'DIJEDA (MANUAL PREV)';
    if (currentStepIndex > 0) {
      applyStepAtIndex(currentStepIndex - 1, false);
    }
  });

  btnStepNext.addEventListener('click', () => {
    stopAutoTimer();
    isPaused = true;
    engineStatusEl.textContent = 'DIJEDA (MANUAL NEXT)';
    if (currentStepIndex < stepHistory.length - 1) {
      applyStepAtIndex(currentStepIndex + 1, true);
    }
  });

  btnStepPauseResume.addEventListener('click', () => {
    if (stepHistory.length === 0) return;
    if (currentStepIndex >= stepHistory.length - 1) {
      applyStepAtIndex(0, false);
      startAutoTimer();
      return;
    }
    if (isPaused) {
      startAutoTimer();
    } else {
      stopAutoTimer();
      isPaused = true;
      setAlgorithmControlsLock(true);
      engineStatusEl.textContent = 'DIJEDA (PAUSED)';
      syncPlaybackAndModeUI();
    }
  });

  btnStepStop.addEventListener('click', jumpToEndAndFinish);

  btnCopyLog.addEventListener('click', async () => {
    const rawText = Array.from(terminalOutputEl.querySelectorAll('.log-line'))
      .map(el => el.textContent)
      .join('\n');
    if (!rawText) return;
    try {
      await navigator.clipboard.writeText(rawText);
      showToast('SELURUH BARIS LOG DISALIN KE CLIPBOARD!');
    } catch {
      showToast('GAGAL MENYALIN LOG.');
    }
  });

  btnClearLog.addEventListener('click', () => {
    terminalOutputEl.innerHTML = '';
    logEntryCount = 0;
    logCounterBadgeEl.textContent = '0 BARIS LOG';
  });

  btnOpenCart.addEventListener('click', () => toggleCartDrawer(true));
  btnCloseCart.addEventListener('click', () => toggleCartDrawer(false));
  cartDrawerBackdropEl.addEventListener('click', () => toggleCartDrawer(false));

  btnCheckoutOpen.addEventListener('click', openCheckoutModal);
  btnCloseModal.addEventListener('click', closeCheckoutModal);
  btnCancelCheckout.addEventListener('click', closeCheckoutModal);
  btnConfirmPayment.addEventListener('click', handleConfirmCheckout);

  btnCloseReceiptModal.addEventListener('click', finalizeReceiptAndClearCart);
  btnFinishNewTransaction.addEventListener('click', finalizeReceiptAndClearCart);
  receiptModalBackdropEl.addEventListener('click', (e) => {
    if (e.target === receiptModalBackdropEl) finalizeReceiptAndClearCart();
  });

  btnOpenCodeModal.addEventListener('click', () => {
    renderCodeInspector();
    codeModalBackdropEl.classList.remove('hidden');
  });
  btnCloseCodeModal.addEventListener('click', () => codeModalBackdropEl.classList.add('hidden'));
  btnCloseCodeModalFooter.addEventListener('click', () => codeModalBackdropEl.classList.add('hidden'));
  codeModalBackdropEl.addEventListener('click', (e) => {
    if (e.target === codeModalBackdropEl) codeModalBackdropEl.classList.add('hidden');
  });

  tabBtnLangC.addEventListener('click', () => {
    activeCodeLang = 'c';
    renderCodeInspector();
  });
  tabBtnLangJS.addEventListener('click', () => {
    activeCodeLang = 'js';
    renderCodeInspector();
  });
  codeTopicSelectEl.addEventListener('change', renderCodeInspector);

  btnCopySourceCode.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(codeInspectorOutputEl.textContent);
      showToast('KODE SUMBER BERHASIL DISALIN!');
    } catch {
      showToast('GAGAL MENYALIN KODE.');
    }
  });

  btnOpenInfoModal.addEventListener('click', () => infoModalBackdropEl.classList.remove('hidden'));
  btnCloseInfoModal.addEventListener('click', () => infoModalBackdropEl.classList.add('hidden'));
  btnCloseInfoModalFooter.addEventListener('click', () => infoModalBackdropEl.classList.add('hidden'));
  infoModalBackdropEl.addEventListener('click', (e) => {
    if (e.target === infoModalBackdropEl) infoModalBackdropEl.classList.add('hidden');
  });

  btnStartTour.addEventListener('click', () => appGuidedTour.start());

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModalsOnEsc();
    }
    if (document.activeElement === searchKeywordEl) return;

    if (e.code === 'ArrowRight') {
      e.preventDefault();
      btnStepNext.click();
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      btnStepPrev.click();
    } else if (e.code === 'Space') {
      e.preventDefault();
      btnStepPauseResume.click();
    }
  });

  try {
    const tourCompleted = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!tourCompleted) {
      setTimeout(() => {
        appGuidedTour.start();
      }, 400);
    }
  } catch {
    // Abaikan jika penyimpanan lokal dibatasi browser
  }
}

initApp();
