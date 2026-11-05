import React, { useState, useEffect, useRef } from 'react';
import { Asset } from '../types';
import { BottomSheet } from './BottomSheet';
import { Camera, QrCode, CheckCircle2, AlertTriangle, RefreshCw, Volume2, Search, ArrowRight, Zap } from 'lucide-react';

interface CameraScannerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  onAssetFound: (asset: Asset, intent?: 'audit' | 'loan' | 'view') => void;
}

export const CameraScannerDrawer: React.FC<CameraScannerDrawerProps> = ({
  isOpen,
  onClose,
  assets,
  onAssetFound,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [detectedAsset, setDetectedAsset] = useState<Asset | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isScanning, setIsScanning] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const scanIntervalRef = useRef<number | null>(null);

  // Play audio beep on successful detection
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // 880 Hz (A5)
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch {
      // AudioContext may be restricted by autoplay policy
    }
  };

  // Start video stream when drawer opens
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    if (isOpen) {
      setDetectedAsset(null);
      setCameraError(null);
      setManualCode('');

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({
            video: {
              facingMode: facingMode,
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          })
          .then((mediaStream) => {
            activeStream = mediaStream;
            setStream(mediaStream);
            if (videoRef.current) {
              videoRef.current.srcObject = mediaStream;
              videoRef.current.play().catch(() => {});
            }
            setIsScanning(true);
          })
          .catch((err) => {
            setCameraError(
              'Akses kamera tidak diizinkan atau tidak tersedia pada browser ini. Anda dapat memasukkan kode aset secara langsung di bawah.'
            );
          });
      } else {
        setCameraError('Fitur kamera browser tidak didukung pada perangkat ini.');
      }
    } else {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      setIsScanning(false);
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, [isOpen, facingMode]);

  // Barcode / QR detection loop using BarcodeDetector API if available
  useEffect(() => {
    if (!isOpen || !isScanning) return;

    const BarcodeDetectorClass = (window as any).BarcodeDetector;
    let detector: any = null;

    if (BarcodeDetectorClass) {
      try {
        detector = new BarcodeDetectorClass({
          formats: ['qr_code', 'code_128', 'code_39', 'ean_13', 'upc_a'],
        });
      } catch {
        detector = null;
      }
    }

    const checkFrame = async () => {
      if (detector && videoRef.current && videoRef.current.readyState === 4) {
        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes && barcodes.length > 0) {
            const rawVal = String(barcodes[0].rawValue || '').trim();
            handleMatchCode(rawVal);
          }
        } catch {
          // Frame decode exception
        }
      }
    };

    scanIntervalRef.current = window.setInterval(checkFrame, 350);

    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, [isOpen, isScanning, assets]);

  const handleMatchCode = (codeStr: string) => {
    const clean = codeStr.trim().toLowerCase();
    if (!clean) return;

    const matched = assets.find(
      (a) =>
        a.ID_Asset.toLowerCase() === clean ||
        (a.Nomor_Seri && a.Nomor_Seri.toLowerCase() === clean) ||
        a.ID_Asset.toLowerCase().includes(clean)
    );

    if (matched) {
      playBeep();
      setDetectedAsset(matched);
      setIsScanning(false);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleMatchCode(manualCode);
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleResetScan = () => {
    setDetectedAsset(null);
    setIsScanning(true);
    setManualCode('');
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Live Scanner Barcode & QR Code"
      subtitle="Sorot label aset fisik untuk verifikasi instan"
      maxHeightClass="max-h-[92vh]"
    >
      <div className="space-y-4 text-xs text-[#2C3E50]">
        {/* Camera Viewport Canvas */}
        <div className="relative w-full aspect-4/3 sm:aspect-16/9 bg-black rounded-2xl overflow-hidden shadow-inner flex items-center justify-center border border-[#e2e6e4]">
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Scanner Reticle Target Overlay */}
          {!detectedAsset && !cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6">
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 border-2 border-dashed border-[#A8E6CF] rounded-2xl flex items-center justify-center animate-pulse">
                {/* Crosshairs & Scanning Beam */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-3 border-l-3 border-[#2D7D62] rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-3 border-r-3 border-[#2D7D62] rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-3 border-l-3 border-[#2D7D62] rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-3 border-r-3 border-[#2D7D62] rounded-br-lg" />
                <div className="w-full h-0.5 bg-[#A8E6CF] shadow-[0_0_12px_#2D7D62] animate-bounce" />
              </div>
              <p className="text-[11px] font-semibold text-white/90 bg-black/60 px-3 py-1 rounded-full mt-3 backdrop-blur-sm">
                Arahkan barcode atau QR aset ke dalam bingkai
              </p>
            </div>
          )}

          {/* Camera Controls Overlay */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              type="button"
              onClick={toggleCameraFacing}
              className="p-2 bg-black/60 text-white hover:bg-black/80 rounded-xl backdrop-blur-sm border border-white/20 transition-all"
              title="Ganti Kamera Depan / Belakang"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Camera Error Banner */}
          {cameraError && (
            <div className="absolute inset-0 bg-slate-900/90 text-white flex flex-col items-center justify-center p-6 text-center space-y-2">
              <AlertTriangle className="w-8 h-8 text-amber-400" />
              <p className="text-xs text-slate-200">{cameraError}</p>
            </div>
          )}
        </div>

        {/* Detected Asset Success Banner & Direct Action Buttons */}
        {detectedAsset ? (
          <div className="p-4 bg-[#A8E6CF]/25 border-2 border-[#2D7D62] rounded-2xl space-y-3 animate-in zoom-in-95">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="font-mono text-xs font-bold text-[#2D7D62] flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-[#2D7D62]" />
                  {detectedAsset.ID_Asset}
                </span>
                <h4 className="text-sm font-bold text-[#2C3E50] mt-0.5 truncate">
                  {detectedAsset.Nama_Asset}
                </h4>
                <p className="text-[11px] text-[#7F8C8D]">
                  {detectedAsset.Kategori} · {detectedAsset.Unit_Kerja} · Kondisi:{' '}
                  <strong className="text-[#2C3E50]">{detectedAsset.Kondisi}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={handleResetScan}
                className="px-2.5 py-1 text-[11px] font-semibold text-[#7F8C8D] hover:text-[#2C3E50] bg-white border border-[#e2e6e4] rounded-lg shrink-0"
              >
                Scan Ulang
              </button>
            </div>

            {/* Direct Action Routing */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#2D7D62]/20">
              <button
                type="button"
                onClick={() => {
                  onAssetFound(detectedAsset, 'audit');
                  onClose();
                }}
                className="py-2.5 px-2 bg-[#2D7D62] hover:bg-[#23634e] text-white font-bold rounded-xl text-center shadow-xs text-[11px] flex items-center justify-center gap-1 transition-all"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Audit SO</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onAssetFound(detectedAsset, 'loan');
                  onClose();
                }}
                className="py-2.5 px-2 bg-white hover:bg-[#F2F4F3] border border-[#e2e6e4] text-[#2C3E50] font-bold rounded-xl text-center shadow-xs text-[11px] flex items-center justify-center gap-1 transition-all"
              >
                <span>Pinjamkan</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onAssetFound(detectedAsset, 'view');
                  onClose();
                }}
                className="py-2.5 px-2 bg-white hover:bg-[#F2F4F3] border border-[#e2e6e4] text-[#2C3E50] font-bold rounded-xl text-center shadow-xs text-[11px] flex items-center justify-center gap-1 transition-all"
              >
                <span>Riwayat</span>
              </button>
            </div>
          </div>
        ) : (
          /* Manual Input Fallback Strip */
          <form onSubmit={handleManualSearch} className="space-y-2">
            <label className="text-[11px] font-semibold text-[#7F8C8D] block">
              Atau ketik/tempel kode aset manual:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#7F8C8D] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Contoh: IT-HRD-2026-0001 / Nomor Seri..."
                  className="w-full bg-[#F2F4F3] border border-[#e2e6e4] rounded-xl pl-9 pr-3 py-2 text-xs text-[#2C3E50] font-mono focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#2D7D62]"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#2D7D62] hover:bg-[#23634e] text-white font-bold text-xs rounded-xl shadow-xs shrink-0 transition-all"
              >
                Cari Aset
              </button>
            </div>
          </form>
        )}
      </div>
    </BottomSheet>
  );
};
