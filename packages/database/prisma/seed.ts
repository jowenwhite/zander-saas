import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  const tenant = await prisma.tenant.create({
    data: {
      companyName: 'My Cabinet Factory',
      subdomain: 'mycabinet',
    }
  })

  console.log('✅ Created tenant:', tenant.companyName)

  const user = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'jonathan@mycabinetfactory.com',
      firstName: 'Jonathan',
      lastName: 'White',
    }
  })

  console.log('✅ Created user:', user.email)

  const contact = await prisma.contact.create({
    data: {
      tenantId: tenant.id,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    }
  })

  console.log('✅ Created contact:', contact.firstName, contact.lastName)
  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
