import { PrismaClient } from '@prisma/client';

/**
 * Script to add slug fields to existing Department and Division records
 * 
 * This script is only needed once after adding the slug fields to the schema
 * 
 * Run with:
 * npx ts-node src/scripts/update-slugs.ts
 */

const prisma = new PrismaClient();

/**
 * Converts a string to a slug format
 * @param text The text to convert to a slug
 * @returns The slug
 */
function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-')   // Replace multiple - with single -
    .replace(/^-+/, '')       // Trim - from start of text
    .replace(/-+$/, '');      // Trim - from end of text
}

async function updateDepartmentSlugs() {
  console.log('Updating department slugs...');
  
  const departments = await prisma.department.findMany();
  
  for (const department of departments) {
    const slug = createSlug(department.department);
    await prisma.department.update({
      where: { id: department.id },
      data: { slug },
    });
    console.log(`Updated department: ${department.department} -> ${slug}`);
  }
  
  console.log('All department slugs updated successfully');
}

async function updateDivisionSlugs() {
  console.log('Updating division slugs...');
  
  const divisions = await prisma.division.findMany({
    include: { department: true },
  });
  
  for (const division of divisions) {
    const slug = createSlug(division.division);
    await prisma.division.update({
      where: { id: division.id },
      data: { slug },
    });
    console.log(`Updated division: ${division.division} -> ${slug}`);
  }
  
  console.log('All division slugs updated successfully');
}

async function main() {
  try {
    console.log('Starting slug update process...');
    
    await updateDepartmentSlugs();
    await updateDivisionSlugs();
    
    console.log('Slug update completed successfully!');
  } catch (error) {
    console.error('Error updating slugs:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 