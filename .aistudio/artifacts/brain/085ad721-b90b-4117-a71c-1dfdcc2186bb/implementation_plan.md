# Rencana Perancangan: Drawer Detail Aset (Asset Detail Bottom Drawer)

Rancangan ini menghadirkan **Asset Detail Bottom Drawer** yang interaktif dan informatif. Drawer ini akan terbuka secara otomatis saat pengembang/pengguna mengklik kartu aset mana saja di Katalog Aset, dan menyajikan informasi lengkap yang terorganisir dalam 3 tab navigasi.

---

## Decision Summary (Hasil Konfirmasi Pengguna)

> [!IMPORTANT]
> 1. **Trigger Pembukaan**: Cukup klik langsung pada area kartu aset (*Asset Card*) di Katalog Aset.
> 2. **Struktur Layout Drawer**: Menggunakan **3 Tab Terpisah**:
>    - **Tab 1: Informasi Utama & Fisik** (Spesifikasi, Foto/QR Code, PIC, Unit Kerja, Lokasi, Status Pinjam & Kondisi).
>    - **Tab 2: Keuangan & Depresiasi** (Harga Perolehan, Tanggal Beli, Umur Ekonomis, Nilai Residu, Nilai Buku Terkini, Sisa %, dan Log Penyusutan).
>    - **Tab 3: Linimasa Riwayat** (Rekam jejak Stock Opname, Peminjaman, dan Berita Acara terkait).

---

## 1. Arsitektur & Trigger Mekanisme

```
┌─────────────────────────────────────────────────────────────────┐
│ Katalog Aset (AssetMgmtTab.tsx)                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [Kartu Aset: Laptop ThinkPad T14]  ──(Klik Kartu)─────────┐ │ │
│ └─────────────────────────────────────────────────────────────┘ │ │
└─────────────────────────────────────────────────────────────────┴─┘
                                                                  │
                                                                  ▼
┌───────────────────────────────────────────────────────────────────┐
│ AssetDetailDrawer.tsx (Bottom Sheet)                              │
├───────────────────────────────────────────────────────────────────┤
│ [Header Ringkas] Tag ID + Nama Aset + Badge Kondisi               │
│ [Tab Switcher]  [1. Info Utama]  [2. Keuangan]  [3. Riwayat]     │
├───────────────────────────────────────────────────────────────────┤
│ [Content Tab 1 / 2 / 3]                                           │
│ [Footer Aksi Cepat]  [Edit Aset]  [Pinjam]  [Cetak Barcode]       │
└───────────────────────────────────────────────────────────────────┘
```

- **Pencegahan Event Collision**: Mengklik tombol multi-select checkbox atau tombol menu Kebab 3-titik akan menggunakan `e.stopPropagation()` agar tidak memicu pembukaan drawer detail secara tidak sengaja.

---

## 2. Rincian Konten Per Tab Dalam Drawer

### Tab 1: Informasi Utama & Fisik
- **Visual Asset**: Foto Produk ukuran medium atau QR Code & Code128 Barcode SVG.
- **Identitas Aset**: ID Tag Aset, Kode Barcode, S/N (Serial Number), Nama Barang, Jenis & Kategori.
- **Lokasi & Otoritas**: Unit Kerja Pengguna, Lokasi Ruang/Sub-Lokasi, Penanggung Jawab (PIC Master).
- **Status Operasional**: Status Pinjam (*Tersedia* / *Dipinjam* / *Overdue*) & Kondisi Fisik (*Baik*, *Rusak Ringan*, *Rusak Berat*, *Hilang*, *Musnah*).

### Tab 2: Keuangan & Depresiasi Nilai Buku
- **Ringkasan Finansial**:
  - Harga Perolehan (Harga Beli Awal)
  - Tanggal Perolehan & Tahun Beli
  - Umur Ekonomis (Masa Manfaat dalam Tahun)
  - Nilai Residu / Sisa (Rp)
- **Kalkulasi Nilai Buku Terkini**:
  - Nilai Buku saat ini (Rp) dengan lencana sisa % nilai.
  - Beban penyusutan per bulan & per tahun.
  - Akumulasi penyusutan hingga hari ini.
- **Tabel Histori Log Penyusutan (`Log_Penyusutan`)**:
  - Daftar historis beban penyusutan periodik yang pernah dieksekusi.

### Tab 3: Linimasa Riwayat & Rekam Jejak
- **Linimasa Kronologis**:
  1. Tanggal Perolehan & Awal Pembelian.
  2. Riwayat Verifikasi Audit Stock Opname (Tanggal SO, Petugas Audit, Sesi SO, Catatan SO).
  3. Riwayat Peminjaman & Pengembalian (Peminjam, Unit, Tanggal Pinjam, Target Kembali, Kondisi Saat Kembali).
  4. Riwayat Penerbitan Berita Acara (BAST Penerimaan, BAST Peminjaman, BA Mutasi, BA Penghapusan/Apkir).

---

## 3. Footer Aksi Cepat (*Quick Actions*)

Di bagian bawah drawer disiapkan baris aksi cepat sehingga pengguna yang sedang membaca detail aset dapat langsung mengeksekusi tindakan tanpa perlu menutup drawer:
- **Edit Aset** (membuka `FastEditAssetDrawer`)
- **Pinjam Aset** (membuka `LoanDrawer`)
- **Cetak Label Barcode** (membuka `BarcodeStudioDrawer`)

---

## 4. Rencana Langkah Eksekusi

1. **Komponen Baru**: Buat `src/components/AssetDetailDrawer.tsx`.
2. **Wiring Event Klik**: Tambahkan `onClick={() => onOpenDetailDrawer(asset)}` pada kontainer kartu aset di `src/components/AssetMgmtTab.tsx`.
3. **State Management**: Tambahkan state `isDetailDrawerOpen` dan `selectedDetailAsset` pada `src/App.tsx`.
4. **Verifikasi**: Jalankan `compile_applet` & `lint_applet` untuk memastikan bebas error.
