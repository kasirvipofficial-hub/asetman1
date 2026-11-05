import React, { useState, useEffect } from 'react';
import { Asset, AssetLoan, ConditionType } from '../types';
import { BottomSheet } from './BottomSheet';
import { SignatureCanvas } from './SignatureCanvas';
import { formatDateIndonesian } from '../utils/dateUtils';
import { Calendar, User, FileText, CheckCircle, RotateCcw } from 'lucide-react';

export interface ReturnItemState {
  idAsset: string;
  namaAsset: string;
  kondisi: ConditionType;
  catatan: string;
}

interface LoanDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAsset: Asset | null;
  allAssets: Asset[];
  onSaveLoan: (loan: AssetLoan) => void;
  onReturnLoan?: (
    loanId: string,
    kondisiKembali: ConditionType,
    catatan: string,
    itemizedReturns?: ReturnItemState[]
  ) => void;
  activeLoanToReturn?: AssetLoan | null;
}

export const LoanDrawer: React.FC<LoanDrawerProps> = ({
  isOpen,
  onClose,
  selectedAsset,
  allAssets,
  onSaveLoan,
  onReturnLoan,
  activeLoanToReturn,
}) => {
  const [assetId, setAssetId] = useState('');
  const [namaPeminjam, setNamaPeminjam] = useState('');
  const [nipPeminjam, setNipPeminjam] = useState('');
  const [unitPeminjam, setUnitPeminjam] = useState('');
  const [targetKembali, setTargetKembali] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)
  );
  const [keperluan, setKeperluan] = useState('');
  const [signature, setSignature] = useState('');

  // Single / Collective Return state
  const [kondisiKembali, setKondisiKembali] = useState<ConditionType>('Baik');
  const [catatanKembali, setCatatanKembali] = useState('');
  const [returnItemsState, setReturnItemsState] = useState<ReturnItemState[]>([]);

  useEffect(() => {
    if (activeLoanToReturn) {
      setKondisiKembali(activeLoanToReturn.Kondisi_Saat_Pinjam);
      setCatatanKembali('');

      // Build itemized list for multi-asset or single asset loan
      const targetIds = activeLoanToReturn.ID_Asset_List && activeLoanToReturn.ID_Asset_List.length > 0
        ? activeLoanToReturn.ID_Asset_List
        : [activeLoanToReturn.ID_Asset];

      const initialReturnItems: ReturnItemState[] = targetIds.map((id) => {
        const found = allAssets.find((a) => a.ID_Asset === id);
        return {
          idAsset: id,
          namaAsset: found ? found.Nama_Asset : activeLoanToReturn.Nama_Asset,
          kondisi: found ? found.Kondisi : 'Baik',
          catatan: found?.Catatan_Khusus_Item || '',
        };
      });

      setReturnItemsState(initialReturnItems);
    } else if (selectedAsset) {
      setAssetId(selectedAsset.ID_Asset);
      setUnitPeminjam(selectedAsset.Unit_Kerja);
    } else if (allAssets.length > 0) {
      setAssetId(allAssets[0].ID_Asset);
      setUnitPeminjam(allAssets[0].Unit_Kerja);
    }
  }, [selectedAsset, activeLoanToReturn, allAssets, isOpen]);

  const targetAssetObj = allAssets.find((a) => a.ID_Asset === assetId) || selectedAsset;

  const handleSubmitLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAssetObj || !namaPeminjam.trim()) return;

    const newLoan: AssetLoan = {
      ID_Pinjam: `LNM-${Date.now()}`,
      ID_Asset: targetAssetObj.ID_Asset,
      Nama_Asset: targetAssetObj.Nama_Asset,
      Nama_Peminjam: namaPeminjam,
      NIP_Peminjam: nipPeminjam,
      Unit_Peminjam: unitPeminjam || targetAssetObj.Unit_Kerja,
      Tanggal_Pinjam: new Date().toISOString().substring(0, 10),
      Target_Kembali: targetKembali,
      Keperluan: keperluan || 'Operasional Tugas Kantor',
      Status_Pinjam: 'Dipinjam',
      Tanda_Tangan_Peminjam: signature,
      Petugas_Pinjam: 'Admin Aset',
      Kondisi_Saat_Pinjam: targetAssetObj.Kondisi,
    };

    onSaveLoan(newLoan);
    onClose();
  };

  const handleReturnItemConditionChange = (id: string, newKondisi: ConditionType) => {
    setReturnItemsState((prev) =>
      prev.map((item) => (item.idAsset === id ? { ...item, kondisi: newKondisi } : item))
    );
  };

  const handleReturnItemNoteChange = (id: string, newNote: string) => {
    setReturnItemsState((prev) =>
      prev.map((item) => (item.idAsset === id ? { ...item, catatan: newNote } : item))
    );
  };

  const handleProcessReturn = () => {
    if (activeLoanToReturn && onReturnLoan) {
      onReturnLoan(
        activeLoanToReturn.ID_Pinjam,
        kondisiKembali,
        catatanKembali,
        returnItemsState
      );
      onClose();
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={activeLoanToReturn ? 'Form Pengembalian Aset (Rincian Item)' : 'Form Peminjaman Aset Baru'}
      subtitle={
        activeLoanToReturn
          ? `Asset: ${activeLoanToReturn.Nama_Asset} (${activeLoanToReturn.ID_Asset})`
          : 'Peminjaman Sementara atau Tetap Pegawai'
      }
      maxHeightClass="max-h-[90vh]"
    >
      {activeLoanToReturn ? (
        /* Return Asset Workflow with Itemized Matrix Table */
        <div className="space-y-4 text-xs text-[#2C3E50]">
          <div className="p-3 bg-[#F2F4F3] border border-[#e2e6e4] rounded-xl space-y-1 text-xs">
            <div className="text-[#7F8C8D]">Peminjam: <strong className="text-[#2C3E50]">{activeLoanToReturn.Nama_Peminjam}</strong> ({activeLoanToReturn.Unit_Peminjam})</div>
            <div className="text-[#7F8C8D]">Tanggal Pinjam: <strong className="text-[#2C3E50]">{formatDateIndonesian(activeLoanToReturn.Tanggal_Pinjam)}</strong></div>
            <div className="text-[#7F8C8D]">Target Kembali: <strong className="text-amber-700 font-bold">{formatDateIndonesian(activeLoanToReturn.Target_Kembali)}</strong></div>
          </div>

          {/* Itemized Table Matrix for Returns */}
          <div className="p-3 bg-[#F2F4F3] border border-[#e2e6e4] rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#2C3E50]">
              <span>Rincian Kondisi & Catatan Fisik Saat Pengembalian:</span>
              <span className="text-[#2D7D62] font-mono">{returnItemsState.length} Items</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {returnItemsState.map((item) => (
                <div key={item.idAsset} className="p-2.5 bg-white border border-[#e2e6e4] rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="font-mono font-bold text-[#2D7D62] text-[11px]">{item.idAsset}</span>
                      <h5 className="font-bold text-[#2C3E50] truncate text-xs">{item.namaAsset}</h5>
                    </div>

                    <select
                      value={item.kondisi}
                      onChange={(e) => handleReturnItemConditionChange(item.idAsset, e.target.value as ConditionType)}
                      className="bg-[#F2F4F3] text-[#2C3E50] font-bold text-[11px] border border-[#e2e6e4] rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#2D7D62]"
                    >
                      <option value="Baik">Baik</option>
                      <option value="Rusak Ringan">Rusak Ringan</option>
                      <option value="Rusak Berat">Rusak Berat</option>
                      <option value="Hilang">Hilang</option>
                    </select>
                  </div>

                  <input
                    type="text"
                    value={item.catatan}
                    onChange={(e) => handleReturnItemNoteChange(item.idAsset, e.target.value)}
                    placeholder="Catatan kelengkapan saat kembali (misal: Adaptor lengkap / lecet)..."
                    className="w-full bg-[#F2F4F3] border border-[#e2e6e4] rounded-lg px-2.5 py-1 text-[11px] text-[#2C3E50] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#2D7D62]"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Catatan Pengembalian Umum (Opsional)</label>
            <textarea
              value={catatanKembali}
              onChange={(e) => setCatatanKembali(e.target.value)}
              rows={2}
              placeholder="Catatan umum proses serah terima kembali aset..."
              className="w-full bg-white border border-[#e2e6e4] rounded-xl p-3 text-[#2C3E50] text-xs focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
            />
          </div>

          <button
            type="button"
            onClick={handleProcessReturn}
            className="w-full bg-[#2D7D62] hover:bg-[#23634e] text-white font-semibold py-3 rounded-xl shadow-xs text-xs flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" /> Konfirmasi Pengembalian ({returnItemsState.length} Aset)
          </button>
        </div>
      ) : (
        /* Create New Loan Workflow */
        <form onSubmit={handleSubmitLoan} className="space-y-3.5 text-xs text-[#2C3E50]">
          <div>
            <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Pilih Barang Aset</label>
            <select
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              className="w-full bg-white border border-[#e2e6e4] rounded-xl px-3 py-2.5 text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#2D7D62] font-mono text-xs"
            >
              {allAssets.map((a, idx) => (
                <option key={`loan-asset-${a.ID_Asset}-${idx}`} value={a.ID_Asset}>
                  {a.ID_Asset} - {a.Nama_Asset} ({a.Kategori} | {a.Unit_Kerja})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Nama Peminjam / Pegawai</label>
              <input
                type="text"
                required
                value={namaPeminjam}
                onChange={(e) => setNamaPeminjam(e.target.value)}
                placeholder="Nama Lengkap Peminjam"
                className="w-full bg-white border border-[#e2e6e4] rounded-xl px-3 py-2 text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">NIP / ID Pegawai (Opsional)</label>
              <input
                type="text"
                value={nipPeminjam}
                onChange={(e) => setNipPeminjam(e.target.value)}
                placeholder="NIP: 19920101..."
                className="w-full bg-white border border-[#e2e6e4] rounded-xl px-3 py-2 text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Unit Kerja Peminjam</label>
              <input
                type="text"
                value={unitPeminjam}
                onChange={(e) => setUnitPeminjam(e.target.value)}
                placeholder="Divisi / Unit Kerja"
                className="w-full bg-white border border-[#e2e6e4] rounded-xl px-3 py-2 text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Target Tanggal Pengembalian</label>
              <input
                type="date"
                required
                value={targetKembali}
                onChange={(e) => setTargetKembali(e.target.value)}
                className="w-full bg-white border border-[#e2e6e4] rounded-xl px-3 py-2 text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Keperluan / Alasan Peminjaman</label>
            <input
              type="text"
              value={keperluan}
              onChange={(e) => setKeperluan(e.target.value)}
              placeholder="Contoh: Tugas Dinas Luar / Presentasi Rapat"
              className="w-full bg-white border border-[#e2e6e4] rounded-xl px-3 py-2 text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
            />
          </div>

          <SignatureCanvas
            label="Tanda Tangan Peminjam (Digital Signature)"
            onSave={(dataUrl) => setSignature(dataUrl)}
          />

          <button
            type="submit"
            className="w-full bg-[#2D7D62] hover:bg-[#23634e] text-white font-semibold py-3 rounded-xl shadow-xs text-xs transition-all mt-2"
          >
            Simpan Log Peminjaman & Tandai Dipinjam
          </button>
        </form>
      )}
    </BottomSheet>
  );
};
