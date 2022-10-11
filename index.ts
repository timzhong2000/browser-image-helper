export class ImageHelper {
  /**
   * it can boost the performance if the image to be processed is mutable
   */
  private sharedCanvas = document.createElement("canvas");
  private image: ImageBitmapSource;

  constructor(image?: ImageBitmapSource, private mutable: boolean = false) {
    image && this.setImage(image);
  }

  static getContextInCPURam(canvas: HTMLCanvasElement | OffscreenCanvas) {
    const context = canvas.getContext("2d", {
      alpha: false,
      willReadFrequently: true,
      desynchronized: false,
    });
    if (!context) throw new Error("get RenderingContext2D failed");
    return context;
  }

  /**
   *
   * @param image Do Not support Blob
   * @param context
   */
  static drawOnContext(
    image: ImageBitmapSource,
    context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    sx: number,
    sy: number,
    sw: number,
    sh: number
  ) {
    if (image instanceof Blob) {
      throw new Error("drawOnContext does not support Blob");
    } else if (image instanceof ImageData) {
      context.putImageData(image, 0, 0, sx, sy, sw, sh);
    } else {
      context.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);
    }
  }

  setImage(image: ImageBitmapSource) {
    this.image = image;
    return this;
  }

  /**
   * create OffscreenCanvas from ImageBitmap. your browser should support OffscreenCanvas!
   */
  async toOffscreenCanvas(sx: number, sy: number, sw: number, sh: number) {
    if (!window.OffscreenCanvas)
      throw new Error("browser does not support OffscreenCanvas");
    const { width, height } = await this.getResolution();
    const offscreenCanvas = new OffscreenCanvas(width, height);
    const context = ImageHelper.getContextInCPURam(offscreenCanvas);
    ImageHelper.drawOnContext(this.image, context, sx, sy, sw, sh);
    return { canvas: offscreenCanvas, context: context };
  }

  async toOnscreenCanvas(sx: number, sy: number, sw: number, sh: number) {
    // create canvas and draw
    const canvas = this.mutable
      ? this.sharedCanvas
      : document.createElement("canvas");
    canvas.width = sw;
    canvas.height = sh;
    const context = ImageHelper.getContextInCPURam(canvas);
    ImageHelper.drawOnContext(this.image, context, sx, sy, sw, sh);

    return { canvas, context };
  }

  /**
   * @param fileName length <= 255
   * @param fileProperty lastModified field
   * @param options image format and quality
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
   * @param options image format and quality
   */
  async toBlob(
    options?: { type?: string | undefined; quality?: number | undefined },
    sx?: number,
    sy?: number,
    sw?: number,
    sh?: number
  ): Promise<Blob> {
    if (this.image instanceof Blob) return this.image;
    const { width, height } = await this.getResolution();
    const { canvas } = await this.toOnscreenCanvas(
      sx ?? 0,
      sy ?? 0,
      sw ?? width,
      sh ?? height
    );
    return new Promise((resolve, reject) =>
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject()),
        options?.type,
        options?.quality
      )
    );
  }

  async toImageData(sx?: number, sy?: number, sw?: number, sh?: number) {
    if (this.image instanceof ImageData) return this.image;
    const { width, height } = await this.getResolution();
    const { context } = await this.toOnscreenCanvas(
      sx ?? 0,
      sy ?? 0,
      sw ?? width,
      sh ?? height
    );
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

  async getResolution() {
    const imageBitmap = await this.toImageBitmap();
    const { width, height } = imageBitmap;
    imageBitmap.close();
    return { width, height };
  }
}
