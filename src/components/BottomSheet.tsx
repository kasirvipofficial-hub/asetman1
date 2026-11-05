import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxHeightClass?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxHeightClass = 'max-h-[88vh]',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#2C3E50]/60 backdrop-blur-xs transition-opacity duration-200">
      {/* Backdrop overlay */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Drawer Container */}
      <div
        className={`relative z-10 w-full max-w-2xl bg-white text-[#2C3E50] border-t border-[#e2e6e4] rounded-t-3xl shadow-2xl flex flex-col ${maxHeightClass} animate-in slide-in-from-bottom duration-300 pb-safe`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Handle */}
        <div className="w-full flex flex-col items-center pt-3 pb-1 cursor-grab active:cursor-grabbing" onClick={onClose}>
          <div className="w-12 h-1.5 bg-[#7F8C8D]/40 rounded-full hover:bg-[#7F8C8D] transition-colors" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#F2F4F3] shrink-0">
          <div>
            <h3 className="text-lg font-bold text-[#2C3E50] tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-[#7F8C8D] mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#7F8C8D] hover:text-[#2C3E50] hover:bg-[#F2F4F3] rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-[#2C3E50]">{children}</div>
      </div>
    </div>
  );
};
