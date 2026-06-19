import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

import { PrismaClient } from '../generated/prisma/client'

interface CategorySeed {
  name: string
  slug: string
  description: string
  icon: string
}

interface AgencySeed {
  name: string
  slug: string
  description: string
  phoneNumber: string | null
}

interface RegionSeed {
  province: string
  city: string
  district: string | null
  village: string | null
}

const categories: CategorySeed[] = [
  {
    name: 'Jalan Rusak',
    slug: 'jalan-rusak',
    description: 'Kerusakan jalan seperti berlubang, retak, atau permukaan tidak rata.',
    icon: 'road'
  },
  {
    name: 'Penerangan Jalan',
    slug: 'penerangan-jalan',
    description: 'Masalah lampu jalan, tiang penerangan, atau area jalan yang gelap.',
    icon: 'lamp'
  },
  {
    name: 'Saluran Air',
    slug: 'saluran-air',
    description: 'Masalah drainase, selokan tersumbat, atau saluran air rusak.',
    icon: 'waves'
  },
  {
    name: 'Jembatan',
    slug: 'jembatan',
    description: 'Kerusakan jembatan, pagar pengaman, atau struktur penyeberangan.',
    icon: 'bridge'
  },
  {
    name: 'Trotoar',
    slug: 'trotoar',
    description: 'Kerusakan trotoar, jalur pejalan kaki, atau aksesibilitas pedestrian.',
    icon: 'footprints'
  },
  {
    name: 'Fasilitas Umum',
    slug: 'fasilitas-umum',
    description: 'Kerusakan fasilitas publik seperti taman, halte, rambu, atau fasilitas kota.',
    icon: 'landmark'
  }
]

const agencies: AgencySeed[] = [
  {
    name: 'Dinas Pekerjaan Umum',
    slug: 'dinas-pekerjaan-umum',
    description: 'Unit pemerintah yang menangani pekerjaan umum dan infrastruktur dasar.',
    phoneNumber: null
  },
  {
    name: 'Dinas Perhubungan',
    slug: 'dinas-perhubungan',
    description: 'Unit pemerintah yang menangani transportasi, lalu lintas, dan keselamatan jalan.',
    phoneNumber: null
  },
  {
    name: 'Dinas Lingkungan',
    slug: 'dinas-lingkungan',
    description: 'Unit pemerintah yang menangani kebersihan, lingkungan, dan ruang publik.',
    phoneNumber: null
  }
]

const regions: RegionSeed[] = [
  {
    province: 'DKI Jakarta',
    city: 'Jakarta Pusat',
    district: null,
    village: null
  },
  {
    province: 'Jawa Barat',
    city: 'Bandung',
    district: null,
    village: null
  },
  {
    province: 'DI Yogyakarta',
    city: 'Yogyakarta',
    district: null,
    village: null
  }
]

function createPrismaClient(): PrismaClient {
  const connectionString = process.env['DATABASE_URL']

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set.')
  }

  const adapter = new PrismaPg(connectionString)

  return new PrismaClient({ adapter })
}

function assertSafeSeedEnvironment(): void {
  const nodeEnvironment = process.env['NODE_ENV']
  const vercelEnvironment = process.env['VERCEL_ENV']
  const explicitProductionSeedApproval = process.env['ALLOW_PRODUCTION_SEED'] === 'true'

  if ((nodeEnvironment === 'production' || vercelEnvironment === 'production') && !explicitProductionSeedApproval) {
    throw new Error('Refusing to run seed in production without ALLOW_PRODUCTION_SEED=true.')
  }
}

async function seedCategories(prisma: PrismaClient): Promise<void> {
  for (const category of categories) {
    await prisma.category.upsert({
      where: {
        slug: category.slug
      },
      update: {
        name: category.name,
        description: category.description,
        icon: category.icon,
        isActive: true
      },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        icon: category.icon,
        isActive: true
      }
    })
  }
}

async function seedAgencies(prisma: PrismaClient): Promise<void> {
  for (const agency of agencies) {
    await prisma.agency.upsert({
      where: {
        slug: agency.slug
      },
      update: {
        name: agency.name,
        description: agency.description,
        phoneNumber: agency.phoneNumber,
        isActive: true
      },
      create: {
        name: agency.name,
        slug: agency.slug,
        description: agency.description,
        phoneNumber: agency.phoneNumber,
        isActive: true
      }
    })
  }
}

async function seedRegions(prisma: PrismaClient): Promise<void> {
  for (const region of regions) {
    const existingRegion = await prisma.region.findFirst({
      where: {
        province: region.province,
        city: region.city,
        district: region.district,
        village: region.village
      }
    })

    if (existingRegion) {
      continue
    }

    await prisma.region.create({
      data: region
    })
  }
}

async function main(): Promise<void> {
  assertSafeSeedEnvironment()

  const prisma = createPrismaClient()

  try {
    await seedCategories(prisma)
    await seedAgencies(prisma)
    await seedRegions(prisma)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown seed error'

  console.error(message)
  process.exit(1)
})
