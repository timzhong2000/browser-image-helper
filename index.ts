export interface CutConfig {
  startX: number;
  startY: number;
  width: number;
  height: number;
}

export class ImageHelper {
  /**
   * it can boost the performance if the image to be processed is mutable
   */
  private sharedCanvas = document.createElement("canvas");
  private image?: ImageBitmapSource;

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
  toOffscreenCanvas(cutConfig: CutConfig) {
    if (!window.OffscreenCanvas)
      throw new Error("browser does not support OffscreenCanvas");
    const { startX: sx, startY: sy, width: sw, height: sh } = cutConfig;
    const offscreenCanvas = new OffscreenCanvas(sw, sh);
    const context = ImageHelper.getContextInCPURam(offscreenCanvas);
    if (!this.image) throw new Error("no avaliable image to process");
    ImageHelper.drawOnContext(this.image, context, sx, sy, sw, sh);
    return { canvas: offscreenCanvas, context: context };
  }

  toOnscreenCanvas(cutConfig: CutConfig) {
    // create canvas and draw
    const canvas = this.mutable
      ? this.sharedCanvas
      : document.createElement("canvas");
    const { startX: sx, startY: sy, width: sw, height: sh } = cutConfig;
    canvas.width = sw;
    canvas.height = sh;
    const context = ImageHelper.getContextInCPURam(canvas);
    if (!this.image) throw new Error("no avaliable image to process");
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
    cutConfig?: CutConfig
  ) {
    const blob = await this.toBlob(options, cutConfig);
    return new File([blob], fileName, fileProperty);
  }

  /**
   * @param options image format and quality
   */
  async toBlob(
    options?: { type?: string | undefined; quality?: number | undefined },
    cutConfig?: CutConfig
  ): Promise<Blob> {
    if (this.image instanceof Blob) return this.image;
    const { width, height } = await this.getResolution();
    cutConfig = cutConfig ?? {
      startX: 0,
      startY: 0,
      height: height,
      width: width,
    };
    const { canvas } = await this.toOnscreenCanvas(cutConfig);
    return new Promise((resolve, reject) =>
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject()),
        options?.type,
        options?.quality
      )
    );
  }

  async toImageData(cutConfig?: CutConfig) {
    if (this.image instanceof ImageData) return this.image;
    const { width, height } = await this.getResolution();
    cutConfig = cutConfig ?? {
      startX: 0,
      startY: 0,
      height: height,
      width: width,
    };
    const { startX: sx, startY: sy, width: sw, height: sh } = cutConfig;
    const { context } = await this.toOnscreenCanvas(cutConfig);
    const blob = context.getImageData(sx, sy, sw, sh);
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
