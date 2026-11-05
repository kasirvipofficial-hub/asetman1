import { Asset, LogPenyusutan } from '../types';

/**
 * Calculates current book value, monthly depreciation, and accumulated depreciation
 * using the Straight-Line Method (Metode Garis Lurus).
 * 
 * Formula:
 * Monthly Depreciation = (Harga Perolehan - Nilai Sisa) / (Masa Manfaat * 12)
 * Elapsed Months = Months between Tanggal Perolehan (or Tahun Beli) and target date (now)
 * Accumulated Depreciation = Min(Harga Perolehan - Nilai Sisa, Monthly Depreciation * Elapsed Months)
 * Current Book Value = Max(Nilai Sisa, Harga Perolehan - Accumulated Depreciation)
 */

export interface DepreciationCalculationResult {
  hargaPerolehan: number;
  nilaiSisa: number;
  masaManfaatTahun: number;
  masaManfaatBulan: number;
  bebanPenyusutanBulan: number;
  bebanPenyusutanTahun: number;
  bulanBerjalan: number;
  akumulasiPenyusutan: number;
  nilaiBukuSaatIni: number;
  persentaseNilaiTersisa: number; // 0 - 100
  isFullyDepreciated: boolean;
}

export function calculateAssetDepreciation(
  asset: Partial<Asset>,
  asOfDate: Date = new Date()
): DepreciationCalculationResult {
  const hargaPerolehan = Number(asset.Harga_Perolehan) || 0;
  const nilaiSisa = Math.max(0, Number(asset.Nilai_Sisa) || 0);
  const masaManfaatTahun = Math.max(1, Number(asset.Masa_Manfaat) || 4);
  const masaManfaatBulan = masaManfaatTahun * 12;

  // Determine purchase date
  let acqDate: Date;
  if (asset.Tanggal_Perolehan && asset.Tanggal_Perolehan.trim() !== '') {
    acqDate = new Date(asset.Tanggal_Perolehan);
    if (isNaN(acqDate.getTime())) acqDate = new Date();
  } else if (asset.Tahun_Beli) {
    const yr = parseInt(String(asset.Tahun_Beli), 10);
    acqDate = isNaN(yr) ? new Date() : new Date(yr, 0, 1);
  } else {
    acqDate = new Date();
  }

  if (hargaPerolehan <= 0) {
    return {
      hargaPerolehan: 0,
      nilaiSisa: 0,
      masaManfaatTahun,
      masaManfaatBulan,
      bebanPenyusutanBulan: 0,
      bebanPenyusutanTahun: 0,
      bulanBerjalan: 0,
      akumulasiPenyusutan: 0,
      nilaiBukuSaatIni: 0,
      persentaseNilaiTersisa: 100,
      isFullyDepreciated: false,
    };
  }

  // Calculate elapsed months
  const yearDiff = asOfDate.getFullYear() - acqDate.getFullYear();
  const monthDiff = asOfDate.getMonth() - acqDate.getMonth();
  const rawMonths = yearDiff * 12 + monthDiff;
  const bulanBerjalan = Math.max(0, rawMonths);

  const totalDepreciable = Math.max(0, hargaPerolehan - nilaiSisa);
  const bebanPenyusutanBulan = Math.round(totalDepreciable / masaManfaatBulan);
  const bebanPenyusutanTahun = Math.round(totalDepreciable / masaManfaatTahun);

  const akumulasiPenyusutan = Math.min(totalDepreciable, Math.round(bebanPenyusutanBulan * bulanBerjalan));
  const nilaiBukuSaatIni = Math.max(nilaiSisa, hargaPerolehan - akumulasiPenyusutan);
  const persentaseNilaiTersisa = hargaPerolehan > 0 ? Math.round((nilaiBukuSaatIni / hargaPerolehan) * 100) : 100;
  const isFullyDepreciated = nilaiBukuSaatIni <= nilaiSisa;

  return {
    hargaPerolehan,
    nilaiSisa,
    masaManfaatTahun,
    masaManfaatBulan,
    bebanPenyusutanBulan,
    bebanPenyusutanTahun,
    bulanBerjalan,
    akumulasiPenyusutan,
    nilaiBukuSaatIni,
    persentaseNilaiTersisa,
    isFullyDepreciated,
  };
}

/**
 * Returns updated asset with computed Nilai_Buku
 */
export function syncAssetBookValue(asset: Asset, asOfDate: Date = new Date()): Asset {
  if (!asset.Harga_Perolehan || asset.Harga_Perolehan <= 0) {
    return {
      ...asset,
      Nilai_Buku: asset.Nilai_Buku !== undefined ? asset.Nilai_Buku : asset.Harga_Perolehan || 0,
    };
  }
  const calc = calculateAssetDepreciation(asset, asOfDate);
  return {
    ...asset,
    Nilai_Buku: calc.nilaiBukuSaatIni,
  };
}

/**
 * Executes a periodic depreciation run for a list of assets.
 * Returns updated assets and generated LogPenyusutan entries.
 */
export function runPeriodicDepreciationBatch(
  assets: Asset[],
  keteranganPeriod: string = `Penyusutan Bulanan ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`,
  executor: string = 'Sistem'
): { updatedAssets: Asset[]; generatedLogs: LogPenyusutan[]; totalBeban: number } {
  const generatedLogs: LogPenyusutan[] = [];
  let totalBeban = 0;
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const todayStr = new Date().toISOString().substring(0, 10);

  const updatedAssets = assets.map((asset) => {
    if (!asset.Harga_Perolehan || asset.Harga_Perolehan <= 0) {
      return asset;
    }

    const calc = calculateAssetDepreciation(asset);
    const prevBookValue = asset.Nilai_Buku !== undefined ? asset.Nilai_Buku : asset.Harga_Perolehan;
    const bebanBulan = calc.bebanPenyusutanBulan;

    if (bebanBulan <= 0 || prevBookValue <= (asset.Nilai_Sisa || 0)) {
      return asset;
    }

    const newBookValue = Math.max(asset.Nilai_Sisa || 0, prevBookValue - bebanBulan);
    const actualBeban = prevBookValue - newBookValue;

    if (actualBeban > 0) {
      totalBeban += actualBeban;
      const logEntry: LogPenyusutan = {
        ID_Log: `LOG-DEP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        ID_Asset: asset.ID_Asset,
        Nama_Asset: asset.Nama_Asset,
        Tanggal_Log: todayStr,
        Nilai_Buku_Sebelum: prevBookValue,
        Beban_Penyusutan: actualBeban,
        Nilai_Buku_Sesudah: newBookValue,
        Keterangan: keteranganPeriod,
        Executor: executor,
      };
      generatedLogs.push(logEntry);

      const existingLogs = asset.Log_Penyusutan || [];
      return {
        ...asset,
        Nilai_Buku: newBookValue,
        Log_Penyusutan: [logEntry, ...existingLogs],
      };
    }

    return asset;
  });

  return { updatedAssets, generatedLogs, totalBeban };
}
