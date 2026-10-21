# MineForge Gear Official Store - E-Commerce Berbasis Struktur Data

**Proyek Tengah Semester (UTS) - Praktikum Struktur Data**  
**Dosen Pengampu:** Muhammad Sonhaji Akbar, S.Pd., M.Kom.  
**Program Studi:** S1 Pendidikan Teknologi Informasi, Universitas Negeri Surabaya

---

## 📌 Status Pengerjaan (Final)
> Seluruh fungsionalitas implementasi struktur data, algoritma sorting dan searching visual berbasis generator, simulasi keranjang Singly Linked List, perancangan antarmuka, serta demonstrasi video telah rampung secara penuh.

---

## 👤 Identitas Mahasiswa
- **Nama** : Asfadavy Aulia Atmadja
- **NIM**  : 25050974087
- **Kelas**: PTI 2025C
- **Jenis Pengerjaan**: Individu
- **Ketentuan Tema**: NIM Ganjil &rarr; **E-Commerce**

---

## 🔗 Tautan Pengumpulan Proyek
- **Repositori GitHub** : [`https://github.com/Azvyl/mineforge-gear`](https://github.com/Azvyl/mineforge-gear)
- **Live Demo Web (GitHub Pages)**: [`https://azvyl.github.io/mineforge-gear/`](https://azvyl.github.io/mineforge-gear/)
- **Tautan Video Demo (YouTube)** : [https://youtu.be/XKYr3F62jPM](https://youtu.be/XKYr3F62jPM)

---

## 📋 Pemetaan Rubrik & Implementasi Kode

Berikut adalah pemetaan implementasi teknis terhadap seluruh poin instruksi tugas:

### 0. Terdapat Array, Pointer, dan Struct
* **Array (`js/repository.js`, `js/data.js`)**:  
  Menyimpan dataset katalog master 10 produk secara in-memory. Pengolahan algoritma bekerja pada salinan array objek menggunakan `ProductRepository.getInitialClone()` agar integritas dataset master tetap terjaga. Pada kartu produk antarmuka, dialokasikan representasi alamat slot fisik kontigu statis (`Slot Addr: &arr[i]`).
* **Struct (`js/struct.js`)**:  
  Direpresentasikan melalui entitas kelas heterogen:
  - `Product`: Memuat atribut terstruktur (`id`, `name`, `category`, `price`, `rating`, `stock`, `image`, `simulatedAddress`).
  - `CartNode`: Memuat atribut simpul keranjang (`product`, `quantity`, `next`).
* **Pointer (`js/struct.js`)**:  
  Diimplementasikan pada sistem keranjang belanja dengan struktur **Singly Linked List** murni (`CartLinkedList`). Setiap simpul dihubungkan oleh referensi pointer objek di memori heap (`this.head` dan relasional `this.next`) untuk penambahan simpul, traversal kuantitas, pemutusan pointer (*removal*), serta pengosongan (`this.head = null`). Rantai pointer juga divisualisasikan secara langsung pada antarmuka drawer keranjang (`[Head] -> Node -> NULL`).

### 1. Sorting (Minimal 1 Metode) + Tampilan Log Sorting
* **Metode yang Diimplementasikan (`js/algorithms.js`)**:
  1. **Insertion Sort**: Pengurutan bertahap dengan mekanisme penyisipan key ke sub-array yang telah terurut.
  2. **Selection Sort**: Pengurutan dengan pencarian nilai ekstrem (minimum/maksimum) lalu dilakukan penukaran (*swap*).
  * Keduanya mendukung pengurutan **Ascending** dan **Descending** berdasarkan properti: **Nama Produk (A-Z)**, **Harga (Price)**, **Rating**, atau **ID Produk**.
* **Tampilan Log Sorting**:  
  Menggunakan JavaScript Generator Function (`function*`) untuk memecah komputasi menjadi langkah-langkah diskret. Setiap tahap (*COMPARE*, *SHIFT*, *SWAP*, *INSERT*) ditampilkan secara real-time pada:
  - **Banner Penjelasan Interaktif**: Menampilkan subjek perbandingan, nilai key yang dipegang, dan counter langkah.
  - **Terminal Log Console**: Mencatat riwayat teks eksekusi lengkap dengan timestamp dan metrik (total perbandingan & pergeseran/pertukaran).

### 2. Searching (Minimal 1 Metode) + Tampilan Log Search
* **Metode yang Diimplementasikan (`js/algorithms.js`)**:
  1. **Linear Search**: Penelusuran sekuensial bebas dari indeks awal hingga akhir berdasarkan nama produk, ID, harga, atau rating.
  2. **Binary Search**: Penelusuran biner efisien $O(\log n)$ yang dilengkapi validasi prasyarat otomatis (*array must be sorted*) serta penanganan duplikat nilai identik.
* **Tampilan Log Search**:  
  Setiap perbandingan indeks tengah (*mid*) atau pemeriksaan sekuensial dicatat secara terperinci ke dalam terminal log dan ditandai dengan perubahan status warna kartu produk (*CHECKING*, *FOUND*, atau *DIMMED/OUT OF BOUNDS*).