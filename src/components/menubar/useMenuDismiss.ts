import { useEffect } from 'react';

/** Close the open menu on any mousedown outside the `.menu-container` wrapper. */
export function useMenuDismiss(onDismiss: () => void): void {
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.menu-container')) onDismiss();
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [onDismiss]);
}
