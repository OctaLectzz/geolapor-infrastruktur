import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'
import pg from 'pg'
import { PhotoType, ReportStatus } from '../generated/prisma/enums'
import { PrismaClient } from '../generated/prisma/client'

interface RegionSeed {
  province: string
  city: string
  district: string | null
  village: string | null
}

interface ReportSeed {
  reportCode: string
  title: string
  description: string
  address: string
  latitude: number
  longitude: number
  status: ReportStatus
  priorityLevel: number
  categorySlug: string
  regionKey: string // province-city key
  imageName: string
  caption: string
}

// 1. Regions to seed/match
const regionsToSeed: RegionSeed[] = [
  { province: 'DKI Jakarta', city: 'Jakarta Selatan', district: 'Mampang Prapatan', village: 'Mampang Prapatan' },
  { province: 'DKI Jakarta', city: 'Jakarta Pusat', district: 'Tanah Abang', village: 'Kebon Melati' },
  { province: 'Jawa Barat', city: 'Bandung', district: 'Coblong', village: 'Lebak Siliwangi' },
  { province: 'DI Yogyakarta', city: 'Yogyakarta', district: 'Gondomanan', village: 'Ngupasan' },
  { province: 'Jawa Timur', city: 'Surabaya', district: 'Tegalsari', village: 'Kedungdoro' },
  { province: 'Bali', city: 'Denpasar', district: 'Denpasar Selatan', village: 'Sanur' },
  { province: 'Sumatera Utara', city: 'Medan', district: 'Medan Baru', village: 'Darats' },
  { province: 'Sulawesi Selatan', city: 'Makassar', district: 'Ujung Pandang', village: 'Maloku' },
  { province: 'Kalimantan Timur', city: 'Balikpapan', district: 'Balikpapan Kota', village: 'Klandasan Ulu' },
  { province: 'Jawa Tengah', city: 'Semarang', district: 'Semarang Tengah', village: 'Sekayu' }
]

// 2. Reports data (22 entries)
const reportsToSeed: ReportSeed[] = [
  {
    reportCode: 'RPT-2026-0010',
    title: 'Lubang Besar di Jalan Kemang Raya',
    description: 'Lubang jalan cukup besar di depan Kemang Village, rawan kecelakaan bagi sepeda motor di malam hari.',
    address: 'Jl. Kemang Raya No. 10, Mampang Prapatan, Jakarta Selatan',
    latitude: -6.273611,
    longitude: 106.818333,
    status: ReportStatus.PENDING_VERIFICATION,
    priorityLevel: 2,
    categorySlug: 'jalan-rusak',
    regionKey: 'dki-jakarta-jakarta-selatan',
    imageName: 'jalan-rusak.png',
    caption: 'Kondisi jalan berlubang di lajur kiri'
  },
  {
    reportCode: 'RPT-2026-0011',
    title: 'Tiang Lampu Roboh di Sudirman',
    description: 'Tiang lampu jalan miring hampir roboh menghalangi trotoar di seberang FX Sudirman.',
    address: 'Jl. Jenderal Sudirman, Senayan, Jakarta Pusat',
    latitude: -6.218333,
    longitude: 106.8025,
    status: ReportStatus.VERIFIED,
    priorityLevel: 3,
    categorySlug: 'penerangan-jalan',
    regionKey: 'dki-jakarta-jakarta-pusat',
    imageName: 'penerangan-jalan.png',
    caption: 'Tiang miring membahayakan pedestrian'
  },
  {
    reportCode: 'RPT-2026-0012',
    title: 'Banjir Cileuncang Akibat Drainase Tersumbat',
    description: 'Setiap hujan deras, Jalan Dago depan FO meluap karena saluran air tersumbat sampah tebal.',
    address: 'Jl. Ir. H. Juanda, Dago, Bandung',
    latitude: -6.891234,
    longitude: 107.618901,
    status: ReportStatus.IN_PROGRESS,
    priorityLevel: 3,
    categorySlug: 'saluran-air',
    regionKey: 'jawa-barat-bandung',
    imageName: 'saluran-air.png',
    caption: 'Air meluap ke badan jalan saat hujan'
  },
  {
    reportCode: 'RPT-2026-0013',
    title: 'Keretakan Jembatan Pasupati',
    description: 'Ditemukan retakan struktural pada sambungan beton flyover Pasupati kilometer 1.5.',
    address: 'Flyover Pasupati, Tamansari, Bandung',
    latitude: -6.901556,
    longitude: 107.608333,
    status: ReportStatus.COMPLETED,
    priorityLevel: 3,
    categorySlug: 'jembatan',
    regionKey: 'jawa-barat-bandung',
    imageName: 'jembatan.png',
    caption: 'Retakan beton di pilar jembatan'
  },
  {
    reportCode: 'RPT-2026-0014',
    title: 'Trotoar Hancur di Malioboro Utara',
    description: 'Tegel trotoar banyak yang pecah dan lepas, membahayakan wisatawan pejalan kaki.',
    address: 'Jl. Malioboro, Ngupasan, Yogyakarta',
    latitude: -7.791222,
    longitude: 110.364556,
    status: ReportStatus.VERIFIED,
    priorityLevel: 1,
    categorySlug: 'trotoar',
    regionKey: 'di-yogyakarta-yogyakarta',
    imageName: 'trotoar.png',
    caption: 'Ubin trotoar hancur berantakan'
  },
  {
    reportCode: 'RPT-2026-0015',
    title: 'Halte Trans Jogja Rusak Parah',
    description: 'Halte depan Bethesda kacanya pecah semua dan atap bocor parah.',
    address: 'Jl. Jenderal Sudirman, Gondokusuman, Yogyakarta',
    latitude: -7.783611,
    longitude: 110.378333,
    status: ReportStatus.PENDING_VERIFICATION,
    priorityLevel: 2,
    categorySlug: 'fasilitas-umum',
    regionKey: 'di-yogyakarta-yogyakarta',
    imageName: 'fasilitas-umum.png',
    caption: 'Kondisi kaca halte pecah berantakan'
  },
  {
    reportCode: 'RPT-2026-0016',
    title: 'Jalan Amblas di Raya Gubeng',
    description: 'Sebagian jalan Raya Gubeng amblas akibat proyek konstruksi basement di dekatnya.',
    address: 'Jl. Raya Gubeng, Gubeng, Surabaya',
    latitude: -7.268056,
    longitude: 112.748333,
    status: ReportStatus.ASSIGNED,
    priorityLevel: 3,
    categorySlug: 'jalan-rusak',
    regionKey: 'jawa-timur-surabaya',
    imageName: 'jalan-rusak.png',
    caption: 'Jalan raya amblas longsor'
  },
  {
    reportCode: 'RPT-2026-0017',
    title: 'Lampu Merah Padam di Perempatan Tunjungan',
    description: 'Traffic light padam total menyebabkan kemacetan parah dari empat arah.',
    address: 'Jl. Tunjungan, Kedungdoro, Surabaya',
    latitude: -7.258889,
    longitude: 112.738889,
    status: ReportStatus.IN_PROGRESS,
    priorityLevel: 2,
    categorySlug: 'penerangan-jalan',
    regionKey: 'jawa-timur-surabaya',
    imageName: 'penerangan-jalan.png',
    caption: 'Traffic light mati memicu kemacetan'
  },
  {
    reportCode: 'RPT-2026-0018',
    title: 'Saluran Drainase Jebol di Kuta',
    description: 'Dinding beton drainase jebol menyebabkan air got meluap ke pertokoan di Jl. Legian.',
    address: 'Jl. Legian, Kuta, Badung, Bali',
    latitude: -8.723611,
    longitude: 115.172222,
    status: ReportStatus.COMPLETED,
    priorityLevel: 2,
    categorySlug: 'saluran-air',
    regionKey: 'bali-denpasar',
    imageName: 'saluran-air.png',
    caption: 'Beton gorong-gorong hancur'
  },
  {
    reportCode: 'RPT-2026-0019',
    title: 'Pagar Pengaman Jembatan Nusa Dua Retak',
    description: 'Pagar pembatas jembatan tol menuju Nusa Dua miring dan retak akibat tertabrak kendaraan.',
    address: 'Tol Bali Mandara, Benoa, Denpasar, Bali',
    latitude: -8.791667,
    longitude: 115.228333,
    status: ReportStatus.PENDING_VERIFICATION,
    priorityLevel: 2,
    categorySlug: 'jembatan',
    regionKey: 'bali-denpasar',
    imageName: 'jembatan.png',
    caption: 'Pagar pembatas patah sebagian'
  },
  {
    reportCode: 'RPT-2026-0020',
    title: 'Trotoar Jadi Tempat Parkir & Rusak di Jl. Gajah Mada',
    description: 'Trotoar di Jl. Gajah Mada rusak parah dan ambles akibat sering digunakan parkir liar mobil.',
    address: 'Jl. Gajah Mada, Medan Petisah, Medan',
    latitude: 3.585556,
    longitude: 98.665556,
    status: ReportStatus.VERIFIED,
    priorityLevel: 1,
    categorySlug: 'trotoar',
    regionKey: 'sumatera-utara-medan',
    imageName: 'trotoar.png',
    caption: 'Kerusakan paving block trotoar'
  },
  {
    reportCode: 'RPT-2026-0021',
    title: 'Taman Kota Lapangan Merdeka Terbengkalai',
    description: 'Bangku taman banyak yang patah dan fasilitas bermain anak rusak berkarat.',
    address: 'Jl. Balai Kota, Kesawan, Medan',
    latitude: 3.591389,
    longitude: 98.678333,
    status: ReportStatus.PENDING_VERIFICATION,
    priorityLevel: 1,
    categorySlug: 'fasilitas-umum',
    regionKey: 'sumatera-utara-medan',
    imageName: 'fasilitas-umum.png',
    caption: 'Kursi taman besi patah dan keropos'
  },
  {
    reportCode: 'RPT-2026-0022',
    title: 'Lubang Menganga di Jalan Urip Sumoharjo',
    description: 'Lubang sedalam 15cm di tengah jalan cepat merusak ban mobil dan motor.',
    address: 'Jl. Urip Sumoharjo, Makassar',
    latitude: -5.138889,
    longitude: 119.438889,
    status: ReportStatus.IN_PROGRESS,
    priorityLevel: 2,
    categorySlug: 'jalan-rusak',
    regionKey: 'sulawesi-selatan-makassar',
    imageName: 'jalan-rusak.png',
    caption: 'Lubang jalan lebar di lajur cepat'
  },
  {
    reportCode: 'RPT-2026-0023',
    title: 'Lampu Penerangan Pantai Losari Mati',
    description: 'Lampu penerangan ikonik di Pantai Losari padam menyebabkan area gelap di malam hari.',
    address: 'Jl. Penghibur, Losari, Makassar',
    latitude: -5.144444,
    longitude: 119.408333,
    status: ReportStatus.COMPLETED,
    priorityLevel: 2,
    categorySlug: 'penerangan-jalan',
    regionKey: 'sulawesi-selatan-makassar',
    imageName: 'penerangan-jalan.png',
    caption: 'Area pelataran Losari gelap'
  },
  {
    reportCode: 'RPT-2026-0024',
    title: 'Saluran Air Perumahan Meluap ke Jalan',
    description: 'Saluran air utama di Sepinggan meluap setelah hujan lebat karena sedimen lumpur tebal.',
    address: 'Jl. Sepinggan Baru, Balikpapan Selatan, Balikpapan',
    latitude: -1.258333,
    longitude: 116.858333,
    status: ReportStatus.ASSIGNED,
    priorityLevel: 2,
    categorySlug: 'saluran-air',
    regionKey: 'kalimantan-timur-balikpapan',
    imageName: 'saluran-air.png',
    caption: 'Parit meluap membawa endapan lumpur'
  },
  {
    reportCode: 'RPT-2026-0025',
    title: 'Jembatan Kayu Lapuk di Kampung Baru',
    description: 'Jembatan penyeberangan kayu di Kampung Atas Air lapuk, beberapa bilah kayu sudah patah.',
    address: 'Kampung Baru Tengah, Balikpapan Barat, Balikpapan',
    latitude: -1.221667,
    longitude: 116.811667,
    status: ReportStatus.PENDING_VERIFICATION,
    priorityLevel: 3,
    categorySlug: 'jembatan',
    regionKey: 'kalimantan-timur-balikpapan',
    imageName: 'jembatan.png',
    caption: 'Papan titian kayu lapuk berlubang'
  },
  {
    reportCode: 'RPT-2026-0026',
    title: 'Ubin Pemandu Tunanetra Rusak di Jl. Pemuda',
    description: 'Guiding block tunanetra banyak yang lepas dan hilang di depan Balai Kota Semarang.',
    address: 'Jl. Pemuda, Sekayu, Semarang',
    latitude: -6.978333,
    longitude: 110.418333,
    status: ReportStatus.VERIFIED,
    priorityLevel: 2,
    categorySlug: 'trotoar',
    regionKey: 'jawa-tengah-semarang',
    imageName: 'trotoar.png',
    caption: 'Guiding block copot tidak lengkap'
  },
  {
    reportCode: 'RPT-2026-0027',
    title: 'Rambu Penunjuk Jalan Patah',
    description: 'Rambu penunjuk arah Kota Lama patah di pangkal tiang akibat angin kencang.',
    address: 'Jl. Letjen Suprapto, Kota Lama, Semarang',
    latitude: -6.991667,
    longitude: 110.428333,
    status: ReportStatus.PENDING_VERIFICATION,
    priorityLevel: 1,
    categorySlug: 'fasilitas-umum',
    regionKey: 'jawa-tengah-semarang',
    imageName: 'fasilitas-umum.png',
    caption: 'Rambu roboh menghalangi jalur jalan'
  },
  {
    reportCode: 'RPT-2026-0028',
    title: 'Banjir Luapan Kali Mampang',
    description: 'Saluran Kali Mampang menyempit dan penuh sampah, air meluap setinggi 30cm ke jalan raya.',
    address: 'Jl. Mampang Prapatan Raya, Jakarta Selatan',
    latitude: -6.248333,
    longitude: 106.8225,
    status: ReportStatus.IN_PROGRESS,
    priorityLevel: 3,
    categorySlug: 'saluran-air',
    regionKey: 'dki-jakarta-jakarta-selatan',
    imageName: 'saluran-air.png',
    caption: 'Banjir genangan setinggi mata kaki'
  },
  {
    reportCode: 'RPT-2026-0029',
    title: 'Jalan Berlubang Dekat Stasiun Bandung',
    description: 'Jalan Kebon Kawung depan Stasiun berlubang banyak mengganggu kelancaran lalu lintas.',
    address: 'Jl. Kebon Kawung, Pasirkaliki, Bandung',
    latitude: -6.913611,
    longitude: 107.6025,
    status: ReportStatus.COMPLETED,
    priorityLevel: 2,
    categorySlug: 'jalan-rusak',
    regionKey: 'jawa-barat-bandung',
    imageName: 'jalan-rusak.png',
    caption: 'Aspal mengelupas parah di persimpangan'
  },
  {
    reportCode: 'RPT-2026-0030',
    title: 'Lampu Taman Pintar Mati Total',
    description: 'Penerangan jalan masuk Taman Pintar padam, rawan aksi kriminalitas malam hari.',
    address: 'Jl. Panembahan Senopati, Ngupasan, Yogyakarta',
    latitude: -7.801389,
    longitude: 110.368333,
    status: ReportStatus.ASSIGNED,
    priorityLevel: 2,
    categorySlug: 'penerangan-jalan',
    regionKey: 'di-yogyakarta-yogyakarta',
    imageName: 'penerangan-jalan.png',
    caption: 'Kawasan loket masuk gelap gulita'
  },
  {
    reportCode: 'RPT-2026-0031',
    title: 'Jembatan Penyeberangan Orang (JPO) Karat',
    description: 'Tangga JPO depan Royal Plaza keropos karat parah, pegangan tangga patah.',
    address: 'Jl. Ahmad Yani, Wonokromo, Surabaya',
    latitude: -7.271389,
    longitude: 112.7425,
    status: ReportStatus.VERIFIED,
    priorityLevel: 3,
    categorySlug: 'jembatan',
    regionKey: 'jawa-timur-surabaya',
    imageName: 'jembatan.png',
    caption: 'Lantai besi JPO bolong dan karatan'
  }
]

function createPrismaClient(): PrismaClient {
  const connectionString = process.env['DATABASE_URL']
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set.')
  }
  const pool = new pg.Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

async function seedRegions(prisma: PrismaClient): Promise<Record<string, string>> {
  const regionMap: Record<string, string> = {}
  console.log('Upserting regions...')

  for (const region of regionsToSeed) {
    let existingRegion = await prisma.region.findFirst({
      where: {
        province: region.province,
        city: region.city
      }
    })

    if (!existingRegion) {
      existingRegion = await prisma.region.create({
        data: region
      })
    }

    const key = `${region.province}-${region.city}`.toLowerCase().replace(/\s+/g, '-')
    regionMap[key] = existingRegion.id
  }

  return regionMap
}

async function main() {
  const prisma = createPrismaClient()

  try {
    const regionMap = await seedRegions(prisma)

    // Load citizen profile to link as reporter
    const citizen = await prisma.userProfile.findFirst({
      where: { email: 'citizen@roostvasum.com' }
    })
    
    if (!citizen) {
      throw new Error('Citizen reporter (citizen@roostvasum.com) not found in the database. Run the main seeder first.')
    }

    // Load categories to map
    const categories = await prisma.category.findMany()
    const categoryMap: Record<string, string> = {}
    for (const cat of categories) {
      categoryMap[cat.slug] = cat.id
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://pydvhjhuhigljxecerpf.supabase.co'

    console.log(`Seeding ${reportsToSeed.length} additional reports across Indonesia...`)

    for (const report of reportsToSeed) {
      // Check if report already exists
      const existing = await prisma.report.findUnique({
        where: { reportCode: report.reportCode }
      })

      if (existing) {
        console.log(`Report ${report.reportCode} already exists, skipping.`)
        continue
      }

      const catId = categoryMap[report.categorySlug]
      const regId = regionMap[report.regionKey]

      if (!catId) {
        console.warn(`Category slug "${report.categorySlug}" not found, skipping report ${report.reportCode}.`)
        continue
      }

      const storagePath = `reports/default/${report.imageName}`
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/report-photos/${storagePath}`

      await prisma.report.create({
        data: {
          reportCode: report.reportCode,
          title: report.title,
          description: report.description,
          address: report.address,
          latitude: report.latitude,
          longitude: report.longitude,
          status: report.status,
          priorityLevel: report.priorityLevel,
          reporterId: citizen.id,
          categoryId: catId,
          regionId: regId,
          photos: {
            create: {
              url: publicUrl,
              path: storagePath,
              type: PhotoType.BEFORE,
              caption: report.caption
            }
          },
          histories: {
            create: {
              status: report.status,
              note: 'Laporan dibuat secara otomatis oleh sistem seeder.',
              changedById: citizen.id
            }
          }
        }
      })

      console.log(`Created report ${report.reportCode}: ${report.title}`)
    }

    console.log('Report seeding completed successfully.')
  } catch (error) {
    console.error('Error seeding reports:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
