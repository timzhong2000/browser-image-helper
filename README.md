# browser-image-helper

A library for image format transform on browser

## Overview

### Supported Input Format

- HTMLImageElement
- SVGImageElement
- HTMLVideoElement
- HTMLCanvasElement
- ImageBitmap
- Blob
- ImageData
- File

### Supported Output Format

- ImageBitmap
- Blob
- ImageData
- File

## Getting Started

```ts
const imgBlob = await(fetch("IMAGE_URL").then((res) => res.blob()));
const imageHelper = new ImageHelper(imgBlob);
// to ImageBitmap
const imageBitmap = imageHelper.toImageBitmap();
// to ImageData
const imageData = imageHelper.toImageBitmap();
```
