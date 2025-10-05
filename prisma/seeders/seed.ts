import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Roles
  const rolesData = [
    { name: 'admin', displayName: 'Admin', description: 'Full system access and administration' },
    { name: 'master_practitioner', displayName: 'Master Practitioner', description: 'Advanced practitioner with content creation capabilities' },
    { name: 'practitioner', displayName: 'Practitioner', description: 'Standard practitioner role with basic access' },
  ];

  const roles = [];
  for (const r of rolesData) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: {
        name: r.name,
        displayName: r.displayName,
        description: r.description,
      },
    });
    roles.push(role);
  }

  // Comprehensive permissions for all roles
  const permissionsData = [
    // Admin permissions
    { name: 'manage_users', displayName: 'Manage Users', resource: 'user', action: 'manage' },
    { name: 'manage_payments', displayName: 'Manage Payments', resource: 'payment', action: 'manage' },
    { name: 'view_payment_reports', displayName: 'View Payment Reports', resource: 'payment', action: 'view_reports' },
    { name: 'generate_payment_reports', displayName: 'Generate Payment Reports', resource: 'payment', action: 'generate_reports' },
    { name: 'manage_contact_inquiries', displayName: 'Manage Contact Inquiries', resource: 'contact', action: 'manage' },
    { name: 'manage_site_settings', displayName: 'Manage Site Settings', resource: 'settings', action: 'manage' },
    { name: 'manage_roles_permissions', displayName: 'Manage Roles & Permissions', resource: 'role', action: 'manage' },
    { name: 'manage_modules', displayName: 'Manage Modules', resource: 'module', action: 'manage' },
    { name: 'view_site_analytics', displayName: 'View Site Analytics', resource: 'analytics', action: 'view' },
    { name: 'generate_custom_reports', displayName: 'Generate Custom Reports', resource: 'report', action: 'generate' },
    { name: 'manage_system_backups', displayName: 'Manage System Backups', resource: 'system', action: 'backup' },

    // Master Practitioner permissions
    { name: 'create_module_content', displayName: 'Create Module Content', resource: 'module_content', action: 'create' },
    { name: 'edit_module_content', displayName: 'Edit Module Content', resource: 'module_content', action: 'edit' },
    { name: 'create_exams', displayName: 'Create Exams', resource: 'exam', action: 'create' },
    { name: 'manage_exams', displayName: 'Manage Exams', resource: 'exam', action: 'manage' },
    { name: 'manage_own_profile', displayName: 'Manage Own Profile', resource: 'profile', action: 'manage_own' },
    { name: 'view_module_analytics', displayName: 'View Module Analytics', resource: 'module', action: 'view_analytics' },
    { name: 'moderate_content_feedback', displayName: 'Moderate Content Feedback', resource: 'feedback', action: 'moderate' },

    // Practitioner (Student) permissions
    { name: 'view_modules', displayName: 'View Modules', resource: 'module', action: 'view' },
    { name: 'enroll_modules', displayName: 'Enroll in Modules', resource: 'module', action: 'enroll' },
    { name: 'access_paid_content', displayName: 'Access Paid Content', resource: 'module_content', action: 'access_paid' },
    { name: 'view_payment_reports', displayName: 'View Payment Reports', resource: 'payment', action: 'view_own' },
    { name: 'view_certificates', displayName: 'View Certificates', resource: 'certificate', action: 'view' },
    { name: 'download_certificates', displayName: 'Download Certificates', resource: 'certificate', action: 'download' },
    { name: 'track_certificate_progress', displayName: 'Track Certificate Progress', resource: 'certificate', action: 'track_progress' },
    { name: 'manage_own_account', displayName: 'Manage Own Account', resource: 'account', action: 'manage_own' },
  ];

  const permissions = [];
  for (const p of permissionsData) {
    const perm = await prisma.permission.upsert({
      where: { name: p.name },
      update: {},
      create: {
        name: p.name,
        displayName: p.displayName,
        resource: p.resource,
        action: p.action,
      },
    });
    permissions.push(perm);
  }

  // Assign permissions to roles based on capabilities

  // Admin gets all permissions
  const adminRole = roles.find(r => r.name === 'admin');
  if (adminRole) {
    const adminPermissions = permissions.filter(p =>
      ['manage_users', 'manage_payments', 'view_payment_reports', 'generate_payment_reports',
       'manage_contact_inquiries', 'manage_site_settings', 'manage_roles_permissions',
       'manage_modules', 'view_site_analytics', 'generate_custom_reports', 'manage_system_backups'].includes(p.name)
    );
    for (const perm of adminPermissions) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      });
    }
  }

  // Master Practitioner permissions
  const masterPractitionerRole = roles.find(r => r.name === 'master_practitioner');
  if (masterPractitionerRole) {
    const masterPermissions = permissions.filter(p =>
      ['create_module_content', 'edit_module_content', 'create_exams', 'manage_exams',
       'manage_own_profile', 'view_module_analytics', 'moderate_content_feedback',
       'manage_modules', 'manage_contact_inquiries'].includes(p.name)
    );
    for (const perm of masterPermissions) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: masterPractitionerRole.id, permissionId: perm.id } },
        update: {},
        create: {
          roleId: masterPractitionerRole.id,
          permissionId: perm.id,
        },
      });
    }
  }

  // Practitioner (Student) permissions
  const practitionerRole = roles.find(r => r.name === 'practitioner');
  if (practitionerRole) {
    const practitionerPermissions = permissions.filter(p =>
      ['view_modules', 'enroll_modules', 'access_paid_content', 'view_payment_reports',
       'view_certificates', 'download_certificates', 'track_certificate_progress', 'manage_own_account'].includes(p.name)
    );
    for (const perm of practitionerPermissions) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: practitionerRole.id, permissionId: perm.id } },
        update: {},
        create: {
          roleId: practitionerRole.id,
          permissionId: perm.id,
        },
      });
    }
  }

  // Default admin user
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123!';

  const hashed = await bcrypt.hash(adminPassword, 10);
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashed,
      isVerified: true,
      profile: {
        create: {
          firstName: 'Admin',
          lastName: 'User',
          nationality: 'Unknown',
          gender: 'OTHER',
          dateOfBirth: new Date('1990-01-01'),
          phoneNumber: '0000000000',
          email: adminEmail,
          designation: 'Administrator',
          organizationName: 'GSPA',
          documentType: 'PASSPORT',
          documentNumber: 'ADMIN001',
          isActive: true,
        }
      }
    },
  });

  // Assign admin role to profile if exists
  const profile = await prisma.profile.findUnique({ where: { id: adminUser.id } });
  if (profile && adminRole) {
    await prisma.profile.update({
      where: { id: profile.id },
      data: { roleId: adminRole.id },
    });
  }

  // Default master practitioner user
  const masterPractitionerEmail = 'master@example.com';
  const masterPractitionerPassword = 'Master@123';

  const hashedMasterPassword = await bcrypt.hash(masterPractitionerPassword, 10);
  const masterPractitionerUser = await prisma.user.upsert({
    where: { email: masterPractitionerEmail },
    update: {},
    create: {
      email: masterPractitionerEmail,
      password: hashedMasterPassword,
      isVerified: true,
      profile: {
        create: {
          firstName: 'Master',
          lastName: 'Practitioner',
          nationality: 'Unknown',
          gender: 'OTHER',
          dateOfBirth: new Date('1985-01-01'),
          phoneNumber: '0000000001',
          email: masterPractitionerEmail,
          designation: 'Master Practitioner',
          organizationName: 'GSPA',
          documentType: 'PASSPORT',
          documentNumber: 'MASTER001',
          isActive: true,
        }
      }
    },
  });

  // Assign master practitioner role to profile if exists
  const masterProfile = await prisma.profile.findUnique({ where: { id: masterPractitionerUser.id } });
  if (masterProfile && masterPractitionerRole) {
    await prisma.profile.update({
      where: { id: masterProfile.id },
      data: { roleId: masterPractitionerRole.id },
    });
  }

  // Default practitioner user
  const practitionerEmail = 'practitioner@example.com';
  const practitionerPassword = 'Practitioner@123';

  const hashedPractitionerPassword = await bcrypt.hash(practitionerPassword, 10);
  const practitionerUser = await prisma.user.upsert({
    where: { email: practitionerEmail },
    update: {},
    create: {
      email: practitionerEmail,
      password: hashedPractitionerPassword,
      isVerified: true,
      profile: {
        create: {
          firstName: 'Regular',
          lastName: 'Practitioner',
          nationality: 'Unknown',
          gender: 'OTHER',
          dateOfBirth: new Date('1990-01-01'),
          phoneNumber: '0000000002',
          email: practitionerEmail,
          designation: 'Practitioner',
          organizationName: 'GSPA',
          documentType: 'PASSPORT',
          documentNumber: 'PRACT001',
          isActive: true,
          membershipFeePaid: true,
          paymentStatus: 'COMPLETED',
        }
      }
    },
  });

  // Assign practitioner role to profile if exists
  const practitionerProfile = await prisma.profile.findUnique({ where: { id: practitionerUser.id } });
  if (practitionerProfile && practitionerRole) {
    await prisma.profile.update({
      where: { id: practitionerProfile.id },
      data: { roleId: practitionerRole.id },
    });
  }

  // Sample module
  const sampleModule = await prisma.module.upsert({
    where: { id: 'module-sample-1' },
    update: {},
    create: {
      id: 'module-sample-1',
      title: 'Introduction to Security Practices',
      description: 'A sample module about security basics.',
      category: 'security',
      difficultyLevel: 'BEGINNER',
      estimatedDuration: 60,
      price: 0.0,
      currency: 'USD',
      isActive: true,
      createdById: adminUser.id,
    },
  });

  // Default modules based on 011_add_modules_system.sql
  const defaultModules = [
    {
      id: 'module-cybersecurity-fundamentals',
      title: 'Cybersecurity Fundamentals',
      description: 'Master the essential concepts of cybersecurity including threat identification, risk assessment, and basic security protocols. This comprehensive course covers everything from basic network security to advanced threat detection techniques.',
      shortDescription: 'Learn the fundamentals of cybersecurity and protect digital assets',
      category: 'Cybersecurity',
      difficultyLevel: 'BEGINNER' as const,
      estimatedDuration: 40,
      price: 200.00,
      currency: 'USD',
      maxStudents: 50,
      prerequisites: 'Basic computer knowledge',
      learningObjectives: [
        'Understand cybersecurity principles and concepts',
        'Identify common security threats and vulnerabilities',
        'Implement basic security measures',
        'Conduct risk assessments',
        'Use security tools and technologies'
      ],
      instructorName: 'Dr. Sarah Johnson',
      instructorBio: 'Dr. Sarah Johnson is a leading cybersecurity expert with over 15 years of experience in the field. She has worked with Fortune 500 companies and government agencies, specializing in cybersecurity education and training.'
    },
    {
      id: 'module-advanced-network-security',
      title: 'Advanced Network Security',
      description: 'Dive deep into advanced network security concepts including firewall configuration, intrusion detection systems, VPNs, and secure network architecture design.',
      shortDescription: 'Advanced network security techniques and implementation',
      category: 'Network Security',
      difficultyLevel: 'ADVANCED' as const,
      estimatedDuration: 60,
      price: 360.00,
      currency: 'USD',
      maxStudents: 30,
      prerequisites: 'Cybersecurity Fundamentals or equivalent experience',
      learningObjectives: [
        'Design secure network architectures',
        'Configure advanced firewalls and IDS/IPS',
        'Implement VPN and secure remote access',
        'Conduct network penetration testing',
        'Manage security incidents and responses'
      ],
      instructorName: 'Prof. Michael Chen',
      instructorBio: 'Prof. Michael Chen is a renowned network security specialist and professor at MIT. He has authored several books on network security and has consulted for major telecommunications companies worldwide.'
    },
    {
      id: 'module-digital-forensics',
      title: 'Digital Forensics and Incident Response',
      description: 'Learn the art and science of digital forensics, evidence collection, analysis, and incident response planning. Master the tools and techniques used by forensic investigators.',
      shortDescription: 'Digital evidence collection, analysis, and incident response',
      category: 'Digital Forensics',
      difficultyLevel: 'INTERMEDIATE' as const,
      estimatedDuration: 50,
      price: 280.00,
      currency: 'USD',
      maxStudents: 40,
      prerequisites: 'Basic cybersecurity knowledge recommended',
      learningObjectives: [
        'Collect and preserve digital evidence',
        'Conduct forensic analysis of digital devices',
        'Use forensic tools and software',
        'Create incident response plans',
        'Present findings in legal proceedings'
      ],
      instructorName: 'Dr. Emily Rodriguez',
      instructorBio: 'Dr. Emily Rodriguez is a certified forensic investigator and former FBI digital forensics specialist. She has testified in numerous high-profile cybercrime cases and is a leading expert in digital evidence analysis.'
    },
    {
      id: 'module-ethical-hacking',
      title: 'Ethical Hacking and Penetration Testing',
      description: 'Become an ethical hacker by learning penetration testing methodologies, vulnerability assessment, and responsible disclosure practices.',
      shortDescription: 'Learn ethical hacking techniques and penetration testing',
      category: 'Ethical Hacking',
      difficultyLevel: 'INTERMEDIATE' as const,
      estimatedDuration: 55,
      price: 320.00,
      currency: 'USD',
      maxStudents: 35,
      prerequisites: 'Basic cybersecurity knowledge',
      learningObjectives: [
        'Understand ethical hacking principles',
        'Conduct vulnerability assessments',
        'Perform penetration testing',
        'Use hacking tools and techniques',
        'Write security reports and recommendations'
      ],
      instructorName: 'Marcus Thompson',
      instructorBio: 'Marcus Thompson is a certified ethical hacker (CEH) and OSCP holder with extensive experience in penetration testing. He has worked with major corporations to identify and fix security vulnerabilities.'
    },
    {
      id: 'module-cloud-security',
      title: 'Cloud Security and Compliance',
      description: 'Master cloud security principles, compliance frameworks, and secure cloud architecture design for AWS, Azure, and GCP platforms.',
      shortDescription: 'Secure cloud infrastructure and ensure compliance',
      category: 'Cloud Security',
      difficultyLevel: 'INTERMEDIATE' as const,
      estimatedDuration: 45,
      price: 240.00,
      currency: 'USD',
      maxStudents: 45,
      prerequisites: 'Basic cloud computing knowledge',
      learningObjectives: [
        'Design secure cloud architectures',
        'Implement cloud security controls',
        'Ensure compliance with regulations',
        'Manage cloud security incidents',
        'Use cloud security tools and services'
      ],
      instructorName: 'Dr. Lisa Park',
      instructorBio: 'Dr. Lisa Park is a cloud security architect and AWS certified solutions architect. She specializes in helping organizations secure their cloud infrastructure and achieve compliance with industry standards.'
    }
  ];

  // Create default modules
  for (const moduleData of defaultModules) {
    await prisma.module.upsert({
      where: { id: moduleData.id },
      update: {},
      create: {
        ...moduleData,
        isActive: true,
        isFeatured: false,
        createdById: adminUser.id,
      },
    });
  }

  console.log('Created default modules');

  // Sample questions
  const q1 = await prisma.testQuestion.upsert({
    where: { id: 'q-sample-1' },
    update: {},
    create: {
      id: 'q-sample-1',
      question: 'What is the most important aspect of security? ',
      category: 'general',
      difficulty: 'EASY',
      moduleId: sampleModule.id,
    },
  });

  await prisma.questionOption.upsert({
    where: { id: 'q1-a' },
    update: {},
    create: {
      id: 'q1-a',
      questionId: q1.id,
      optionText: 'People',
      optionLetter: 'A',
      isCorrect: true,
    }
  });
  await prisma.questionOption.upsert({
    where: { id: 'q1-b' },
    update: {},
    create: {
      id: 'q1-b',
      questionId: q1.id,
      optionText: 'Computers',
      optionLetter: 'B',
      isCorrect: false,
    }
  });

  // Run cybersecurity questions seeder
  console.log('Starting cybersecurity questions seeding...');

  // First, create a cybersecurity module if it doesn't exist
  let cybersecurityModule = await prisma.module.findFirst({
    where: { title: 'Cybersecurity Fundamentals' }
  });

  if (!cybersecurityModule) {
    cybersecurityModule = await prisma.module.create({
      data: {
        title: 'Cybersecurity Fundamentals',
        description: 'Comprehensive introduction to cybersecurity principles, threats, and best practices',
        shortDescription: 'Learn essential cybersecurity concepts and protection strategies',
        category: 'Cybersecurity',
        difficultyLevel: 'BEGINNER',
        price: 99.99,
        currency: 'USD',
        isActive: true,
        isFeatured: true,
        createdById: adminUser.id,
      }
    });
    console.log('Created cybersecurity module');
  }

  // Create a level for the module
  let cybersecurityLevel = await prisma.level.findFirst({
    where: {
      moduleId: cybersecurityModule.id,
      title: 'Basic Cybersecurity Concepts'
    }
  });

  if (!cybersecurityLevel) {
    cybersecurityLevel = await prisma.level.create({
      data: {
        moduleId: cybersecurityModule.id,
        title: 'Basic Cybersecurity Concepts',
        description: 'Fundamental concepts of cybersecurity and information security',
        orderIndex: 1,
        isActive: true,
      }
    });
    console.log('Created cybersecurity level');
  }

  // Create a sub-topic
  let cybersecuritySubTopic = await prisma.subTopic.findFirst({
    where: {
      levelId: cybersecurityLevel.id,
      title: 'Network Security Basics'
    }
  });

  if (!cybersecuritySubTopic) {
    cybersecuritySubTopic = await prisma.subTopic.create({
      data: {
        levelId: cybersecurityLevel.id,
        title: 'Network Security Basics',
        description: 'Understanding network security fundamentals and common threats',
        orderIndex: 1,
        isActive: true,
      }
    });
    console.log('Created cybersecurity sub-topic');
  }

  // Create a sub-topic test
  let cybersecurityTest = await prisma.subTopicTest.findFirst({
    where: { subTopicId: cybersecuritySubTopic.id }
  });

  if (!cybersecurityTest) {
    cybersecurityTest = await prisma.subTopicTest.create({
      data: {
        subTopicId: cybersecuritySubTopic.id,
        title: 'Network Security Fundamentals Quiz',
        description: 'Test your knowledge of basic network security concepts',
        questions: [], // Will be populated with question IDs
        totalQuestions: 0,
        passingScore: 70,
        timeLimit: 600, // 10 minutes
        isActive: true,
      }
    });
    console.log('Created cybersecurity sub-topic test');
  }

  // Cybersecurity questions data
  const cybersecurityQuestions = [
    {
      question: 'What is the primary goal of cybersecurity?',
      options: [
        { optionLetter: 'A', optionText: 'To make computers run faster', isCorrect: false },
        { optionLetter: 'B', optionText: 'To protect information and systems from unauthorized access', isCorrect: true },
        { optionLetter: 'C', optionText: 'To create new software applications', isCorrect: false },
        { optionLetter: 'D', optionText: 'To improve internet connectivity', isCorrect: false }
      ],
      category: 'Cybersecurity Fundamentals',
      difficulty: 'EASY' as const,
      modelType: 'subtopic',
      modelId: cybersecurityTest.id
    },
    {
      question: 'Which of the following is NOT a common type of cyber attack?',
      options: [
        { optionLetter: 'A', optionText: 'Phishing', isCorrect: false },
        { optionLetter: 'B', optionText: 'Malware', isCorrect: false },
        { optionLetter: 'C', optionText: 'DDoS', isCorrect: false },
        { optionLetter: 'D', optionText: 'Power outage', isCorrect: true }
      ],
      category: 'Cyber Threats',
      difficulty: 'EASY' as const,
      modelType: 'subtopic',
      modelId: cybersecurityTest.id
    },
    {
      question: 'What does "CIA" stand for in cybersecurity?',
      options: [
        { optionLetter: 'A', optionText: 'Central Intelligence Agency', isCorrect: false },
        { optionLetter: 'B', optionText: 'Confidentiality, Integrity, Availability', isCorrect: true },
        { optionLetter: 'C', optionText: 'Computer Internet Access', isCorrect: false },
        { optionLetter: 'D', optionText: 'Cybersecurity Intelligence Agency', isCorrect: false }
      ],
      category: 'Cybersecurity Principles',
      difficulty: 'MEDIUM' as const,
      modelType: 'subtopic',
      modelId: cybersecurityTest.id
    },
    {
      question: 'Which authentication method is considered the strongest?',
      options: [
        { optionLetter: 'A', optionText: 'Password only', isCorrect: false },
        { optionLetter: 'B', optionText: 'Username and password', isCorrect: false },
        { optionLetter: 'C', optionText: 'Multi-factor authentication (MFA)', isCorrect: true },
        { optionLetter: 'D', optionText: 'Security questions', isCorrect: false }
      ],
      category: 'Authentication',
      difficulty: 'MEDIUM' as const,
      modelType: 'subtopic',
      modelId: cybersecurityTest.id
    },
    {
      question: 'What is a firewall primarily used for?',
      options: [
        { optionLetter: 'A', optionText: 'Speeding up internet connection', isCorrect: false },
        { optionLetter: 'B', optionText: 'Monitoring network traffic and blocking unauthorized access', isCorrect: true },
        { optionLetter: 'C', optionText: 'Creating backups of data', isCorrect: false },
        { optionLetter: 'D', optionText: 'Scanning for viruses', isCorrect: false }
      ],
      category: 'Network Security',
      difficulty: 'EASY' as const,
      modelType: 'subtopic',
      modelId: cybersecurityTest.id
    },
    {
      question: 'Which of the following is an example of social engineering?',
      options: [
        { optionLetter: 'A', optionText: 'Installing antivirus software', isCorrect: false },
        { optionLetter: 'B', optionText: 'Tricking someone into revealing confidential information', isCorrect: true },
        { optionLetter: 'C', optionText: 'Updating system passwords regularly', isCorrect: false },
        { optionLetter: 'D', optionText: 'Encrypting sensitive files', isCorrect: false }
      ],
      category: 'Social Engineering',
      difficulty: 'MEDIUM' as const,
      modelType: 'subtopic',
      modelId: cybersecurityTest.id
    },
    {
      question: 'What does "encryption" do?',
      options: [
        { optionLetter: 'A', optionText: 'Makes data unreadable to unauthorized users', isCorrect: true },
        { optionLetter: 'B', optionText: 'Speeds up data transmission', isCorrect: false },
        { optionLetter: 'C', optionText: 'Compresses data for storage', isCorrect: false },
        { optionLetter: 'D', optionText: 'Deletes old data automatically', isCorrect: false }
      ],
      category: 'Data Protection',
      difficulty: 'MEDIUM' as const,
      modelType: 'subtopic',
      modelId: cybersecurityTest.id
    },
    {
      question: 'Which protocol is commonly used for secure web browsing?',
      options: [
        { optionLetter: 'A', optionText: 'HTTP', isCorrect: false },
        { optionLetter: 'B', optionText: 'FTP', isCorrect: false },
        { optionLetter: 'C', optionText: 'HTTPS', isCorrect: true },
        { optionLetter: 'D', optionText: 'SMTP', isCorrect: false }
      ],
      category: 'Web Security',
      difficulty: 'EASY' as const,
      modelType: 'subtopic',
      modelId: cybersecurityTest.id
    },
    {
      question: 'What is the purpose of a VPN?',
      options: [
        { optionLetter: 'A', optionText: 'To speed up internet connection', isCorrect: false },
        { optionLetter: 'B', optionText: 'To create a secure connection over a public network', isCorrect: true },
        { optionLetter: 'C', optionText: 'To block all incoming traffic', isCorrect: false },
        { optionLetter: 'D', optionText: 'To monitor internet usage', isCorrect: false }
      ],
      category: 'Network Security',
      difficulty: 'MEDIUM' as const,
      modelType: 'subtopic',
      modelId: cybersecurityTest.id
    },
    {
      question: 'Which of the following is a strong password practice?',
      options: [
        { optionLetter: 'A', optionText: 'Using "password123" as your password', isCorrect: false },
        { optionLetter: 'B', optionText: 'Using the same password for all accounts', isCorrect: false },
        { optionLetter: 'C', optionText: 'Using a combination of uppercase, lowercase, numbers, and symbols', isCorrect: true },
        { optionLetter: 'D', optionText: 'Writing passwords on sticky notes', isCorrect: false }
      ],
      category: 'Password Security',
      difficulty: 'EASY' as const,
      modelType: 'subtopic',
      modelId: cybersecurityTest.id
    }
  ];

  // Create questions and associate them with the test
  const createdQuestions = [];

  for (const qData of cybersecurityQuestions) {
    const question = await prisma.testQuestion.create({
      data: {
        question: qData.question,
        category: qData.category,
        difficulty: qData.difficulty,
        isActive: true,
        options: {
          create: qData.options
        }
      }
    });

    // Fetch the question with options
    const questionWithOptions = await prisma.testQuestion.findUnique({
      where: { id: question.id },
      include: { options: true }
    });

    if (questionWithOptions) {
      createdQuestions.push({
        id: questionWithOptions.id,
        question: questionWithOptions.question,
        options: questionWithOptions.options.reduce((acc: any, opt: any) => {
          acc[opt.optionLetter] = opt.optionText;
          return acc;
        }, {}),
        correctAnswer: questionWithOptions.options.find((opt: any) => opt.isCorrect)?.optionLetter || 'A',
        category: questionWithOptions.category,
        difficulty: questionWithOptions.difficulty
      });
    }
  }

  // Update the sub-topic test with the questions
  await prisma.subTopicTest.update({
    where: { id: cybersecurityTest.id },
    data: {
      questions: createdQuestions,
      totalQuestions: createdQuestions.length
    }
  });

  console.log(`Created ${createdQuestions.length} cybersecurity questions`);
  console.log('Cybersecurity questions seeding completed successfully');

  console.log('Seeding complete.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
