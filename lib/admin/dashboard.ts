import { prisma } from '@/lib/prisma/client';

export async function getAdminDashboardData() {
  try {
    const [
      totalUsers,
      totalPractitioners,
      totalMasterPractitioners,
      recentUsers,
      pendingCertifications,
      recentPayments
    ] = await Promise.all([
      // Get total users count
      prisma.user.count(),
      
      // Get practitioners count
      prisma.profile.count({
        where: {
          role: {
            name: 'practitioner'
          }
        }
      }),
      
      // Get master practitioners count
      prisma.profile.count({
        where: {
          role: {
            name: 'master_practitioner'
          }
        }
      }),
      
      // Get recent users with their profiles
      prisma.user.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          profile: {
            include: {
              role: true
            }
          }
        }
      }),
      
      // Get pending certifications
      prisma.profile.findMany({
        where: {
          testCompleted: true,
          certificateIssued: false
        },
        take: 5,
        include: {
          user: true,
          role: true
        }
      }),
      
      // Get recent payments
      prisma.profile.findMany({
        where: {
          paymentStatus: 'COMPLETED'
        },
        take: 5,
        orderBy: {
          updatedAt: 'desc'
        },
        include: {
          user: true
        }
      })
    ]);

    return {
      statistics: {
        totalUsers,
        totalPractitioners,
        totalMasterPractitioners,
        pendingCertificationsCount: pendingCertifications.length,
      },
      recentUsers: recentUsers.map(user => ({
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        role: user.profile?.role?.name || 'user',
        name: user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : 'Not Set'
      })),
      pendingCertifications: pendingCertifications.map(profile => ({
        id: profile.id,
        name: `${profile.firstName} ${profile.lastName}`,
        email: profile.email,
        role: profile.role?.name,
        testScore: profile.testScore
      })),
      recentPayments: recentPayments.map(profile => ({
        id: profile.id,
        name: `${profile.firstName} ${profile.lastName}`,
        amount: 'Membership Fee', // You can add actual amount if you store it
        date: profile.updatedAt,
        status: profile.paymentStatus
      }))
    };
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    throw error;
  }
}
