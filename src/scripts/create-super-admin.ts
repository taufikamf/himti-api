import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function createSuperAdmin() {
  const prisma = new PrismaClient();
  
  try {
    const [email, password, name] = process.argv.slice(2);
    
    if (!email || !password || !name) {
      console.error('Usage: npx ts-node create-super-admin.ts <email> <password> <name>');
      process.exit(1);
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      console.log(`User with email ${email} already exists.`);
      process.exit(0);
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create super admin
    const superAdmin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: Role.SUPER_ADMIN,
      },
    });
    
    console.log(`Super admin created successfully:`);
    console.log({
      id: superAdmin.id,
      email: superAdmin.email,
      name: superAdmin.name,
      role: superAdmin.role
    });
    
  } catch (error) {
    console.error('Error creating super admin:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin(); 