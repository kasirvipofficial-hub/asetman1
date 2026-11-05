import React, { useState, useEffect } from 'react';
import { Asset, ConditionType } from '../types';
import { BottomSheet } from './BottomSheet';
import { SignatureCanvas } from './SignatureCanvas';
import {
  ArrowLeftRight,
  Building2,
  Flame,
  Printer,
  CheckCircle2,
  FileCheck2,
  Users,
  Edit3,
} from 'lucide-react';

export interface ItemizedBatchState {
  idAsset: string;
  namaAsset: string;
  kategori: string;
  unitKerja: string;
  kondisi: ConditionType;
  catatanKhusus: string;
}

interface BatchOperationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAssets: Asset[];
  units: string[];
  onExecuteBatchLoan: (
    items: ItemizedBatchState[],
    loanData: {
      namaPeminjam: string;
      unitPeminjam: string;
      targetKembali: string;
      keperluan: string;
      signature: string;
    }
  ) => void;
  onExecuteBatchMutation: (
    items: ItemizedBatchState[],
    mutationData: {
      unitTujuan: string;
      penanggungJawabBaru: string;
      nomorBA: string;
      alasan: string;
      pihak1Nama: string;
      pihak2Nama: string;
      pihak1TTD: string;
      pihak2TTD: string;
    }
  ) => void;
  onExecuteBatchDisposal: (
    items: ItemizedBatchState[],
    disposalData: {
      nomorBA: string;
      alasan: string;
      pihak1Nama: string;
      pihak2Nama: string;
      pihak1TTD: string;
      pihak2TTD: string;
    }
  ) => void;
}

export const BatchOperationsDrawer: React.FC<BatchOperationsDrawerProps> = ({
  isOpen,
  onClose,
  selectedAssets,
  units,
  onExecuteBatchLoan,
  onExecuteBatchMutation,
  onExecuteBatchDisposal,
}) => {
  const [activeAction, setActiveAction] = useState<'loan' | 'mutation' | 'disposal'>('loan');

  // Itemized State for each asset in the batch
  const [itemsState, setItemsState] = useState<ItemizedBatchState[]>([]);

  // Loan State
  const [namaPeminjam, setNamaPeminjam] = useState('');
  const [unitPeminjam, setUnitPeminjam] = useState(units[0] || 'Office');
  const [targetKembali, setTargetKembali] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)
  );
  const [keperluanPinjam, setKeperluanPinjam] = useState('');
  const [loanSignature, setLoanSignature] = useState('');

  // Mutation State (Wajib BA)
  const [unitTujuan, setUnitTujuan] = useState(units[0] || 'Office');
  const [picBaru, setPicBaru] = useState('');
  const [nomorBAMutasi, setNomorBAMutasi] = useState(
    `BA-MUTASI/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`
  );
  const [alasanMutasi, setAlasanMutasi] = useState('Mutasi perpindahan unit kerja operasional instansi.');
  const [pihak1NamaMutasi, setPihak1NamaMutasi] = useState('Arno Kristanto');
  const [pihak2NamaMutasi, setPihak2NamaMutasi] = useState('');
  const [ttdPihak1Mutasi, setTtdPihak1Mutasi] = useState('');
  const [ttdPihak2Mutasi, setTtdPihak2Mutasi] = useState('');

  // Disposal State (Wajib BA)
  const [nomorBADisposal, setNomorBADisposal] = useState(
    `BA-APKYR/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`
  );
  const [alasanDisposal, setAlasanDisposal] = useState('Aset dalam kondisi rusak berat / afkir tidak layak pakai.');
  const [pihak1NamaDisposal, setPihak1NamaDisposal] = useState('Arno Kristanto');
  const [pihak2NamaDisposal, setPihak2NamaDisposal] = useState('Bambang Haryono, S.E.');
  const [ttdPihak1Disposal, setTtdPihak1Disposal] = useState('');
  const [ttdPihak2Disposal, setTtdPihak2Disposal] = useState('');

  useEffect(() => {
    if (selectedAssets && selectedAssets.length > 0) {
      const initialItems: ItemizedBatchState[] = selectedAssets.map((a) => ({
        idAsset: a.ID_Asset,
        namaAsset: a.Nama_Asset,
        kategori: a.Kategori,
        unitKerja: a.Unit_Kerja,
        kondisi: a.Kondisi || 'Baik',
        catatanKhusus: a.Catatan_Khusus_Item || '',
      }));
      setItemsState(initialItems);
    }
  }, [selectedAssets, isOpen]);

  if (selectedAssets.length === 0) return null;

  const handleItemConditionChange = (id: string, newCondition: ConditionType) => {
    setItemsState((prev) =>
      prev.map((item) => (item.idAsset === id ? { ...item, kondisi: newCondition } : item))
    );
  };

  const handleItemNoteChange = (id: string, newNote: string) => {
    setItemsState((prev) =>
      prev.map((item) => (item.idAsset === id ? { ...item, catatanKhusus: newNote } : item))
    );
  };

  const handleLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPeminjam.trim()) return;
    onExecuteBatchLoan(itemsState, {
      namaPeminjam,
      unitPeminjam,
      targetKembali,
      keperluan: keperluanPinjam || 'Operasional Massal Kantor',
      signature: loanSignature,
    });
    onClose();
  };

  const handleMutationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!picBaru.trim()) return;
    onExecuteBatchMutation(itemsState, {
      unitTujuan,
      penanggungJawabBaru: picBaru,
      nomorBA: nomorBAMutasi,
      alasan: alasanMutasi,
      pihak1Nama: pihak1NamaMutasi,
      pihak2Nama: pihak2NamaMutasi || picBaru,
      pihak1TTD: ttdPihak1Mutasi,
      pihak2TTD: ttdPihak2Mutasi,
    });
    onClose();
  };

  const handleDisposalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExecuteBatchDisposal(itemsState, {
      nomorBA: nomorBADisposal,
      alasan: alasanDisposal,
      pihak1Nama: pihak1NamaDisposal,
      pihak2Nama: pihak2NamaDisposal,
      pihak1TTD: ttdPihak1Disposal,
      pihak2TTD: ttdPihak2Disposal,
    });
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Aksi Transaksi Massal (Batch Operation)"
      subtitle={`Terpilih: ${selectedAssets.length} Barang Aset · Rincian Itemized`}
      maxHeightClass="max-h-[92vh]"
    >
      <div className="space-y-4 text-xs text-[#2C3E50]">
        {/* Action Type Segment Control */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F2F4F3] border border-[#e2e6e4] rounded-xl font-semibold">
          <button
            type="button"
            onClick={() => setActiveAction('loan')}
            className={`py-2 px-2 rounded-lg text-center transition-all flex items-center justify-center gap-1 ${
              activeAction === 'loan' ? 'bg-[#2D7D62] text-white shadow-xs' : 'text-[#7F8C8D] hover:text-[#2C3E50]'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Pinjam Massal</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAction('mutation')}
            className={`py-2 px-2 rounded-lg text-center transition-all flex items-center justify-center gap-1 ${
              activeAction === 'mutation' ? 'bg-[#2D7D62] text-white shadow-xs' : 'text-[#7F8C8D] hover:text-[#2C3E50]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>BA Mutasi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAction('disposal')}
            className={`py-2 px-2 rounded-lg text-center transition-all flex items-center justify-center gap-1 ${
              activeAction === 'disposal' ? 'bg-rose-700 text-white shadow-xs' : 'text-[#7F8C8D] hover:text-[#2C3E50]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>BA Musnah</span>
          </button>
        </div>

        {/* Itemized Table Matrix: Condition & Notes per row */}
        <div className="p-3 bg-[#F2F4F3] border border-[#e2e6e4] rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#2C3E50]">
            <span className="flex items-center gap-1.5">
              <Edit3 className="w-4 h-4 text-[#2D7D62]" /> Matriks Kondisi & Catatan Per Baris Barang:
            </span>
            <span className="text-[#2D7D62] font-mono">{itemsState.length} Items</span>
          </div>

          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {itemsState.map((item, idx) => (
              <div
                key={item.idAsset}
                className="p-2.5 bg-white border border-[#e2e6e4] rounded-xl space-y-2 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-mono font-bold text-[#2D7D62] text-[11px]">
                      {item.idAsset}
                    </span>
                    <h5 className="font-bold text-[#2C3E50] truncate text-xs">
                      {item.namaAsset}
                    </h5>
                  </div>

                  {/* Condition Selector */}
                  <select
                    value={item.kondisi}
                    onChange={(e) =>
                      handleItemConditionChange(item.idAsset, e.target.value as ConditionType)
                    }
                    className="bg-[#F2F4F3] text-[#2C3E50] font-bold text-[11px] border border-[#e2e6e4] rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#2D7D62]"
                  >
                    <option value="Baik">Baik</option>
                    <option value="Rusak Ringan">Rusak Ringan</option>
                    <option value="Rusak Berat">Rusak Berat</option>
                    <option value="Hilang">Hilang</option>
                    <option value="Musnah">Musnah</option>
                  </select>
                </div>

                {/* Per-Item Specific Notes Field */}
                <input
                  type="text"
                  value={item.catatanKhusus}
                  onChange={(e) => handleItemNoteChange(item.idAsset, e.target.value)}
                  placeholder="Catatan fisik spesifik (misal: Charger hilang / body tergores)..."
                  className="w-full bg-[#F2F4F3] border border-[#e2e6e4] rounded-lg px-2.5 py-1 text-[11px] text-[#2C3E50] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#2D7D62]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 1. Pinjam Massal Form */}
        {activeAction === 'loan' && (
          <form onSubmit={handleLoanSubmit} className="space-y-3.5 pt-1">
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
                <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Unit Kerja Peminjam</label>
                <select
                  value={unitPeminjam}
                  onChange={(e) => setUnitPeminjam(e.target.value)}
                  className="w-full bg-white border border-[#e2e6e4] rounded-xl px-3 py-2 text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
                >
                  {units.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Target Pengembalian</label>
                <input
                  type="date"
                  required
                  value={targetKembali}
                  onChange={(e) => setTargetKembali(e.target.value)}
                  className="w-full bg-white border border-[#e2e6e4] rounded-xl px-3 py-2 text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Keperluan / Alasan</label>
                <input
                  type="text"
                  value={keperluanPinjam}
                  onChange={(e) => setKeperluanPinjam(e.target.value)}
                  placeholder="Contoh: Penugasan Proyek Lapangan"
                  className="w-full bg-white border border-[#e2e6e4] rounded-xl px-3 py-2 text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
                />
              </div>
            </div>

            <SignatureCanvas
              label="Tanda Tangan Peminjam (Digital Signature)"
              onSave={(dataUrl) => setLoanSignature(dataUrl)}
            />

            <button
              type="submit"
              className="w-full bg-[#2D7D62] hover:bg-[#23634e] text-white font-semibold py-3 rounded-xl shadow-xs text-xs transition-all flex items-center justify-center gap-2 mt-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Proses Peminjaman Massal ({itemsState.length} Aset)
            </button>
          </form>
        )}

        {/* 2. Mutasi Massal Form (Wajib BA) */}
        {activeAction === 'mutation' && (
          <form onSubmit={handleMutationSubmit} className="space-y-3.5 pt-1">
            <div className="p-3 bg-[#A8E6CF]/30 border border-[#2D7D62]/30 text-[#2D7D62] rounded-xl text-[11px] font-semibold flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 shrink-0" />
              <span>Otomatis memindahkan unit & menerbitkan <strong>1 Dokumen BA Mutasi Kolektif</strong>!</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Unit Kerja Tujuan Baru</label>
                <select
                  value={unitTujuan}
                  onChange={(e) => setUnitTujuan(e.target.value)}
                  className="w-full bg-white border border-[#e2e6e4] rounded-xl px-3 py-2 text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
                >
                  {units.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Penanggung Jawab (PIC) Baru</label>
                <input
                  type="text"
                  required
                  value={picBaru}
                  onChange={(e) => setPicBaru(e.target.value)}
                  placeholder="Nama PIC Baru"
                  className="w-full bg-white border border-[#e2e6e4] rounded-xl px-3 py-2 text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Nomor Dokumen BA Mutasi Kolektif</label>
              <input
                type="text"
                required
                value={nomorBAMutasi}
                onChange={(e) => setNomorBAMutasi(e.target.value)}
                className="w-full bg-white border border-[#e2e6e4] rounded-xl px-3 py-2 text-[#2C3E50] font-mono focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Alasan Perpindahan / Mutasi</label>
              <textarea
                value={alasanMutasi}
                onChange={(e) => setAlasanMutasi(e.target.value)}
                rows={2}
                className="w-full bg-white border border-[#e2e6e4] rounded-xl p-3 text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
              />
            </div>

            <SignatureCanvas
              label="Tanda Tangan Petugas Pengeluar (Pihak 1)"
              onSave={(dataUrl) => setTtdPihak1Mutasi(dataUrl)}
            />

            <button
              type="submit"
              className="w-full bg-[#2D7D62] hover:bg-[#23634e] text-white font-semibold py-3 rounded-xl shadow-xs text-xs transition-all flex items-center justify-center gap-2 mt-2"
            >
              <FileCheck2 className="w-4 h-4" /> Eksekusi Mutasi & Terbitkan BA Kolektif
            </button>
          </form>
        )}

        {/* 3. Pemusnahan Massal Form (Wajib BA) */}
        {activeAction === 'disposal' && (
          <form onSubmit={handleDisposalSubmit} className="space-y-3.5 pt-1">
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-[11px] font-semibold flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Otomatis menandai kondisi 'Musnah' & menerbitkan <strong>1 BA Penghapusan Kolektif</strong>!</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Nomor BA Penghapusan Kolektif</label>
              <input
                type="text"
                required
                value={nomorBADisposal}
                onChange={(e) => setNomorBADisposal(e.target.value)}
                className="w-full bg-white border border-[#e2e6e4] rounded-xl px-3 py-2 text-[#2C3E50] font-mono focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Alasan Pemusnahan / Apkir Massal</label>
              <textarea
                value={alasanDisposal}
                onChange={(e) => setAlasanDisposal(e.target.value)}
                rows={2}
                className="w-full bg-white border border-[#e2e6e4] rounded-xl p-3 text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
              />
            </div>

            <SignatureCanvas
              label="Tanda Tangan Petugas Penanggung Jawab (Pihak 1)"
              onSave={(dataUrl) => setTtdPihak1Disposal(dataUrl)}
            />

            <button
              type="submit"
              className="w-full bg-rose-700 hover:bg-rose-800 text-white font-semibold py-3 rounded-xl shadow-xs text-xs transition-all flex items-center justify-center gap-2 mt-2"
            >
              <Flame className="w-4 h-4" /> Musnahkan {itemsState.length} Aset & Terbitkan BA
            </button>
          </form>
        )}
      </div>
    </BottomSheet>
  );
};
