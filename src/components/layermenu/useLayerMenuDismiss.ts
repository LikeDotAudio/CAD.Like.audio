import { useEffect } from 'react';

/** The layer menu closes on any outside mousedown or on Escape. */
export function useLayerMenuDismiss(onClose: () => void): void {
  useEffect(() => {
    const handleOutsideClick = () => onClose();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);
}
