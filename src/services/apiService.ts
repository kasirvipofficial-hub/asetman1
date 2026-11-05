import { Asset, SesiSO, InitialDataResponse, ConditionType, RincianKondisi, AssetLoan, BeritaAcaraDoc, LogPenyusutan } from '../types';
import { calculateAssetDepreciation, syncAssetBookValue, runPeriodicDepreciationBatch } from '../utils/depreciation';

export const DEFAULT_GAS_WEB_APP_URL: string = "https://script.google.com/macros/s/AKfycbwQeR0vlOVNmI9UwVOijAd20mvpjfuMw9TCRElhK7T6L21VGUbCjHwMPumIY1hO1DO5/exec";

const STORAGE_KEYS = {
  GAS_URL: 'so_gas_web_app_url',
  ASSETS: 'so_assets_data_real_v3',
  SESSIONS: 'so_sessions_data_real_v3',
  CATEGORIES: 'so_categories_real_v3',
  UNITS: 'so_units_real_v3',
  LOANS: 'so_loans_real_v3',
  BERITA_ACARA: 'so_ba_docs_real_v3',
  DEPRECIATION_LOGS: 'so_depreciation_logs_real_v3',
  ACTIVE_AUDITOR: 'so_active_auditor_v3',
};

export function getActiveAuditor(): string {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_AUDITOR) || 'Arno Kristanto';
}

export function setActiveAuditor(name: string) {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_AUDITOR, name.trim());
}

// Default initial master lists
const DEFAULT_CATEGORIES = ['IT & Elektronik', 'Mebel & Furnitur', 'Peralatan Kantor', 'Kendaraan', 'Perlengkapan'];
const DEFAULT_UNITS = ['HRD & General Affair', 'IT Operations', 'Keuangan & Akuntansi', 'Gudang Utama', 'Nursery Ciminyak'];

const INITIAL_REAL_ASSETS: Asset[] = [
  {
    ID_Asset: 'IT-HRD-2026-0001',
    Nama_Asset: 'Laptop ThinkPad T14 Gen 4',
    Kategori: 'IT & Elektronik',
    Jenis: 'Laptop Office',
    Penanggung_Jawab: 'Budi Santoso',
    Unit_Kerja: 'HRD & General Affair',
    Tahun_Beli: '2025',
    Tanggal_Perolehan: '2025-01-15',
    Lokasi: 'Ruang HRD Lt. 2',
    Jumlah_Asal: 1,
    Jumlah: 1,
    Kondisi: 'Baik',
    Rincian_Kondisi: { Baik: 1, Rusak_Ringan: 0, Rusak_Berat: 0, Hilang: 0, Musnah: 0 },
    Petugas_SO: 'Arno Kristanto',
    Keterangan_SO: 'Aset dalam kondisi sangat baik.',
    Tanggal_SO: '2026-02-10 10:00',
    Sesi_SO_Terakhir: 'SESI-001',
    Status_Audit: 'Sudah SO',
    Harga_Perolehan: 18500000,
    Masa_Manfaat: 4,
    Nilai_Sisa: 1850000,
    Nilai_Buku: 14333333,
    Nomor_Seri: 'PF-9821X902',
    Status_Pinjam: 'Tersedia',
  },
  {
    ID_Asset: 'IT-OPS-2026-0002',
    Nama_Asset: 'Printer Epson L3210 All-in-One',
    Kategori: 'IT & Elektronik',
    Jenis: 'Printer Multifungsi',
    Penanggung_Jawab: 'Rina Rahmawati',
    Unit_Kerja: 'IT Operations',
    Tahun_Beli: '2024',
    Tanggal_Perolehan: '2024-03-10',
    Lokasi: 'Ruang IT',
    Jumlah_Asal: 1,
    Jumlah: 1,
    Kondisi: 'Rusak Ringan',
    Rincian_Kondisi: { Baik: 0, Rusak_Ringan: 1, Rusak_Berat: 0, Hilang: 0, Musnah: 0 },
    Petugas_SO: 'Arno Kristanto',
    Keterangan_SO: 'Paper roller agak aus, perlu cleaning kit.',
    Tanggal_SO: '2026-02-12 11:30',
    Sesi_SO_Terakhir: 'SESI-001',
    Status_Audit: 'Sudah SO',
    Harga_Perolehan: 2750000,
    Masa_Manfaat: 3,
    Nilai_Sisa: 275000,
    Nilai_Buku: 1098611,
    Nomor_Seri: 'EPS-882190',
    Status_Pinjam: 'Tersedia',
  },
  {
    ID_Asset: 'FUR-KEU-2026-0003',
    Nama_Asset: 'Meja Kerja Ergonomis & Kursi Mesh',
    Kategori: 'Mebel & Furnitur',
    Jenis: 'Meja & Kursi',
    Penanggung_Jawab: 'Dian Permata',
    Unit_Kerja: 'Keuangan & Akuntansi',
    Tahun_Beli: '2023',
    Tanggal_Perolehan: '2023-06-01',
    Lokasi: 'Ruang Keuangan',
    Jumlah_Asal: 3,
    Jumlah: 3,
    Kondisi: 'Baik',
    Rincian_Kondisi: { Baik: 3, Rusak_Ringan: 0, Rusak_Berat: 0, Hilang: 0, Musnah: 0 },
    Petugas_SO: 'Arno Kristanto',
    Keterangan_SO: 'Semua unit lengkap.',
    Tanggal_SO: '2026-02-14 09:15',
    Sesi_SO_Terakhir: 'SESI-001',
    Status_Audit: 'Sudah SO',
    Harga_Perolehan: 4500000,
    Masa_Manfaat: 5,
    Nilai_Sisa: 450000,
    Nilai_Buku: 2325000,
    Status_Pinjam: 'Tersedia',
  },
];

const INITIAL_REAL_SESSIONS: SesiSO[] = [
  {
    ID_Sesi: 'SESI-001',
    Nama_Sesi: 'Stock Opname Awal Tahun 2026',
    Sheet_Name: 'SO_SESI_001',
    Tanggal_Mulai: new Date().toISOString().substring(0, 10),
    Target_Unit_Kerja: 'Semua',
    Petugas_Utama: 'Arno Kristanto',
    Status_Sesi: 'Aktif',
  }
];

const INITIAL_DEMO_LOANS: AssetLoan[] = [
  {
    ID_Pinjam: 'LNM-1001',
    ID_Asset: 'IT-HRD-2026-0001',
    Nama_Asset: 'Laptop ThinkPad T14 Gen 4',
    Nama_Peminjam: 'Bambang Sukoco',
    NIP_Peminjam: '199003152018011002',
    Unit_Peminjam: 'HRD & General Affair',
    Tanggal_Pinjam: '2026-02-20',
    Target_Kembali: '2026-03-01',
    Keperluan: 'Dinas Luar Kota Presentasi Klien',
    Status_Pinjam: 'Dipinjam',
    Petugas_Pinjam: 'Arno Kristanto',
    Kondisi_Saat_Pinjam: 'Baik',
  }
];

const INITIAL_DEMO_BA: BeritaAcaraDoc[] = [
  {
    ID_BA: 'BA-2026-001',
    Nomor_BA: 'BAST/IT/2026/001',
    Jenis_BA: 'BAST Penerimaan',
    Tanggal_BA: '2026-01-15',
    ID_Asset: 'IT-HRD-2026-0001',
    Nama_Asset: 'Laptop ThinkPad T14 Gen 4',
    Kategori: 'IT & Elektronik',
    Unit_Asal: 'Vendor PT IT Solusindo',
    Unit_Tujuan: 'HRD & General Affair',
    Alasan_Keterangan: 'Penerimaan pengadaan aset baru unit laptop dinas.',
    Nama_Pihak_1: 'Arno Kristanto',
    Jabatan_Pihak_1: 'Admin Aset',
    Nama_Pihak_2: 'Budi Santoso',
    Jabatan_Pihak_2: 'Penerima Barang',
    Status_BA: 'Disetujui',
  }
];

export function getStoredGasUrl(): string {
  const stored = localStorage.getItem(STORAGE_KEYS.GAS_URL);
  if (!stored || stored.trim() === '') {
    localStorage.setItem(STORAGE_KEYS.GAS_URL, DEFAULT_GAS_WEB_APP_URL);
    return DEFAULT_GAS_WEB_APP_URL;
  }
  return stored;
}

export function setStoredGasUrl(url: string) {
  localStorage.setItem(STORAGE_KEYS.GAS_URL, url.trim());
}

function getLocalAssets(): Asset[] {
  const data = localStorage.getItem(STORAGE_KEYS.ASSETS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(INITIAL_REAL_ASSETS));
    return INITIAL_REAL_ASSETS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_REAL_ASSETS;
  }
}

function saveLocalAssets(assets: Asset[]) {
  localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
}

function getLocalSessions(): SesiSO[] {
  const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(INITIAL_REAL_SESSIONS));
    return INITIAL_REAL_SESSIONS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_REAL_SESSIONS;
  }
}

function saveLocalSessions(sessions: SesiSO[]) {
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
}

export function getLocalCategories(): string[] {
  const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    return DEFAULT_CATEGORIES;
  }
  try {
    const list = JSON.parse(data);
    return Array.isArray(list) && list.length > 0 ? list : DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export function saveLocalCategories(list: string[]) {
  const unique = Array.from(new Set(list.filter(Boolean)));
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(unique));
}

export function getLocalUnits(): string[] {
  const data = localStorage.getItem(STORAGE_KEYS.UNITS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(DEFAULT_UNITS));
    return DEFAULT_UNITS;
  }
  try {
    const list = JSON.parse(data);
    return Array.isArray(list) && list.length > 0 ? list : DEFAULT_UNITS;
  } catch {
    return DEFAULT_UNITS;
  }
}

export function saveLocalUnits(list: string[]) {
  const unique = Array.from(new Set(list.filter(Boolean)));
  localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(unique));
}

export function getLocalLoans(): AssetLoan[] {
  const data = localStorage.getItem(STORAGE_KEYS.LOANS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(INITIAL_DEMO_LOANS));
    return INITIAL_DEMO_LOANS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_DEMO_LOANS;
  }
}

export function saveLocalLoans(loans: AssetLoan[]) {
  localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
}

export function getLocalBeritaAcaraDocs(): BeritaAcaraDoc[] {
  const data = localStorage.getItem(STORAGE_KEYS.BERITA_ACARA);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.BERITA_ACARA, JSON.stringify(INITIAL_DEMO_BA));
    return INITIAL_DEMO_BA;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_DEMO_BA;
  }
}

export function saveLocalBeritaAcaraDocs(docs: BeritaAcaraDoc[]) {
  localStorage.setItem(STORAGE_KEYS.BERITA_ACARA, JSON.stringify(docs));
}

// Local storage helpers & internal sync functions
function updateLocalStockOpnameInternal(payload: {
  ID_Asset: string;
  Kondisi: ConditionType;
  Jumlah: number;
  Rincian_Kondisi: RincianKondisi;
  Petugas_SO: string;
  Keterangan_SO: string;
  Sesi_SO_Terakhir: string;
}): InitialDataResponse {
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const assets = getLocalAssets();
  const updated = assets.map((a) => {
    if (a.ID_Asset === payload.ID_Asset) {
      const prevAuditHistory = a.Kondisi
        ? {
            Kondisi: a.Kondisi,
            Jumlah: a.Jumlah,
            Rincian: a.Rincian_Kondisi || { Baik: a.Jumlah, Rusak_Ringan: 0, Rusak_Berat: 0, Hilang: 0, Musnah: 0 },
            Tanggal_SO: a.Tanggal_SO || 'Sebelumnya',
            Petugas_SO: a.Petugas_SO || 'Petugas Lalu',
            Keterangan_SO: a.Keterangan_SO || '-',
            Sesi_SO: a.Sesi_SO_Terakhir || '-',
          }
        : a.Audit_Sebelumnya;

      return {
        ...a,
        Audit_Sebelumnya: prevAuditHistory,
        Kondisi: payload.Kondisi,
        Jumlah: payload.Jumlah,
        Rincian_Kondisi: payload.Rincian_Kondisi,
        Petugas_SO: payload.Petugas_SO,
        Keterangan_SO: payload.Keterangan_SO,
        Tanggal_SO: nowStr,
        Sesi_SO_Terakhir: payload.Sesi_SO_Terakhir,
        Status_Audit: 'Sudah SO' as const,
      };
    }
    return a;
  });
  saveLocalAssets(updated);
  return {
    assets: updated,
    sessions: getLocalSessions(),
    categories: getLocalCategories(),
    units: getLocalUnits(),
    loans: getLocalLoans(),
    beritaAcaraDocs: getLocalBeritaAcaraDocs(),
  };
}

function addLocalAssetInternal(
  newAsset: Omit<Asset, 'Tanggal_SO' | 'Sesi_SO_Terakhir' | 'Status_Audit' | 'Rincian_Kondisi' | 'Petugas_SO'>
): InitialDataResponse {
  const jml = Number(newAsset.Jumlah) || 1;
  const initialRincian: RincianKondisi = { Baik: jml, Rusak_Ringan: 0, Rusak_Berat: 0, Hilang: 0, Musnah: 0 };
  const currentAuditor = getActiveAuditor();
  const jmlAsal = newAsset.Jumlah_Asal !== undefined ? Number(newAsset.Jumlah_Asal) : jml;

  const currentKats = getLocalCategories();
  if (newAsset.Kategori && !currentKats.includes(newAsset.Kategori)) {
    saveLocalCategories([...currentKats, newAsset.Kategori]);
  }
  const currentUnits = getLocalUnits();
  if (newAsset.Unit_Kerja && !currentUnits.includes(newAsset.Unit_Kerja)) {
    saveLocalUnits([...currentUnits, newAsset.Unit_Kerja]);
  }

  const assets = getLocalAssets();
  const createdAsset: Asset = {
    ...newAsset,
    Jumlah_Asal: jmlAsal,
    Rincian_Kondisi: initialRincian,
    Petugas_SO: currentAuditor,
    Tanggal_SO: '',
    Sesi_SO_Terakhir: '',
    Status_Audit: 'Belum SO',
    Status_Pinjam: 'Tersedia',
  };
  const updated = [createdAsset, ...assets];
  saveLocalAssets(updated);
  return {
    assets: updated,
    sessions: getLocalSessions(),
    categories: getLocalCategories(),
    units: getLocalUnits(),
    loans: getLocalLoans(),
    beritaAcaraDocs: getLocalBeritaAcaraDocs(),
  };
}

function createLocalSessionInternal(payload: {
  Nama_Sesi: string;
  Tanggal_Mulai: string;
  Target_Unit_Kerja: string;
  Scope_Kategori?: string;
  Scope_Lokasi?: string;
  Petugas_Utama: string;
  autoReset?: boolean;
}): InitialDataResponse {
  const newId = `SESI-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 900))}`;
  const sheetName = `SO_${newId.replace(/[^a-zA-Z0-9]/g, '_')}`;

  const sessions = getLocalSessions().map((s) => ({ ...s, Status_Sesi: 'Selesai' as const }));
  const newSession: SesiSO = {
    ID_Sesi: newId,
    Nama_Sesi: payload.Nama_Sesi,
    Sheet_Name: sheetName,
    Tanggal_Mulai: payload.Tanggal_Mulai,
    Target_Unit_Kerja: payload.Target_Unit_Kerja,
    Scope_Kategori: payload.Scope_Kategori || 'Semua',
    Scope_Lokasi: payload.Scope_Lokasi || 'Semua',
    Petugas_Utama: payload.Petugas_Utama,
    Status_Sesi: 'Aktif',
  };
  const updatedSessions = [newSession, ...sessions];
  saveLocalSessions(updatedSessions);

  let assets = getLocalAssets();
  if (payload.autoReset !== false) {
    assets = assets.map((a) => {
      const matchUnit = payload.Target_Unit_Kerja === 'Semua' || a.Unit_Kerja === payload.Target_Unit_Kerja;
      const matchCat = !payload.Scope_Kategori || payload.Scope_Kategori === 'Semua' || a.Kategori === payload.Scope_Kategori;
      const matchLoc = !payload.Scope_Lokasi || payload.Scope_Lokasi === 'Semua' || (a.Lokasi && a.Lokasi.toLowerCase().includes(payload.Scope_Lokasi.toLowerCase()));
      
      if (matchUnit && matchCat && matchLoc) {
        return {
          ...a,
          Petugas_SO: payload.Petugas_Utama,
          Status_Audit: 'Belum SO' as const,
        };
      }
      return a;
    });
    saveLocalAssets(assets);
  }

  return {
    assets,
    sessions: updatedSessions,
    categories: getLocalCategories(),
    units: getLocalUnits(),
    loans: getLocalLoans(),
    beritaAcaraDocs: getLocalBeritaAcaraDocs(),
  };
}

export function normalizeRawAsset(raw: any, idx: number, seenIds: Map<string, number>): Asset {
  let rawId = String(raw.ID_Asset || raw.Kode_Asset || raw['ID Asset'] || '').trim();
  if (!rawId) {
    rawId = `AST-${100 + idx}`;
  }
  const count = seenIds.get(rawId) || 0;
  seenIds.set(rawId, count + 1);
  const idAsset = count === 0 ? rawId : `${rawId}-${count + 1}`;

  const namaAsset = String(raw.Nama_Asset || raw['Nama Asset'] || raw.Nama_Barang || raw.Nama || 'Barang Tanpa Nama').trim();
  const kategori = String(raw.Kategori || 'Peralatan').trim();
  const jenis = String(raw.Jenis || raw.Tipe || '').trim();
  const pic = String(raw.Penanggung_Jawab || raw['PIC Master'] || raw.PIC || '-').trim();
  const unit = String(raw.Unit_Kerja || raw['Unit Kerja'] || raw.Unit || 'Nursery Ciminyak').trim();
  const tahunBeli = raw.Tahun_Beli || raw['Tahun Beli'] || '';
  const lokasi = raw.Lokasi || raw['Lokasi Barang'] || '';

  const jumlahAsal = Number(raw.Jumlah_Asal) || Number(raw['Jumlah Asal']) || Number(raw.Jumlah) || 1;

  const baik = Number(raw.Jml_Baik) || (raw.Kondisi_Terakhir === 'Baik' || raw.Kondisi === 'Baik' ? (Number(raw.Jumlah) || jumlahAsal) : 0);
  const rr = Number(raw.Jml_Rusak_Ringan) || (raw.Kondisi_Terakhir === 'Rusak Ringan' || raw.Kondisi === 'Rusak Ringan' ? (Number(raw.Jumlah) || jumlahAsal) : 0);
  const rb = Number(raw.Jml_Rusak_Berat) || (raw.Kondisi_Terakhir === 'Rusak Berat' || raw.Kondisi === 'Rusak Berat' ? (Number(raw.Jumlah) || jumlahAsal) : 0);
  const hilang = Number(raw.Jml_Hilang) || (raw.Kondisi_Terakhir === 'Hilang' || raw.Kondisi === 'Hilang' ? (Number(raw.Jumlah) || jumlahAsal) : 0);
  const musnah = Number(raw.Jml_Musnah) || (raw.Kondisi_Terakhir === 'Musnah' || raw.Kondisi === 'Musnah' ? (Number(raw.Jumlah) || jumlahAsal) : 0);

  const conditionSum = baik + rr + rb + hilang + musnah;
  const totalJumlah = Number(raw.Jumlah) || (conditionSum > 0 ? conditionSum : jumlahAsal);

  let kondisi: ConditionType = 'Baik';
  const rawKondisi = String(raw.Kondisi || raw.Kondisi_Terakhir || '').trim();
  if (['Baik', 'Rusak Ringan', 'Rusak Berat', 'Hilang', 'Musnah'].includes(rawKondisi)) {
    kondisi = rawKondisi as ConditionType;
  } else if (rr > 0 && rr >= baik) {
    kondisi = 'Rusak Ringan';
  } else if (rb > 0 && rb >= baik) {
    kondisi = 'Rusak Berat';
  } else if (musnah > 0) {
    kondisi = 'Musnah';
  } else if (hilang > 0) {
    kondisi = 'Hilang';
  }

  const isAudited = Boolean(raw.Tanggal_SO || raw.Status_Audit === 'Sudah SO');

  const hargaPerolehan = Number(raw.Harga_Perolehan || raw['Harga Perolehan'] || raw.Harga_Asal || raw['Harga Asal']) || undefined;
  const tglPerolehan = raw.Tanggal_Perolehan || raw['Tanggal Perolehan'] || raw.Tgl_Beli || (raw.Tahun_Beli ? `${raw.Tahun_Beli}-01-01` : undefined);
  const masaManfaat = Number(raw.Masa_Manfaat || raw['Masa Manfaat'] || raw.Umur_Ekonomis) || 4;
  const nilaiSisa = Number(raw.Nilai_Sisa || raw['Nilai Sisa'] || raw.Nilai_Residu) || (hargaPerolehan ? Math.round(hargaPerolehan * 0.1) : 0);
  
  let nilaiBuku = raw.Nilai_Buku !== undefined && raw.Nilai_Buku !== '' ? Number(raw.Nilai_Buku) : undefined;
  if (nilaiBuku === undefined && hargaPerolehan) {
    const calc = calculateAssetDepreciation({
      Harga_Perolehan: hargaPerolehan,
      Tanggal_Perolehan: tglPerolehan,
      Tahun_Beli: tahunBeli,
      Masa_Manfaat: masaManfaat,
      Nilai_Sisa: nilaiSisa,
    });
    nilaiBuku = calc.nilaiBukuSaatIni;
  }

  return {
    ID_Asset: idAsset,
    Nama_Asset: namaAsset,
    Kategori: kategori,
    Jenis: jenis,
    Penanggung_Jawab: pic,
    Unit_Kerja: unit,
    Tahun_Beli: tahunBeli ? String(tahunBeli) : undefined,
    Tanggal_Perolehan: tglPerolehan ? String(tglPerolehan) : undefined,
    Lokasi: lokasi ? String(lokasi) : undefined,
    Jumlah_Asal: jumlahAsal,
    Jumlah: totalJumlah,
    Kondisi: kondisi,
    Rincian_Kondisi: {
      Baik: baik || (kondisi === 'Baik' ? totalJumlah : 0),
      Rusak_Ringan: rr || (kondisi === 'Rusak Ringan' ? totalJumlah : 0),
      Rusak_Berat: rb || (kondisi === 'Rusak Berat' ? totalJumlah : 0),
      Hilang: hilang || (kondisi === 'Hilang' ? totalJumlah : 0),
      Musnah: musnah || (kondisi === 'Musnah' ? totalJumlah : 0),
    },
    Petugas_SO: String(raw.Petugas_SO || ''),
    Keterangan_SO: String(raw.Keterangan_SO || raw.Catatan || ''),
    Tanggal_SO: String(raw.Tanggal_SO || ''),
    Sesi_SO_Terakhir: String(raw.Sesi_SO_Terakhir || 'SESI-001'),
    Status_Audit: isAudited ? 'Sudah SO' : 'Belum SO',
    Harga_Perolehan: hargaPerolehan,
    Masa_Manfaat: masaManfaat,
    Nilai_Sisa: nilaiSisa,
    Nilai_Buku: nilaiBuku,
    Nomor_Seri: raw.Nomor_Seri ? String(raw.Nomor_Seri) : undefined,
    Foto_Asset: raw.Foto_Asset ? String(raw.Foto_Asset) : undefined,
    Status_Pinjam: raw.Status_Pinjam || 'Tersedia',
  };
}

export function normalizeAssetList(rawAssets: any[]): Asset[] {
  if (!Array.isArray(rawAssets)) return [];
  const seenIds = new Map<string, number>();
  return rawAssets.map((a, idx) => normalizeRawAsset(a, idx, seenIds));
}

export async function fetchInitialData(activeSheetName?: string): Promise<InitialDataResponse> {
  const gasUrl = getStoredGasUrl();

  if (!gasUrl) {
    const assets = getLocalAssets();
    const categoriesFromAssets = assets.map((a) => a.Kategori).filter((k) => k && k.trim() !== 'Semua');
    const unitsFromAssets = assets.map((a) => a.Unit_Kerja).filter((u) => u && u.trim() !== 'Semua');
    const categories = Array.from(new Set([...getLocalCategories(), ...categoriesFromAssets].filter((k) => k && k.trim() !== 'Semua')));
    const units = Array.from(new Set([...getLocalUnits(), ...unitsFromAssets].filter((u) => u && u.trim() !== 'Semua')));
    saveLocalCategories(categories);
    saveLocalUnits(units);

    return {
      assets,
      sessions: getLocalSessions(),
      categories,
      units,
      loans: getLocalLoans(),
      beritaAcaraDocs: getLocalBeritaAcaraDocs(),
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);
    const urlWithParam = activeSheetName ? `${gasUrl}?sheet=${encodeURIComponent(activeSheetName)}` : gasUrl;
    const res = await fetch(urlWithParam, { method: 'GET', signal: controller.signal });
    clearTimeout(timeoutId);

    const json = await res.json();
    if (json.status === 'success' && json.data) {
      let rawAssets = Array.isArray(json.data.assets) ? json.data.assets : [];

      if (rawAssets.length === 0 && !activeSheetName) {
        try {
          const masterCtrl = new AbortController();
          const masterTimeout = setTimeout(() => masterCtrl.abort(), 9000);
          const masterRes = await fetch(`${gasUrl}?sheet=Master_Assets`, { method: 'GET', signal: masterCtrl.signal });
          clearTimeout(masterTimeout);
          const masterJson = await masterRes.json();
          if (masterJson.status === 'success' && Array.isArray(masterJson.data?.assets) && masterJson.data.assets.length > 0) {
            rawAssets = masterJson.data.assets;
            if (masterJson.data.categories) json.data.categories = masterJson.data.categories;
            if (masterJson.data.units) json.data.units = masterJson.data.units;
          }
        } catch (mErr) {
          console.warn('Fallback to Master_Assets failed:', mErr);
        }
      }

      const seenIds = new Map<string, number>();
      const normalizedAssets = rawAssets.map((a: any, idx: number) => normalizeRawAsset(a, idx, seenIds));

      const dynamicCats = Array.from(
        new Set([...(json.data.categories || getLocalCategories()), ...normalizedAssets.map((a: Asset) => a.Kategori)].filter((k) => k && k.trim() !== 'Semua'))
      );
      const dynamicUnits = Array.from(
        new Set([...(json.data.units || getLocalUnits()), ...normalizedAssets.map((a: Asset) => a.Unit_Kerja)].filter((u) => u && u.trim() !== 'Semua'))
      );

      saveLocalAssets(normalizedAssets);
      saveLocalSessions(json.data.sessions || []);
      saveLocalCategories(dynamicCats);
      saveLocalUnits(dynamicUnits);

      return {
        assets: normalizedAssets,
        sessions: json.data.sessions || [],
        categories: dynamicCats,
        units: dynamicUnits,
        loans: json.data.loans || getLocalLoans(),
        beritaAcaraDocs: json.data.beritaAcaraDocs || getLocalBeritaAcaraDocs(),
      };
    }
    throw new Error(json.message || 'Gagal mengambil data dari Google Sheet');
  } catch (err) {
    console.warn('Fallback to LocalStorage due to API fetch error:', err);
    return {
      assets: getLocalAssets(),
      sessions: getLocalSessions(),
      categories: getLocalCategories(),
      units: getLocalUnits(),
      loans: getLocalLoans(),
      beritaAcaraDocs: getLocalBeritaAcaraDocs(),
    };
  }
}

export async function updateStockOpname(payload: {
  ID_Asset: string;
  Kondisi: ConditionType;
  Jumlah: number;
  Rincian_Kondisi: RincianKondisi;
  Petugas_SO: string;
  Keterangan_SO: string;
  Sesi_SO_Terakhir: string;
}): Promise<InitialDataResponse> {
  const gasUrl = getStoredGasUrl();
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

  if (!gasUrl) {
    return updateLocalStockOpnameInternal(payload);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      signal: controller.signal,
      body: JSON.stringify({
        action: 'updateStockOpname',
        payload: {
          ...payload,
          Kondisi_Terakhir: payload.Kondisi,
          Tanggal_SO: nowStr,
        },
      }),
    });
    clearTimeout(timeoutId);

    const json = await res.json();
    if (json.status === 'success' && json.data) {
      const normalized = normalizeAssetList(json.data.assets);
      saveLocalAssets(normalized);
      saveLocalSessions(json.data.sessions);
      if (json.data.categories) saveLocalCategories(json.data.categories);
      if (json.data.units) saveLocalUnits(json.data.units);
      return {
        ...json.data,
        assets: normalized,
        loans: getLocalLoans(),
        beritaAcaraDocs: getLocalBeritaAcaraDocs(),
      };
    }
    throw new Error(json.message || 'Gagal memperbarui data SO');
  } catch (err) {
    console.warn('GAS POST failed, falling back to local update:', err);
    return updateLocalStockOpnameInternal(payload);
  }
}

export async function addAsset(
  newAsset: Omit<Asset, 'Tanggal_SO' | 'Sesi_SO_Terakhir' | 'Status_Audit' | 'Rincian_Kondisi' | 'Petugas_SO'>
): Promise<InitialDataResponse> {
  const gasUrl = getStoredGasUrl();
  const jml = Number(newAsset.Jumlah) || 1;
  const initialRincian: RincianKondisi = { Baik: jml, Rusak_Ringan: 0, Rusak_Berat: 0, Hilang: 0, Musnah: 0 };
  const currentAuditor = getActiveAuditor();
  const jmlAsal = newAsset.Jumlah_Asal !== undefined ? Number(newAsset.Jumlah_Asal) : jml;

  if (!gasUrl) {
    return addLocalAssetInternal(newAsset);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      signal: controller.signal,
      body: JSON.stringify({
        action: 'addAsset',
        payload: {
          ...newAsset,
          Kondisi_Terakhir: newAsset.Kondisi || 'Baik',
          Jumlah_Asal: jmlAsal,
          Rincian_Kondisi: initialRincian,
          Petugas_SO: currentAuditor,
        },
      }),
    });
    clearTimeout(timeoutId);

    const json = await res.json();
    if (json.status === 'success' && json.data) {
      const normalized = normalizeAssetList(json.data.assets);
      saveLocalAssets(normalized);
      saveLocalSessions(json.data.sessions);
      if (json.data.categories) saveLocalCategories(json.data.categories);
      if (json.data.units) saveLocalUnits(json.data.units);
      return {
        ...json.data,
        assets: normalized,
        loans: getLocalLoans(),
        beritaAcaraDocs: getLocalBeritaAcaraDocs(),
      };
    }
    throw new Error(json.message || 'Gagal menambah aset');
  } catch (err) {
    console.warn('GAS addAsset failed, using local update:', err);
    return addLocalAssetInternal(newAsset);
  }
}

export async function addCategory(name: string): Promise<InitialDataResponse> {
  const clean = name.trim();
  if (!clean) return fetchInitialData();

  const current = getLocalCategories();
  if (!current.includes(clean)) saveLocalCategories([...current, clean]);

  return fetchInitialData();
}

export async function addUnit(name: string): Promise<InitialDataResponse> {
  const clean = name.trim();
  if (!clean) return fetchInitialData();

  const current = getLocalUnits();
  if (!current.includes(clean)) saveLocalUnits([...current, clean]);

  return fetchInitialData();
}

export async function createSession(payload: {
  Nama_Sesi: string;
  Tanggal_Mulai: string;
  Target_Unit_Kerja: string;
  Scope_Kategori?: string;
  Scope_Lokasi?: string;
  Petugas_Utama: string;
  autoReset?: boolean;
}): Promise<InitialDataResponse> {
  const gasUrl = getStoredGasUrl();

  if (!gasUrl) {
    return createLocalSessionInternal(payload);
  }

  try {
    const newId = `SESI-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 900))}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      signal: controller.signal,
      body: JSON.stringify({
        action: 'createSession',
        payload: {
          ID_Sesi: newId,
          ...payload,
        },
      }),
    });
    clearTimeout(timeoutId);

    const json = await res.json();
    if (json.status === 'success' && json.data) {
      const normalized = normalizeAssetList(json.data.assets);
      saveLocalAssets(normalized);
      saveLocalSessions(json.data.sessions);
      if (json.data.categories) saveLocalCategories(json.data.categories);
      if (json.data.units) saveLocalUnits(json.data.units);
      return {
        ...json.data,
        assets: normalized,
        loans: getLocalLoans(),
        beritaAcaraDocs: getLocalBeritaAcaraDocs(),
      };
    }
    throw new Error(json.message || 'Gagal membuat sesi SO baru');
  } catch (err) {
    console.warn('GAS createSession failed, falling back to local update:', err);
    return createLocalSessionInternal(payload);
  }
}

export async function updateAsset(updatedAsset: Asset): Promise<InitialDataResponse> {
  const gasUrl = getStoredGasUrl();
  const currentAssets = getLocalAssets();

  const sanitizedAsset: Asset = {
    ...updatedAsset,
    Kondisi: updatedAsset.Kondisi || 'Baik',
    Harga_Perolehan: updatedAsset.Harga_Perolehan !== undefined ? Number(updatedAsset.Harga_Perolehan) : undefined,
    Nilai_Buku: updatedAsset.Nilai_Buku !== undefined ? Number(updatedAsset.Nilai_Buku) : undefined,
  };

  const updatedAssets = currentAssets.map((a) => (a.ID_Asset === sanitizedAsset.ID_Asset ? sanitizedAsset : a));
  saveLocalAssets(updatedAssets);

  if (gasUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        signal: controller.signal,
        body: JSON.stringify({
          action: 'updateAsset',
          payload: {
            ...sanitizedAsset,
            Kondisi_Terakhir: sanitizedAsset.Kondisi,
            Harga_Perolehan: sanitizedAsset.Harga_Perolehan !== undefined ? sanitizedAsset.Harga_Perolehan : '',
            Nilai_Buku: sanitizedAsset.Nilai_Buku !== undefined ? sanitizedAsset.Nilai_Buku : '',
          },
        }),
      });
      clearTimeout(timeoutId);
      const json = await res.json();
      if (json.status === 'success' && json.data?.assets) {
        const normalized = normalizeAssetList(json.data.assets);
        saveLocalAssets(normalized);
        return {
          assets: normalized,
          sessions: json.data.sessions || getLocalSessions(),
          categories: json.data.categories || getLocalCategories(),
          units: json.data.units || getLocalUnits(),
          loans: json.data.loans || getLocalLoans(),
          beritaAcaraDocs: json.data.beritaAcaraDocs || getLocalBeritaAcaraDocs(),
        };
      }
    } catch (err) {
      console.warn('GAS updateAsset failed, saved locally:', err);
    }
  }

  return {
    assets: updatedAssets,
    sessions: getLocalSessions(),
    categories: getLocalCategories(),
    units: getLocalUnits(),
    loans: getLocalLoans(),
    beritaAcaraDocs: getLocalBeritaAcaraDocs(),
  };
}

export async function deleteAsset(assetId: string): Promise<InitialDataResponse> {
  const gasUrl = getStoredGasUrl();
  const currentAssets = getLocalAssets();
  const updatedAssets = currentAssets.filter((a) => a.ID_Asset !== assetId);
  saveLocalAssets(updatedAssets);

  if (gasUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        signal: controller.signal,
        body: JSON.stringify({
          action: 'deleteAsset',
          payload: { ID_Asset: assetId },
        }),
      });
      clearTimeout(timeoutId);
      const json = await res.json();
      if (json.status === 'success' && json.data?.assets) {
        const normalized = normalizeAssetList(json.data.assets);
        saveLocalAssets(normalized);
        return {
          assets: normalized,
          sessions: json.data.sessions || getLocalSessions(),
          categories: json.data.categories || getLocalCategories(),
          units: json.data.units || getLocalUnits(),
          loans: json.data.loans || getLocalLoans(),
          beritaAcaraDocs: json.data.beritaAcaraDocs || getLocalBeritaAcaraDocs(),
        };
      }
    } catch (err) {
      console.warn('GAS deleteAsset failed, saved locally:', err);
    }
  }

  return {
    assets: updatedAssets,
    sessions: getLocalSessions(),
    categories: getLocalCategories(),
    units: getLocalUnits(),
    loans: getLocalLoans(),
    beritaAcaraDocs: getLocalBeritaAcaraDocs(),
  };
}

export async function batchUpdateAssets(updatedList: Asset[]): Promise<InitialDataResponse> {
  const itemMap = new Map(updatedList.map((a) => [a.ID_Asset, a]));
  const currentAssets = getLocalAssets();
  const updatedAssets = currentAssets.map((a) => (itemMap.has(a.ID_Asset) ? itemMap.get(a.ID_Asset)! : a));
  saveLocalAssets(updatedAssets);

  const gasUrl = getStoredGasUrl();
  if (gasUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);
      const res = await fetch(gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        signal: controller.signal,
        body: JSON.stringify({
          action: 'batchUpdateAssets',
          payload: { assets: updatedList },
        }),
      });
      clearTimeout(timeoutId);
      const json = await res.json();
      if (json.status === 'success' && json.data?.assets) {
        saveLocalAssets(json.data.assets);
      }
    } catch (err) {
      console.warn('GAS batchUpdateAssets failed, saved locally:', err);
    }
  }

  return {
    assets: updatedAssets,
    sessions: getLocalSessions(),
    categories: getLocalCategories(),
    units: getLocalUnits(),
    loans: getLocalLoans(),
    beritaAcaraDocs: getLocalBeritaAcaraDocs(),
  };
}

export async function updateSession(updatedSession: SesiSO): Promise<{ sessions: SesiSO[] }> {
  const currentSessions = getLocalSessions();
  const updated = currentSessions.map((s) => (s.ID_Sesi === updatedSession.ID_Sesi ? updatedSession : s));
  saveLocalSessions(updated);

  const gasUrl = getStoredGasUrl();
  if (gasUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        signal: controller.signal,
        body: JSON.stringify({
          action: 'updateSession',
          payload: updatedSession,
        }),
      });
      clearTimeout(timeoutId);
      const json = await res.json();
      if (json.status === 'success' && json.data?.sessions) {
        saveLocalSessions(json.data.sessions);
        return { sessions: json.data.sessions };
      }
    } catch (err) {
      console.warn('GAS updateSession failed, saved locally:', err);
    }
  }
  return { sessions: updated };
}

export async function deleteSession(sessionId: string): Promise<{ sessions: SesiSO[] }> {
  const currentSessions = getLocalSessions();
  if (currentSessions.length <= 1) {
    throw new Error('Minimal harus ada 1 sesi Stock Opname.');
  }
  const updated = currentSessions.filter((s) => s.ID_Sesi !== sessionId);
  const hasActive = updated.some((s) => s.Status_Sesi === 'Aktif');
  if (!hasActive && updated.length > 0) {
    updated[0].Status_Sesi = 'Aktif';
  }
  saveLocalSessions(updated);

  const gasUrl = getStoredGasUrl();
  if (gasUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        signal: controller.signal,
        body: JSON.stringify({
          action: 'deleteSession',
          payload: { ID_Sesi: sessionId },
        }),
      });
      clearTimeout(timeoutId);
      const json = await res.json();
      if (json.status === 'success' && json.data?.sessions) {
        saveLocalSessions(json.data.sessions);
        return { sessions: json.data.sessions };
      }
    } catch (err) {
      console.warn('GAS deleteSession failed, saved locally:', err);
    }
  }
  return { sessions: updated };
}

export function updateLocalSession(updatedSession: SesiSO): { sessions: SesiSO[] } {
  updateSession(updatedSession); // triggers background GAS sync
  const currentSessions = getLocalSessions();
  const updated = currentSessions.map((s) => (s.ID_Sesi === updatedSession.ID_Sesi ? updatedSession : s));
  saveLocalSessions(updated);
  return { sessions: updated };
}

export function deleteLocalSession(sessionId: string): { sessions: SesiSO[] } {
  const currentSessions = getLocalSessions();
  if (currentSessions.length <= 1) {
    throw new Error('Minimal harus ada 1 sesi Stock Opname.');
  }
  const updated = currentSessions.filter((s) => s.ID_Sesi !== sessionId);
  const hasActive = updated.some((s) => s.Status_Sesi === 'Aktif');
  if (!hasActive && updated.length > 0) {
    updated[0].Status_Sesi = 'Aktif';
  }
  saveLocalSessions(updated);
  deleteSession(sessionId); // triggers background GAS sync
  return { sessions: updated };
}

export function setActiveSession(sessionId: string): { sessions: SesiSO[] } {
  const currentSessions = getLocalSessions();
  const updated = currentSessions.map((s) => ({
    ...s,
    Status_Sesi: (s.ID_Sesi === sessionId ? 'Aktif' : 'Selesai') as 'Aktif' | 'Selesai',
  }));
  saveLocalSessions(updated);
  return { sessions: updated };
}

export function saveAssetLoan(newLoan: AssetLoan): { assets: Asset[]; loans: AssetLoan[] } {
  const currentLoans = getLocalLoans();
  const updatedLoans = [newLoan, ...currentLoans];
  saveLocalLoans(updatedLoans);

  // Mark asset status as Dipinjam
  const currentAssets = getLocalAssets();
  const targetIds = newLoan.ID_Asset_List && newLoan.ID_Asset_List.length > 0 ? newLoan.ID_Asset_List : [newLoan.ID_Asset];
  const updatedAssets = currentAssets.map((a) => {
    if (targetIds.includes(a.ID_Asset)) {
      return {
        ...a,
        Status_Pinjam: 'Dipinjam' as const,
        Peminjam_Aktif: newLoan.Nama_Peminjam,
      };
    }
    return a;
  });
  saveLocalAssets(updatedAssets);

  // Background sync to GAS
  const gasUrl = getStoredGasUrl();
  if (gasUrl) {
    fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'saveLoan',
        payload: newLoan,
      }),
    }).catch((err) => console.warn('GAS saveLoan sync failed:', err));
  }

  return { assets: updatedAssets, loans: updatedLoans };
}

export function processReturnAssetLoan(
  loanId: string,
  kondisiKembali: ConditionType,
  catatanKembali: string
): { assets: Asset[]; loans: AssetLoan[] } {
  const currentLoans = getLocalLoans();
  let targetAssetId = '';

  const updatedLoans = currentLoans.map((l) => {
    if (l.ID_Pinjam === loanId) {
      targetAssetId = l.ID_Asset;
      return {
        ...l,
        Status_Pinjam: 'Dikembalikan' as const,
        Tanggal_Kembali: new Date().toISOString().substring(0, 10),
        Kondisi_Saat_Kembali: kondisiKembali,
        Catatan: catatanKembali,
      };
    }
    return l;
  });
  saveLocalLoans(updatedLoans);

  const currentAssets = getLocalAssets();
  const updatedAssets = currentAssets.map((a) => {
    if (a.ID_Asset === targetAssetId) {
      return {
        ...a,
        Status_Pinjam: 'Tersedia' as const,
        Peminjam_Aktif: undefined,
        Kondisi: kondisiKembali,
      };
    }
    return a;
  });
  saveLocalAssets(updatedAssets);

  // Background sync to GAS
  const gasUrl = getStoredGasUrl();
  if (gasUrl) {
    fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'returnLoan',
        payload: {
          ID_Pinjam: loanId,
          ID_Asset: targetAssetId,
          Kondisi_Kembali: kondisiKembali,
          Catatan_Kembali: catatanKembali,
        },
      }),
    }).catch((err) => console.warn('GAS returnLoan sync failed:', err));
  }

  return { assets: updatedAssets, loans: updatedLoans };
}

export function saveBeritaAcaraDocument(doc: BeritaAcaraDoc): BeritaAcaraDoc[] {
  const current = getLocalBeritaAcaraDocs();
  const updated = [doc, ...current];
  saveLocalBeritaAcaraDocs(updated);

  // Background sync to GAS
  const gasUrl = getStoredGasUrl();
  if (gasUrl) {
    fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'saveBeritaAcara',
        payload: doc,
      }),
    }).catch((err) => console.warn('GAS saveBeritaAcara sync failed:', err));
  }

  return updated;
}

export function getLocalDepreciationLogs(): LogPenyusutan[] {
  const data = localStorage.getItem(STORAGE_KEYS.DEPRECIATION_LOGS);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveLocalDepreciationLogs(logs: LogPenyusutan[]) {
  localStorage.setItem(STORAGE_KEYS.DEPRECIATION_LOGS, JSON.stringify(logs));
}

export async function processPeriodicDepreciation(
  keteranganPeriod?: string
): Promise<InitialDataResponse & { totalBeban: number; newLogsCount: number }> {
  const currentAssets = getLocalAssets();
  const currentAuditor = getActiveAuditor();
  const { updatedAssets, generatedLogs, totalBeban } = runPeriodicDepreciationBatch(
    currentAssets,
    keteranganPeriod || `Penyusutan Periodik ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`,
    currentAuditor
  );

  saveLocalAssets(updatedAssets);
  const currentLogs = getLocalDepreciationLogs();
  const combinedLogs = [...generatedLogs, ...currentLogs];
  saveLocalDepreciationLogs(combinedLogs);

  // Sync to GAS background
  const gasUrl = getStoredGasUrl();
  if (gasUrl && generatedLogs.length > 0) {
    fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'batchDepreciation',
        payload: {
          logs: generatedLogs,
          assets: updatedAssets,
        },
      }),
    }).catch((err) => console.warn('GAS batchDepreciation sync failed:', err));
  }

  return {
    assets: updatedAssets,
    sessions: getLocalSessions(),
    categories: getLocalCategories(),
    units: getLocalUnits(),
    loans: getLocalLoans(),
    beritaAcaraDocs: getLocalBeritaAcaraDocs(),
    depreciationLogs: combinedLogs,
    totalBeban,
    newLogsCount: generatedLogs.length,
  };
}

export function resetDemoData(): InitialDataResponse {
  localStorage.removeItem(STORAGE_KEYS.ASSETS);
  localStorage.removeItem(STORAGE_KEYS.SESSIONS);
  localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
  localStorage.removeItem(STORAGE_KEYS.UNITS);
  localStorage.removeItem(STORAGE_KEYS.LOANS);
  localStorage.removeItem(STORAGE_KEYS.BERITA_ACARA);
  localStorage.removeItem(STORAGE_KEYS.DEPRECIATION_LOGS);
  return {
    assets: getLocalAssets(),
    sessions: getLocalSessions(),
    categories: getLocalCategories(),
    units: getLocalUnits(),
    loans: getLocalLoans(),
    beritaAcaraDocs: getLocalBeritaAcaraDocs(),
    depreciationLogs: [],
  };
}
