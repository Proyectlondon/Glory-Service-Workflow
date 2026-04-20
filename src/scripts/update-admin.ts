import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const result = await prisma.user.update({
    where: { email: 'admin@glory.com' },
    data: { email: 'admin' },
  })
  console.log('Admin user updated:', result)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
