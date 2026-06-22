import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'
import pg from 'pg'
import { NotificationType, PhotoType, ReportStatus, UserRole } from '../generated/prisma/enums'

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
    phoneNumber: '021-1234567'
  },
  {
    name: 'Dinas Perhubungan',
    slug: 'dinas-perhubungan',
    description: 'Unit pemerintah yang menangani transportasi, lalu lintas, dan keselamatan jalan.',
    phoneNumber: '021-7654321'
  },
  {
    name: 'Dinas Lingkungan Hidup',
    slug: 'dinas-lingkungan-hidup',
    description: 'Unit pemerintah yang menangani kebersihan, lingkungan, dan ruang publik.',
    phoneNumber: '021-1112223'
  }
]

const regions: RegionSeed[] = [
  {
    province: 'DKI Jakarta',
    city: 'Jakarta Pusat',
    district: 'Gambir',
    village: 'Petojo Selatan'
  },
  {
    province: 'Jawa Barat',
    city: 'Bandung',
    district: 'Coblong',
    village: 'Dago'
  },
  {
    province: 'DI Yogyakarta',
    city: 'Yogyakarta',
    district: 'Gedongtengen',
    village: 'Sosromenduran'
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

function assertSafeSeedEnvironment(): void {
  const nodeEnvironment = process.env['NODE_ENV']
  const vercelEnvironment = process.env['VERCEL_ENV']
  const explicitProductionSeedApproval = process.env['ALLOW_PRODUCTION_SEED'] === 'true'

  if ((nodeEnvironment === 'production' || vercelEnvironment === 'production') && !explicitProductionSeedApproval) {
    throw new Error('Refusing to run seed in production without ALLOW_PRODUCTION_SEED=true.')
  }
}

async function seedCategories(prisma: PrismaClient): Promise<Record<string, string>> {
  const categoryMap: Record<string, string> = {}
  for (const category of categories) {
    const record = await prisma.category.upsert({
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
    categoryMap[category.slug] = record.id
  }
  return categoryMap
}

async function seedAgencies(prisma: PrismaClient): Promise<Record<string, string>> {
  const agencyMap: Record<string, string> = {}
  for (const agency of agencies) {
    const record = await prisma.agency.upsert({
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
    agencyMap[agency.slug] = record.id
  }
  return agencyMap
}

async function seedRegions(prisma: PrismaClient): Promise<Record<string, string>> {
  const regionMap: Record<string, string> = {}
  for (const region of regions) {
    let existingRegion = await prisma.region.findFirst({
      where: {
        province: region.province,
        city: region.city,
        district: region.district,
        village: region.village
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

async function seedUserProfiles(prisma: PrismaClient, agencyMap: Record<string, string>): Promise<Record<string, string>> {
  const userMap: Record<string, string> = {}

  const usersToSeed = [
    {
      email: 'superadmin@roostvasum.com',
      fullName: 'Roostvasum Superadmin',
      role: UserRole.SUPERADMIN,
      supabaseUserId: 'a8b27f1c-7f55-4cde-8033-77443831b81a',
      phoneNumber: '081234567890',
      isActive: true,
      agencySlug: null
    },
    {
      email: 'admin@roostvasum.com',
      fullName: 'Roostvasum Admin DPU',
      role: UserRole.ADMIN,
      supabaseUserId: 'b25c382f-8a02-4d2c-901d-5573752e5052',
      phoneNumber: '081234567891',
      isActive: true,
      agencySlug: 'dinas-pekerjaan-umum'
    },
    {
      email: 'officer@roostvasum.com',
      fullName: 'Roostvasum Officer DPU',
      role: UserRole.OFFICER,
      supabaseUserId: 'c4a1612e-1b84-482a-a53d-24950e181467',
      phoneNumber: '081234567892',
      isActive: true,
      agencySlug: 'dinas-pekerjaan-umum'
    },
    {
      email: 'citizen@roostvasum.com',
      fullName: 'Roostvasum Citizen',
      role: UserRole.USER,
      supabaseUserId: 'd6b17a3a-9e5c-4d32-be43-850d75a898b9',
      phoneNumber: '081234567893',
      isActive: true,
      agencySlug: null
    }
  ]

  for (const user of usersToSeed) {
    const agencyId = user.agencySlug ? agencyMap[user.agencySlug] : null

    const record = await prisma.userProfile.upsert({
      where: {
        supabaseUserId: user.supabaseUserId
      },
      update: {
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        phoneNumber: user.phoneNumber,
        isActive: user.isActive,
        agencyId
      },
      create: {
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        supabaseUserId: user.supabaseUserId,
        phoneNumber: user.phoneNumber,
        isActive: user.isActive,
        agencyId
      }
    })

    userMap[user.email] = record.id
  }

  return userMap
}

async function seedReports(
  prisma: PrismaClient,
  categoryMap: Record<string, string>,
  regionMap: Record<string, string>,
  userMap: Record<string, string>
): Promise<void> {
  const reporterId = userMap['citizen@roostvasum.com']!
  const superadminId = userMap['superadmin@roostvasum.com']!
  const adminId = userMap['admin@roostvasum.com']!
  const officerId = userMap['officer@roostvasum.com']!

  // --- REPORT 1: PENDING VERIFICATION ---
  const report1Code = 'RPT-2026-0001'
  const report1Exist = await prisma.report.findUnique({ where: { reportCode: report1Code } })
  if (!report1Exist) {
    const report1 = await prisma.report.create({
      data: {
        reportCode: report1Code,
        title: 'Lubang Jalan Besar di Harmoni',
        description: 'Terdapat lubang jalan yang cukup besar dan dalam di dekat halte Harmoni. Sangat berbahaya bagi pengendara motor.',
        address: 'Jl. Gajah Mada No.3, Harmoni, Jakarta Pusat',
        latitude: -6.167389,
        longitude: 106.819778,
        status: ReportStatus.PENDING_VERIFICATION,
        priorityLevel: 1,
        reporterId,
        categoryId: categoryMap['jalan-rusak']!,
        regionId: regionMap['dki-jakarta-jakarta-pusat']!,
        photos: {
          create: {
            url: 'https://pydvhjhuhigljxecerpf.supabase.co/storage/v1/object/public/report-photos/default/jalan-rusak-before.jpg',
            path: 'reports/default/jalan-rusak-before.jpg',
            type: PhotoType.BEFORE,
            caption: 'Kerusakan jalan berlubang'
          }
        },
        histories: {
          create: {
            status: ReportStatus.PENDING_VERIFICATION,
            note: 'Laporan pertama kali dibuat oleh warga.',
            changedById: reporterId
          }
        },
        notifications: {
          create: {
            userId: reporterId,
            type: NotificationType.REPORT_CREATED,
            title: 'Laporan Berhasil Dibuat',
            message: `Laporan Anda dengan kode ${report1Code} telah diterima dan sedang menunggu verifikasi.`
          }
        }
      }
    })

    await prisma.auditLog.create({
      data: {
        actorId: reporterId,
        action: 'REPORT_CREATED',
        entityType: 'Report',
        entityId: report1.id,
        metadata: { reportCode: report1Code }
      }
    })
  }

  // --- REPORT 2: IN_PROGRESS ---
  const report2Code = 'RPT-2026-0002'
  const report2Exist = await prisma.report.findUnique({ where: { reportCode: report2Code } })
  if (!report2Exist) {
    const report2 = await prisma.report.create({
      data: {
        reportCode: report2Code,
        title: 'Lampu Penerangan Jalan Mati di Dago',
        description: 'Lampu jalan di sepanjang Jl. Ir. H. Juanda dekat taman Dago mati total selama 3 hari terakhir.',
        address: 'Jl. Ir. H. Juanda, Dago, Bandung',
        latitude: -6.887556,
        longitude: 107.616222,
        status: ReportStatus.IN_PROGRESS,
        priorityLevel: 2,
        reporterId,
        categoryId: categoryMap['penerangan-jalan']!,
        regionId: regionMap['jawa-barat-bandung']!,
        photos: {
          create: [
            {
              url: 'https://pydvhjhuhigljxecerpf.supabase.co/storage/v1/object/public/report-photos/default/lampu-mati-before.jpg',
              path: 'reports/default/lampu-mati-before.jpg',
              type: PhotoType.BEFORE,
              caption: 'Kondisi gelap gulita malam hari'
            }
          ]
        },
        histories: {
          createMany: {
            data: [
              {
                status: ReportStatus.PENDING_VERIFICATION,
                note: 'Laporan dibuat oleh warga.',
                changedById: reporterId,
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
              },
              {
                status: ReportStatus.VERIFIED,
                note: 'Laporan tervalidasi oleh Admin.',
                changedById: adminId,
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
              },
              {
                status: ReportStatus.ASSIGNED,
                note: 'Tugas diberikan kepada petugas dinas lapangan.',
                changedById: adminId,
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
              },
              {
                status: ReportStatus.IN_PROGRESS,
                note: 'Petugas mulai melakukan investigasi lapangan.',
                changedById: officerId,
                createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
              }
            ]
          }
        },
        assignments: {
          create: {
            officerId,
            assignedById: adminId,
            note: 'Harap periksa kelistrikan tiang nomor 12 s/d 15 di kawasan Dago.',
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            isActive: true,
            fieldUpdates: {
              create: {
                note: 'Pengecekan kabel dan penggantian bohlam LED 40W sedang dilakukan.',
                progress: 40,
                photoUrl: 'https://pydvhjhuhigljxecerpf.supabase.co/storage/v1/object/public/field-update-photos/default/lampu-perbaikan.jpg',
                photoPath: 'field-updates/default/lampu-perbaikan.jpg'
              }
            }
          }
        }
      }
    })

    // Write audit logs
    await prisma.auditLog.createMany({
      data: [
        {
          actorId: reporterId,
          action: 'REPORT_CREATED',
          entityType: 'Report',
          entityId: report2.id,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        {
          actorId: adminId,
          action: 'REPORT_VERIFIED',
          entityType: 'Report',
          entityId: report2.id,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          actorId: adminId,
          action: 'REPORT_ASSIGNED',
          entityType: 'Report',
          entityId: report2.id,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        {
          actorId: officerId,
          action: 'FIELD_UPDATE_CREATED',
          entityType: 'Assignment',
          entityId: report2.id, // linked loosely for demo
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
        }
      ]
    })
  }

  // --- REPORT 3: COMPLETED ---
  const report3Code = 'RPT-2026-0003'
  const report3Exist = await prisma.report.findUnique({ where: { reportCode: report3Code } })
  if (!report3Exist) {
    const report3 = await prisma.report.create({
      data: {
        reportCode: report3Code,
        title: 'Selokan Tersumbat Sampah Plastik di Malioboro',
        description: 'Saluran air tersumbat botol dan sampah plastik sehingga meluap membanjiri area trotoar pejalan kaki.',
        address: 'Jl. Malioboro, Yogyakarta',
        latitude: -7.792611,
        longitude: 110.365833,
        status: ReportStatus.COMPLETED,
        priorityLevel: 3,
        reporterId,
        categoryId: categoryMap['saluran-air']!,
        regionId: regionMap['di-yogyakarta-yogyakarta']!,
        photos: {
          create: [
            {
              url: 'https://pydvhjhuhigljxecerpf.supabase.co/storage/v1/object/public/report-photos/default/selokan-before.jpg',
              path: 'reports/default/selokan-before.jpg',
              type: PhotoType.BEFORE,
              caption: 'Saluran air mampet tergenang air keruh'
            },
            {
              url: 'https://pydvhjhuhigljxecerpf.supabase.co/storage/v1/object/public/report-photos/default/selokan-after.jpg',
              path: 'reports/default/selokan-after.jpg',
              type: PhotoType.AFTER,
              caption: 'Saluran air bersih kembali setelah dikuras'
            }
          ]
        },
        histories: {
          createMany: {
            data: [
              {
                status: ReportStatus.PENDING_VERIFICATION,
                note: 'Laporan dilaporkan oleh warga.',
                changedById: reporterId,
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
              },
              {
                status: ReportStatus.VERIFIED,
                note: 'Verifikasi disetujui.',
                changedById: superadminId,
                createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
              },
              {
                status: ReportStatus.ASSIGNED,
                note: 'Petugas lapangan ditugaskan.',
                changedById: superadminId,
                createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
              },
              {
                status: ReportStatus.IN_PROGRESS,
                note: 'Perbaikan dimulai.',
                changedById: officerId,
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
              },
              {
                status: ReportStatus.NEED_REVIEW,
                note: 'Petugas mengajukan verifikasi penyelesaian pekerjaan.',
                changedById: officerId,
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
              },
              {
                status: ReportStatus.COMPLETED,
                note: 'Admin menyetujui penyelesaian laporan. Masalah teratasi.',
                changedById: superadminId,
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
              }
            ]
          }
        },
        assignments: {
          create: {
            officerId,
            assignedById: superadminId,
            note: 'Kuras sampah selokan pedestrian.',
            dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            isActive: false,
            fieldUpdates: {
              createMany: {
                data: [
                  {
                    note: 'Mulai pengerukan sampah plastik.',
                    progress: 50,
                    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
                  },
                  {
                    note: 'Pembersihan tuntas. Aliran air kembali lancar.',
                    progress: 100,
                    photoUrl: 'https://pydvhjhuhigljxecerpf.supabase.co/storage/v1/object/public/field-update-photos/default/selokan-clean.jpg',
                    photoPath: 'field-updates/default/selokan-clean.jpg',
                    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
                  }
                ]
              }
            }
          }
        }
      }
    })

    // Write audit logs
    await prisma.auditLog.createMany({
      data: [
        {
          actorId: reporterId,
          action: 'REPORT_CREATED',
          entityType: 'Report',
          entityId: report3.id,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        {
          actorId: superadminId,
          action: 'REPORT_VERIFIED',
          entityType: 'Report',
          entityId: report3.id,
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
        },
        {
          actorId: superadminId,
          action: 'REPORT_ASSIGNED',
          entityType: 'Report',
          entityId: report3.id,
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
        },
        {
          actorId: officerId,
          action: 'REPORT_SUBMITTED_FOR_REVIEW',
          entityType: 'Assignment',
          entityId: report3.id,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          actorId: superadminId,
          action: 'REPORT_COMPLETED',
          entityType: 'Report',
          entityId: report3.id,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
      ]
    })
  }
}

async function main(): Promise<void> {
  assertSafeSeedEnvironment()

  const prisma = createPrismaClient()

  try {
    console.log('Seeding categories...')
    const categoryMap = await seedCategories(prisma)

    console.log('Seeding agencies...')
    const agencyMap = await seedAgencies(prisma)

    console.log('Seeding regions...')
    const regionMap = await seedRegions(prisma)

    console.log('Seeding user profiles...')
    const userMap = await seedUserProfiles(prisma, agencyMap)

    console.log('Seeding reports and related entities...')
    await seedReports(prisma, categoryMap, regionMap, userMap)

    console.log('Seeding completed successfully.')
  } catch (error) {
    console.error('Error during seeding:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown seed error'

  console.error(message)
  process.exit(1)
})
