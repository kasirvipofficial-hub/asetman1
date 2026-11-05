import React, { useState, useEffect } from 'react';
import { Asset, BeritaAcaraDoc, JenisBeritaAcara } from '../types';
import { BottomSheet } from './BottomSheet';
import { SignatureCanvas } from './SignatureCanvas';
import { formatDateIndonesian } from '../utils/dateUtils';
import { FileText, Printer, CheckCircle2, Upload, PenTool } from 'lucide-react';

interface BeritaAcaraDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAsset: Asset | null;
  onSaveBeritaAcara: (doc: BeritaAcaraDoc) => void;
  existingDoc?: BeritaAcaraDoc | null;
}

export const BeritaAcaraDrawer: React.FC<BeritaAcaraDrawerProps> = ({
  isOpen,
  onClose,
  selectedAsset,
  onSaveBeritaAcara,
  existingDoc,
}) => {
  const [jenisBA, setJenisBA] = useState<JenisBeritaAcara>('BAST Penerimaan');
  const [nomorBA, setNomorBA] = useState('');
  const [tanggalBA, setTanggalBA] = useState(new Date().toISOString().substring(0, 10));
  const [unitAsal, setUnitAsal] = useState('');
  const [unitTujuan, setUnitTujuan] = useState('');
  const [pihak1Nama, setPihak1Nama] = useState('Arno Kristanto');
  const [pihak1Jabatan, setPihak1Jabatan] = useState('Manajer Aset / Admin');
  const [pihak1TTD, setPihak1TTD] = useState('');

  const [pihak2Nama, setPihak2Nama] = useState('');
  const [pihak2Jabatan, setPihak2Jabatan] = useState('');
  const [pihak2TTD, setPihak2TTD] = useState('');

  const [atasanNama, setAtasanNama] = useState('Bambang Haryono, S.E.');
  const [alasan, setAlasan] = useState('');
  const [fotoScan, setFotoScan] = useState('');

  const [activeTab, setActiveTab] = useState<'form' | 'signature' | 'preview'>('form');

  useEffect(() => {
    if (existingDoc) {
      setJenisBA(existingDoc.Jenis_BA);
      setNomorBA(existingDoc.Nomor_BA);
      setTanggalBA(existingDoc.Tanggal_BA);
      setUnitAsal(existingDoc.Unit_Asal || '');
      setUnitTujuan(existingDoc.Unit_Tujuan || '');
      setPihak1Nama(existingDoc.Nama_Pihak_1 || '');
      setPihak1Jabatan(existingDoc.Jabatan_Pihak_1 || '');
      setPihak1TTD(existingDoc.TTD_Pihak_1 || '');
      setPihak2Nama(existingDoc.Nama_Pihak_2 || '');
      setPihak2Jabatan(existingDoc.Jabatan_Pihak_2 || '');
      setPihak2TTD(existingDoc.TTD_Pihak_2 || '');
      setAlasan(existingDoc.Alasan_Keterangan || '');
      setFotoScan(existingDoc.Foto_Dokumen_Scan || '');
    } else if (selectedAsset) {
      const year = new Date().getFullYear();
      const randomNo = String(Math.floor(100 + Math.random() * 900));
      setNomorBA(`BAST/${selectedAsset.Kategori.substring(0, 3).toUpperCase()}/${year}/${randomNo}`);
      setUnitAsal(selectedAsset.Unit_Kerja);
      setUnitTujuan(selectedAsset.Unit_Kerja);
      setPihak2Nama(selectedAsset.Penanggung_Jawab);
      setPihak2Jabatan('Staf Penanggung Jawab');
      setAlasan(`Penyerahan/Pengelolaan Aset ${selectedAsset.Nama_Asset} (${selectedAsset.ID_Asset}) dalam kondisi ${selectedAsset.Kondisi}.`);
    }
  }, [existingDoc, selectedAsset, isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoScan(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!nomorBA.trim()) return;

    const doc: BeritaAcaraDoc = {
      ID_BA: existingDoc?.ID_BA || `BA-${Date.now()}`,
      Nomor_BA: nomorBA,
      Jenis_BA: jenisBA,
      Tanggal_BA: tanggalBA,
      ID_Asset: selectedAsset?.ID_Asset || (existingDoc?.Aset_List ? `${existingDoc.Aset_List.length} Items` : 'AST-MULTI'),
      Nama_Asset: selectedAsset?.Nama_Asset || (existingDoc?.Aset_List ? `${existingDoc.Aset_List.length} Barang Terlampir` : 'Aset Kolektif'),
      Aset_List: existingDoc?.Aset_List || (selectedAsset ? [selectedAsset] : undefined),
      Kategori: selectedAsset?.Kategori || 'General',
      Unit_Asal: unitAsal,
      Unit_Tujuan: unitTujuan,
      Alasan_Keterangan: alasan,
      Foto_Dokumen_Scan: fotoScan,
      Nama_Pihak_1: pihak1Nama,
      Jabatan_Pihak_1: pihak1Jabatan,
      TTD_Pihak_1: pihak1TTD,
      Nama_Pihak_2: pihak2Nama,
      Jabatan_Pihak_2: pihak2Jabatan,
      TTD_Pihak_2: pihak2TTD,
      Nama_Atasan: atasanNama,
      Status_BA: 'Disetujui',
    };

    onSaveBeritaAcara(doc);
    onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  const itemList = existingDoc?.Aset_List || (selectedAsset ? [selectedAsset] : []);

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Generator & Viewer Berita Acara Digital"
      subtitle={`Form & Dokumen Resmi (${jenisBA})`}
      maxHeightClass="max-h-[92vh]"
    >
      <div className="space-y-4 text-[#2C3E50]">
        {/* Segmented Tab Bar */}
        <div className="flex rounded-xl p-1 bg-[#F2F4F3] border border-[#e2e6e4] text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              activeTab === 'form' ? 'bg-[#2D7D62] text-white shadow-xs' : 'text-[#7F8C8D] hover:text-[#2C3E50]'
            }`}
          >
            1. Form Dokumen
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('signature')}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              activeTab === 'signature' ? 'bg-[#2D7D62] text-white shadow-xs' : 'text-[#7F8C8D] hover:text-[#2C3E50]'
            }`}
          >
            2. Tanda Tangan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              activeTab === 'preview' ? 'bg-[#2D7D62] text-white shadow-xs' : 'text-[#7F8C8D] hover:text-[#2C3E50]'
            }`}
          >
            3. Pratinjau & Cetak
          </button>
        </div>

        {/* Tab 1: Form Dokumen */}
        {activeTab === 'form' && (
          <div className="space-y-3.5 text-xs">
            <div>
              <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Jenis Berita Acara</label>
              <select
                value={jenisBA}
                onChange={(e) => setJenisBA(e.target.value as JenisBeritaAcara)}
                className="w-full bg-white border border-[#e2e6e4] rounded-xl px-3 py-2.5 text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
              >
                <option value="BAST Penerimaan">BAST Penerimaan (Barang Baru dari Vendor)</option>
                <option value="BAST Peminjaman">BAST Peminjaman & Penyerahan Aset</option>
                <option value="BA Mutasi">Berita Acara Mutasi / Perpindahan Unit</option>
                <option value="BA Penghapusan">Berita Acara Penghapusan / Pemusnahan</option>
                <option value="BA Pelelangan">Berita Acara Pelelangan / Hibah</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Nomor Dokumen BA</label>
                <input
                  type="text"
                  value={nomorBA}
                  onChange={(e) => setNomorBA(e.target.value)}
                  placeholder="Contoh: BAST/IT/2026/001"
                  className="w-full bg-white border border-[#e2e6e4] rounded-xl px-3 py-2 text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#2D7D62] font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Tanggal Dokumen</label>
                <input
                  type="date"
                  value={tanggalBA}
                  onChange={(e) => setTanggalBA(e.target.value)}
                  className="w-full bg-white border border-[#e2e6e4] rounded-xl px-3 py-2 text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#2D7D62] text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Pihak Pertama (Pengeluar / Petugas)</label>
                <input
                  type="text"
                  value={pihak1Nama}
                  onChange={(e) => setPihak1Nama(e.target.value)}
                  placeholder="Nama Petugas"
                  className="w-full bg-white border border-[#e2e6e4] rounded-xl px-3 py-2 text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#2D7D62] text-xs mb-1.5"
                />
                <input
                  type="text"
                  value={pihak1Jabatan}
                  onChange={(e) => setPihak1Jabatan(e.target.value)}
                  placeholder="Jabatan Petugas"
                  className="w-full bg-white border border-[#e2e6e4] rounded-xl px-3 py-2 text-[#7F8C8D] focus:outline-none focus:ring-2 focus:ring-[#2D7D62] text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Pihak Kedua (Penerima / Vendor / Peminjam)</label>
                <input
                  type="text"
                  value={pihak2Nama}
                  onChange={(e) => setPihak2Nama(e.target.value)}
                  placeholder="Nama Penerima"
                  className="w-full bg-white border border-[#e2e6e4] rounded-xl px-3 py-2 text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#2D7D62] text-xs mb-1.5"
                />
                <input
                  type="text"
                  value={pihak2Jabatan}
                  onChange={(e) => setPihak2Jabatan(e.target.value)}
                  placeholder="Jabatan / Instansi Penerima"
                  className="w-full bg-white border border-[#e2e6e4] rounded-xl px-3 py-2 text-[#7F8C8D] focus:outline-none focus:ring-2 focus:ring-[#2D7D62] text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Maksud & Keterangan Berita Acara</label>
              <textarea
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                rows={3}
                placeholder="Rincian alasan penyerahan, pemindahan, kondisi barang, atau instruksi penghapusan..."
                className="w-full bg-white border border-[#e2e6e4] rounded-xl p-3 text-[#2C3E50] text-xs focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
              />
            </div>

            {/* Optional Scan Physical Upload */}
            <div className="p-3 bg-[#F2F4F3] border border-[#e2e6e4] rounded-xl space-y-2">
              <label className="text-xs font-semibold text-[#2C3E50] flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-[#2D7D62]" /> Unggah Foto Scan Berkas Fisik (Opsional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="text-xs text-[#7F8C8D] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#2D7D62] file:text-white hover:file:bg-[#23634e] cursor-pointer"
              />
              {fotoScan && (
                <div className="mt-2 text-xs text-[#2D7D62] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Berkas scan fisik siap dilampirkan
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('signature')}
              className="w-full bg-[#2D7D62] hover:bg-[#23634e] text-white font-semibold py-3 rounded-xl shadow-xs text-xs transition-all"
            >
              Lanjut ke Tanda Tangan Digital →
            </button>
          </div>
        )}

        {/* Tab 2: Tanda Tangan */}
        {activeTab === 'signature' && (
          <div className="space-y-4 text-xs">
            <SignatureCanvas
              label={`Tanda Tangan Pihak Pertama (${pihak1Nama || 'Petugas'})`}
              initialValue={pihak1TTD}
              onSave={(dataUrl) => setPihak1TTD(dataUrl)}
            />

            <SignatureCanvas
              label={`Tanda Tangan Pihak Kedua (${pihak2Nama || 'Penerima'})`}
              initialValue={pihak2TTD}
              onSave={(dataUrl) => setPihak2TTD(dataUrl)}
            />

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className="flex-1 bg-[#F2F4F3] hover:bg-[#e2e6e4] text-[#2C3E50] border border-[#e2e6e4] font-semibold py-2.5 rounded-xl text-xs"
              >
                ← Kembali
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className="flex-1 bg-[#2D7D62] hover:bg-[#23634e] text-white font-semibold py-2.5 rounded-xl text-xs shadow-xs"
              >
                Lihat Pratinjau Dokumen →
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Pratinjau Dokumen Resmi & Print */}
        {activeTab === 'preview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#7F8C8D]">Pratinjau Layout PDF / Cetak Kop Surat</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 bg-[#F2F4F3] hover:bg-[#e2e6e4] text-[#2C3E50] text-xs px-3 py-1.5 rounded-lg border border-[#e2e6e4]"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak / PDF
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center gap-1.5 bg-[#2D7D62] hover:bg-[#23634e] text-white font-semibold text-xs px-4 py-1.5 rounded-lg shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Simpan Berita Acara
                </button>
              </div>
            </div>

            {/* Official Document Paper Container */}
            <div className="bg-white text-slate-900 rounded-xl p-6 shadow-lg border border-slate-300 font-serif text-xs leading-relaxed max-h-[60vh] overflow-y-auto print:max-h-none print:shadow-none print:p-0">
              {/* Kop Surat Header */}
              <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
                <h2 className="text-base font-extrabold tracking-wide uppercase text-slate-950 font-sans">
                  PEMERINTAH / INSTANSI TATA KELOLA ASET
                </h2>
                <p className="text-[10px] text-slate-600 font-sans">
                  Jl. Administrasi Utama No. 01, Gedung Perkantoran · Telp: (021) 555-0199
                </p>
              </div>

              {/* Document Title */}
              <div className="text-center mb-5 font-sans">
                <h3 className="text-sm font-black underline tracking-wider uppercase text-slate-900">
                  {jenisBA}
                </h3>
                <p className="text-[11px] font-bold text-slate-700 mt-0.5">Nomor: {nomorBA || 'BAST/001/2026'}</p>
              </div>

              {/* Opening Paragraph */}
              <p className="mb-3">
                Pada hari ini <strong className="font-sans">{formatDateIndonesian(tanggalBA)}</strong>, kami yang bertanda tangan di bawah ini:
              </p>

              {/* Parties Details */}
              <div className="space-y-2 mb-4 pl-3 border-l-2 border-slate-300">
                <div>
                  <strong>1. Nama:</strong> {pihak1Nama || '-'} <br />
                  <span className="text-[11px] text-slate-700">Jabatan: {pihak1Jabatan || 'Petugas Aset'}</span> (Selanjutnya disebut <strong>Pihak Pertama</strong>)
                </div>
                <div>
                  <strong>2. Nama:</strong> {pihak2Nama || '-'} <br />
                  <span className="text-[11px] text-slate-700">Jabatan: {pihak2Jabatan || 'Penerima / Peminjam'}</span> (Selanjutnya disebut <strong>Pihak Kedua</strong>)
                </div>
              </div>

              <p className="mb-3">
                Menyatakan bahwa Pihak Pertama telah menyerahkan/memproses kepada Pihak Kedua, dan Pihak Kedua telah menerima/menyetujui barang aset kantor dengan rincian sebagai berikut:
              </p>

              {/* Asset Item Table (Supports Single & Multi-Asset BA with 6-column Kop Surat layout) */}
              <table className="w-full border-collapse border border-slate-800 text-[11px] mb-4 font-sans">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 border-b border-slate-800 font-bold">
                    <th className="border border-slate-800 p-1.5 text-center w-10">No</th>
                    <th className="border border-slate-800 p-1.5 text-left">Kode Aset</th>
                    <th className="border border-slate-800 p-1.5 text-left">Nama Barang</th>
                    <th className="border border-slate-800 p-1.5 text-left">Kategori / Unit</th>
                    <th className="border border-slate-800 p-1.5 text-center">Kondisi Fisik</th>
                    <th className="border border-slate-800 p-1.5 text-left">Catatan Khusus</th>
                  </tr>
                </thead>
                <tbody>
                  {itemList.length > 0 ? (
                    itemList.map((item, idx) => (
                      <tr key={`${item.ID_Asset}-${idx}`}>
                        <td className="border border-slate-800 p-1.5 text-center font-bold">{idx + 1}</td>
                        <td className="border border-slate-800 p-1.5 font-mono font-bold">{item.ID_Asset}</td>
                        <td className="border border-slate-800 p-1.5 font-semibold">{item.Nama_Asset}</td>
                        <td className="border border-slate-800 p-1.5">{item.Kategori} ({item.Unit_Kerja})</td>
                        <td className="border border-slate-800 p-1.5 text-center font-semibold">{item.Kondisi || 'Baik'}</td>
                        <td className="border border-slate-800 p-1.5 text-slate-700 italic">{item.Catatan_Khusus_Item || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="border border-slate-800 p-1.5 text-center font-bold">1</td>
                      <td className="border border-slate-800 p-1.5 font-mono font-bold">{selectedAsset?.ID_Asset || 'AST-001'}</td>
                      <td className="border border-slate-800 p-1.5 font-semibold">{selectedAsset?.Nama_Asset || 'Aset Kantor'}</td>
                      <td className="border border-slate-800 p-1.5">{selectedAsset?.Kategori || 'Umum'} ({selectedAsset?.Unit_Kerja || '-'})</td>
                      <td className="border border-slate-800 p-1.5 text-center font-semibold">{selectedAsset?.Kondisi || 'Baik'}</td>
                      <td className="border border-slate-800 p-1.5 text-slate-700 italic">{selectedAsset?.Catatan_Khusus_Item || '-'}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <p className="mb-4">
                <strong>Catatan / Alasan:</strong> {alasan || 'Tidak ada catatan tambahan.'}
              </p>

              {/* Signature Blocks */}
              <div className="grid grid-cols-2 gap-4 text-center mt-8 pt-4 font-sans text-[11px]">
                <div>
                  <p className="font-semibold text-slate-800 mb-1">Pihak Pertama (Pengeluar)</p>
                  <div className="h-16 flex items-center justify-center my-1">
                    {pihak1TTD ? (
                      <img src={pihak1TTD} alt="TTD Pihak 1" className="max-h-14 max-w-full object-contain" />
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">(Belum Tanda Tangan)</span>
                    )}
                  </div>
                  <p className="font-bold underline text-slate-950">{pihak1Nama || '(Nama Petugas)'}</p>
                </div>

                <div>
                  <p className="font-semibold text-slate-800 mb-1">Pihak Kedua (Penerima)</p>
                  <div className="h-16 flex items-center justify-center my-1">
                    {pihak2TTD ? (
                      <img src={pihak2TTD} alt="TTD Pihak 2" className="max-h-14 max-w-full object-contain" />
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">(Belum Tanda Tangan)</span>
                    )}
                  </div>
                  <p className="font-bold underline text-slate-950">{pihak2Nama || '(Nama Penerima)'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </BottomSheet>
  );
};
