export class ImageHelper {
  private canvas = document.createElement("canvas");
  constructor(private image?: ImageBitmapSource) {}

  setImage(image: ImageBitmapSource) {
    this.image = image;
  }

  /**
   * create OffscreenCanvas from ImageBitmap. your browser should support OffscreenCanvas
   */
  async toOffscreenCanvas() {
    const imageBitmap = await this.toImageBitmap();
    const { width, height } = imageBitmap;
    if (!window.OffscreenCanvas)
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
   * @param copy false: use a shared canvas
   * @returns
   */
  async toOnscreenCanvas(copy = true) {
    const imageBitmap = await this.toImageBitmap();
    const { width, height } = imageBitmap;
    const canvas = copy ? document.createElement("canvas") : this.canvas;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", {
      alpha: false,
      willReadFrequently: true,
      desynchronized: false,
    });
    if (!ctx) throw new Error("get RenderingContext2D failed");
    ctx.drawImage(imageBitmap, 0, 0);
    return { canvas, context: ctx };
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
    const { canvas } = await this.toOnscreenCanvas();
    return new Promise((resolve, reject) =>
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject()))
    );
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
    const { context } = await this.toOnscreenCanvas();
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
    if (!this.image) throw new Error("no avaliable image to process");
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
