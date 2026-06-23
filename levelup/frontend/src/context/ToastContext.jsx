import { createContext, useContext, useState, useEffect } from 'react';
import { CheckCircle, AlertOctagon, AlertTriangle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const success = (msg, dur) => addToast(msg, 'success', dur);
  const error = (msg, dur) => addToast(msg, 'error', dur);
  const warn = (msg, dur) => addToast(msg, 'warning', dur);
  const info = (msg, dur) => addToast(msg, 'info', dur);

  // Listen to custom window events for toasts (useful for Axios interceptors)
  useEffect(() => {
    const handleToastEvent = (e) => {
      const { message, type, duration } = e.detail || {};
      if (message) {
        addToast(message, type, duration);
      }
    };
    window.addEventListener('app-toast', handleToastEvent);

    // Check for any stored toasts from redirects
    const storedMsg = sessionStorage.getItem('toast_message');
    if (storedMsg) {
      addToast(storedMsg, 'warning');
      sessionStorage.removeItem('toast_message');
    }

    return () => window.removeEventListener('app-toast', handleToastEvent);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warn, info }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

// Non-React helper function to trigger toasts from anywhere
export const triggerToast = (message, type = 'info', duration = 4000) => {
  window.dispatchEvent(
    new CustomEvent('app-toast', {
      detail: { message, type, duration },
    })
  );
};

function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div 
          key={toast.id} 
          className={`toast-card ${toast.type}`}
          onClick={() => removeToast(toast.id)}
          style={{ cursor: 'pointer' }}
        >
          <div className="toast-icon">{getIcon(toast.type)}</div>
          <div className="toast-message">{toast.message}</div>
          <button className="toast-close" onClick={(e) => { e.stopPropagation(); removeToast(toast.id); }}>×</button>
        </div>
      ))}
    </div>
  );
}

function getIcon(type) {
  switch (type) {
    case 'success': return <CheckCircle size={16} />;
    case 'error': return <AlertOctagon size={16} />;
    case 'warning': return <AlertTriangle size={16} />;
    default: return <Info size={16} />;
  }
}
