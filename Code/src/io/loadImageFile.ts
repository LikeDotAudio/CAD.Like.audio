/** Read a picked image file into a decoded HTMLImageElement. */
export function loadImageFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Could not decode the image.'));
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
