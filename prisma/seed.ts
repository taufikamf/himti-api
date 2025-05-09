import { PrismaClient, Role, ForumStatus, MemberRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const PLACEHOLDER_IMAGE = 'https://placehold.co/600x400/green/white.png?text=Hello+World';

async function main() {
  console.log('Seeding database...');

  // Create a test user for authoring content
  const testUserPassword = await bcrypt.hash('password123', 10);
  const testUser = await prisma.user.upsert({
    where: { email: 'test@himti.com' },
    update: {},
    create: {
      email: 'test@himti.com',
      name: 'Test User',
      password: testUserPassword,
      role: Role.ADMIN,
      profile_picture: PLACEHOLDER_IMAGE,
    },
  });

  console.log('Created test user:', testUser.email);

  // Create test admin user
  const adminUserPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@himti.com' },
    update: {},
    create: {
      email: 'admin@himti.com',
      name: 'Admin User',
      password: adminUserPassword,
      role: Role.SUPER_ADMIN,
      profile_picture: PLACEHOLDER_IMAGE,
    },
  });

  console.log('Created admin user:', adminUser.email);

  // Create Departments
  const departments = [
    { name: 'PSDM' },
    { name: 'Kemahasiswaan' },
    { name: 'Eksternal' },
    { name: 'Internal' },
  ];

  const departmentMap = {};

  // First, find existing departments to avoid duplicate entries
  const existingDepartments = await prisma.department.findMany();
  const existingDepartmentMap = {};
  
  existingDepartments.forEach(dept => {
    existingDepartmentMap[dept.department] = dept.id;
  });

  for (const departmentData of departments) {
    let departmentId;
    
    // Check if department already exists
    if (existingDepartmentMap[departmentData.name]) {
      departmentId = existingDepartmentMap[departmentData.name];
      console.log('Department exists:', departmentData.name);
    } else {
      // Create new department
      const newDepartment = await prisma.department.create({
        data: {
          department: departmentData.name,
        },
      });
      departmentId = newDepartment.id;
      console.log('Created department:', newDepartment.department);
    }
    
    departmentMap[departmentData.name] = departmentId;
  }

  // Create Divisions
  const divisions = [
    // PSDM Divisions
    { name: 'Akademik', department: 'PSDM' },
    { name: 'Seni dan Olahraga', department: 'PSDM' },
    { name: 'Keprofesian', department: 'PSDM' },
    
    // Kemahasiswaan Divisions
    { name: 'Penelitian dan Pengembangan', department: 'Kemahasiswaan' },
    { name: 'Kaderisasi dan Advokasi', department: 'Kemahasiswaan' },
    
    // Eksternal Divisions
    { name: 'Media Kreatif', department: 'Eksternal' },
    { name: 'Hubungan Antar Lembaga', department: 'Eksternal' },
    { name: 'Sosial Masyarakat', department: 'Eksternal' },
    
    // Internal Divisions
    { name: 'Sinergi Organisasi', department: 'Internal' },
    { name: 'Kewirausahaan', department: 'Internal' },
  ];

  // Find existing divisions to avoid duplicate entries
  const existingDivisions = await prisma.division.findMany({
    include: { department: true }
  });
  
  const existingDivisionMap = {};
  existingDivisions.forEach(div => {
    if (div.department) {
      const key = `${div.division}-${div.department.department}`;
      existingDivisionMap[key] = div.id;
    }
  });

  for (const divisionData of divisions) {
    const departmentId = departmentMap[divisionData.department];
    const divisionKey = `${divisionData.name}-${divisionData.department}`;
    
    if (!departmentId) {
      console.log(`Department ${divisionData.department} not found, skipping division ${divisionData.name}`);
      continue;
    }
    
    // Check if division already exists
    if (existingDivisionMap[divisionKey]) {
      console.log('Division exists:', divisionData.name, 'in department:', divisionData.department);
      continue;
    }
    
    // Create new division
    const newDivision = await prisma.division.create({
      data: {
        division: divisionData.name,
        department_id: departmentId,
      },
    });
    console.log('Created division:', newDivision.division, 'in department:', divisionData.department);
  }

  // Create Forums
  const forums = [
    {
      title: 'Introduction to Web Development',
      thumbnail: PLACEHOLDER_IMAGE,
      content: 'Web development is the work involved in developing a website for the Internet or an intranet. Web development can range from developing a simple single static page of plain text to complex web applications, electronic businesses, and social network services.',
      status: ForumStatus.PUBLISHED,
    },
    {
      title: 'The Power of Machine Learning',
      thumbnail: PLACEHOLDER_IMAGE,
      content: 'Machine learning is a method of data analysis that automates analytical model building. It is a branch of artificial intelligence based on the idea that systems can learn from data, identify patterns and make decisions with minimal human intervention.',
      status: ForumStatus.PUBLISHED,
    },
    {
      title: 'Cybersecurity Best Practices',
      thumbnail: PLACEHOLDER_IMAGE,
      content: 'Cybersecurity is the practice of protecting systems, networks, and programs from digital attacks. These cyberattacks are usually aimed at accessing, changing, or destroying sensitive information; extorting money from users; or interrupting normal business processes.',
      status: ForumStatus.PUBLISHED,
    },
    {
      title: 'Mobile App Development Trends',
      thumbnail: PLACEHOLDER_IMAGE,
      content: 'Mobile application development is the process of creating software applications that run on a mobile device, and a typical mobile application utilizes a network connection to work with remote computing resources.',
      status: ForumStatus.PUBLISHED,
    },
    {
      title: 'Cloud Computing Fundamentals',
      thumbnail: PLACEHOLDER_IMAGE,
      content: 'Cloud computing is the on-demand availability of computer system resources, especially data storage and computing power, without direct active management by the user. The term is generally used to describe data centers available to many users over the Internet.',
      status: ForumStatus.PUBLISHED,
    },
  ];

  for (const forum of forums) {
    const createdForum = await prisma.forum.create({
      data: {
        title: forum.title,
        thumbnail: forum.thumbnail,
        content: forum.content,
        status: forum.status,
        author_id: testUser.id,
      },
    });
    console.log('Created forum:', createdForum.title);
  }

  // Create Articles
  const articles = [
    {
      title: 'How to Build a RESTful API with Node.js',
      thumbnail: PLACEHOLDER_IMAGE,
      content: 'This article guides you through building a RESTful API using Node.js and Express. We cover route creation, middleware usage, and database integration to help you build robust and scalable APIs.',
      author: 'John Doe',
    },
    {
      title: 'Understanding React Hooks',
      thumbnail: PLACEHOLDER_IMAGE,
      content: 'React Hooks let you use state and other React features without writing a class. This article explains the most common hooks like useState, useEffect, and useContext with practical examples.',
      author: 'Jane Smith',
    },
    {
      title: 'Introduction to Docker Containers',
      thumbnail: PLACEHOLDER_IMAGE,
      content: 'Docker containers are lightweight, standalone, and executable packages that include everything needed to run an application. Learn how to build, deploy, and manage containers in this comprehensive guide.',
      author: 'Mike Johnson',
    },
    {
      title: 'Database Design Principles',
      thumbnail: PLACEHOLDER_IMAGE,
      content: 'Proper database design is crucial for application performance and maintainability. This article covers normalization, indexing strategies, and relationship modeling for relational databases.',
      author: 'Sarah Williams',
    },
    {
      title: 'Getting Started with TypeScript',
      thumbnail: PLACEHOLDER_IMAGE,
      content: 'TypeScript adds static types to JavaScript, helping you catch errors early and build more robust applications. This beginner-friendly guide will help you set up TypeScript and understand its core concepts.',
      author: 'David Brown',
    },
  ];

  for (const article of articles) {
    const createdArticle = await prisma.article.create({
      data: {
        title: article.title,
        thumbnail: article.thumbnail,
        content: article.content,
        author: article.author,
        author_id: adminUser.id,
      },
    });
    console.log('Created article:', createdArticle.title);
  }

  // Create an Event for Galleries
  const event = await prisma.event.create({
    data: {
      name: 'HIMTI Annual Tech Conference 2023',
    },
  });

  console.log('Created event:', event.name);

  // Create Galleries
  const galleries = [
    {
      photo_url: PLACEHOLDER_IMAGE,
    },
    {
      photo_url: PLACEHOLDER_IMAGE,
    },
    {
      photo_url: PLACEHOLDER_IMAGE,
    },
    {
      photo_url: PLACEHOLDER_IMAGE,
    },
    {
      photo_url: PLACEHOLDER_IMAGE,
    },
  ];

  for (const gallery of galleries) {
    const createdGallery = await prisma.gallery.create({
      data: {
        photo_url: gallery.photo_url,
        event_id: event.id,
      },
    });
    console.log('Created gallery item:', createdGallery.photo_url);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 