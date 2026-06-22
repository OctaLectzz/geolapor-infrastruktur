import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

const IMAGES_TO_UPLOAD = [
  { name: 'jalan-rusak.png', localPath: './public/images/reports/jalan-rusak.png' },
  { name: 'penerangan-jalan.png', localPath: './public/images/reports/penerangan-jalan.png' },
  { name: 'saluran-air.png', localPath: './public/images/reports/saluran-air.png' },
  { name: 'jembatan.png', localPath: './public/images/reports/jembatan.png' },
  { name: 'trotoar.png', localPath: './public/images/reports/trotoar.png' },
  { name: 'fasilitas-umum.png', localPath: './public/images/reports/fasilitas-umum.png' }
]

async function main() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL or access keys are missing.')
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  })

  console.log('Starting upload of seed images to Supabase Storage...')

  for (const img of IMAGES_TO_UPLOAD) {
    const filePath = path.resolve(img.localPath)
    if (!fs.existsSync(filePath)) {
      console.warn(`Local file not found: ${filePath}, skipping...`)
      continue
    }

    const fileBuffer = fs.readFileSync(filePath)
    const storagePath = `reports/default/${img.name}`

    console.log(`Uploading ${img.name} to bucket "report-photos" at path "${storagePath}"...`)

    const { data, error } = await supabase.storage
      .from('report-photos')
      .upload(storagePath, fileBuffer, {
        contentType: 'image/png',
        upsert: true
      })

    if (error) {
      console.error(`Failed to upload ${img.name}:`, error.message)
    } else {
      console.log(`Successfully uploaded ${img.name}. Storage path: ${data.path}`)
    }
  }

  console.log('Image upload script completed.')
}

main().catch((err) => {
  console.error('Unexpected error running upload script:', err)
  process.exit(1)
})
