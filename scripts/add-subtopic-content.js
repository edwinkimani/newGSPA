const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addSubTopicContent() {
  try {
    console.log('Adding SubTopicContent data...');

    // First, let's find the existing subtopic
    const subtopic = await prisma.subTopic.findFirst({
      where: {
        title: 'Network Security Basics'
      },
      include: {
        level: {
          include: {
            module: true
          }
        }
      }
    });

    if (!subtopic) {
      console.log('No subtopic found. Please run the main seeder first.');
      return;
    }

    console.log('Found subtopic:', subtopic.id, '-', subtopic.title);

    // Find a user to use as creator (admin or master practitioner)
    const creator = await prisma.user.findFirst({
      include: {
        profile: {
          include: {
            role: true
          }
        }
      },
      where: {
        profile: {
          role: {
            name: {
              in: ['admin', 'master_practitioner']
            }
          }
        }
      }
    });

    if (!creator) {
      console.log('No admin or master practitioner found. Please run the main seeder first.');
      return;
    }

    console.log('Using creator:', creator.email);

    // Create sample content for the subtopic
    const contentData = [
      {
        title: 'Introduction to Network Security',
        description: 'Learn the fundamental concepts of network security and why it\'s important.',
        contentType: 'NOTES',
        contentText: `
<h2>What is Network Security?</h2>
<p>Network security is the practice of protecting computer networks and their data from unauthorized access, misuse, or theft. It involves implementing various security measures to ensure the confidentiality, integrity, and availability of network resources.</p>

<h3>Key Components of Network Security:</h3>
<ul>
  <li><strong>Firewalls:</strong> Act as barriers between trusted and untrusted networks</li>
  <li><strong>Access Control:</strong> Determines who can access network resources</li>
  <li><strong>Encryption:</strong> Protects data in transit and at rest</li>
  <li><strong>Monitoring:</strong> Continuous surveillance of network activities</li>
</ul>

<h3>Common Network Threats:</h3>
<ul>
  <li>Malware and viruses</li>
  <li>Unauthorized access attempts</li>
  <li>Data breaches</li>
  <li>Denial of Service (DoS) attacks</li>
  <li>Man-in-the-middle attacks</li>
</ul>

<p>Understanding these basics is crucial for implementing effective network security measures.</p>
        `,
        durationMinutes: 15,
        isRequired: true,
        orderIndex: 1,
        isPublished: true,
        subTopicId: subtopic.id,
        createdById: creator.id
      },
      {
        title: 'Types of Network Attacks',
        description: 'Explore different types of network attacks and how they work.',
        contentType: 'NOTES',
        contentText: `
<h2>Common Network Attack Types</h2>

<h3>1. Denial of Service (DoS) Attacks</h3>
<p>DoS attacks aim to make network resources unavailable to legitimate users by overwhelming the system with traffic or requests.</p>

<h3>2. Man-in-the-Middle (MITM) Attacks</h3>
<p>In MITM attacks, attackers intercept communication between two parties, potentially stealing or modifying data.</p>

<h3>3. SQL Injection</h3>
<p>Attackers insert malicious SQL code into web applications to gain unauthorized access to databases.</p>

<h3>4. Phishing</h3>
<p>Social engineering attacks that trick users into revealing sensitive information through fake websites or emails.</p>

<h3>5. Malware</h3>
<p>Malicious software designed to damage, disrupt, or gain unauthorized access to computer systems.</p>

<h3>Prevention Strategies:</h3>
<ul>
  <li>Keep software and systems updated</li>
  <li>Use strong authentication methods</li>
  <li>Implement network monitoring</li>
  <li>Train users on security awareness</li>
  <li>Use encryption for sensitive data</li>
</ul>
        `,
        durationMinutes: 20,
        isRequired: true,
        orderIndex: 2,
        isPublished: true,
        subTopicId: subtopic.id,
        createdById: creator.id
      },
      {
        title: 'Network Security Best Practices',
        description: 'Learn essential best practices for maintaining network security.',
        contentType: 'NOTES',
        contentText: `
<h2>Network Security Best Practices</h2>

<h3>1. Implement Strong Access Controls</h3>
<ul>
  <li>Use multi-factor authentication (MFA)</li>
  <li>Follow the principle of least privilege</li>
  <li>Regularly review and update user permissions</li>
</ul>

<h3>2. Keep Systems Updated</h3>
<ul>
  <li>Install security patches promptly</li>
  <li>Update antivirus and anti-malware software</li>
  <li>Maintain current firmware on network devices</li>
</ul>

<h3>3. Network Segmentation</h3>
<ul>
  <li>Separate critical systems from general networks</li>
  <li>Use VLANs to isolate different network segments</li>
  <li>Implement proper firewall rules between segments</li>
</ul>

<h3>4. Monitor and Log Activities</h3>
<ul>
  <li>Implement comprehensive logging</li>
  <li>Use intrusion detection systems (IDS)</li>
  <li>Regularly review security logs</li>
  <li>Set up alerts for suspicious activities</li>
</ul>

<h3>5. Data Protection</h3>
<ul>
  <li>Encrypt sensitive data in transit and at rest</li>
  <li>Implement secure backup procedures</li>
  <li>Use secure protocols (HTTPS, SFTP, etc.)</li>
</ul>

<h3>6. Employee Training</h3>
<ul>
  <li>Conduct regular security awareness training</li>
  <li>Teach employees to recognize phishing attempts</li>
  <li>Establish clear security policies and procedures</li>
</ul>
        `,
        durationMinutes: 25,
        isRequired: true,
        orderIndex: 3,
        isPublished: true,
        subTopicId: subtopic.id,
        createdById: creator.id
      }
    ];

    // Create the content records
    for (const content of contentData) {
      const createdContent = await prisma.subTopicContent.create({
        data: content
      });
      console.log('Created content:', createdContent.id, '-', createdContent.title);
    }

    console.log('Successfully added SubTopicContent data!');
    console.log('SubTopic ID:', subtopic.id);
    console.log('You can now test the API endpoint: /api/sub-topic-content?subTopicId=' + subtopic.id);

  } catch (error) {
    console.error('Error adding SubTopicContent:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSubTopicContent();
