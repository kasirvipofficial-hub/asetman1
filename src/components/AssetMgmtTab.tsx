import React, { useState } from 'react';
import { Asset, UserRole } from '../types';
import { formatDateIndonesian, formatRupiah, calculateDepreciation } from '../utils/dateUtils';
import { generateCode128Svg, generateQrCodeSvg } from '../utils/barcodeUtils';
import {
  Plus,
  Printer,
  FileSpreadsheet,
  QrCode,
  ArrowLeftRight,
  FileCheck2,
  Building2,
  Tag,
  User,
  Calendar,
  Layers,
  Banknote,
  Search,
  Filter,
  Lock,
  MoreVertical,
  CheckSquare,
  Square,
  CheckCircle2,
  X,
  Edit2,
  Flame,
  History,
} from 'lucide-react';

interface AssetMgmtTabProps {
  assets: Asset[];
  categories: string[];
  units: string[];
  userRole: UserRole;
  assignedUnit: string;
  searchQuery: string;
  onOpenAddAssetDrawer: () => void;
  onOpenBarcodeDrawer: (asset: Asset | null, assetList?: Asset[]) => void;
  onOpenLoanDrawer: (asset: Asset) => void;
  onOpenBeritaAcaraDrawer: (asset: Asset) => void;
  onOpenFastEditDrawer: (asset: Asset) => void;
  onOpenLifecycleDrawer?: (asset: Asset) => void;
  onOpenDetailDrawer?: (asset: Asset) => void;
  onOpenBatchOpsDrawer: (selectedAssets: Asset[]) => void;
  onExportExcel: (selectedAssets?: Asset[]) => void;
  onImportExcelClick: () => void;
}

export const AssetMgmtTab: React.FC<AssetMgmtTabProps> = ({
  assets,
  categories,
  units,
  userRole,
  assignedUnit,
  searchQuery,
  onOpenAddAssetDrawer,
  onOpenBarcodeDrawer,
  onOpenLoanDrawer,
  onOpenBeritaAcaraDrawer,
  onOpenFastEditDrawer,
  onOpenLifecycleDrawer,
  onOpenDetailDrawer,
  onOpenBatchOpsDrawer,
  onExportExcel,
  onImportExcelClick,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>('Semua');
  const [selectedCondition, setSelectedCondition] = useState<string>('Semua');

  // Ensure unique units and categories without duplicate 'Semua'
  const sanitizedUnits = ['Semua', ...Array.from(new Set(units.filter((u) => u && u.trim() !== 'Semua')))];
  const sanitizedCategories = ['Semua', ...Array.from(new Set(categories.filter((c) => c && c.trim() !== 'Semua')))];

  // Multi-Select Batch State
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [openKebabAssetId, setOpenKebabAssetId] = useState<string | null>(null);

  // Non-admin users are strictly scoped to their assigned Unit Kerja
  const unitScopedAssets = assets.filter((a) => {
    if (userRole !== 'Admin') {
      return a.Unit_Kerja.toLowerCase().trim() === assignedUnit.toLowerCase().trim();
    }
    return true;
  });

  const filteredAssets = unitScopedAssets.filter((a) => {
    if (selectedCategory !== 'Semua' && a.Kategori !== selectedCategory) return false;
    if (userRole === 'Admin' && selectedUnitFilter !== 'Semua' && a.Unit_Kerja !== selectedUnitFilter) return false;
    if (selectedCondition !== 'Semua' && a.Kondisi !== selectedCondition) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        a.ID_Asset.toLowerCase().includes(q) ||
        a.Nama_Asset.toLowerCase().includes(q) ||
        a.Kategori.toLowerCase().includes(q) ||
        a.Unit_Kerja.toLowerCase().includes(q) ||
        a.Penanggung_Jawab.toLowerCase().includes(q) ||
        (a.Nomor_Seri && a.Nomor_Seri.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const isAllSelected =
    filteredAssets.length > 0 &&
    filteredAssets.every((a) => selectedAssetIds.includes(a.ID_Asset));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedAssetIds([]);
    } else {
      setSelectedAssetIds(filteredAssets.map((a) => a.ID_Asset));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedAssetIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedAssetsObjects = assets.filter((a) => selectedAssetIds.includes(a.ID_Asset));

  const handleBulkPrintBarcode = () => {
    if (selectedAssetsObjects.length === 0) return;
    onOpenBarcodeDrawer(selectedAssetsObjects[0], selectedAssetsObjects);
  };

  const handleBulkExportExcel = () => {
    if (selectedAssetsObjects.length === 0) return;
    onExportExcel(selectedAssetsObjects);
  };

  const handleOpenBatchOps = () => {
    if (selectedAssetsObjects.length === 0) return;
    onOpenBatchOpsDrawer(selectedAssetsObjects);
  };

  return (
    <div className="space-y-4 pb-28 pt-2 animate-in fade-in text-xs text-[#2C3E50] relative">
      {/* Top Header & Main Action Bar */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-[#2C3E50] tracking-tight flex items-center gap-1.5">
            Katalog Aset
            {userRole !== 'Admin' && (
              <span className="text-[10px] bg-[#A8E6CF] text-[#2D7D62] border border-[#2D7D62]/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                <Lock className="w-3 h-3" /> {assignedUnit}
              </span>
            )}
          </h2>
          <p className="text-[11px] text-[#7F8C8D]">
            Total: {filteredAssets.length} Aset
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {userRole === 'Admin' && (
            <button
              onClick={onOpenAddAssetDrawer}
              className="flex items-center gap-1.5 bg-[#2D7D62] hover:bg-[#23634e] text-white font-semibold text-xs px-3 py-2 rounded-xl shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span> Aset</span>
            </button>
          )}

          <button
            onClick={() => onOpenBarcodeDrawer(null)}
            className="p-2 bg-[#F2F4F3] hover:bg-[#e2e6e4] text-[#2C3E50] rounded-xl border border-[#e2e6e4]"
            title=" Label"
          >
            <Printer className="w-4 h-4 text-[#2D7D62]" />
          </button>

          <button
            onClick={() => onExportExcel()}
            className="p-2 bg-[#F2F4F3] hover:bg-[#e2e6e4] text-[#2D7D62] rounded-xl border border-[#e2e6e4]"
            title="Ekspor Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Category & Admin Unit Selector */}
      <div className="space-y-2 bg-[#F2F4F3] border border-[#e2e6e4] p-3 rounded-2xl">
        {userRole === 'Admin' && (
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#e2e6e4]">
            <Building2 className="w-4 h-4 text-[#2D7D62] shrink-0" />
            <span className="text-[11px] text-[#7F8C8D] font-semibold">Unit:</span>
            <select
              value={selectedUnitFilter}
              onChange={(e) => setSelectedUnitFilter(e.target.value)}
              className="bg-white text-[#2C3E50] border border-[#e2e6e4] rounded-lg px-2.5 py-1 text-xs focus:outline-none"
            >
              {sanitizedUnits.map((u, idx) => (
                <option key={`unit-opt-${u}-${idx}`} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#7F8C8D] font-semibold text-[11px]">
            <Filter className="w-3.5 h-3.5 text-[#2D7D62]" /> Kategori:
          </div>

          {/* Select All Checkbox Shortcut */}
          <button
            type="button"
            onClick={handleToggleSelectAll}
            className="flex items-center gap-1 text-[11px] font-bold text-[#2D7D62] hover:underline cursor-pointer"
          >
            {isAllSelected ? (
              <CheckSquare className="w-4 h-4 text-[#2D7D62]" />
            ) : (
              <Square className="w-4 h-4 text-[#7F8C8D]" />
            )}
            <span>Pilih Semua ({filteredAssets.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {sanitizedCategories.map((cat, idx) => (
            <button
              key={`cat-btn-${cat}-${idx}`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#2D7D62] text-white'
                  : 'bg-white text-[#2C3E50] hover:bg-[#A8E6CF]/30 border border-[#e2e6e4]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Bulk Action Bar when assets are selected */}
      {selectedAssetIds.length > 0 && (
        <div className="sticky top-16 z-30 bg-[#2C3E50] text-white rounded-2xl p-2.5 shadow-xl border border-[#2D7D62] flex items-center justify-between gap-2 animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2 shrink-0 pl-1">
            <span className="w-5.5 h-5.5 rounded-full bg-[#A8E6CF] text-[#2D7D62] text-xs font-black flex items-center justify-center">
              {selectedAssetIds.length}
            </span>
            <span className="text-xs font-bold text-white hidden xs:inline">Aset Terpilih</span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleOpenBatchOps}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2D7D62] hover:bg-[#23634e] text-white font-bold text-xs rounded-xl transition-all shadow-xs shrink-0"
              title="Aksi Massal (Peminjaman / BA Mutasi / BA Apkir)"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Aksi Massal</span>
            </button>

            <button
              onClick={handleBulkPrintBarcode}
              className="p-2 bg-white hover:bg-[#F2F4F3] text-[#2D7D62] rounded-xl transition-all shadow-xs shrink-0"
              title="Cetak Barcode Terpilih"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={handleBulkExportExcel}
              className="p-2 bg-[#F2F4F3] hover:bg-white text-[#2D7D62] rounded-xl transition-all shadow-xs shrink-0"
              title="Ekspor Excel Terpilih"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSelectedAssetIds([])}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg shrink-0"
              title="Batal Pilih"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Asset Cards List with Ultra-Clean Kebab Menu */}
      <div className="space-y-2">
        {filteredAssets.length === 0 ? (
          <div className="p-8 text-center bg-[#F2F4F3] border border-[#e2e6e4] rounded-2xl text-[#7F8C8D]">
            Tidak ada aset yang sesuai untuk unit {assignedUnit} dengan filter ini.
          </div>
        ) : (
          filteredAssets.map((asset) => {
            const valHarga = Number(asset.Harga_Perolehan || asset.Harga_Asal) || 0;
            const dep = calculateDepreciation(valHarga, asset.Tahun_Beli || asset.Tanggal_Perolehan, asset.Masa_Manfaat || 4);
            const valBuku = asset.Nilai_Buku !== undefined && Number(asset.Nilai_Buku) >= 0 ? Number(asset.Nilai_Buku) : dep.nilaiBuku;
            const qrSvg = generateQrCodeSvg(asset.ID_Asset, 48);
            const isSelected = selectedAssetIds.includes(asset.ID_Asset);
            const isKebabOpen = openKebabAssetId === asset.ID_Asset;

            return (
              <div
                key={asset.ID_Asset}
                onClick={() => onOpenDetailDrawer && onOpenDetailDrawer(asset)}
                className={`p-3 rounded-xl border transition-all relative cursor-pointer ${
                  isSelected
                    ? 'border-[#2D7D62] ring-1.5 ring-[#2D7D62]/20 bg-white shadow-2xs'
                    : 'bg-white border-[#e2e6e4] hover:border-[#2D7D62]/60 hover:shadow-xs shadow-2xs'
                }`}
              >
                {/* Main Header & Body Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0 flex-1">
                    {/* Multi-Select Checkbox */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSelectOne(asset.ID_Asset);
                      }}
                      className="mt-0.5 text-[#2D7D62] hover:scale-105 transition-all shrink-0 cursor-pointer"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4.5 h-4.5 text-[#2D7D62]" />
                      ) : (
                        <Square className="w-4.5 h-4.5 text-[#7F8C8D]/50 hover:text-[#2D7D62]" />
                      )}
                    </button>

                    {/* Photo or QR Code Thumbnail */}
                    {asset.Foto_Asset ? (
                      <img
                        src={asset.Foto_Asset}
                        alt={asset.Nama_Asset}
                        className="w-10 h-10 rounded-lg object-cover border border-[#e2e6e4] shrink-0"
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-lg bg-[#F8FAFC] border border-[#e2e6e4] p-0.5 shrink-0 flex items-center justify-center"
                        dangerouslySetInnerHTML={{ __html: qrSvg }}
                      />
                    )}

                    {/* Primary Asset Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap leading-none">
                        <span className="font-mono font-bold text-[#2D7D62] text-[11px] tracking-tight">
                          {asset.ID_Asset}
                        </span>
                        {asset.Nomor_Seri && (
                          <span className="text-[10px] text-[#7F8C8D] font-mono">
                            SN: {asset.Nomor_Seri}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs font-bold text-[#2C3E50] truncate mt-0.5">
                        {asset.Nama_Asset}
                      </h3>
                      <p className="text-[10px] text-[#7F8C8D] mt-0.5 truncate">
                        {asset.Kategori} · {asset.Unit_Kerja}{asset.Lokasi ? ` · ${asset.Lokasi}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Right: Condition Badge & Kebab Menu Trigger */}
                  <div className="flex items-center gap-1 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        asset.Kondisi === 'Baik' || !asset.Kondisi
                          ? 'bg-[#A8E6CF]/60 text-[#2D7D62]'
                          : asset.Kondisi === 'Rusak Ringan'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {asset.Kondisi || 'Baik'}
                    </span>

                    {/* Kebab 3-Dot Button */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenKebabAssetId(isKebabOpen ? null : asset.ID_Asset);
                        }}
                        className="p-1 rounded-lg hover:bg-[#F2F4F3] text-[#7F8C8D] hover:text-[#2C3E50] transition-all"
                        title="Opsi Aksi Aset"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Kebab Menu Popover */}
                      {isKebabOpen && (
                        <div
                          className="absolute right-0 top-7 z-40 w-52 bg-white border border-[#e2e6e4] rounded-xl shadow-xl p-1 text-xs animate-in fade-in duration-150 space-y-0.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              setOpenKebabAssetId(null);
                              onOpenFastEditDrawer(asset);
                            }}
                            className="w-full px-2.5 py-1.5 text-left hover:bg-[#F2F4F3] rounded-lg flex items-center gap-2 font-semibold text-[#2C3E50]"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-[#2D7D62]" />
                            <span>Edit Aset</span>
                          </button>

                          <button
                            onClick={() => {
                              setOpenKebabAssetId(null);
                              if (onOpenLifecycleDrawer) onOpenLifecycleDrawer(asset);
                            }}
                            className="w-full px-2.5 py-1.5 text-left hover:bg-[#F2F4F3] rounded-lg flex items-center gap-2 font-semibold text-[#2C3E50]"
                          >
                            <History className="w-3.5 h-3.5 text-[#2D7D62]" />
                            <span>Riwayat & Nilai Buku</span>
                          </button>

                          <button
                            onClick={() => {
                              setOpenKebabAssetId(null);
                              onOpenLoanDrawer(asset);
                            }}
                            className="w-full px-2.5 py-1.5 text-left hover:bg-[#F2F4F3] rounded-lg flex items-center gap-2 font-semibold text-[#2C3E50]"
                          >
                            <ArrowLeftRight className="w-3.5 h-3.5 text-amber-600" />
                            <span>Pinjam Aset</span>
                          </button>

                          <button
                            onClick={() => {
                              setOpenKebabAssetId(null);
                              onOpenBeritaAcaraDrawer(asset);
                            }}
                            className="w-full px-2.5 py-1.5 text-left hover:bg-[#F2F4F3] rounded-lg flex items-center gap-2 font-semibold text-[#2C3E50]"
                          >
                            <FileCheck2 className="w-3.5 h-3.5 text-purple-600" />
                            <span>Terbitkan BA</span>
                          </button>

                          <button
                            onClick={() => {
                              setOpenKebabAssetId(null);
                              onOpenBarcodeDrawer(asset);
                            }}
                            className="w-full px-2.5 py-1.5 text-left hover:bg-[#F2F4F3] rounded-lg flex items-center gap-2 font-semibold text-[#2C3E50]"
                          >
                            <Printer className="w-3.5 h-3.5 text-blue-600" />
                            <span>Cetak Label</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Compact Inline Metadata Footer Strip */}
                <div className="flex items-center justify-between text-[10px] text-[#7F8C8D] bg-[#F8FAFC] border border-[#e2e6e4]/70 rounded-lg px-2.5 py-1 mt-1.5 flex-wrap gap-x-2 gap-y-0.5">
                  <span className="truncate">
                    Jml: <strong className="text-[#2C3E50] font-semibold">{asset.Jumlah}</strong> · PIC: <strong className="text-[#2C3E50] font-semibold">{asset.Penanggung_Jawab}</strong>
                  </span>
                  <div className="flex items-center gap-2 shrink-0 font-mono">
                    <span>Harga: <strong className="text-[#2D7D62] font-bold">{valHarga > 0 ? formatRupiah(valHarga) : '-'}</strong></span>
                    <span className="text-[#e2e6e4]">|</span>
                    <span>Buku: <strong className="text-blue-700 font-bold">{valHarga > 0 ? formatRupiah(valBuku) : '-'}</strong></span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
