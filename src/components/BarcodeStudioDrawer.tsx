import React, { useState, useEffect } from 'react';
import { Asset, BarcodeLabelConfig } from '../types';
import { BottomSheet } from './BottomSheet';
import { generateCode128Svg, generateQrCodeSvg } from '../utils/barcodeUtils';
import { Printer, LayoutGrid, Tag, Check, Download } from 'lucide-react';

interface BarcodeStudioDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAsset: Asset | null;
  selectedAssetList?: Asset[] | null;
  allAssets: Asset[];
}

export const BarcodeStudioDrawer: React.FC<BarcodeStudioDrawerProps> = ({
  isOpen,
  onClose,
  selectedAsset,
  selectedAssetList,
  allAssets,
}) => {
  const [targetMode, setTargetMode] = useState<'single' | 'batch'>('single');
  const [config, setConfig] = useState<BarcodeLabelConfig>({
    mode: 'thermal_single',
    includeLogo: true,
    includeQR: true,
    includeBarcode: true,
    companyName: 'ASSETS MANAGEMENT',
  });

  useEffect(() => {
    if (selectedAssetList && selectedAssetList.length > 0) {
      setTargetMode('batch');
    } else if (selectedAsset) {
      setTargetMode('single');
    }
  }, [selectedAsset, selectedAssetList, isOpen]);

  const assetsToPrint =
    selectedAssetList && selectedAssetList.length > 0
      ? selectedAssetList
      : targetMode === 'single' && selectedAsset
      ? [selectedAsset]
      : allAssets.slice(0, 24);

  const handlePrint = () => {
    window.print();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Studio Cetak Label"
      subtitle="Support Thermal Sticker 50x30mm & A4 Multi-Label Grid Sheet"
      maxHeightClass="max-h-[92vh]"
    >
      <div className="space-y-5 text-[#2C3E50]">
        {/* Print Configuration Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#F2F4F3] rounded-xl border border-[#e2e6e4]">
          <div>
            <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Target Cetak</label>
            <div className="flex rounded-lg p-1 bg-white border border-[#e2e6e4] text-xs">
              <button
                type="button"
                onClick={() => setTargetMode('single')}
                className={`flex-1 py-1.5 px-2 rounded-md font-medium transition-colors ${
                  targetMode === 'single' ? 'bg-[#2D7D62] text-white shadow-xs' : 'text-[#7F8C8D] hover:text-[#2C3E50]'
                }`}
              >
                {selectedAsset ? `Aset: ${selectedAsset.ID_Asset}` : '1 Aset'}
              </button>
              <button
                type="button"
                onClick={() => setTargetMode('batch')}
                className={`flex-1 py-1.5 px-2 rounded-md font-medium transition-colors ${
                  targetMode === 'batch' ? 'bg-[#2D7D62] text-white shadow-xs' : 'text-[#7F8C8D] hover:text-[#2C3E50]'
                }`}
              >
                {selectedAssetList && selectedAssetList.length > 0
                  ? `Terpilih (${selectedAssetList.length})`
                  : `Batch All (${allAssets.length})`}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Format Printer</label>
            <div className="flex rounded-lg p-1 bg-white border border-[#e2e6e4] text-xs">
              <button
                type="button"
                onClick={() => setConfig({ ...config, mode: 'thermal_single' })}
                className={`flex-1 py-1.5 px-2 rounded-md font-medium transition-colors ${
                  config.mode === 'thermal_single' ? 'bg-[#2D7D62] text-white shadow-xs' : 'text-[#7F8C8D] hover:text-[#2C3E50]'
                }`}
              >
                Thermal (50x30mm)
              </button>
              <button
                type="button"
                onClick={() => setConfig({ ...config, mode: 'a4_grid' })}
                className={`flex-1 py-1.5 px-2 rounded-md font-medium transition-colors ${
                  config.mode === 'a4_grid' ? 'bg-[#2D7D62] text-white shadow-xs' : 'text-[#7F8C8D] hover:text-[#2C3E50]'
                }`}
              >
                A4 Sheet (Grid)
              </button>
            </div>
          </div>
        </div>

        {/* Company Name / Header Input */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#7F8C8D]">Header Instansi Pada Label</label>
          <input
            type="text"
            value={config.companyName}
            onChange={(e) => setConfig({ ...config, companyName: e.target.value })}
            className="w-full bg-white border border-[#e2e6e4] rounded-xl px-3 py-2 text-sm text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
          />
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-[#7F8C8D]">
            Total Label: <strong className="text-[#2C3E50]">{assetsToPrint.length} Sticker</strong>
          </span>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-[#2D7D62] hover:bg-[#23634e] text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-98"
          >
            <Printer className="w-4 h-4" /> Cetak Label Sekarang
          </button>
        </div>

        {/* Print Live Preview Sheet */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#7F8C8D] block">Pratinjau Hasil Cetak</label>
          
          <div className="p-4 bg-[#F2F4F3] border border-[#e2e6e4] rounded-2xl overflow-x-auto min-h-[220px]">
            {/* Printable Container */}
            <div id="printable-barcode-area" className={config.mode === 'a4_grid' ? 'grid grid-cols-2 sm:grid-cols-3 gap-3 print:grid-cols-3 print:gap-2' : 'flex flex-col gap-3 items-center print:block'}>
              {assetsToPrint.map((asset, idx) => {
                const code128Svg = generateCode128Svg(asset.ID_Asset, 40);
                const qrSvg = generateQrCodeSvg(asset.ID_Asset, 80);

                return (
                  <div
                    key={`barcode-card-${asset.ID_Asset}-${idx}`}
                    className="w-[240px] bg-white text-slate-900 border border-slate-300 rounded-lg p-2.5 shadow-xs print:break-inside-avoid print:w-[50mm] print:h-[30mm] print:p-1.5 print:shadow-none print:border-black flex flex-col justify-between font-sans"
                  >
                    {/* Header */}
                    <div className="border-b border-slate-200 pb-1 text-center">
                      <div className="text-[10px] font-extrabold tracking-wider uppercase text-[#2D7D62] leading-none">
                        {config.companyName}
                      </div>
                      <div className="text-[8px] text-slate-500 truncate font-medium mt-0.5">
                        {asset.Unit_Kerja}
                      </div>
                    </div>

                    {/* Middle QR & Details */}
                    <div className="flex items-center gap-2 my-1.5">
                      <div
                        className="w-12 h-12 shrink-0 border border-slate-200 rounded p-0.5"
                        dangerouslySetInnerHTML={{ __html: qrSvg }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-black text-slate-900 font-mono tracking-tight leading-tight truncate">
                          {asset.ID_Asset}
                        </div>
                        <div className="text-[10px] font-bold text-slate-800 truncate mt-0.5">
                          {asset.Nama_Asset}
                        </div>
                        <div className="text-[9px] text-slate-500 truncate">
                          {asset.Kategori} · {asset.Lokasi || 'Kantor'}
                        </div>
                      </div>
                    </div>

                    {/* Footer Code128 Barcode */}
                    <div className="pt-1 border-t border-slate-200">
                      <div className="h-7 w-full overflow-hidden" dangerouslySetInnerHTML={{ __html: code128Svg }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
};
