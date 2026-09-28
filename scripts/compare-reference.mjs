import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import pixelmatch from 'pixelmatch'

const [referencePath, candidatePath] = process.argv.slice(2)
if (!referencePath || !candidatePath) throw new Error('Usage: bun run reference:compare -- <reference.png> <candidate.png>')
const frontend = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const output = path.join(frontend, 'tests/visual/comparison', path.basename(referencePath, '.png'))
await mkdir(output, { recursive: true })
const width = 3360, height = 1878
const read = async file => {
  const image = sharp(file)
  const meta = await image.metadata()
  if (meta.width !== width || meta.height !== height) throw new Error(`${file}: expected ${width} × ${height}, found ${meta.width} × ${meta.height}`)
  return image.ensureAlpha().raw().toBuffer()
}
const [reference, candidate] = await Promise.all([read(referencePath), read(candidatePath)])
const diff = Buffer.alloc(width * height * 4)
const differing = pixelmatch(reference, candidate, diff, width, height, { threshold: 0.12 })
const halfCandidate = Buffer.from(candidate)
for (let index = 3; index < halfCandidate.length; index += 4) halfCandidate[index] = 128
await Promise.all([
  sharp({ create: { width: width * 2, height, channels: 4, background: '#fff' } })
    .composite([{ input: reference, left: 0, top: 0, raw: { width, height, channels: 4 } }, { input: candidate, left: width, top: 0, raw: { width, height, channels: 4 } }])
    .png().toFile(path.join(output, 'side-by-side.png')),
  sharp(reference, { raw: { width, height, channels: 4 } }).composite([{ input: halfCandidate, blend: 'over', raw: { width, height, channels: 4 } }])
    .png().toFile(path.join(output, 'overlay.png')),
  sharp(diff, { raw: { width, height, channels: 4 } }).png().toFile(path.join(output, 'difference.png')),
])
console.log(`${differing} differing pixels (${(100 * differing / (width * height)).toFixed(2)}%). Review ${output}`)
