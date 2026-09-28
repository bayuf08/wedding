import { mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const frontend = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const originals = path.resolve(frontend, '../web-screenshots')
const output = path.resolve(frontend, 'tests/visual/reference')
const files = (await readdir(originals)).filter(name => name === '0.intro.png' || /^\d+\.png$/.test(name))
  .sort((a, b) => (a === '0.intro.png' ? -1 : b === '0.intro.png' ? 1 : Number.parseInt(a) - Number.parseInt(b)))
if (files.length !== 88) throw new Error(`Expected 88 reference screenshots, found ${files.length}`)
await mkdir(output, { recursive: true })
for (const name of files) {
  const input = path.join(originals, name)
  const { width, height } = await sharp(input).metadata()
  if (width !== 3584 || height !== 2264) throw new Error(`${name}: expected 3584 × 2264, found ${width} × ${height}`)
  await sharp(input).extract({ left: 112, top: 238, width: 3360, height: 1878 })
    .png({ compressionLevel: 9 }).toFile(path.join(output, name))
}
console.log(`Prepared ${files.length} 3360 × 1878 reference crops in ${output}`)
