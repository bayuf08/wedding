import type { ImageAsset } from '../types/claire'
export function packGallery(images: ImageAsset[]): [ImageAsset[], ImageAsset[]] {
  const columns: [ImageAsset[], ImageAsset[]] = [[], []]
  const heights = [0, 0]
  for (const image of images) { const index = heights[0]! <= heights[1]! ? 0 : 1; columns[index]!.push(image); heights[index]! += image.height / image.width + 0.03 }
  return columns
}
