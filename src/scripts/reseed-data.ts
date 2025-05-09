import { PrismaClient, Role, ForumStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const NEW_IMAGE_URL = 'https://placehold.co/600x400/green/white?text=Hello+World';

async function reseedData() {
  console.log('Starting data reseeding process...');

  try {
    // Delete existing data
    console.log('Deleting existing data...');
    await prisma.forumLike.deleteMany({});
    await prisma.forumComment.deleteMany({});
    await prisma.forum.deleteMany({});
    await prisma.articleLike.deleteMany({});
    await prisma.article.deleteMany({});
    await prisma.gallery.deleteMany({});
    await prisma.event.deleteMany({});
    console.log('Existing data deleted successfully.');

    // Find or create users for seeding
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@himti.com' },
    });

    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@himti.com' },
    });

    let testUserId = testUser?.id;
    let adminUserId = adminUser?.id;

    // If users don't exist, create them
    if (!testUser) {
      const testUserPassword = await bcrypt.hash('password123', 10);
      const newTestUser = await prisma.user.create({
        data: {
          email: 'test@himti.com',
          name: 'Test User',
          password: testUserPassword,
          role: Role.ADMIN,
          profile_picture: NEW_IMAGE_URL,
        },
      });
      testUserId = newTestUser.id;
      console.log('Created test user:', newTestUser.email);
    }

    if (!adminUser) {
      const adminUserPassword = await bcrypt.hash('admin123', 10);
      const newAdminUser = await prisma.user.create({
        data: {
          email: 'admin@himti.com',
          name: 'Admin User',
          password: adminUserPassword,
          role: Role.SUPER_ADMIN,
          profile_picture: NEW_IMAGE_URL,
        },
      });
      adminUserId = newAdminUser.id;
      console.log('Created admin user:', newAdminUser.email);
    }

    // Create Forums
    console.log('Creating new forums...');
    const forums = [
      {
        title: 'Introduction to Web Development',
        thumbnail: NEW_IMAGE_URL,
        content: 'Web development is the work involved in developing a website for the Internet or an intranet. Web development can range from developing a simple single static page of plain text to complex web applications, electronic businesses, and social network services.',
        status: ForumStatus.PUBLISHED,
      },
      {
        title: 'The Power of Machine Learning',
        thumbnail: NEW_IMAGE_URL,
        content: 'Machine learning is a method of data analysis that automates analytical model building. It is a branch of artificial intelligence based on the idea that systems can learn from data, identify patterns and make decisions with minimal human intervention.',
        status: ForumStatus.PUBLISHED,
      },
      {
        title: 'Cybersecurity Best Practices',
        thumbnail: NEW_IMAGE_URL,
        content: 'Cybersecurity is the practice of protecting systems, networks, and programs from digital attacks. These cyberattacks are usually aimed at accessing, changing, or destroying sensitive information; extorting money from users; or interrupting normal business processes.',
        status: ForumStatus.PUBLISHED,
      },
      {
        title: 'Mobile App Development Trends',
        thumbnail: NEW_IMAGE_URL,
        content: 'Mobile application development is the process of creating software applications that run on a mobile device, and a typical mobile application utilizes a network connection to work with remote computing resources.',
        status: ForumStatus.PUBLISHED,
      },
      {
        title: 'Cloud Computing Fundamentals',
        thumbnail: NEW_IMAGE_URL,
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
          author_id: testUserId,
        },
      });
      console.log('Created forum:', createdForum.title);
    }

    // Create Articles
    console.log('Creating new articles...');
    const articles = [
      {
        title: 'How to Build a RESTful API with Node.js',
        thumbnail: NEW_IMAGE_URL,
        content: 'This article guides you through building a RESTful API using Node.js and Express. We cover route creation, middleware usage, and database integration to help you build robust and scalable APIs.',
        author: 'John Doe',
      },
      {
        title: 'Understanding React Hooks',
        thumbnail: NEW_IMAGE_URL,
        content: 'React Hooks let you use state and other React features without writing a class. This article explains the most common hooks like useState, useEffect, and useContext with practical examples.',
        author: 'Jane Smith',
      },
      {
        title: 'Introduction to Docker Containers',
        thumbnail: NEW_IMAGE_URL,
        content: 'Docker containers are lightweight, standalone, and executable packages that include everything needed to run an application. Learn how to build, deploy, and manage containers in this comprehensive guide.',
        author: 'Mike Johnson',
      },
      {
        title: 'Database Design Principles',
        thumbnail: NEW_IMAGE_URL,
        content: 'Proper database design is crucial for application performance and maintainability. This article covers normalization, indexing strategies, and relationship modeling for relational databases.',
        author: 'Sarah Williams',
      },
      {
        title: 'Getting Started with TypeScript',
        thumbnail: NEW_IMAGE_URL,
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
          author_id: adminUserId,
        },
      });
      console.log('Created article:', createdArticle.title);
    }

    // Create an Event for Galleries
    console.log('Creating new event and galleries...');
    const event = await prisma.event.create({
      data: {
        name: 'HIMTI Annual Tech Conference 2023',
      },
    });

    console.log('Created event:', event.name);

    // Create Galleries
    const galleries = [
      {
        photo_url: NEW_IMAGE_URL,
      },
      {
        photo_url: NEW_IMAGE_URL,
      },
      {
        photo_url: NEW_IMAGE_URL,
      },
      {
        photo_url: NEW_IMAGE_URL,
      },
      {
        photo_url: NEW_IMAGE_URL,
      },
    ];

    for (const gallery of galleries) {
      const createdGallery = await prisma.gallery.create({
        data: {
          photo_url: gallery.photo_url,
          event_id: event.id,
        },
      });
      console.log('Created gallery item with new image URL');
    }

    console.log('Data reseeding completed successfully!');
  } catch (error) {
    console.error('Error during reseeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

reseedData(); 