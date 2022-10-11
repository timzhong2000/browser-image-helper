export class ImageHelper {
  constructor(private image: ImageBitmapSource) {}

  /**
   * create OffscreenCanvas from ImageBitmap. your browser should support OffscreenCanvas
   *
   * @todo polyfill OffscreenCanvas
   * @param imageBitmap
   * @returns
   */
  private createOffscreenCanvasFromImageBitmap(imageBitmap: ImageBitmap) {
    const { width, height } = imageBitmap;
    if (!OffscreenCanvas)
      throw new Error("browser does not support OffscreenCanvas");
    const offscreenCanvas = new OffscreenCanvas(width, height);
    const ctx = offscreenCanvas.getContext("2d", {
      alpha: false,
      willReadFrequently: true,
      desynchronized: false,
    });
    if (!ctx) throw new Error("get RenderingContext2D failed");
    ctx.drawImage(imageBitmap, 0, 0);
    return { canvas: offscreenCanvas, context: ctx };
  }

  /**
   *
   * @param fileName
   * @param fileProperty lastModified field
   * @param options image format and quality
   * @param sx
   * @param sy
   * @param sw
   * @param sh
   * @returns
   */
  async toFile(
    fileName: string,
    fileProperty?: FilePropertyBag,
    options?: { type?: string | undefined; quality?: number | undefined },
    sx?: number,
    sy?: number,
    sw?: number,
    sh?: number
  ) {
    const blob = await this.toBlob(options, sx, sy, sw, sh);
    return new File([blob], fileName, fileProperty);
  }

  /**
   *
   * @param options image format and quality
   * @param sx
   * @param sy
   * @param sw
   * @param sh
   * @returns
   */
  async toBlob(
    options?: { type?: string | undefined; quality?: number | undefined },
    sx?: number,
    sy?: number,
    sw?: number,
    sh?: number
  ): Promise<Blob> {
    if (this.image instanceof Blob) return this.image;
    const imageBitmap = await this.toImageBitmap(sx, sy, sw, sh);
    const { canvas } = this.createOffscreenCanvasFromImageBitmap(imageBitmap);
    const blob = await canvas.convertToBlob(options);
    return blob;
  }

  /**
   *
   * @param sx
   * @param sy
   * @param sw
   * @param sh
   * @returns
   */
  async toImageData(sx?: number, sy?: number, sw?: number, sh?: number) {
    if (this.image instanceof ImageData) return this.image;
    const imageBitmap = await this.toImageBitmap(sx, sy, sw, sh);
    const { width, height } = imageBitmap;
    const { context } = this.createOffscreenCanvasFromImageBitmap(imageBitmap);
    const blob = context.getImageData(
      sx ?? 0,
      sy ?? 0,
      sw ?? width,
      sh ?? height
    );
    return blob;
  }

  /**
   *
   * @param sx
   * @param sy
   * @param sw
   * @param sh
   * @returns
   */
  async toImageBitmap(sx?: number, sy?: number, sw?: number, sh?: number) {
    if (
      sx !== undefined &&
      sy !== undefined &&
      sw !== undefined &&
      sh !== undefined
    ) {
      return await createImageBitmap(this.image, sx, sy, sw, sh);
    } else {
      return await createImageBitmap(this.image);
    }
  }
}
