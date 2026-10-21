import { Product } from './struct.js';
import { MASTER_PRODUCTS_DATA } from './data.js';

export class ProductRepository {
  static _activeStockMap = new Map();

  /**
   * Mengembalikan salinan array baru berisi instance Struct Product
   * agar mutasi in-place oleh algoritma tidak merusak data master
   */
  static getInitialClone() {
    this._activeStockMap.clear();
    return MASTER_PRODUCTS_DATA.map(item => {
      this._activeStockMap.set(item.id, item.stock);
      return new Product(
        item.id,
        item.name,
        item.category,
        item.price,
        item.rating,
        item.stock,
        item.image,
        item.simulatedAddress
      );
    });
  }

  /**
   * Memperbarui stok aktif produk pada repository
   * Menjaga sinkronisasi data stok agar tetap konsisten dengan catalogArray
   * @param {number} id - ID unik produk
   * @param {number} newStock - Nilai kuantitas stok produk terkini
   */
  static updateStock(id, newStock) {
    this._activeStockMap.set(id, newStock);
  }

  /**
   * Mengambil stok aktif terkini berdasarkan ID produk
   * @param {number} id - ID unik produk
   * @returns {number}
   */
  static getStock(id) {
    if (this._activeStockMap.has(id)) {
      return this._activeStockMap.get(id);
    }
    const raw = MASTER_PRODUCTS_DATA.find(item => item.id === id);
    return raw ? raw.stock : 0;
  }

  /**
   * Mengambil stok awal penuh dari data master
   * @param {number} id - ID unik produk
   * @returns {number}
   */
  static getMasterStock(id) {
    const raw = MASTER_PRODUCTS_DATA.find(item => item.id === id);
    return raw ? raw.stock : 0;
  }

  /**
   * Mengembalikan semua stok aktif ke kondisi master awal
   */
  static resetStock() {
    this._activeStockMap.clear();
    MASTER_PRODUCTS_DATA.forEach(item => {
      this._activeStockMap.set(item.id, item.stock);
    });
  }

  /**
   * Mencari produk berdasarkan ID dengan mengembalikan instance yang
   * membawa nilai stok aktif sesi terkini, bukan stok awal master
   * @param {number} id - ID unik produk
   * @returns {Product|null}
   */
  static getById(id) {
    const raw = MASTER_PRODUCTS_DATA.find(item => item.id === id);
    if (!raw) return null;
    const currentStock = this._activeStockMap.has(id) ? this._activeStockMap.get(id) : raw.stock;
    return new Product(
      raw.id,
      raw.name,
      raw.category,
      raw.price,
      raw.rating,
      currentStock,
      raw.image,
      raw.simulatedAddress
    );
  }
}
