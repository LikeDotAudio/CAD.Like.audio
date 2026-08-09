/** A reference photo/screenshot placed under the drawing to trace over. */
export interface TracingImage {
  img: HTMLImageElement;
  /** World coordinates of the image centre. */
  x: number;
  y: number;
  /** How wide the image is in world units; height follows the aspect ratio. */
  worldWidth: number;
  opacity: number;
  visible: boolean;
}
