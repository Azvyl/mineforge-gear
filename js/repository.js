import { Product } from './struct.js';
import { MASTER_PRODUCTS_DATA } from './data.js';

export class ProductRepository {
  /**
   * Mengembalikan salinan array baru berisi instance Struct Product
   * agar mutasi in-place oleh algoritma tidak merusak data master
   */
  static getInitialClone() {
    return MASTER_PRODUCTS_DATA.map(item => new Product(
      item.id,
      item.name,
      item.category,
      item.price,
      item.rating,
      item.stock,
      item.image,
      item.simulatedAddress
    ));
  }

  /**
   * Mencari produk dari data master berdasarkan ID
   */
  static getById(id) {
    const raw = MASTER_PRODUCTS_DATA.find(item => item.id === id);
    if (!raw) return null;
    return new Product(
      raw.id,
      raw.name,
      raw.category,
      raw.price,
      raw.rating,
      raw.stock,
      raw.image,
      raw.simulatedAddress
    );
  }
}
