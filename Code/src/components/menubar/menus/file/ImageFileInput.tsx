import type { RefObject } from 'react';

export interface ImageFileInputProps {
  inputRef: RefObject<HTMLInputElement | null>;
  onPicked: (file: File) => void;
}

/** Hidden file picker for tracing images, opened by the File menu. */
export function ImageFileInput({ inputRef, onPicked }: ImageFileInputProps) {
  return (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      hidden
      onChange={(e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (file) onPicked(file);
      }}
    />
  );
}
