import React, { useState, useEffect } from 'react';
import { X, Copy, Check, ExternalLink, HelpCircle, Save } from 'lucide-react';
import { getStoredGasUrl, setStoredGasUrl } from '../services/apiService';

interface CodeGsModalProps {
  isOpen: boolean;
  onClose: () => void;
  gasUrl?: string;
  onSaveUrl?: (url: string) => void;
  onUrlUpdated?: (url: string) => void;
}

export const CodeGsModal: React.FC<CodeGsModalProps> = ({
  isOpen,
  onClose,
  gasUrl,
  onSaveUrl,
  onUrlUpdated,
}) => {
  const [copied, setCopied] = useState(false);
  const [inputUrl, setInputUrl] = useState(gasUrl || getStoredGasUrl());
  const [activeTab, setActiveTab] = useState<'instructions' | 'code'>('instructions');

  useEffect(() => {
    if (gasUrl) setInputUrl(gasUrl);
  }, [gasUrl]);

  if (!isOpen) return null;

  const codeGsContent = `/**
 * GOOGLE APPS SCRIPT BACKEND: Assets Management & Stock Opname
 * Multi-Tab Database: Master_Assets, Sesi_SO, Log_Peminjaman, Dokumen_BA, Master_Kategori, Master_Unit, & SO_SESI_xxx.
 *
 * PETUNJUK DEPLOYMENT:
 * 1. Buka Google Sheets baru -> Ekstensi (Extensions) -> Apps Script.
 * 2. Hapus seluruh isi lama, tempelkan SELURUH kode di bawah ini.
 * 3. Pilih fungsi 'setupDatabase' lalu klik 'Jalankan' (Run) 1x & izinkan akses.
 * 4. Klik 'Terapkan' (Deploy) -> 'Kelola Penerapan' (Manage Deployments) -> Buat baru.
 * 5. Jenis: 'Aplikasi Web' (Web App).
 *    - Jalankan sebagai: 'Saya' (Me).
 *    - Yang memiliki akses: 'Siapa saja' (Anyone).
 * 6. Salin URL Web App dan tempelkan ke aplikasi Assets Management!
 */

function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Setup Sheet Master_Assets
  var sheetMaster = ss.getSheetByName('Master_Assets') || ss.insertSheet('Master_Assets');
  var headersMaster = [
    'ID_Asset', 'Nama_Asset', 'Kategori', 'Jenis', 'Penanggung_Jawab', 
    'Unit_Kerja', 'Lokasi', 'Tahun_Beli', 'Tanggal_Perolehan', 'Jumlah', 'Jumlah_Asal', 'Kondisi_Terakhir', 
    'Harga_Perolehan', 'Masa_Manfaat', 'Nilai_Sisa', 'Nilai_Buku', 'Nomor_Seri', 'Status_Pinjam', 'Peminjam_Aktif',
    'Petugas_SO_Terakhir', 'Tanggal_SO_Terakhir', 'Sesi_SO_Terakhir', 'Keterangan_SO'
  ];
  if (sheetMaster.getLastRow() === 0) {
    sheetMaster.appendRow(headersMaster);
    sheetMaster.getRange(1, 1, 1, headersMaster.length).setFontWeight('bold').setBackground('#2D7D62').setFontColor('#ffffff');
    sheetMaster.setFrozenRows(1);
  }

  // 2. Setup Sheet Log_Penyusutan
  var sheetLogDep = ss.getSheetByName('Log_Penyusutan') || ss.insertSheet('Log_Penyusutan');
  var headersLogDep = [
    'ID_Log', 'ID_Asset', 'Nama_Asset', 'Tanggal_Log', 'Nilai_Buku_Sebelum',
    'Beban_Penyusutan', 'Nilai_Buku_Sesudah', 'Keterangan', 'Executor'
  ];
  if (sheetLogDep.getLastRow() === 0) {
    sheetLogDep.appendRow(headersLogDep);
    sheetLogDep.getRange(1, 1, 1, headersLogDep.length).setFontWeight('bold').setBackground('#2D7D62').setFontColor('#ffffff');
    sheetLogDep.setFrozenRows(1);
  }

  // 3. Setup Sheet Master_Kategori
  var sheetKat = ss.getSheetByName('Master_Kategori') || ss.insertSheet('Master_Kategori');
  if (sheetKat.getLastRow() === 0) {
    sheetKat.appendRow(['Nama_Kategori']);
    sheetKat.getRange(1, 1).setFontWeight('bold').setBackground('#2D7D62').setFontColor('#ffffff');
    var defaultKategori = ['IT & Elektronik', 'Mebel & Furnitur', 'Peralatan Kantor', 'Kendaraan', 'Perlengkapan'];
    defaultKategori.forEach(function(k) { sheetKat.appendRow([k]); });
  }

  // 4. Setup Sheet Master_Unit
  var sheetUnit = ss.getSheetByName('Master_Unit') || ss.insertSheet('Master_Unit');
  if (sheetUnit.getLastRow() === 0) {
    sheetUnit.appendRow(['Nama_Unit']);
    sheetUnit.getRange(1, 1).setFontWeight('bold').setBackground('#2D7D62').setFontColor('#ffffff');
    var defaultUnit = ['HRD & General Affair', 'IT Operations', 'Keuangan & Akuntansi', 'Gudang Utama', 'Nursery Ciminyak', 'Office Ciminyak'];
    defaultUnit.forEach(function(u) { sheetUnit.appendRow([u]); });
  }

  // 5. Setup Sheet Sesi_SO
  var sheetSesi = ss.getSheetByName('Sesi_SO') || ss.insertSheet('Sesi_SO');
  var headersSesi = ['ID_Sesi', 'Nama_Sesi', 'Sheet_Name', 'Tanggal_Mulai', 'Target_Unit_Kerja', 'Scope_Kategori', 'Scope_Lokasi', 'Petugas_Utama', 'Status_Sesi'];
  if (sheetSesi.getLastRow() === 0) {
    sheetSesi.appendRow(headersSesi);
    sheetSesi.getRange(1, 1, 1, headersSesi.length).setFontWeight('bold').setBackground('#2D7D62').setFontColor('#ffffff');
    sheetSesi.setFrozenRows(1);
    var tglToday = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    sheetSesi.appendRow(['SESI-001', 'Stock Opname Awal Tahun 2026', 'SO_SESI_001', tglToday, 'Semua', 'Semua', 'Semua', 'Auditor Utama', 'Aktif']);
  }

  // 6. Setup Sheet Log_Peminjaman
  var sheetPinjam = ss.getSheetByName('Log_Peminjaman') || ss.insertSheet('Log_Peminjaman');
  var headersPinjam = [
    'ID_Pinjam', 'ID_Asset', 'Nama_Asset', 'ID_Asset_List', 'Nama_Peminjam', 'Unit_Peminjam',
    'Tanggal_Pinjam', 'Target_Kembali', 'Tanggal_Kembali_Real', 'Keperluan', 'Status_Pinjam',
    'Kondisi_Saat_Pinjam', 'Kondisi_Kembali', 'Catatan_Kembali', 'Petugas_Pinjam', 'Tanda_Tangan_Peminjam'
  ];
  if (sheetPinjam.getLastRow() === 0) {
    sheetPinjam.appendRow(headersPinjam);
    sheetPinjam.getRange(1, 1, 1, headersPinjam.length).setFontWeight('bold').setBackground('#2D7D62').setFontColor('#ffffff');
    sheetPinjam.setFrozenRows(1);
  }

  // 7. Setup Sheet Dokumen_BA
  var sheetBA = ss.getSheetByName('Dokumen_BA') || ss.insertSheet('Dokumen_BA');
  var headersBA = [
    'ID_BA', 'Nomor_BA', 'Jenis_BA', 'Tanggal_BA', 'ID_Asset', 'Nama_Asset', 'Kategori',
    'Unit_Asal', 'Unit_Tujuan', 'Penanggung_Jawab_Lama', 'Penanggung_Jawab_Baru',
    'Alasan_Keterangan', 'Nama_Pihak_1', 'Jabatan_Pihak_1', 'Nama_Pihak_2', 'Jabatan_Pihak_2', 'Status_BA'
  ];
  if (sheetBA.getLastRow() === 0) {
    sheetBA.appendRow(headersBA);
    sheetBA.getRange(1, 1, 1, headersBA.length).setFontWeight('bold').setBackground('#2D7D62').setFontColor('#ffffff');
    sheetBA.setFrozenRows(1);
  }

  // 8. Setup Sheet SO_SESI_001 (Initial active session sheet)
  var sheetSO = ss.getSheetByName('SO_SESI_001') || ss.insertSheet('SO_SESI_001');
  var headersSO = [
    'ID_Asset', 'Nama_Asset', 'Kategori', 'Unit_Kerja', 'Lokasi', 'Penanggung_Jawab',
    'Jumlah_Asal', 'Jumlah', 'Jml_Baik', 'Jml_Rusak_Ringan', 'Jml_Rusak_Berat', 'Jml_Hilang', 'Jml_Musnah',
    'Kondisi', 'Status_Audit', 'Petugas_SO', 'Tanggal_SO', 'Keterangan_SO'
  ];
  if (sheetSO.getLastRow() === 0) {
    sheetSO.appendRow(headersSO);
    sheetSO.getRange(1, 1, 1, headersSO.length).setFontWeight('bold').setBackground('#2D7D62').setFontColor('#ffffff');
    sheetSO.setFrozenRows(1);
  }
}

function doGet(e) {
  try {
    var sheetName = e && e.parameter ? e.parameter.sheet : null;
    return createJsonResponse({ status: 'success', data: getInitialDataInternal(sheetName) });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

function doPost(e) {
  try {
    var postData = JSON.parse(e.postData.contents);
    var action = postData.action;
    var payload = postData.payload || {};
    var result;
    
    if (action === 'getInitialData') {
      result = getInitialDataInternal(payload.activeSheetName);
    } else if (action === 'addAsset') {
      result = addAssetInternal(payload);
    } else if (action === 'updateAsset') {
      result = updateAssetInternal(payload);
    } else if (action === 'deleteAsset') {
      result = deleteAssetInternal(payload);
    } else if (action === 'updateStockOpname') {
      result = updateStockOpnameInternal(payload);
    } else if (action === 'createSession') {
      result = createSessionInternal(payload);
    } else if (action === 'updateSession') {
      result = updateSessionInternal(payload);
    } else if (action === 'deleteSession') {
      result = deleteSessionInternal(payload);
    } else if (action === 'saveLoan') {
      result = saveLoanInternal(payload);
    } else if (action === 'returnLoan') {
      result = returnLoanInternal(payload);
    } else if (action === 'saveBeritaAcara') {
      result = saveBeritaAcaraInternal(payload);
    } else if (action === 'batchUpdateAssets') {
      result = batchUpdateAssetsInternal(payload);
    } else if (action === 'batchDepreciation') {
      result = batchDepreciationInternal(payload);
    } else {
      throw new Error('Action tidak dikenal: ' + action);
    }
    
    return createJsonResponse({ status: 'success', data: result });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

function getInitialDataInternal(activeSheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetMaster = ss.getSheetByName('Master_Assets');
  var sheetSesiList = ss.getSheetByName('Sesi_SO');
  var sheetKat = ss.getSheetByName('Master_Kategori');
  var sheetUnit = ss.getSheetByName('Master_Unit');
  var sheetLoan = ss.getSheetByName('Log_Peminjaman');
  var sheetBA = ss.getSheetByName('Dokumen_BA');
  
  if (!sheetMaster || !sheetSesiList) {
    setupDatabase();
    sheetMaster = ss.getSheetByName('Master_Assets');
    sheetSesiList = ss.getSheetByName('Sesi_SO');
    sheetKat = ss.getSheetByName('Master_Kategori');
    sheetUnit = ss.getSheetByName('Master_Unit');
    sheetLoan = ss.getSheetByName('Log_Peminjaman');
    sheetBA = ss.getSheetByName('Dokumen_BA');
  }
  
  var sessions = sheetToObjects(sheetSesiList);
  var activeSesi = sessions.filter(function(s) { return s.Status_Sesi === 'Aktif'; })[0] || sessions[0];
  var targetSheetName = activeSheetName || (activeSesi ? (activeSesi.Sheet_Name || 'SO_' + activeSesi.ID_Sesi.replace(/[^a-zA-Z0-9]/g, '_')) : 'Master_Assets');
  
  var sheetSO = ss.getSheetByName(targetSheetName) || sheetMaster;
  var assets = sheetToObjects(sheetSO);

  return {
    assets: assets,
    sessions: sessions,
    categories: getListFromSingleColSheet(sheetKat),
    units: getListFromSingleColSheet(sheetUnit),
    loans: sheetLoan ? sheetToObjects(sheetLoan) : [],
    beritaAcaraDocs: sheetBA ? sheetToObjects(sheetBA) : []
  };
}

function addAssetInternal(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetMaster = ss.getSheetByName('Master_Assets') || ss.insertSheet('Master_Assets');
  setupDatabase();

  var headers = sheetMaster.getRange(1, 1, 1, sheetMaster.getLastColumn()).getValues()[0];
  var newRow = [];
  for (var i = 0; i < headers.length; i++) {
    var colName = headers[i];
    newRow.push(payload[colName] !== undefined ? payload[colName] : '');
  }
  sheetMaster.appendRow(newRow);

  return getInitialDataInternal();
}

function updateAssetInternal(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetMaster = ss.getSheetByName('Master_Assets');
  if (!sheetMaster) return getInitialDataInternal();

  var rowIdx = findRowIndexById(sheetMaster, 'ID_Asset', payload.ID_Asset);
  if (rowIdx > 0) {
    var headers = sheetMaster.getRange(1, 1, 1, sheetMaster.getLastColumn()).getValues()[0];
    for (var i = 0; i < headers.length; i++) {
      var colName = headers[i];
      if (payload[colName] !== undefined) {
        sheetMaster.getRange(rowIdx, i + 1).setValue(payload[colName]);
      }
    }
  }

  return getInitialDataInternal();
}

function deleteAssetInternal(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetMaster = ss.getSheetByName('Master_Assets');
  if (sheetMaster) {
    var rowIdx = findRowIndexById(sheetMaster, 'ID_Asset', payload.ID_Asset);
    if (rowIdx > 0) {
      sheetMaster.deleteRow(rowIdx);
    }
  }
  return getInitialDataInternal();
}

function updateStockOpnameInternal(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sessions = sheetToObjects(ss.getSheetByName('Sesi_SO'));
  var targetSessionId = payload.Sesi_SO_Terakhir;
  var sesiObj = sessions.filter(function(s) { return s.ID_Sesi === targetSessionId; })[0];
  var sessionSheetName = sesiObj ? (sesiObj.Sheet_Name || 'SO_' + sesiObj.ID_Sesi.replace(/[^a-zA-Z0-9]/g, '_')) : 'SO_SESI_001';

  var sheetSO = ss.getSheetByName(sessionSheetName) || ss.getSheetByName('Master_Assets');
  if (sheetSO) {
    var soRow = findRowIndexById(sheetSO, 'ID_Asset', payload.ID_Asset);
    if (soRow > 0) {
      var headers = sheetSO.getRange(1, 1, 1, sheetSO.getLastColumn()).getValues()[0];
      var updateMap = {
        'Kondisi': payload.Kondisi,
        'Jumlah': payload.Jumlah,
        'Jml_Baik': payload.Rincian_Kondisi ? payload.Rincian_Kondisi.Baik : payload.Jumlah,
        'Jml_Rusak_Ringan': payload.Rincian_Kondisi ? payload.Rincian_Kondisi.Rusak_Ringan : 0,
        'Jml_Rusak_Berat': payload.Rincian_Kondisi ? payload.Rincian_Kondisi.Rusak_Berat : 0,
        'Jml_Hilang': payload.Rincian_Kondisi ? payload.Rincian_Kondisi.Hilang : 0,
        'Jml_Musnah': payload.Rincian_Kondisi ? payload.Rincian_Kondisi.Musnah : 0,
        'Status_Audit': 'Sudah SO',
        'Petugas_SO': payload.Petugas_SO,
        'Tanggal_SO': payload.Tanggal_SO || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'),
        'Keterangan_SO': payload.Keterangan_SO || ''
      };
      for (var i = 0; i < headers.length; i++) {
        var h = headers[i];
        if (updateMap[h] !== undefined) {
          sheetSO.getRange(soRow, i + 1).setValue(updateMap[h]);
        }
      }
    }
  }

  // Sync back to Master_Assets
  var sheetMaster = ss.getSheetByName('Master_Assets');
  if (sheetMaster) {
    var masterRow = findRowIndexById(sheetMaster, 'ID_Asset', payload.ID_Asset);
    if (masterRow > 0) {
      var mHeaders = sheetMaster.getRange(1, 1, 1, sheetMaster.getLastColumn()).getValues()[0];
      var masterUpdates = {
        'Kondisi_Terakhir': payload.Kondisi,
        'Jumlah': payload.Jumlah,
        'Petugas_SO_Terakhir': payload.Petugas_SO,
        'Tanggal_SO_Terakhir': payload.Tanggal_SO || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'),
        'Sesi_SO_Terakhir': payload.Sesi_SO_Terakhir,
        'Keterangan_SO': payload.Keterangan_SO || ''
      };
      for (var j = 0; j < mHeaders.length; j++) {
        var mh = mHeaders[j];
        if (masterUpdates[mh] !== undefined) {
          sheetMaster.getRange(masterRow, j + 1).setValue(masterUpdates[mh]);
        }
      }
    }
  }

  return getInitialDataInternal(sessionSheetName);
}

function createSessionInternal(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetSesi = ss.getSheetByName('Sesi_SO') || ss.insertSheet('Sesi_SO');
  var newId = payload.ID_Sesi || ('SESI-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy') + '-' + Math.floor(100 + Math.random() * 900));
  var sheetName = 'SO_' + newId.replace(/[^a-zA-Z0-9]/g, '_');

  // Deactivate other sessions
  var sesiData = sheetSesi.getDataRange().getValues();
  for (var r = 1; r < sesiData.length; r++) {
    var statusCol = sesiData[0].indexOf('Status_Sesi');
    if (statusCol !== -1) {
      sheetSesi.getRange(r + 1, statusCol + 1).setValue('Selesai');
    }
  }

  // Insert new session row
  sheetSesi.appendRow([
    newId,
    payload.Nama_Sesi,
    sheetName,
    payload.Tanggal_Mulai,
    payload.Target_Unit_Kerja || 'Semua',
    payload.Scope_Kategori || 'Semua',
    payload.Scope_Lokasi || 'Semua',
    payload.Petugas_Utama,
    'Aktif'
  ]);

  // Create dedicated sheet for this session
  var sheetNewSO = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
  var headersSO = [
    'ID_Asset', 'Nama_Asset', 'Kategori', 'Unit_Kerja', 'Lokasi', 'Penanggung_Jawab',
    'Jumlah_Asal', 'Jumlah', 'Jml_Baik', 'Jml_Rusak_Ringan', 'Jml_Rusak_Berat', 'Jml_Hilang', 'Jml_Musnah',
    'Kondisi', 'Status_Audit', 'Petugas_SO', 'Tanggal_SO', 'Keterangan_SO'
  ];
  sheetNewSO.appendRow(headersSO);
  sheetNewSO.getRange(1, 1, 1, headersSO.length).setFontWeight('bold').setBackground('#2D7D62').setFontColor('#ffffff');
  sheetNewSO.setFrozenRows(1);

  // Populate from Master_Assets based on scope
  var sheetMaster = ss.getSheetByName('Master_Assets');
  if (sheetMaster) {
    var masterAssets = sheetToObjects(sheetMaster);
    var targetUnit = payload.Target_Unit_Kerja || 'Semua';
    var scopeKat = payload.Scope_Kategori || 'Semua';
    var scopeLoc = payload.Scope_Lokasi || 'Semua';

    masterAssets.forEach(function(a) {
      if (targetUnit !== 'Semua' && a.Unit_Kerja !== targetUnit) return;
      if (scopeKat !== 'Semua' && a.Kategori !== scopeKat) return;
      if (scopeLoc !== 'Semua' && a.Lokasi !== scopeLoc) return;

      var jml = Number(a.Jumlah) || 1;
      sheetNewSO.appendRow([
        a.ID_Asset,
        a.Nama_Asset,
        a.Kategori,
        a.Unit_Kerja,
        a.Lokasi || '',
        a.Penanggung_Jawab || '',
        jml,
        jml,
        jml,
        0, 0, 0, 0,
        a.Kondisi_Terakhir || 'Baik',
        'Belum SO',
        '',
        '',
        ''
      ]);
    });
  }

  return getInitialDataInternal(sheetName);
}

function updateSessionInternal(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetSesi = ss.getSheetByName('Sesi_SO');
  if (!sheetSesi) return getInitialDataInternal();

  var rowIdx = findRowIndexById(sheetSesi, 'ID_Sesi', payload.ID_Sesi);
  if (rowIdx > 0) {
    var headers = sheetSesi.getRange(1, 1, 1, sheetSesi.getLastColumn()).getValues()[0];
    for (var i = 0; i < headers.length; i++) {
      var col = headers[i];
      if (payload[col] !== undefined) {
        sheetSesi.getRange(rowIdx, i + 1).setValue(payload[col]);
      }
    }
  }

  return getInitialDataInternal();
}

function deleteSessionInternal(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetSesi = ss.getSheetByName('Sesi_SO');
  if (sheetSesi) {
    var rowIdx = findRowIndexById(sheetSesi, 'ID_Sesi', payload.ID_Sesi);
    if (rowIdx > 0) {
      var sheetNameCol = sheetSesi.getRange(1, 1, 1, sheetSesi.getLastColumn()).getValues()[0].indexOf('Sheet_Name');
      var sheetName = sheetNameCol !== -1 ? sheetSesi.getRange(rowIdx, sheetNameCol + 1).getValue() : '';
      sheetSesi.deleteRow(rowIdx);

      // Optionally delete the session sheet if exists
      if (sheetName && sheetName !== 'Master_Assets') {
        var sheetToDelete = ss.getSheetByName(sheetName);
        if (sheetToDelete) {
          try { ss.deleteSheet(sheetToDelete); } catch(e) {}
        }
      }
    }
  }

  return getInitialDataInternal();
}

function saveLoanInternal(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetPinjam = ss.getSheetByName('Log_Peminjaman') || ss.insertSheet('Log_Peminjaman');
  setupDatabase();

  var headers = sheetPinjam.getRange(1, 1, 1, sheetPinjam.getLastColumn()).getValues()[0];
  var newRow = [];
  for (var i = 0; i < headers.length; i++) {
    var col = headers[i];
    newRow.push(payload[col] !== undefined ? payload[col] : '');
  }
  sheetPinjam.appendRow(newRow);

  // Mark asset status as Dipinjam in Master_Assets
  var sheetMaster = ss.getSheetByName('Master_Assets');
  if (sheetMaster) {
    var targetIds = payload.ID_Asset_List && payload.ID_Asset_List.length > 0 ? payload.ID_Asset_List : [payload.ID_Asset];
    targetIds.forEach(function(id) {
      var rIdx = findRowIndexById(sheetMaster, 'ID_Asset', id);
      if (rIdx > 0) {
        var mHeaders = sheetMaster.getRange(1, 1, 1, sheetMaster.getLastColumn()).getValues()[0];
        var statusCol = mHeaders.indexOf('Status_Pinjam');
        var picCol = mHeaders.indexOf('Peminjam_Aktif');
        if (statusCol !== -1) sheetMaster.getRange(rIdx, statusCol + 1).setValue('Dipinjam');
        if (picCol !== -1) sheetMaster.getRange(rIdx, picCol + 1).setValue(payload.Nama_Peminjam);
      }
    });
  }

  return getInitialDataInternal();
}

function returnLoanInternal(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetPinjam = ss.getSheetByName('Log_Peminjaman');
  if (sheetPinjam) {
    var rIdx = findRowIndexById(sheetPinjam, 'ID_Pinjam', payload.ID_Pinjam);
    if (rIdx > 0) {
      var pHeaders = sheetPinjam.getRange(1, 1, 1, sheetPinjam.getLastColumn()).getValues()[0];
      var updateMap = {
        'Status_Pinjam': 'Selesai',
        'Tanggal_Kembali_Real': Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
        'Kondisi_Kembali': payload.Kondisi_Kembali || 'Baik',
        'Catatan_Kembali': payload.Catatan_Kembali || ''
      };
      for (var i = 0; i < pHeaders.length; i++) {
        var h = pHeaders[i];
        if (updateMap[h] !== undefined) {
          sheetPinjam.getRange(rIdx, i + 1).setValue(updateMap[h]);
        }
      }
    }
  }

  // Release asset in Master_Assets
  var sheetMaster = ss.getSheetByName('Master_Assets');
  if (sheetMaster && payload.ID_Asset) {
    var mIdx = findRowIndexById(sheetMaster, 'ID_Asset', payload.ID_Asset);
    if (mIdx > 0) {
      var mHeaders = sheetMaster.getRange(1, 1, 1, sheetMaster.getLastColumn()).getValues()[0];
      var sCol = mHeaders.indexOf('Status_Pinjam');
      var pCol = mHeaders.indexOf('Peminjam_Aktif');
      var kCol = mHeaders.indexOf('Kondisi_Terakhir');
      if (sCol !== -1) sheetMaster.getRange(mIdx, sCol + 1).setValue('Tersedia');
      if (pCol !== -1) sheetMaster.getRange(mIdx, pCol + 1).setValue('');
      if (kCol !== -1 && payload.Kondisi_Kembali) sheetMaster.getRange(mIdx, kCol + 1).setValue(payload.Kondisi_Kembali);
    }
  }

  return getInitialDataInternal();
}

function saveBeritaAcaraInternal(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetBA = ss.getSheetByName('Dokumen_BA') || ss.insertSheet('Dokumen_BA');
  setupDatabase();

  var headers = sheetBA.getRange(1, 1, 1, sheetBA.getLastColumn()).getValues()[0];
  var newRow = [];
  for (var i = 0; i < headers.length; i++) {
    var col = headers[i];
    newRow.push(payload[col] !== undefined ? payload[col] : '');
  }
  sheetBA.appendRow(newRow);

  return getInitialDataInternal();
}

function batchUpdateAssetsInternal(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetMaster = ss.getSheetByName('Master_Assets');
  if (!sheetMaster || !payload.assets) return getInitialDataInternal();

  payload.assets.forEach(function(a) {
    updateAssetInternal(a);
  });

  return getInitialDataInternal();
}

function batchDepreciationInternal(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetLogDep = ss.getSheetByName('Log_Penyusutan') || ss.insertSheet('Log_Penyusutan');
  setupDatabase();

  if (payload.logs && payload.logs.length > 0) {
    var headers = sheetLogDep.getRange(1, 1, 1, sheetLogDep.getLastColumn()).getValues()[0];
    payload.logs.forEach(function(logItem) {
      var newRow = [];
      for (var i = 0; i < headers.length; i++) {
        var col = headers[i];
        newRow.push(logItem[col] !== undefined ? logItem[col] : '');
      }
      sheetLogDep.appendRow(newRow);
    });
  }

  if (payload.assets && payload.assets.length > 0) {
    payload.assets.forEach(function(a) {
      updateAssetInternal(a);
    });
  }

  return getInitialDataInternal();
}

function findRowIndexById(sheet, colName, idVal) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return -1;
  var colIdx = data[0].indexOf(colName);
  if (colIdx === -1) return -1;
  for (var r = 1; r < data.length; r++) {
    if (String(data[r][colIdx]).trim() === String(idVal).trim()) {
      return r + 1; // 1-indexed for SpreadsheetApp
    }
  }
  return -1;
}

function getListFromSingleColSheet(sheet) {
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var list = [];
  for (var i = 1; i < data.length; i++) {
    var val = String(data[i][0]).trim();
    if (val && list.indexOf(val) === -1) list.push(val);
  }
  return list;
}

function sheetToObjects(sheet) {
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var headers = data[0], result = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) obj[headers[j]] = row[j];
    result.push(obj);
  }
  return result;
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeGsContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveUrl = () => {
    setStoredGasUrl(inputUrl);
    if (onSaveUrl) onSaveUrl(inputUrl.trim());
    if (onUrlUpdated) onUrlUpdated(inputUrl.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C3E50]/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white text-[#2C3E50] rounded-3xl shadow-2xl overflow-hidden border border-[#e2e6e4] flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F2F4F3] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#2D7D62] text-white flex items-center justify-center font-bold text-xs">
              GS
            </div>
            <div>
              <h2 className="text-base font-bold text-[#2C3E50]">
                Google Sheet API Apps Script
              </h2>
              <p className="text-[11px] text-[#7F8C8D] font-medium">
                Backend Service Integrasi Assets Management
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#7F8C8D] hover:text-[#2C3E50] hover:bg-[#F2F4F3] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-[#F2F4F3] px-5 pt-2 bg-[#F2F4F3] shrink-0 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('instructions')}
            className={`pb-2 px-3 border-b-2 transition-all ${
              activeTab === 'instructions'
                ? 'border-[#2D7D62] text-[#2D7D62]'
                : 'border-transparent text-[#7F8C8D] hover:text-[#2C3E50]'
            }`}
          >
            Panduan & Connect URL
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`pb-2 px-3 border-b-2 transition-all ${
              activeTab === 'code'
                ? 'border-[#2D7D62] text-[#2D7D62]'
                : 'border-transparent text-[#7F8C8D] hover:text-[#2C3E50]'
            }`}
          >
            Kode Backend Multi-Tab (Code.gs)
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'instructions' ? (
            <>
              <div className="bg-[#F2F4F3] p-4 rounded-2xl border border-[#e2e6e4] space-y-2">
                <label className="block text-xs font-bold text-[#2D7D62] uppercase tracking-wider">
                  GAS Web App Deployment URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="flex-1 bg-white text-[#2C3E50] border border-[#e2e6e4] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#2D7D62] font-mono"
                  />
                  <button
                    onClick={handleSaveUrl}
                    className="px-3.5 py-2 bg-[#2D7D62] hover:bg-[#23634e] text-white font-bold text-xs rounded-xl flex items-center gap-1 shrink-0 shadow-xs transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#2C3E50] uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-[#2D7D62]" />
                  Langkah Setup Google Spreadsheet:
                </h3>
                <ol className="list-decimal list-inside text-xs text-[#2C3E50] space-y-2 font-medium leading-relaxed">
                  <li>Buka <a href="https://sheets.google.com" target="_blank" rel="noreferrer" className="text-[#2D7D62] underline inline-flex items-center gap-0.5">Google Sheets <ExternalLink className="w-3 h-3"/></a> baru.</li>
                  <li>Buka menu <strong>Ekstensi (Extensions) &rarr; Apps Script</strong>.</li>
                  <li>Salin kode pada tab <strong>Kode Backend Multi-Tab (Code.gs)</strong> di atas dan tempelkan.</li>
                  <li>Jalankan fungsi <code className="bg-[#A8E6CF] text-[#2D7D62] px-1 py-0.5 rounded font-mono font-bold">setupDatabase()</code> 1x.</li>
                  <li>Klik <strong>Terapkan (Deploy) &rarr; Menerapkan sebagai Aplikasi Web</strong> (Akses: <strong>Anyone / Siapa saja</strong>).</li>
                  <li>Salin URL Web App dan tempelkan ke form di atas.</li>
                </ol>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#7F8C8D] uppercase tracking-wider">
                  Code.gs (Multi-Tab Version)
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#2D7D62] hover:bg-[#23634e] text-white font-bold text-xs shadow-xs transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin!' : 'Salin Semua Kode'}</span>
                </button>
              </div>
              <pre className="p-3 bg-[#2C3E50] text-slate-100 rounded-2xl text-[10px] font-mono overflow-x-auto border border-[#e2e6e4] max-h-80 leading-relaxed">
                {codeGsContent}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
