import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const frontend = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const directory = path.join(frontend, 'public/images/claire')
const originals = (await readdir(directory)).filter(name => /\.jpe?g$/i.test(name))
for (const name of originals) {
  const source = path.join(directory, name)
  const { width } = await sharp(source).metadata()
  if (!width) throw new Error(`Cannot read width: ${name}`)
  const stem = name.replace(/\.jpe?g$/i, '')
  for (const targetWidth of [640, 1200, 1680]) {
    if (targetWidth > width) continue
    await sharp(source).resize({ width: targetWidth }).webp({ quality: 84, effort: 6 }).toFile(path.join(directory, `${stem}-${targetWidth}.webp`))
  }
}
console.log(`Prepared responsive WebP sizes for ${originals.length} originals.`)
