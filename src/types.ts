export type ConditionType = 'Baik' | 'Rusak Ringan' | 'Rusak Berat' | 'Hilang' | 'Musnah';
export type StatusAuditType = 'Sudah SO' | 'Belum SO';
export type StatusPinjamType = 'Tersedia' | 'Dipinjam' | 'Perbaikan' | 'Dalam Proses BA';
export type UserRole = 'Admin' | 'Auditor' | 'Staf';

export type JenisBeritaAcara =
  | 'BAST Penerimaan'
  | 'BAST Peminjaman'
  | 'BA Mutasi'
  | 'BA Penghapusan'
  | 'BA Pelelangan';

export interface RincianKondisi {
  Baik: number;
  Rusak_Ringan: number;
  Rusak_Berat: number;
  Hilang: number;
  Musnah: number;
}

export interface AuditSebelumnya {
  Kondisi: ConditionType;
  Jumlah: number;
  Rincian: RincianKondisi;
  Tanggal_SO: string;
  Petugas_SO: string;
  Keterangan_SO: string;
  Sesi_SO: string;
}

export interface LogPenyusutan {
  ID_Log: string;
  ID_Asset: string;
  Nama_Asset: string;
  Tanggal_Log: string;
  Nilai_Buku_Sebelum: number;
  Beban_Penyusutan: number;
  Nilai_Buku_Sesudah: number;
  Keterangan: string;
  Executor: string;
}

export interface Asset {
  ID_Asset: string;
  Nama_Asset: string;
  Kategori: string;
  Jenis: string;
  Penanggung_Jawab: string; // PIC Barang/Master
  Unit_Kerja: string;
  Tahun_Beli?: string | number;
  Lokasi?: string;
  Jumlah_Asal?: number;
  Jumlah: number;
  Kondisi: ConditionType;
  Rincian_Kondisi: RincianKondisi;
  Petugas_SO: string;
  Keterangan_SO: string;
  Tanggal_SO: string;
  Sesi_SO_Terakhir: string;
  Status_Audit: StatusAuditType;
  Audit_Sebelumnya?: AuditSebelumnya;
  // Dynamic Asset Lifecycle Fields
  Harga_Perolehan?: number;
  Harga_Asal?: number;
  Tanggal_Perolehan?: string; // YYYY-MM-DD
  Masa_Manfaat?: number; // Umur Ekonomis dalam Tahun (misal: 4)
  Nilai_Sisa?: number; // Residual value (default 0)
  Nilai_Buku?: number; // Nilai Buku Saat Ini
  Nomor_Seri?: string;
  Foto_Asset?: string;
  Status_Pinjam?: StatusPinjamType;
  Peminjam_Aktif?: string;
  Catatan_Khusus_Item?: string; // Per-item notes for batch/audit logs
  Log_Penyusutan?: LogPenyusutan[];
}

export interface AssetLoan {
  ID_Pinjam: string;
  ID_Asset: string;
  Nama_Asset: string;
  ID_Asset_List?: string[];
  Nama_Peminjam: string;
  NIP_Peminjam?: string;
  Unit_Peminjam: string;
  Tanggal_Pinjam: string;
  Target_Kembali: string;
  Tanggal_Kembali?: string;
  Keperluan: string;
  Status_Pinjam: 'Dipinjam' | 'Dikembalikan' | 'Overdue';
  Tanda_Tangan_Peminjam?: string;
  Petugas_Pinjam: string;
  Kondisi_Saat_Pinjam: ConditionType;
  Kondisi_Saat_Kembali?: ConditionType;
  Catatan?: string;
}

export interface BeritaAcaraDoc {
  ID_BA: string;
  Nomor_BA: string;
  Jenis_BA: JenisBeritaAcara;
  Tanggal_BA: string;
  ID_Asset: string;
  Nama_Asset: string;
  Aset_List?: Asset[]; // For Collective / Multi-Asset BA with itemized condition & notes
  Kategori: string;
  Unit_Asal?: string;
  Unit_Tujuan?: string;
  Penanggung_Jawab_Lama?: string;
  Penanggung_Jawab_Baru?: string;
  Alasan_Keterangan: string;
  Foto_Dokumen_Scan?: string;
  TTD_Pihak_1?: string;
  Nama_Pihak_1?: string;
  Jabatan_Pihak_1?: string;
  TTD_Pihak_2?: string;
  Nama_Pihak_2?: string;
  Jabatan_Pihak_2?: string;
  TTD_Atasan?: string;
  Nama_Atasan?: string;
  Status_BA: 'Draft' | 'Disetujui' | 'Arsip';
}

export interface BarcodeLabelConfig {
  mode: 'thermal_single' | 'a4_grid';
  includeLogo: boolean;
  includeQR: boolean;
  includeBarcode: boolean;
  companyName: string;
}

export interface SesiSO {
  ID_Sesi: string;
  Nama_Sesi: string;
  Sheet_Name: string;
  Tanggal_Mulai: string;
  Target_Unit_Kerja: string;
  Scope_Kategori?: string;
  Scope_Lokasi?: string;
  Petugas_Utama: string;
  Status_Sesi: 'Aktif' | 'Selesai';
}

export interface InitialDataResponse {
  assets: Asset[];
  sessions: SesiSO[];
  categories?: string[];
  units?: string[];
  loans?: AssetLoan[];
  beritaAcaraDocs?: BeritaAcaraDoc[];
  depreciationLogs?: LogPenyusutan[];
}
