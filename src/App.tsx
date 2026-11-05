import React, { useState, useEffect } from 'react';
import { Asset, SesiSO, ConditionType, RincianKondisi, AssetLoan, BeritaAcaraDoc, UserRole } from './types';
import {
  fetchInitialData,
  updateStockOpname,
  addAsset,
  updateAsset,
  deleteAsset,
  batchUpdateAssets,
  addCategory,
  addUnit,
  createSession,
  getStoredGasUrl,
  getActiveAuditor,
  resetDemoData,
  saveAssetLoan,
  processReturnAssetLoan,
  saveBeritaAcaraDocument,
  updateSession,
  deleteSession,
  updateLocalSession,
  deleteLocalSession,
  setActiveSession,
  processPeriodicDepreciation,
} from './services/apiService';
import { exportAuditReportToExcel } from './services/excelService';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { DashboardTab } from './components/DashboardTab';
import { AssetMgmtTab } from './components/AssetMgmtTab';
import { AuditTab } from './components/AuditTab';
import { LoanTab } from './components/LoanTab';
import { BeritaAcaraTab } from './components/BeritaAcaraTab';
import { SettingsTab } from './components/SettingsTab';
import { ActionHubDrawer } from './components/ActionHubDrawer';
import { CodeGsModal } from './components/CodeGsModal';
import { AssetFormDrawer } from './components/AssetFormDrawer';
import { BarcodeStudioDrawer } from './components/BarcodeStudioDrawer';
import { LoanDrawer, ReturnItemState } from './components/LoanDrawer';
import { BeritaAcaraDrawer } from './components/BeritaAcaraDrawer';
import { FastEditAssetDrawer } from './components/FastEditAssetDrawer';
import { BatchOperationsDrawer, ItemizedBatchState } from './components/BatchOperationsDrawer';
import { CameraScannerDrawer } from './components/CameraScannerDrawer';
import { AssetLifecycleDrawer } from './components/AssetLifecycleDrawer';
import { AssetDetailDrawer } from './components/AssetDetailDrawer';
import { CreateSessionDrawer } from './components/CreateSessionDrawer';
import { SessionManagementDrawer } from './components/SessionManagementDrawer';
import { SessionReportModal } from './components/SessionReportModal';
import { Toast, ToastMessage } from './components/Toast';

export default function App() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [sessions, setSessions] = useState<SesiSO[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [units, setUnits] = useState<string[]>([]);
  const [loans, setLoans] = useState<AssetLoan[]>([]);
  const [beritaAcaraDocs, setBeritaAcaraDocs] = useState<BeritaAcaraDoc[]>([]);

  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('Admin');
  const [assignedUnit, setAssignedUnit] = useState<string>('HRD & General Affair');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [gasUrl, setGasUrl] = useState<string>(getStoredGasUrl());
  const [isGasModalOpen, setIsGasModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Bottom Drawers State
  const [isActionHubOpen, setIsActionHubOpen] = useState<boolean>(false);
  const [isCreateSessionDrawerOpen, setIsCreateSessionDrawerOpen] = useState<boolean>(false);
  const [isAddAssetDrawerOpen, setIsAddAssetDrawerOpen] = useState<boolean>(false);
  const [isBarcodeDrawerOpen, setIsBarcodeDrawerOpen] = useState<boolean>(false);
  const [barcodeDrawerAsset, setBarcodeDrawerAsset] = useState<Asset | null>(null);
  const [barcodeDrawerList, setBarcodeDrawerList] = useState<Asset[] | null>(null);

  const [isFastEditDrawerOpen, setIsFastEditDrawerOpen] = useState<boolean>(false);
  const [fastEditAsset, setFastEditAsset] = useState<Asset | null>(null);

  const [isBatchOpsDrawerOpen, setIsBatchOpsDrawerOpen] = useState<boolean>(false);
  const [batchOpsSelectedAssets, setBatchOpsSelectedAssets] = useState<Asset[]>([]);

  const [isLoanDrawerOpen, setIsLoanDrawerOpen] = useState<boolean>(false);
  const [loanDrawerAsset, setLoanDrawerAsset] = useState<Asset | null>(null);
  const [activeLoanToReturn, setActiveLoanToReturn] = useState<AssetLoan | null>(null);

  const [isBeritaAcaraDrawerOpen, setIsBeritaAcaraDrawerOpen] = useState<boolean>(false);
  const [beritaAcaraAsset, setBeritaAcaraAsset] = useState<Asset | null>(null);
  const [existingBADoc, setExistingBADoc] = useState<BeritaAcaraDoc | null>(null);

  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isLifecycleDrawerOpen, setIsLifecycleDrawerOpen] = useState<boolean>(false);
  const [lifecycleAsset, setLifecycleAsset] = useState<Asset | null>(null);

  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState<boolean>(false);
  const [detailDrawerAsset, setDetailDrawerAsset] = useState<Asset | null>(null);

  const [isAuditViewActive, setIsAuditViewActive] = useState<boolean>(false);
  const [isLoanViewActive, setIsLoanViewActive] = useState<boolean>(false);
  const [isBAViewActive, setIsBAViewActive] = useState<boolean>(false);

  // Stock Opname Session Management & Reporting
  const [isSessionMgmtDrawerOpen, setIsSessionMgmtDrawerOpen] = useState<boolean>(false);
  const [isSessionReportModalOpen, setIsSessionReportModalOpen] = useState<boolean>(false);
  const [selectedReportSession, setSelectedReportSession] = useState<SesiSO | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({
      id: String(Date.now()),
      text,
      type,
    });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchInitialData();
      setAssets(data.assets || []);
      setSessions(data.sessions || []);
      setCategories(data.categories || []);
      setUnits(data.units || []);
      setLoans(data.loans || []);
      setBeritaAcaraDocs(data.beritaAcaraDocs || []);

      if (data.units && data.units.length > 0 && !assignedUnit) {
        setAssignedUnit(data.units[0]);
      }

      const activeSesi = data.sessions?.find((s) => s.Status_Sesi === 'Aktif') || data.sessions?.[0];
      if (activeSesi) {
        setActiveSessionId(activeSesi.ID_Sesi);
      }
    } catch (err) {
      showToast('Gagal memuat data dari cloud. Menggunakan data lokal.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveAudit = async (payload: {
    ID_Asset: string;
    Kondisi: ConditionType;
    Jumlah: number;
    Rincian_Kondisi: RincianKondisi;
    Petugas_SO?: string;
    Keterangan_SO: string;
  }) => {
    setIsSaving(true);
    try {
      const auditor = payload.Petugas_SO || getActiveAuditor();
      const res = await updateStockOpname({
        ...payload,
        Petugas_SO: auditor,
        Sesi_SO_Terakhir: activeSessionId,
      });
      setAssets(res.assets);
      setSessions(res.sessions);
      showToast(`Hasil Stock Opname ${payload.ID_Asset} (${payload.Jumlah} Unit) tersimpan!`, 'success');
    } catch (err) {
      showToast('Gagal menyimpan hasil SO', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateSession = async (payload: {
    Nama_Sesi: string;
    Tanggal_Mulai: string;
    Target_Unit_Kerja: string;
    Scope_Kategori: string;
    Scope_Lokasi: string;
    Petugas_Utama: string;
    autoReset: boolean;
  }) => {
    setIsSaving(true);
    try {
      const res = await createSession(payload);
      setAssets(res.assets);
      setSessions(res.sessions);
      if (res.sessions.length > 0) {
        setActiveSessionId(res.sessions[0].ID_Sesi);
      }
      setIsAuditViewActive(true);
      showToast(`Sesi Stock Opname "${payload.Nama_Sesi}" berhasil dibuat & siap diaudit!`, 'success');
    } catch (err) {
      showToast('Gagal membuat sesi Stock Opname', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSession = async (updatedSession: SesiSO) => {
    try {
      const res = await updateSession(updatedSession);
      setSessions(res.sessions);
      if (selectedReportSession && selectedReportSession.ID_Sesi === updatedSession.ID_Sesi) {
        setSelectedReportSession(updatedSession);
      }
      showToast(`Sesi "${updatedSession.Nama_Sesi}" berhasil diperbarui & tersinkron!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal memperbarui sesi', 'error');
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const res = await deleteSession(sessionId);
      setSessions(res.sessions);
      if (activeSessionId === sessionId) {
        const nextActive = res.sessions[0]?.ID_Sesi || '';
        setActiveSessionId(nextActive);
      }
      showToast('Sesi Stock Opname berhasil dihapus & tersinkron.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus sesi', 'error');
    }
  };

  const handleSelectSession = (sessionId: string) => {
    const res = setActiveSession(sessionId);
    setSessions(res.sessions);
    setActiveSessionId(sessionId);
    const found = res.sessions.find((s) => s.ID_Sesi === sessionId);
    if (found) {
      showToast(`Sesi aktif beralih ke: ${found.Nama_Sesi}`, 'info');
    }
  };

  const handleGoToAuditFromSession = (sessionId: string) => {
    setActiveSession(sessionId);
    setActiveSessionId(sessionId);
    setIsSessionMgmtDrawerOpen(false);
    setIsAuditViewActive(true);
  };

  const handleOpenReportModal = (session: SesiSO) => {
    setSelectedReportSession(session);
    setIsSessionReportModalOpen(true);
  };

  const handleBatchAuditSO = (assetIds: string[]) => {
    const auditor = getActiveAuditor();
    const updatedAssets = assets.map((a) => {
      if (assetIds.includes(a.ID_Asset)) {
        return {
          ...a,
          Status_Audit: 'Sudah SO' as const,
          Tanggal_SO: new Date().toISOString().substring(0, 10),
          Petugas_SO: auditor,
          Sesi_SO_Terakhir: activeSessionId,
        };
      }
      return a;
    });
    setAssets(updatedAssets);
    batchUpdateAssets(updatedAssets).catch(() => {});
    showToast(`Batch SO Berhasil! ${assetIds.length} Aset telah diverifikasi & tersinkron.`, 'success');
  };

  const handleSaveFastEditAsset = async (updatedAsset: Asset) => {
    try {
      const res = await updateAsset(updatedAsset);
      setAssets(res.assets);
      showToast(`Data aset "${updatedAsset.Nama_Asset}" [${updatedAsset.ID_Asset}] berhasil diperbarui & tersinkron!`, 'success');
    } catch {
      const updatedAssets = assets.map((a) => (a.ID_Asset === updatedAsset.ID_Asset ? updatedAsset : a));
      setAssets(updatedAssets);
      showToast(`Data aset "${updatedAsset.Nama_Asset}" tersimpan secara lokal.`, 'info');
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    try {
      const res = await deleteAsset(assetId);
      setAssets(res.assets);
      showToast(`Aset [${assetId}] berhasil dihapus & tersinkron ke Google Sheets!`, 'info');
    } catch {
      const updatedAssets = assets.filter((a) => a.ID_Asset !== assetId);
      setAssets(updatedAssets);
      showToast(`Aset [${assetId}] berhasil dihapus secara lokal.`, 'info');
    }
  };

  // Batch Action Operations Executions with per-item matrix handling
  const handleExecuteBatchLoan = (
    items: ItemizedBatchState[],
    loanData: {
      namaPeminjam: string;
      unitPeminjam: string;
      targetKembali: string;
      keperluan: string;
      signature: string;
    }
  ) => {
    const itemMap = new Map(items.map((i) => [i.idAsset, i]));
    const targetIds = items.map((i) => i.idAsset);

    const updatedAssets = assets.map((a) => {
      const itemInfo = itemMap.get(a.ID_Asset);
      if (itemInfo) {
        return {
          ...a,
          Kondisi: itemInfo.kondisi,
          Catatan_Khusus_Item: itemInfo.catatanKhusus || a.Catatan_Khusus_Item,
          Status_Pinjam: 'Dipinjam' as const,
          Peminjam_Aktif: loanData.namaPeminjam,
        };
      }
      return a;
    });

    const affectedAssetObjects = updatedAssets.filter((a) => targetIds.includes(a.ID_Asset));

    const newBatchLoan: AssetLoan = {
      ID_Pinjam: `LNM-BATCH-${Date.now()}`,
      ID_Asset: `BATCH-${targetIds.length}`,
      Nama_Asset: `Batch ${targetIds.length} Barang Aset`,
      ID_Asset_List: targetIds,
      Nama_Peminjam: loanData.namaPeminjam,
      Unit_Peminjam: loanData.unitPeminjam,
      Tanggal_Pinjam: new Date().toISOString().substring(0, 10),
      Target_Kembali: loanData.targetKembali,
      Keperluan: loanData.keperluan,
      Status_Pinjam: 'Dipinjam',
      Tanda_Tangan_Peminjam: loanData.signature,
      Petugas_Pinjam: getActiveAuditor(),
      Kondisi_Saat_Pinjam: 'Baik',
    };

    setAssets(updatedAssets);
    const updatedLoans = saveAssetLoan(newBatchLoan);
    setLoans(updatedLoans.loans);

    // Issue 1 collective BAST Peminjaman document with itemized list
    const collectiveBA: BeritaAcaraDoc = {
      ID_BA: `BA-LN-${Date.now()}`,
      Nomor_BA: `BAST-PINJAM/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
      Jenis_BA: 'BAST Peminjaman',
      Tanggal_BA: new Date().toISOString().substring(0, 10),
      ID_Asset: `MULTI-${targetIds.length}`,
      Nama_Asset: `Peminjaman Massal ${targetIds.length} Barang Aset`,
      Aset_List: affectedAssetObjects,
      Kategori: 'Peminjaman Kolektif',
      Unit_Asal: affectedAssetObjects[0]?.Unit_Kerja || 'Unit Asal',
      Unit_Tujuan: loanData.unitPeminjam,
      Alasan_Keterangan: loanData.keperluan,
      Nama_Pihak_1: getActiveAuditor(),
      Jabatan_Pihak_1: 'Petugas Pengeluar Aset',
      TTD_Pihak_1: loanData.signature,
      Nama_Pihak_2: loanData.namaPeminjam,
      Jabatan_Pihak_2: `Peminjam (${loanData.unitPeminjam})`,
      TTD_Pihak_2: loanData.signature,
      Status_BA: 'Disetujui',
    };
    const updatedDocs = saveBeritaAcaraDocument(collectiveBA);
    setBeritaAcaraDocs(updatedDocs);

    showToast(`Peminjaman massal ${targetIds.length} aset & BAST Kolektif berhasil diterbitkan!`, 'success');
  };

  const handleExecuteBatchMutation = (
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
  ) => {
    const itemMap = new Map(items.map((i) => [i.idAsset, i]));
    const targetIds = items.map((i) => i.idAsset);

    const updatedAssets = assets.map((a) => {
      const itemInfo = itemMap.get(a.ID_Asset);
      if (itemInfo) {
        return {
          ...a,
          Unit_Kerja: mutationData.unitTujuan,
          Penanggung_Jawab: mutationData.penanggungJawabBaru,
          Kondisi: itemInfo.kondisi,
          Catatan_Khusus_Item: itemInfo.catatanKhusus || a.Catatan_Khusus_Item,
        };
      }
      return a;
    });

    const affectedAssetObjects = updatedAssets.filter((a) => targetIds.includes(a.ID_Asset));

    const collectiveBAMutation: BeritaAcaraDoc = {
      ID_BA: `BA-MUT-${Date.now()}`,
      Nomor_BA: mutationData.nomorBA,
      Jenis_BA: 'BA Mutasi',
      Tanggal_BA: new Date().toISOString().substring(0, 10),
      ID_Asset: `MULTI-${targetIds.length}`,
      Nama_Asset: `Mutasi Massal ${targetIds.length} Barang Aset`,
      Aset_List: affectedAssetObjects,
      Kategori: 'Mutasi Kolektif',
      Unit_Asal: batchOpsSelectedAssets[0]?.Unit_Kerja || 'Unit Asal',
      Unit_Tujuan: mutationData.unitTujuan,
      Penanggung_Jawab_Lama: batchOpsSelectedAssets[0]?.Penanggung_Jawab || 'PIC Lama',
      Penanggung_Jawab_Baru: mutationData.penanggungJawabBaru,
      Alasan_Keterangan: mutationData.alasan,
      Nama_Pihak_1: mutationData.pihak1Nama,
      Jabatan_Pihak_1: 'Petugas Pengeluar',
      TTD_Pihak_1: mutationData.pihak1TTD,
      Nama_Pihak_2: mutationData.pihak2Nama,
      Jabatan_Pihak_2: 'Penerima Aset Baru',
      TTD_Pihak_2: mutationData.pihak2TTD,
      Status_BA: 'Disetujui',
    };

    setAssets(updatedAssets);
    const updatedDocs = saveBeritaAcaraDocument(collectiveBAMutation);
    setBeritaAcaraDocs(updatedDocs);
    showToast(`Mutasi massal ${targetIds.length} aset & 1 BA Mutasi Kolektif berhasil diterbitkan!`, 'success');
  };

  const handleExecuteBatchDisposal = (
    items: ItemizedBatchState[],
    disposalData: {
      nomorBA: string;
      alasan: string;
      pihak1Nama: string;
      pihak2Nama: string;
      pihak1TTD: string;
      pihak2TTD: string;
    }
  ) => {
    const itemMap = new Map(items.map((i) => [i.idAsset, i]));
    const targetIds = items.map((i) => i.idAsset);

    const updatedAssets = assets.map((a) => {
      const itemInfo = itemMap.get(a.ID_Asset);
      if (itemInfo) {
        return {
          ...a,
          Kondisi: itemInfo.kondisi || ('Musnah' as const),
          Catatan_Khusus_Item: itemInfo.catatanKhusus || a.Catatan_Khusus_Item,
        };
      }
      return a;
    });

    const affectedAssetObjects = updatedAssets.filter((a) => targetIds.includes(a.ID_Asset));

    const collectiveBADisposal: BeritaAcaraDoc = {
      ID_BA: `BA-DISP-${Date.now()}`,
      Nomor_BA: disposalData.nomorBA,
      Jenis_BA: 'BA Penghapusan',
      Tanggal_BA: new Date().toISOString().substring(0, 10),
      ID_Asset: `MULTI-${targetIds.length}`,
      Nama_Asset: `Pemusnahan Massal ${targetIds.length} Barang Aset`,
      Aset_List: affectedAssetObjects,
      Kategori: 'Pemusnahan Kolektif',
      Alasan_Keterangan: disposalData.alasan,
      Nama_Pihak_1: disposalData.pihak1Nama,
      Jabatan_Pihak_1: 'Petugas Aset',
      TTD_Pihak_1: disposalData.pihak1TTD,
      Nama_Pihak_2: disposalData.pihak2Nama,
      Jabatan_Pihak_2: 'Saksi / Penanggung Jawab',
      TTD_Pihak_2: disposalData.pihak2TTD,
      Status_BA: 'Disetujui',
    };

    setAssets(updatedAssets);
    const updatedDocs = saveBeritaAcaraDocument(collectiveBADisposal);
    setBeritaAcaraDocs(updatedDocs);
    showToast(`Pemusnahan ${targetIds.length} aset & 1 BA Penghapusan Kolektif berhasil diterbitkan!`, 'success');
  };

  const handleAddAsset = async (payload: Omit<Asset, 'Tanggal_SO' | 'Sesi_SO_Terakhir' | 'Status_Audit' | 'Rincian_Kondisi' | 'Petugas_SO'>) => {
    setIsSaving(true);
    try {
      const res = await addAsset(payload);
      setAssets(res.assets);
      setSessions(res.sessions);
      if (res.categories) setCategories(res.categories);
      if (res.units) setUnits(res.units);
      showToast(`Aset baru "${payload.Nama_Asset}" [${payload.ID_Asset}] berhasil ditambahkan!`, 'success');
      setActiveTab('assets');
    } catch (err) {
      showToast('Gagal menambah aset baru', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveLoan = (newLoan: AssetLoan) => {
    const res = saveAssetLoan(newLoan);
    setAssets(res.assets);
    setLoans(res.loans);
    showToast(`Peminjaman aset "${newLoan.Nama_Asset}" oleh ${newLoan.Nama_Peminjam} berhasil dicatat!`, 'success');
  };

  const handleReturnLoan = (
    loanId: string,
    kondisiKembali: ConditionType,
    catatan: string,
    itemizedReturns?: ReturnItemState[]
  ) => {
    const res = processReturnAssetLoan(loanId, kondisiKembali, catatan);
    let updatedAssets = res.assets;

    if (itemizedReturns && itemizedReturns.length > 0) {
      const itemMap = new Map(itemizedReturns.map((i) => [i.idAsset, i]));
      updatedAssets = updatedAssets.map((a) => {
        const itemInfo = itemMap.get(a.ID_Asset);
        if (itemInfo) {
          return {
            ...a,
            Kondisi: itemInfo.kondisi,
            Catatan_Khusus_Item: itemInfo.catatan || a.Catatan_Khusus_Item,
          };
        }
        return a;
      });
    }

    setAssets(updatedAssets);
    setLoans(res.loans);

    // Generate 1 BAST Pengembalian document automatically if desired
    const loanObj = loans.find((l) => l.ID_Pinjam === loanId);
    if (loanObj) {
      const targetIds = loanObj.ID_Asset_List && loanObj.ID_Asset_List.length > 0
        ? loanObj.ID_Asset_List
        : [loanObj.ID_Asset];
      const returnedAssetObjects = updatedAssets.filter((a) => targetIds.includes(a.ID_Asset));

      const collectiveBAReturn: BeritaAcaraDoc = {
        ID_BA: `BA-RET-${Date.now()}`,
        Nomor_BA: `BAST-KEMBALI/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
        Jenis_BA: 'BAST Peminjaman',
        Tanggal_BA: new Date().toISOString().substring(0, 10),
        ID_Asset: `MULTI-${targetIds.length}`,
        Nama_Asset: `Pengembalian Massal ${targetIds.length} Barang Aset`,
        Aset_List: returnedAssetObjects,
        Kategori: 'Pengembalian Kolektif',
        Unit_Asal: loanObj.Unit_Peminjam,
        Unit_Tujuan: returnedAssetObjects[0]?.Unit_Kerja || 'Gudang Utama',
        Alasan_Keterangan: catatan || 'Pengembalian aset selesai peminjaman.',
        Nama_Pihak_1: loanObj.Nama_Peminjam,
        Jabatan_Pihak_1: `Peminjam (${loanObj.Unit_Peminjam})`,
        TTD_Pihak_1: loanObj.Tanda_Tangan_Peminjam,
        Nama_Pihak_2: getActiveAuditor(),
        Jabatan_Pihak_2: 'Petugas Penerima Aset',
        Status_BA: 'Disetujui',
      };
      const updatedDocs = saveBeritaAcaraDocument(collectiveBAReturn);
      setBeritaAcaraDocs(updatedDocs);
    }

    showToast(`Pengembalian aset berhasil diproses & BAST Pengembalian diterbitkan.`, 'success');
  };

  const handleSaveBeritaAcara = (doc: BeritaAcaraDoc) => {
    const updated = saveBeritaAcaraDocument(doc);
    setBeritaAcaraDocs(updated);
    showToast(`Dokumen Berita Acara ${doc.Nomor_BA} berhasil diterbitkan & tersimpan!`, 'success');
  };

  const handleExportExcel = (selectedAssets?: Asset[]) => {
    const exportData = selectedAssets && selectedAssets.length > 0 ? selectedAssets : assets;
    exportAuditReportToExcel(exportData, sessions);
    showToast(`Laporan Assets Management (${exportData.length} Aset) berhasil diekspor ke Excel!`, 'success');
  };

  const handleRunDepreciationBatch = async () => {
    try {
      const res = await processPeriodicDepreciation();
      setAssets(res.assets);
      showToast(
        `Penyusutan Periodik Berhasil! Total beban penyusutan Rp ${res.totalBeban.toLocaleString('id-ID')} dicatat ke Log_Penyusutan.`,
        'success'
      );
    } catch (err: any) {
      showToast('Gagal memproses penyusutan periodik.', 'error');
    }
  };

  const handleResetDemo = () => {
    const res = resetDemoData();
    setAssets(res.assets);
    setSessions(res.sessions);
    setCategories(res.categories || []);
    setUnits(res.units || []);
    setLoans(res.loans || []);
    setBeritaAcaraDocs(res.beritaAcaraDocs || []);
    if (res.sessions[0]) setActiveSessionId(res.sessions[0].ID_Sesi);
    showToast('Data demo Assets Management berhasil di-reset.', 'info');
  };

  const handleUrlUpdated = (newUrl: string) => {
    setGasUrl(newUrl);
    loadData();
    if (newUrl) {
      showToast('URL Google Apps Script diperbarui! Menghubungkan...', 'info');
    }
  };

  const handleAssetFoundFromScanner = (asset: Asset, intent: 'audit' | 'loan' | 'view' = 'view') => {
    if (intent === 'audit') {
      setIsAuditViewActive(true);
      showToast(`Aset "${asset.Nama_Asset}" (${asset.ID_Asset}) siap diaudit!`, 'info');
    } else if (intent === 'loan') {
      setLoanDrawerAsset(asset);
      setActiveLoanToReturn(null);
      setIsLoanDrawerOpen(true);
    } else {
      setLifecycleAsset(asset);
      setIsLifecycleDrawerOpen(true);
    }
  };

  const handleActionHubSelect = (actionKey: string) => {
    setIsAuditViewActive(false);
    setIsLoanViewActive(false);
    setIsBAViewActive(false);

    if (actionKey === 'add_asset') {
      setIsAddAssetDrawerOpen(true);
    } else if (actionKey === 'new_loan') {
      setLoanDrawerAsset(assets[0] || null);
      setActiveLoanToReturn(null);
      setIsLoanDrawerOpen(true);
    } else if (actionKey === 'return_loan') {
      setIsLoanViewActive(true);
    } else if (actionKey === 'bast_penerimaan' || actionKey === 'ba_mutasi' || actionKey === 'ba_penghapusan') {
      setBeritaAcaraAsset(assets[0] || null);
      setExistingBADoc(null);
      setIsBeritaAcaraDrawerOpen(true);
    } else if (actionKey === 'audit_so') {
      setIsCreateSessionDrawerOpen(true);
    } else if (actionKey === 'manage_sessions') {
      setIsSessionMgmtDrawerOpen(true);
    } else if (actionKey === 'print_barcode') {
      setBarcodeDrawerAsset(assets[0] || null);
      setBarcodeDrawerList(null);
      setIsBarcodeDrawerOpen(true);
    }
  };

  const pendingAuditCount = assets.filter((a) => a.Status_Audit === 'Belum SO').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#2C3E50] flex flex-col font-sans antialiased selection:bg-[#2D7D62] selection:text-white">
      {/* Top Bar Header */}
      <Header
        gasUrl={gasUrl}
        onOpenGasModal={() => setIsGasModalOpen(true)}
        onRefresh={loadData}
        isLoading={isLoading}
        searchQuery={searchQuery}
        onSearchChange={(q) => setSearchQuery(q)}
        userRole={userRole}
        assignedUnit={assignedUnit}
        onOpenScanner={() => setIsScannerOpen(true)}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-2">
        {isAuditViewActive ? (
          <AuditTab
            assets={assets}
            activeSessionId={activeSessionId}
            sessions={sessions}
            searchQuery={searchQuery}
            onSaveAudit={handleSaveAudit}
            isSaving={isSaving}
            onBackToDashboard={() => setIsAuditViewActive(false)}
            onOpenSessionManagement={() => setIsSessionMgmtDrawerOpen(true)}
          />
        ) : isLoanViewActive ? (
          <LoanTab
            loans={loans}
            userRole={userRole}
            onOpenNewLoanDrawer={() => {
              setLoanDrawerAsset(assets[0] || null);
              setActiveLoanToReturn(null);
              setIsLoanDrawerOpen(true);
            }}
            onOpenReturnLoanDrawer={(loan) => {
              setActiveLoanToReturn(loan);
              setIsLoanDrawerOpen(true);
            }}
          />
        ) : isBAViewActive ? (
          <BeritaAcaraTab
            docs={beritaAcaraDocs}
            userRole={userRole}
            onOpenNewBADrawer={() => {
              setBeritaAcaraAsset(assets[0] || null);
              setExistingBADoc(null);
              setIsBeritaAcaraDrawerOpen(true);
            }}
            onViewDocDrawer={(doc) => {
              setExistingBADoc(doc);
              setIsBeritaAcaraDrawerOpen(true);
            }}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardTab
                assets={assets}
                sessions={sessions}
                loans={loans}
                beritaAcaraDocs={beritaAcaraDocs}
                activeSessionId={activeSessionId}
                onSelectSession={(id) => setActiveSessionId(id)}
                onGoToAudit={() => setIsAuditViewActive(true)}
                onGoToLoans={() => setIsLoanViewActive(true)}
                onGoToBeritaAcara={() => setIsBAViewActive(true)}
                onGoToManage={() => setActiveTab('assets')}
                onOpenGasModal={() => setIsGasModalOpen(true)}
                gasUrl={gasUrl}
              />
            )}

            {activeTab === 'assets' && (
              <AssetMgmtTab
                assets={assets}
                categories={categories}
                units={units}
                userRole={userRole}
                assignedUnit={assignedUnit}
                searchQuery={searchQuery}
                onOpenAddAssetDrawer={() => setIsAddAssetDrawerOpen(true)}
                onOpenBarcodeDrawer={(asset, list) => {
                  setBarcodeDrawerAsset(asset);
                  setBarcodeDrawerList(list || null);
                  setIsBarcodeDrawerOpen(true);
                }}
                onOpenLoanDrawer={(asset) => {
                  setLoanDrawerAsset(asset);
                  setActiveLoanToReturn(null);
                  setIsLoanDrawerOpen(true);
                }}
                onOpenBeritaAcaraDrawer={(asset) => {
                  setBeritaAcaraAsset(asset);
                  setExistingBADoc(null);
                  setIsBeritaAcaraDrawerOpen(true);
                }}
                onOpenFastEditDrawer={(asset) => {
                  setFastEditAsset(asset);
                  setIsFastEditDrawerOpen(true);
                }}
                onOpenLifecycleDrawer={(asset) => {
                  setLifecycleAsset(asset);
                  setIsLifecycleDrawerOpen(true);
                }}
                onOpenDetailDrawer={(asset) => {
                  setDetailDrawerAsset(asset);
                  setIsDetailDrawerOpen(true);
                }}
                onOpenBatchOpsDrawer={(selectedList) => {
                  setBatchOpsSelectedAssets(selectedList);
                  setIsBatchOpsDrawerOpen(true);
                }}
                onExportExcel={handleExportExcel}
                onImportExcelClick={() => setIsAddAssetDrawerOpen(true)}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsTab
                userRole={userRole}
                onRoleChange={(role) => setUserRole(role)}
                assignedUnit={assignedUnit}
                onAssignedUnitChange={(unit) => setAssignedUnit(unit)}
                units={units}
                gasUrl={gasUrl}
                onSaveGasUrl={handleUrlUpdated}
                onOpenGasModal={() => setIsGasModalOpen(true)}
                assets={assets}
                sessions={sessions}
                onImportExcel={(impAssets, impSess, impCats, impUnits) => {
                  setAssets(impAssets);
                  if (impCats) setCategories(impCats);
                  if (impUnits) setUnits(impUnits);
                  showToast(`Berhasil mengimpor ${impAssets.length} aset dari Excel!`, 'success');
                }}
                onResetDemo={handleResetDemo}
                onRunDepreciationBatch={handleRunDepreciationBatch}
              />
            )}
          </>
        )}
      </main>

      {/* Floating Action Hub Drawer */}
      <ActionHubDrawer
        isOpen={isActionHubOpen}
        onClose={() => setIsActionHubOpen(false)}
        onActionSelect={handleActionHubSelect}
        userRole={userRole}
      />

      {/* Mobile-First Bottom Drawers */}
      <CreateSessionDrawer
        isOpen={isCreateSessionDrawerOpen}
        onClose={() => setIsCreateSessionDrawerOpen(false)}
        categories={categories}
        units={units}
        assets={assets}
        onCreateSession={handleCreateSession}
        isSaving={isSaving}
      />

      <SessionManagementDrawer
        isOpen={isSessionMgmtDrawerOpen}
        onClose={() => setIsSessionMgmtDrawerOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        assets={assets}
        categories={categories}
        units={units}
        onSelectActiveSession={handleSelectSession}
        onUpdateSession={handleUpdateSession}
        onDeleteSession={handleDeleteSession}
        onOpenReport={handleOpenReportModal}
        onGoToAudit={handleGoToAuditFromSession}
        onOpenCreateSession={() => {
          setIsSessionMgmtDrawerOpen(false);
          setIsCreateSessionDrawerOpen(true);
        }}
      />

      <SessionReportModal
        isOpen={isSessionReportModalOpen}
        onClose={() => {
          setIsSessionReportModalOpen(false);
          setSelectedReportSession(null);
        }}
        session={selectedReportSession}
        allAssets={assets}
        onCreateBAForAsset={(asset) => {
          setIsSessionReportModalOpen(false);
          setIsSessionMgmtDrawerOpen(false);
          setBeritaAcaraAsset(asset);
          setExistingBADoc(null);
          setIsBeritaAcaraDrawerOpen(true);
        }}
      />

      <AssetFormDrawer
        isOpen={isAddAssetDrawerOpen}
        onClose={() => setIsAddAssetDrawerOpen(false)}
        categories={categories}
        units={units}
        onAddAsset={handleAddAsset}
        existingAssetCount={assets.length}
      />

      <FastEditAssetDrawer
        isOpen={isFastEditDrawerOpen}
        onClose={() => setIsFastEditDrawerOpen(false)}
        asset={fastEditAsset}
        onSaveEdit={handleSaveFastEditAsset}
        onDeleteAsset={handleDeleteAsset}
      />

      <BatchOperationsDrawer
        isOpen={isBatchOpsDrawerOpen}
        onClose={() => setIsBatchOpsDrawerOpen(false)}
        selectedAssets={batchOpsSelectedAssets}
        units={units}
        onExecuteBatchLoan={handleExecuteBatchLoan}
        onExecuteBatchMutation={handleExecuteBatchMutation}
        onExecuteBatchDisposal={handleExecuteBatchDisposal}
      />

      <BarcodeStudioDrawer
        isOpen={isBarcodeDrawerOpen}
        onClose={() => setIsBarcodeDrawerOpen(false)}
        selectedAsset={barcodeDrawerAsset}
        selectedAssetList={barcodeDrawerList}
        allAssets={assets}
      />

      <LoanDrawer
        isOpen={isLoanDrawerOpen}
        onClose={() => setIsLoanDrawerOpen(false)}
        selectedAsset={loanDrawerAsset}
        allAssets={assets}
        onSaveLoan={handleSaveLoan}
        onReturnLoan={handleReturnLoan}
        activeLoanToReturn={activeLoanToReturn}
      />

      <BeritaAcaraDrawer
        isOpen={isBeritaAcaraDrawerOpen}
        onClose={() => setIsBeritaAcaraDrawerOpen(false)}
        selectedAsset={beritaAcaraAsset}
        onSaveBeritaAcara={handleSaveBeritaAcara}
        existingDoc={existingBADoc}
      />

      <CameraScannerDrawer
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        assets={assets}
        onAssetFound={handleAssetFoundFromScanner}
      />

      <AssetLifecycleDrawer
        isOpen={isLifecycleDrawerOpen}
        onClose={() => setIsLifecycleDrawerOpen(false)}
        asset={lifecycleAsset}
        loans={loans}
        beritaAcaraDocs={beritaAcaraDocs}
      />

      <AssetDetailDrawer
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        asset={detailDrawerAsset}
        loans={loans}
        beritaAcaraDocs={beritaAcaraDocs}
        onOpenEditDrawer={(asset) => {
          setFastEditAsset(asset);
          setIsFastEditDrawerOpen(true);
        }}
        onOpenLoanDrawer={(asset) => {
          setLoanDrawerAsset(asset);
          setActiveLoanToReturn(null);
          setIsLoanDrawerOpen(true);
        }}
        onOpenBarcodeDrawer={(asset) => {
          setBarcodeDrawerAsset(asset);
          setBarcodeDrawerList(null);
          setIsBarcodeDrawerOpen(true);
        }}
        onOpenBADrawer={(asset) => {
          setBeritaAcaraAsset(asset);
          setExistingBADoc(null);
          setIsBeritaAcaraDrawerOpen(true);
        }}
      />

      <CodeGsModal
        isOpen={isGasModalOpen}
        onClose={() => setIsGasModalOpen(false)}
        gasUrl={gasUrl}
        onSaveUrl={handleUrlUpdated}
      />

      {/* Fixed Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        isAuditViewActive={isAuditViewActive}
        onTabChange={(tab) => {
          setIsLoanViewActive(false);
          setIsBAViewActive(false);
          if (tab === 'audit') {
            setIsAuditViewActive(true);
          } else {
            setIsAuditViewActive(false);
            setActiveTab(tab);
          }
        }}
        onOpenActionHub={() => setIsActionHubOpen(true)}
        pendingAuditCount={pendingAuditCount}
      />

      {/* Toast Feedback */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
