import { createWriteStream } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import archiver from 'archiver'

const sourceDirectory = new URL('../dist/operation-map/', import.meta.url)
const outputFile = new URL('../dist/operation-map.zip', import.meta.url)

await mkdir(new URL('../dist/', import.meta.url), { recursive: true })

await new Promise((resolve, reject) => {
  const output = createWriteStream(outputFile)
  const archive = archiver('zip', {
    zlib: {
      level: 9
    }
  })

  output.on('close', resolve)
  output.on('error', reject)
  archive.on('error', reject)

  archive.pipe(output)
  archive.directory(sourceDirectory.pathname, false)
  archive.finalize()
})
