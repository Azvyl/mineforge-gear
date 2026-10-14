/**
 * Struct Product: Representasi entitas produk bertipe heterogen
 */
export class Product {
  constructor(id, name, category, price, rating, stock, image, simulatedAddress) {
    this.id = id;                               // Integer (Primary Key)
    this.name = name;                           // String
    this.category = category;                   // String
    this.price = price;                         // Number (IDR)
    this.rating = rating;                       // Number (Float 1.0 - 5.0)
    this.stock = stock;                         // Integer
    this.image = image;                         // String (path lokal aset gambar)
    this.simulatedAddress = simulatedAddress;   // String heksadesimal edukatif (misal '0x7FFE01')
  }
}

/**
 * Struct CartNode: Simpul elemen pada Singly Linked List keranjang belanja
 */
export class CartNode {
  constructor(product, quantity = 1) {
    this.product = product; // Referensi memori ke instance objek Product
    this.quantity = quantity;
    this.next = null;       // Pointer referensi ke CartNode berikutnya di memori heap
  }
}

/**
 * Singly Linked List untuk pengelolaan Keranjang Belanja berbasis Pointer
 */
export class CartLinkedList {
  constructor() {
    this.head = null;       // Pointer simpul pertama (head pointer)
    this.length = 0;
  }

  add(product, quantity = 1) {
    if (!this.head) {
      const initialQty = Math.min(quantity, product.stock);
      this.head = new CartNode(product, initialQty);
      this.length++;
      return { success: true, quantity: initialQty };
    }

    let current = this.head;
    while (current) {
      if (current.product.id === product.id) {
        if (current.quantity + quantity > product.stock) {
          return { success: false, message: 'Melebihi sisa stok produk!' };
        }
        current.quantity += quantity;
        return { success: true, quantity: current.quantity };
      }
      if (!current.next) break;
      current = current.next;
    }

    const initialQty = Math.min(quantity, product.stock);
    current.next = new CartNode(product, initialQty);
    this.length++;
    return { success: true, quantity: initialQty };
  }

  decrease(productId) {
    if (!this.head) return false;

    if (this.head.product.id === productId) {
      if (this.head.quantity > 1) {
        this.head.quantity--;
      } else {
        this.head = this.head.next;
        this.length--;
      }
      return true;
    }

    let current = this.head;
    while (current.next && current.next.product.id !== productId) {
      current = current.next;
    }

    if (current.next) {
      if (current.next.quantity > 1) {
        current.next.quantity--;
      } else {
        current.next = current.next.next; // Memindahkan referensi pointer
        this.length--;
      }
      return true;
    }
    return false;
  }

  remove(productId) {
    if (!this.head) return false;

    if (this.head.product.id === productId) {
      this.head = this.head.next;
      this.length--;
      return true;
    }

    let current = this.head;
    while (current.next && current.next.product.id !== productId) {
      current = current.next;
    }

    if (current.next) {
      current.next = current.next.next;
      this.length--;
      return true;
    }
    return false;
  }

  clear() {
    this.head = null;
    this.length = 0;
  }

  toArray() {
    const items = [];
    let current = this.head;
    while (current) {
      items.push({ product: current.product, quantity: current.quantity });
      current = current.next;
    }
    return items;
  }
}