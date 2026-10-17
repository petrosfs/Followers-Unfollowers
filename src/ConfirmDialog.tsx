import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/** Explains an action and asks the user to confirm it before it runs */
export default function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel,
  danger = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-body"
            className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-4"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="confirm-title" className="text-lg font-bold">{title}</h2>
            <p
              id="confirm-body"
              className="text-sm text-neutral-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: body }}
            />
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
              <button
                onClick={onCancel}
                className="px-4 py-2.5 rounded-xl font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                autoFocus
                className={`px-4 py-2.5 rounded-xl font-semibold text-white transition-colors ${
                  danger ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Small text button with an explanation that appears on hover (mouse devices only).
 *  The tooltip is display:none until hovered, so it never widens the page on phones. */
export function ActionLink({
  label,
  tip,
  onClick,
  danger = false,
  alignRight = false,
}: {
  label: string;
  tip: string;
  onClick: () => void;
  danger?: boolean;
  /** Open the tooltip towards the left (for links near the right edge) */
  alignRight?: boolean;
}) {
  return (
    <span className="relative inline-flex group">
      <button
        onClick={onClick}
        className={`underline transition-colors ${
          danger ? 'text-neutral-400 hover:text-red-500' : 'text-purple-600 hover:text-purple-800'
        }`}
      >
        {label}
      </button>
      <span
        role="tooltip"
        className={`pointer-events-none absolute bottom-full ${alignRight ? 'right-0' : 'left-0'} z-20 mb-2 hidden w-64 max-w-[calc(100vw-2rem)] rounded-lg bg-neutral-900 px-3 py-2 text-xs leading-snug text-white shadow-lg group-hover:block`}
      >
        {tip}
      </span>
    </span>
  );
}
