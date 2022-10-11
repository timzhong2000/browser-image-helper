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

```bash
npm install @timzhong2000/browser-image-helper
# or
pnpm install @timzhong2000/browser-image-helper

```

normal use (immutable image)

```ts
import { ImageHelper } from "@timzhong2000/browser-image-helper";

const imageHelper = new ImageHelper(await fetchBlob());

// to ImageBitmap
const imageBitmap = await imageHelper.toImageBitmap();

// to ImageData
const imageData = await imageHelper.toImageData();

// select an area
const imageDataWithCutArea = await imageHelper.toImageData(0, 0, 1920, 1080);
```

for performance (mutable image)

```ts
import { ImageHelper } from "@timzhong2000/browser-image-helper";

const imageHelper = new ImageHelper(undefined, true);

// to ImageData (first time SLOW!)
imageHelper.setImage(await fetchBlob());
const imageData1 = await imageHelper.toImageBitmap();

// to ImageData (second time with zero-copy SUPER FAST!)
imageHelper.setImage(await fetchAnotherBlob());
const imageData2 = await imageHelper.toImageBitmap();
// ...
```
