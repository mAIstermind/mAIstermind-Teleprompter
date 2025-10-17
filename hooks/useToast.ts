import * as React from 'react';

interface ToastState {
  message: string;
  isVisible: boolean;
}

const useToast = (duration: number = 2000) => {
  const [toast, setToast] = React.useState<ToastState>({ message: '', isVisible: false });
  // FIX: Replaced NodeJS.Timeout with number for browser compatibility, as setTimeout returns a number in browser environments.
  const timeoutRef = React.useRef<number | null>(null);

  const showToast = React.useCallback((message: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setToast({ message, isVisible: true });
    timeoutRef.current = window.setTimeout(() => {
      setToast({ message: '', isVisible: false });
      timeoutRef.current = null;
    }, duration);
  }, [duration]);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { toast, showToast };
};

export default useToast;