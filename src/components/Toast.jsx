import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import '../styles/toast.css';

const ToastContext = createContext(() => {});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timer = useRef();

  const show = useCallback((msg) => {
    clearTimeout(timer.current);
    setToast({ id: Date.now(), msg });
    timer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toast-wrap" role="status" aria-live="polite">
        <AnimatePresence mode="wait">
          {toast && (
            <motion.div
              key={toast.id}
              className="toast"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            >
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
