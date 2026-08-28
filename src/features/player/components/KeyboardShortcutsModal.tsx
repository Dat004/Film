'use client';

import { X } from 'lucide-react';
import React from 'react';

import Button from '@/components/ui/Button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/Dialog';

import { KEYBOARD_SHORTCUT_GROUPS } from '../constants/keyboard-shortcuts.constants';

export interface KeyboardShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsModal({ open, onOpenChange }: KeyboardShortcutsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="modal-panel-surface mx-auto max-w-[520px] w-[92vw] rounded-[12px] overflow-hidden bg-bg-sidebar border border-bd-filed-form-color p-0 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-[16px] py-[8px] border-b border-bd-filed-form-color">
          <DialogTitle className="text-[15px] font-semibold text-primary flex items-center gap-[8px]">
            <span>Hướng dẫn Phím tắt Trình phát</span>
          </DialogTitle>
          <Button
            rounded
            aria-label="Đóng"
            onClick={() => onOpenChange(false)}
            className="w-[32px] h-[32px] p-0 flex items-center justify-center text-title hover:text-primary transition-colors"
          >
            <X className="w-[18px] h-[18px]" />
          </Button>
        </div>

        {/* Modal Body */}
        <div className="p-[20px] max-h-[70vh] overflow-y-auto space-y-5">
          {KEYBOARD_SHORTCUT_GROUPS.map((group, gIdx) => (
            <div key={gIdx} className="space-y-2">
              <h4 className="text-[12px] font-semibold uppercase tracking-wider text-title/70">
                {group.title}
              </h4>
              <div className="rounded-[8px] bg-bg-field border border-bd-filed-form-color divide-y divide-bd-filed-form-color">
                {group.items.map((item, iIdx) => (
                  <div
                    key={iIdx}
                    className="flex items-center justify-between px-3.5 py-2.5 text-[13px]"
                  >
                    <span className="text-primary/90 font-medium">{item.label}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((k, kIdx) => (
                        <React.Fragment key={kIdx}>
                          {kIdx > 0 && <span className="text-title/50 text-[11px]">hoặc</span>}
                          <kbd className="inline-flex min-w-[24px] items-center justify-center rounded-[4px] border border-bd-filed-form-color bg-bg-sidebar px-2 py-0.5 text-[11px] font-semibold text-primary shadow-sm font-mono">
                            {k}
                          </kbd>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="p-[14px] px-[20px] bg-bg-field border-t border-bd-filed-form-color flex justify-between items-center text-[12px] text-title/70">
          <span>
            Nhấn{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-bg-sidebar border border-bd-filed-form-color font-mono text-[11px]">
              Shift
            </kbd>{' '}
            +{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-bg-sidebar border border-bd-filed-form-color font-mono text-[11px]">
              ?
            </kbd>{' '}
            mọi lúc để mở lại
          </span>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-[6px] bg-bg-search-btn px-4 py-1.5 text-[12.5px] font-medium text-primary hover:bg-bg-odd-color transition-colors"
          >
            Đã hiểu
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default KeyboardShortcutsModal;
