-- Seed Default Modules for GSPA Platform
-- This script creates comprehensive training modules for the Global Security Practitioners Alliance

-- Get the admin user ID (assuming admin@gmail.com exists)
-- In production, replace this with the actual admin user ID
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Try to get admin user ID, fallback to a placeholder if not found
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = 'admin@gmail.com'
    LIMIT 1;

    IF admin_user_id IS NULL THEN
        -- Use a placeholder UUID - replace with actual admin UUID when running
        admin_user_id := 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid;
        RAISE NOTICE 'Admin user not found, using placeholder UUID. Replace with actual admin UUID.';
    END IF;

    -- Insert comprehensive default modules
    INSERT INTO public.modules (
        title,
        description,
        short_description,
        category,
        difficulty_level,
        estimated_duration,
        price,
        currency,
        is_active,
        is_featured,
        thumbnail_url,
        prerequisites,
        learning_objectives,
        created_by
    ) VALUES
    -- Cybersecurity Fundamentals
    (
        'Cybersecurity Fundamentals',
        'Master the essential concepts of cybersecurity including threat identification, risk assessment, and basic security protocols. This comprehensive course covers everything from basic network security to advanced threat detection techniques, providing a solid foundation for any security professional.',
        'Learn the fundamentals of cybersecurity and protect digital assets',
        'Cybersecurity',
        'beginner',
        240, -- 4 hours
        49.99,
        'USD',
        TRUE,
        TRUE,
        '/api/placeholder/400/300?text=Cybersecurity',
        NULL,
        ARRAY[
            'Understand core cybersecurity principles and concepts',
            'Identify common security threats and vulnerabilities',
            'Implement basic security measures and best practices',
            'Conduct fundamental risk assessments',
            'Use essential security tools and technologies'
        ],
        admin_user_id
    ),
    (
        'Advanced Cybersecurity Techniques',
        'Dive deep into advanced cybersecurity methodologies including penetration testing, ethical hacking, and advanced threat detection. Learn to identify and mitigate sophisticated cyber attacks using industry-standard tools and techniques.',
        'Advanced cybersecurity methods and threat mitigation',
        'Cybersecurity',
        'advanced',
        480, -- 8 hours
        149.99,
        'USD',
        TRUE,
        TRUE,
        '/api/placeholder/400/300?text=Advanced+Cybersecurity',
        ARRAY['Cybersecurity Fundamentals'],
        ARRAY[
            'Perform advanced penetration testing',
            'Implement ethical hacking methodologies',
            'Detect and respond to sophisticated threats',
            'Use advanced security analysis tools',
            'Develop comprehensive security strategies'
        ],
        admin_user_id
    ),

    -- Network Security
    (
        'Network Security Essentials',
        'Master the fundamentals of network security including firewalls, VPNs, intrusion detection systems, and secure network architecture design. Learn to protect network infrastructure from both internal and external threats.',
        'Build secure network infrastructures and protect against threats',
        'Network Security',
        'intermediate',
        360, -- 6 hours
        79.99,
        'USD',
        TRUE,
        TRUE,
        '/api/placeholder/400/300?text=Network+Security',
        ARRAY['Cybersecurity Fundamentals'],
        ARRAY[
            'Design secure network architectures',
            'Configure and manage firewalls effectively',
            'Implement VPN and secure remote access solutions',
            'Deploy intrusion detection and prevention systems',
            'Conduct network security assessments'
        ],
        admin_user_id
    ),
    (
        'Wireless Network Security',
        'Comprehensive coverage of wireless network security including Wi-Fi encryption, wireless intrusion detection, and mobile device security. Learn to secure wireless networks against modern threats and attacks.',
        'Secure wireless networks and mobile communications',
        'Network Security',
        'intermediate',
        300, -- 5 hours
        69.99,
        'USD',
        TRUE,
        FALSE,
        '/api/placeholder/400/300?text=Wireless+Security',
        ARRAY['Network Security Essentials'],
        ARRAY[
            'Implement secure Wi-Fi encryption protocols',
            'Detect and prevent wireless intrusions',
            'Secure mobile devices and communications',
            'Configure wireless security policies',
            'Conduct wireless network assessments'
        ],
        admin_user_id
    ),

    -- Digital Forensics
    (
        'Digital Forensics Fundamentals',
        'Learn the art and science of digital forensics, evidence collection, analysis, and preservation. Master the tools and techniques used by forensic investigators to collect and analyze digital evidence.',
        'Digital evidence collection, analysis, and preservation',
        'Digital Forensics',
        'intermediate',
        420, -- 7 hours
        99.99,
        'USD',
        TRUE,
        TRUE,
        '/api/placeholder/400/300?text=Digital+Forensics',
        ARRAY['Cybersecurity Fundamentals'],
        ARRAY[
            'Collect and preserve digital evidence properly',
            'Conduct forensic analysis of digital devices',
            'Use forensic tools and software effectively',
            'Maintain chain of custody for evidence',
            'Present forensic findings in legal proceedings'
        ],
        admin_user_id
    ),
    (
        'Advanced Digital Forensics',
        'Master advanced digital forensics techniques including memory analysis, mobile device forensics, and cloud forensics. Learn to handle complex investigations and work with encrypted data.',
        'Advanced forensic investigation techniques',
        'Digital Forensics',
        'advanced',
        540, -- 9 hours
        159.99,
        'USD',
        TRUE,
        FALSE,
        '/api/placeholder/400/300?text=Advanced+Forensics',
        ARRAY['Digital Forensics Fundamentals'],
        ARRAY[
            'Perform memory forensics and analysis',
            'Conduct mobile device investigations',
            'Handle cloud-based evidence collection',
            'Work with encrypted and protected data',
            'Manage complex forensic investigations'
        ],
        admin_user_id
    ),

    -- Ethical Hacking
    (
        'Ethical Hacking and Penetration Testing',
        'Become an ethical hacker by learning penetration testing methodologies, vulnerability assessment, and responsible disclosure practices. Master the tools and techniques used by security professionals.',
        'Learn ethical hacking and penetration testing techniques',
        'Ethical Hacking',
        'intermediate',
        480, -- 8 hours
        129.99,
        'USD',
        TRUE,
        TRUE,
        '/api/placeholder/400/300?text=Ethical+Hacking',
        ARRAY['Cybersecurity Fundamentals', 'Network Security Essentials'],
        ARRAY[
            'Understand ethical hacking principles and methodologies',
            'Conduct comprehensive vulnerability assessments',
            'Perform systematic penetration testing',
            'Use industry-standard hacking tools',
            'Write detailed security assessment reports'
        ],
        admin_user_id
    ),

    -- Cloud Security
    (
        'Cloud Security and Compliance',
        'Master cloud security principles, compliance frameworks, and secure cloud architecture design for AWS, Azure, and GCP platforms. Learn to implement security in cloud environments.',
        'Secure cloud infrastructure and ensure compliance',
        'Cloud Security',
        'intermediate',
        390, -- 6.5 hours
        109.99,
        'USD',
        TRUE,
        FALSE,
        '/api/placeholder/400/300?text=Cloud+Security',
        ARRAY['Cybersecurity Fundamentals'],
        ARRAY[
            'Design secure cloud architectures',
            'Implement cloud security controls and best practices',
            'Ensure compliance with industry regulations',
            'Manage cloud security incidents',
            'Use cloud security monitoring tools'
        ],
        admin_user_id
    ),

    -- Incident Response
    (
        'Cybersecurity Incident Response',
        'Learn to effectively respond to cybersecurity incidents including breach detection, containment, eradication, and recovery. Develop comprehensive incident response plans and procedures.',
        'Master incident response and cyber breach management',
        'Incident Response',
        'intermediate',
        360, -- 6 hours
        89.99,
        'USD',
        TRUE,
        TRUE,
        '/api/placeholder/400/300?text=Incident+Response',
        ARRAY['Cybersecurity Fundamentals'],
        ARRAY[
            'Develop comprehensive incident response plans',
            'Detect and assess security incidents',
            'Implement containment and eradication strategies',
            'Conduct thorough incident investigations',
            'Perform effective recovery and lessons learned'
        ],
        admin_user_id
    ),

    -- Security Operations
    (
        'Security Operations Center (SOC) Management',
        'Learn to manage and operate a Security Operations Center including threat monitoring, incident handling, and security analytics. Master the tools and processes used in modern SOC environments.',
        'Manage security operations and threat monitoring',
        'Security Operations',
        'advanced',
        450, -- 7.5 hours
        139.99,
        'USD',
        TRUE,
        FALSE,
        '/api/placeholder/400/300?text=SOC+Management',
        ARRAY['Cybersecurity Fundamentals', 'Network Security Essentials'],
        ARRAY[
            'Set up and manage SOC operations',
            'Implement threat monitoring and detection',
            'Handle security incidents effectively',
            'Use SIEM and security analytics tools',
            'Develop SOC policies and procedures'
        ],
        admin_user_id
    ),

    -- Compliance and Governance
    (
        'Security Compliance and Governance',
        'Master security compliance frameworks including GDPR, HIPAA, PCI-DSS, and ISO 27001. Learn to implement governance frameworks and ensure regulatory compliance.',
        'Ensure security compliance and implement governance',
        'Compliance',
        'intermediate',
        330, -- 5.5 hours
        79.99,
        'USD',
        TRUE,
        FALSE,
        '/api/placeholder/400/300?text=Compliance',
        ARRAY['Cybersecurity Fundamentals'],
        ARRAY[
            'Understand major compliance frameworks',
            'Implement governance and risk management',
            'Conduct compliance assessments and audits',
            'Develop compliance documentation',
            'Manage regulatory reporting requirements'
        ],
        admin_user_id
    );

    RAISE NOTICE 'Default modules created successfully!';
END $$;

-- Add sample content for the most popular modules
INSERT INTO public.module_content (
    module_id,
    title,
    content_type,
    content_text,
    description,
    order_index,
    is_required,
    estimated_duration,
    created_by
) VALUES
-- Cybersecurity Fundamentals content
(
    (SELECT id FROM public.modules WHERE title = 'Cybersecurity Fundamentals' LIMIT 1),
    'Introduction to Cybersecurity',
    'text',
    'Cybersecurity is the practice of protecting systems, networks, and data from digital attacks. In today''s interconnected world, cybersecurity is essential for protecting sensitive information, maintaining business continuity, and safeguarding personal privacy.

Key concepts covered in this module:
• Understanding cyber threats and attack vectors
• Basic security principles (CIA triad)
• Risk assessment and management
• Security policies and procedures
• Essential security tools and technologies',
    'Understanding the fundamental concepts and importance of cybersecurity',
    1,
    TRUE,
    30,
    (SELECT id FROM auth.users WHERE email = 'admin@gmail.com' LIMIT 1)
),
(
    (SELECT id FROM public.modules WHERE title = 'Cybersecurity Fundamentals' LIMIT 1),
    'Common Cyber Threats',
    'text',
    'Learn about the most common cyber threats facing organizations today:

1. Malware: Viruses, worms, trojans, ransomware
2. Phishing: Social engineering attacks via email
3. DDoS Attacks: Distributed denial of service
4. SQL Injection: Database exploitation
5. Cross-Site Scripting (XSS): Web application attacks
6. Man-in-the-Middle: Network interception attacks

Understanding these threats is crucial for developing effective defense strategies.',
    'Identifying and understanding different types of cyber attacks',
    2,
    TRUE,
    45,
    (SELECT id FROM auth.users WHERE email = 'admin@gmail.com' LIMIT 1)
),
(
    (SELECT id FROM public.modules WHERE title = 'Cybersecurity Fundamentals' LIMIT 1),
    'Basic Security Measures',
    'text',
    'Essential security measures every organization should implement:

• Strong password policies and multi-factor authentication
• Regular software updates and patch management
• Antivirus and anti-malware protection
• Firewall configuration and network segmentation
• Data encryption and backup strategies
• Employee security awareness training
• Access control and least privilege principles

These foundational measures form the basis of a comprehensive security program.',
    'Implementing basic security controls and best practices',
    3,
    TRUE,
    40,
    (SELECT id FROM auth.users WHERE email = 'admin@gmail.com' LIMIT 1)
),

-- Network Security Essentials content
(
    (SELECT id FROM public.modules WHERE title = 'Network Security Essentials' LIMIT 1),
    'Network Security Fundamentals',
    'text',
    'Network security involves protecting the integrity, confidentiality, and availability of network infrastructure and data. This module covers:

• Network architecture and design principles
• Firewall types and configuration
• VPN technologies and secure remote access
• Intrusion detection and prevention systems
• Network segmentation and access controls
• Wireless network security
• Network monitoring and logging

A secure network is the foundation of any cybersecurity program.',
    'Understanding network security principles and architecture',
    1,
    TRUE,
    50,
    (SELECT id FROM auth.users WHERE email = 'admin@gmail.com' LIMIT 1)
),
(
    (SELECT id FROM public.modules WHERE title = 'Network Security Essentials' LIMIT 1),
    'Firewall Configuration',
    'text',
    'Firewalls are the first line of defense in network security. Learn about:

• Firewall types: Hardware, software, cloud-based
• Rule creation and management
• Network Address Translation (NAT)
• Port forwarding and filtering
• Stateful vs stateless inspection
• Next-generation firewall features
• Firewall best practices and maintenance

Proper firewall configuration is essential for network protection.',
    'Configuring and managing firewalls effectively',
    2,
    TRUE,
    60,
    (SELECT id FROM auth.users WHERE email = 'admin@gmail.com' LIMIT 1)
);

-- Display created modules
SELECT
    'Created Modules:' as status,
    title,
    category,
    difficulty_level,
    estimated_duration || ' minutes' as duration,
    '$' || price as price,
    CASE WHEN is_featured THEN 'Featured' ELSE 'Standard' END as type
FROM public.modules
ORDER BY category, difficulty_level, title;

-- Display module content summary
SELECT
    'Module Content:' as status,
    m.title as module_title,
    COUNT(mc.id) as content_items,
    SUM(mc.estimated_duration) || ' minutes' as total_duration
FROM public.modules m
LEFT JOIN public.module_content mc ON m.id = mc.module_id
GROUP BY m.id, m.title
ORDER BY m.title;

-- Final notification
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎓 DEFAULT MODULES CREATION COMPLETE!';
    RAISE NOTICE '=====================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Created modules across categories:';
    RAISE NOTICE '• Cybersecurity (2 modules)';
    RAISE NOTICE '• Network Security (2 modules)';
    RAISE NOTICE '• Digital Forensics (2 modules)';
    RAISE NOTICE '• Ethical Hacking (1 module)';
    RAISE NOTICE '• Cloud Security (1 module)';
    RAISE NOTICE '• Incident Response (1 module)';
    RAISE NOTICE '• Security Operations (1 module)';
    RAISE NOTICE '• Compliance (1 module)';
    RAISE NOTICE '';
    RAISE NOTICE 'Total: 11 comprehensive training modules';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Review and customize module content';
    RAISE NOTICE '2. Add video content and multimedia materials';
    RAISE NOTICE '3. Set up pricing and enrollment options';
    RAISE NOTICE '4. Configure module prerequisites and learning paths';
END $$;
