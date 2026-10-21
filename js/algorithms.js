/**
 * Helper perbandingan nilai generik untuk Number, Float (Rating), dan String (Nama)
 * Mendukung presisi floating point epsilon (1e-5) dan perbandingan String localeCompare
 * Mengembalikan:
 *   < 0 jika a < b
 *   > 0 jika a > b
 *   0 jika a == b
 */
export function comparePropertyValues(a, b, property) {
  if (property === 'rating') {
    const numA = Number(a);
    const numB = Number(b);
    if (Math.abs(numA - numB) < 1e-5) return 0;
    return numA < numB ? -1 : 1;
  }
  if (property === 'name') {
    return String(a ?? '').localeCompare(String(b ?? ''), 'id', { sensitivity: 'base' });
  }
  const numA = Number(a);
  const numB = Number(b);
  if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
    if (numA < numB) return -1;
    if (numA > numB) return 1;
    return 0;
  }
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/**
 * Helper pengecekan apakah array sudah terurut berdasarkan properti tertentu
 * Digunakan sebagai prasyarat mutlak sebelum menjalankan Binary Search
 */
export function detectSortOrder(items, property) {
  if (!items || items.length <= 1) return 'asc';

  let hasAsc = false;
  let hasDesc = false;

  for (let i = 0; i < items.length - 1; i++) {
    const curr = items[i][property];
    const next = items[i + 1][property];
    const cmp = comparePropertyValues(curr, next, property);

    if (cmp < 0) {
      hasAsc = true;
    } else if (cmp > 0) {
      hasDesc = true;
    }

    if (hasAsc && hasDesc) {
      return null;
    }
  }

  if (hasAsc && !hasDesc) return 'asc';
  if (!hasAsc && hasDesc) return 'desc';
  return 'asc';
}

/**
 * 1. Algoritma Sorting: Insertion Sort berbasis Generator
 */
export function* insertionSort(items, property, direction = 'asc') {
  const arr = items;
  const n = arr.length;
  let comparisons = 0;
  let shifts = 0;

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;

    comparisons++;
    const initialCompareSnapshot = arr.map(item => ({ ...item }));
    initialCompareSnapshot[i] = key;
    yield {
      type: 'COMPARE',
      indices: { active: i, compare: j, passIndex: i },
      keyProduct: key,
      metrics: { comparisons, shiftsOrSwaps: shifts },
      arraySnapshot: initialCompareSnapshot,
      logMessage: `[INSERTION][PASS ${i}][COMPARE] Menguji Key "${key.name}" (${property}: ${key[property]}) dengan Indeks [${j}] "${arr[j].name}" (${property}: ${arr[j][property]})`
    };

    while (j >= 0 && (
      direction === 'asc'
        ? comparePropertyValues(arr[j][property], key[property], property) > 0
        : comparePropertyValues(arr[j][property], key[property], property) < 0
    )) {
      const shiftedItem = arr[j];
      arr[j + 1] = shiftedItem;
      shifts++;
      const shiftSnapshot = arr.map(item => ({ ...item }));
      shiftSnapshot[j] = key;
      yield {
        type: 'SHIFT',
        indices: { active: j + 1, compare: j, passIndex: i },
        keyProduct: key,
        shiftedProduct: shiftedItem,
        metrics: { comparisons, shiftsOrSwaps: shifts },
        arraySnapshot: shiftSnapshot,
        logMessage: `[INSERTION][PASS ${i}][SHIFT] Menggeser elemen [${j}] ('${shiftedItem.name}') ke kanan menuju [${j + 1}] dan memindahkan slot Key ('${key.name}') ke [${j}].`
      };

      j--;
      if (j >= 0) {
        comparisons++;
        const nextCompareSnapshot = arr.map(item => ({ ...item }));
        nextCompareSnapshot[j + 1] = key;
        yield {
          type: 'COMPARE',
          indices: { active: j + 1, compare: j, passIndex: i },
          keyProduct: key,
          metrics: { comparisons, shiftsOrSwaps: shifts },
          arraySnapshot: nextCompareSnapshot,
          logMessage: `[INSERTION][PASS ${i}][COMPARE] Menguji Key "${key.name}" (${property}: ${key[property]}) pada slot [${j + 1}] dengan Indeks [${j}] "${arr[j].name}" (${property}: ${arr[j][property]})`
        };
      }
    }

    arr[j + 1] = key;
    yield {
      type: 'INSERT',
      indices: { active: j + 1, compare: null, passIndex: i },
      keyProduct: key,
      metrics: { comparisons, shiftsOrSwaps: shifts },
      arraySnapshot: arr.map(item => ({ ...item })),
      logMessage: `[INSERTION][PASS ${i}][INSERT] Menempatkan Key "${key.name}" secara permanen pada Indeks [${j + 1}]`
    };
  }

  yield {
    type: 'COMPLETE',
    indices: { active: null, compare: null },
    keyProduct: null,
    metrics: { comparisons, shiftsOrSwaps: shifts },
    arraySnapshot: arr.map(item => ({ ...item })),
    logMessage: `[INSERTION][COMPLETE] Pengurutan ${property.toUpperCase()} (${direction.toUpperCase()}) selesai. Total Perbandingan: ${comparisons}, Pergeseran (Shift): ${shifts}.`
  };
}

/**
 * 2. Algoritma Sorting: Selection Sort berbasis Generator
 * Memancarkan state: COMPARE, MIN_FOUND, SWAP, COMPLETE
 */
export function* selectionSort(items, property, direction = 'asc') {
  const arr = items;
  const n = arr.length;
  let comparisons = 0;
  let swaps = 0;
  const targetLabel = direction === 'asc' ? 'MINIMUM' : 'MAKSIMUM';

  for (let i = 0; i < n - 1; i++) {
    let targetIdx = i;

    for (let j = i + 1; j < n; j++) {
      comparisons++;
      yield {
        type: 'COMPARE',
        indices: { active: targetIdx, compare: j, passStart: i },
        keyProduct: arr[targetIdx],
        metrics: { comparisons, shiftsOrSwaps: swaps },
        arraySnapshot: arr.map(item => ({ ...item })),
        logMessage: `[SELECTION][PASS ${i + 1}][COMPARE] Membandingkan kandidat ${targetLabel} [${targetIdx}] "${arr[targetIdx].name}" (${arr[targetIdx][property]}) dengan [${j}] "${arr[j].name}" (${arr[j][property]})`
      };

      const cmp = comparePropertyValues(arr[j][property], arr[targetIdx][property], property);
      const isBetter = direction === 'asc' ? cmp < 0 : cmp > 0;

      if (isBetter) {
        targetIdx = j;
        yield {
          type: 'MIN_FOUND',
          indices: { active: targetIdx, compare: i, passStart: i },
          keyProduct: arr[targetIdx],
          metrics: { comparisons, shiftsOrSwaps: swaps },
          arraySnapshot: arr.map(item => ({ ...item })),
          logMessage: `[SELECTION][PASS ${i + 1}][MIN_FOUND] Kandidat ${targetLabel} baru ditemukan pada Indeks [${targetIdx}]: "${arr[targetIdx].name}" (${property}: ${arr[targetIdx][property]})`
        };
      }
    }

    if (targetIdx !== i) {
      const originalAtI = arr[i];
      const extremeAtTarget = arr[targetIdx];
      arr[i] = extremeAtTarget;
      arr[targetIdx] = originalAtI;
      swaps++;

      yield {
        type: 'SWAP',
        indices: { active: i, compare: targetIdx },
        keyProduct: extremeAtTarget,
        swapMeta: {
          fromIndex: i,
          fromName: originalAtI.name,
          toIndex: targetIdx,
          toName: extremeAtTarget.name,
          targetLabel: targetLabel.toLowerCase()
        },
        metrics: { comparisons, shiftsOrSwaps: swaps },
        arraySnapshot: arr.map(item => ({ ...item })),
        logMessage: `[SELECTION][PASS ${i + 1}][SWAP] Menukar (SWAP) elemen Indeks [${i}] ('${originalAtI.name}') dengan target ${targetLabel.toLowerCase()} Indeks [${targetIdx}] ('${extremeAtTarget.name}').`
      };
    }
  }

  yield {
    type: 'COMPLETE',
    indices: { active: null, compare: null },
    keyProduct: null,
    metrics: { comparisons, shiftsOrSwaps: swaps },
    arraySnapshot: arr.map(item => ({ ...item })),
    logMessage: `[SELECTION][COMPLETE] Selection Sort ${property.toUpperCase()} (${direction.toUpperCase()}) selesai. Total Perbandingan: ${comparisons}, Pertukaran (Swap): ${swaps}.`
  };
}

/**
 * 3. Algoritma Searching: Linear Search berbasis Generator
 */
export function* linearSearch(items, keyword) {
  const query = keyword.trim().toLowerCase();
  const n = items.length;
  let matchCount = 0;
  let comparisons = 0;

  yield {
    type: 'START',
    indices: { active: null, compare: null },
    metrics: { comparisons: 0, shiftsOrSwaps: 0 },
    arraySnapshot: items.map(item => ({ ...item })),
    logMessage: `[LINEAR-SEARCH][START] Memulai pencarian sekuensial kata kunci: "${keyword}" pada ${n} item produk`
  };

  for (let i = 0; i < n; i++) {
    const item = items[i];
    comparisons++;
    const isMatch =
      item.name.toLowerCase().includes(query) ||
      item.id.toString() === query ||
      item.price.toString() === query ||
      item.rating.toString() === query;

    if (isMatch) {
      matchCount++;
      yield {
        type: 'FOUND',
        indices: { active: i, compare: null },
        metrics: { comparisons, shiftsOrSwaps: 0 },
        arraySnapshot: items.map(item => ({ ...item })),
        logMessage: `[LINEAR-SEARCH][STEP ${i + 1}][FOUND] Ditemukan kecocokan pada Indeks [${i}]: "${item.name}" (ID: ${item.id})`
      };
    } else {
      yield {
        type: 'CHECKING',
        indices: { active: i, compare: null },
        metrics: { comparisons, shiftsOrSwaps: 0 },
        arraySnapshot: items.map(item => ({ ...item })),
        logMessage: `[LINEAR-SEARCH][STEP ${i + 1}][CHECKING] Indeks [${i}]: "${item.name}" -> Tidak cocok`
      };
    }
  }

  yield {
    type: 'COMPLETE',
    indices: { active: null, compare: null },
    metrics: { comparisons, shiftsOrSwaps: 0 },
    arraySnapshot: items.map(item => ({ ...item })),
    logMessage: `[LINEAR-SEARCH][COMPLETE] Penelusuran selesai. Ditemukan ${matchCount} item dari ${comparisons} perbandingan.`
  };
}

/**
 * 4. Algoritma Searching: Binary Search berbasis Generator
 * Validasi wajib: Memeriksa apakah array telah terurut berdasarkan `property`
 * Mendukung evaluasi floating-point rating dengan presisi epsilon & ekspansi duplikat identik
 */
export function* binarySearch(items, keyword, property = 'id') {
  const sortOrder = detectSortOrder(items, property);

  if (!sortOrder) {
    yield {
      type: 'NOT_SORTED',
      indices: { active: null, compare: null },
      metrics: { comparisons: 0, shiftsOrSwaps: 0 },
      arraySnapshot: items.map(item => ({ ...item })),
      logMessage: `[BINARY-SEARCH][PERINGATAN] Array belum terurut berdasarkan properti "${property.toUpperCase()}"! Silakan jalankan Sorting pada properti "${property.toUpperCase()}" terlebih dahulu sebelum menggunakan Binary Search.`
    };
    return;
  }

  const strKeyword = String(keyword ?? '').trim();
  let targetVal;

  if (property === 'name') {
    targetVal = strKeyword;
    if (!targetVal) {
      yield {
        type: 'NOT_SORTED',
        indices: { active: null, compare: null },
        metrics: { comparisons: 0, shiftsOrSwaps: 0 },
        arraySnapshot: items.map(item => ({ ...item })),
        logMessage: `[BINARY-SEARCH][PERINGATAN] Masukkan nama produk yang valid untuk Binary Search!`
      };
      return;
    }
  } else {
    let sanitized = '';
    if (property === 'price' || property === 'id') {
      sanitized = strKeyword.replace(/\D/g, '');
    } else if (property === 'rating') {
      const withDot = strKeyword.replace(/,/g, '.');
      const cleanChars = withDot.replace(/[^0-9.]/g, '');
      const parts = cleanChars.split('.');
      if (parts.length > 1) {
        sanitized = parts[0] + '.' + parts.slice(1).join('');
      } else {
        sanitized = parts[0];
      }
    } else {
      sanitized = strKeyword.replace(/\D/g, '');
    }

    targetVal = Number(sanitized);

    if (!sanitized || sanitized === '.' || Number.isNaN(targetVal)) {
      yield {
        type: 'NOT_SORTED',
        indices: { active: null, compare: null },
        metrics: { comparisons: 0, shiftsOrSwaps: 0 },
        arraySnapshot: items.map(item => ({ ...item })),
        logMessage: `[BINARY-SEARCH][PERINGATAN] Binary Search pada properti "${property.toUpperCase()}" membutuhkan input angka numerik yang valid (contoh ID: 205, Harga: 185000 / 185.000, atau Rating: 4.8 / 4,8).`
      };
      return;
    }
  }

  let low = 0;
  let high = items.length - 1;
  let comparisons = 0;
  let stepNum = 0;

  yield {
    type: 'START',
    indices: { active: null, compare: null, low, high },
    metrics: { comparisons: 0, shiftsOrSwaps: 0 },
    arraySnapshot: items.map(item => ({ ...item })),
    logMessage: `[BINARY-SEARCH][START] Array terdeteksi sudah terurut (${sortOrder.toUpperCase()}). Mencari ${property.toUpperCase()} = ${targetVal} pada rentang Indeks [${low}..${high}].`
  };

  while (low <= high) {
    stepNum++;
    const mid = Math.floor((low + high) / 2);
    const midVal = items[mid][property];
    comparisons++;

    yield {
      type: 'CHECKING',
      indices: { active: mid, compare: null, low, high },
      metrics: { comparisons, shiftsOrSwaps: 0 },
      arraySnapshot: items.map(item => ({ ...item })),
      logMessage: `[BINARY-SEARCH][STEP ${stepNum}][CHECKING] Rentang [${low}..${high}] -> Menguji titik tengah Mid [${mid}] "${items[mid].name}" (${property}: ${midVal})`
    };

    const cmp = comparePropertyValues(midVal, targetVal, property);

    if (cmp === 0) {
      const matchedIndices = [mid];

      let left = mid - 1;
      while (left >= 0 && comparePropertyValues(items[left][property], targetVal, property) === 0) {
        matchedIndices.unshift(left);
        left--;
      }

      let right = mid + 1;
      while (right < items.length && comparePropertyValues(items[right][property], targetVal, property) === 0) {
        matchedIndices.push(right);
        right++;
      }

      yield {
        type: 'FOUND',
        indices: { active: mid, compare: null, low, high, matchedIndices },
        metrics: { comparisons, shiftsOrSwaps: 0 },
        arraySnapshot: items.map(item => ({ ...item })),
        logMessage: `[BINARY-SEARCH][STEP ${stepNum}][FOUND] Target ${property.toUpperCase()} = ${targetVal} ditemukan pada Mid Indeks [${mid}]: "${items[mid].name}"!`
      };

      for (const matchIdx of matchedIndices) {
        if (matchIdx !== mid) {
          comparisons++;
          yield {
            type: 'FOUND',
            indices: { active: matchIdx, compare: mid, low, high, matchedIndices },
            metrics: { comparisons, shiftsOrSwaps: 0 },
            arraySnapshot: items.map(item => ({ ...item })),
            logMessage: `[BINARY-SEARCH][EKSPANSI][FOUND] Ditemukan kecocokan duplikat ${property.toUpperCase()} = ${targetVal} pada Indeks [${matchIdx}]: "${items[matchIdx].name}"!`
          };
        }
      }

      yield {
        type: 'COMPLETE',
        indices: { active: mid, compare: null, low, high, matchedIndices },
        metrics: { comparisons, shiftsOrSwaps: 0 },
        arraySnapshot: items.map(item => ({ ...item })),
        logMessage: `[BINARY-SEARCH][COMPLETE] Pencarian biner selesai. Ditemukan total ${matchedIndices.length} produk dengan ${property.toUpperCase()} = ${targetVal} (Indeks: [${matchedIndices.join(', ')}]) dalam ${comparisons} perbandingan.`
      };
      return;
    }

    const goRight = sortOrder === 'asc' ? cmp < 0 : cmp > 0;
    if (goRight) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  yield {
    type: 'COMPLETE',
    indices: { active: null, compare: null, matchedIndices: [] },
    metrics: { comparisons, shiftsOrSwaps: 0 },
    arraySnapshot: items.map(item => ({ ...item })),
    logMessage: `[BINARY-SEARCH][COMPLETE] Target ${property.toUpperCase()} = ${targetVal} tidak ditemukan setelah ${comparisons} perbandingan.`
  };
}
