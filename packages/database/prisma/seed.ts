import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')
  
  // Hash a default password
  const hashedPassword = await bcrypt.hash('zander2025', 10);

  // Check if tenant already exists
  let tenant = await prisma.tenant.findFirst({
    where: { companyName: 'My Cabinet Factory' }
  });

  // Create tenant if it doesn't exist
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        companyName: 'My Cabinet Factory',
        subdomain: 'mycabinet',
      }
    });
    console.log('✅ Created tenant:', tenant.companyName)
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: 'jonathan@mycabinetfactory.com' }
  });

  // Create user only if not existing
  if (!existingUser) {
    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: 'jonathan@mycabinetfactory.com',
        firstName: 'Jonathan',
        lastName: 'White',
        password: hashedPassword,
      }
    });
    console.log('✅ Created user:', user.email)
  } else {
    console.log('✅ User already exists, skipping creation')
  }

  const contact = await prisma.contact.create({
    data: {
      tenantId: tenant.id,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    }
  })

  console.log('✅ Created contact:', contact.firstName, contact.lastName)

  const deal = await prisma.deal.create({
    data: {
      tenantId: tenant.id,
      dealName: 'Kitchen Remodel Project',
      contactId: contact.id,
      dealValue: 45000,
      probability: 75,
      stage: 'PROPOSAL',
      status: 'open',
    }
  })

  console.log('✅ Created deal:', deal.dealName)
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
