import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Helper function to get role-based dashboard path
function getRoleBasedDashboardPath(role: string): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return '/dashboard/super-admin';
    case 'ADMIN':
      return '/dashboard/admin';
    case 'USER':
    default:
      return '/dashboard/user';
  }
}

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // If user is accessing /dashboard without a specific role path
    if (pathname === '/dashboard' && token?.role) {
      const roleBasedPath = getRoleBasedDashboardPath(token.role as string);
      return NextResponse.redirect(new URL(roleBasedPath, req.url));
    }

    // Role-based access control for dashboard routes
    if (pathname.startsWith('/dashboard/')) {
      const userRole = token?.role as string;
      
      // Super Admin access
      if (pathname.startsWith('/dashboard/super-admin')) {
        if (userRole !== 'SUPER_ADMIN') {
          const redirectPath = getRoleBasedDashboardPath(userRole);
          return NextResponse.redirect(new URL(redirectPath, req.url));
        }
      }
      
      // Admin access
      else if (pathname.startsWith('/dashboard/admin')) {
        if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
          const redirectPath = getRoleBasedDashboardPath(userRole);
          return NextResponse.redirect(new URL(redirectPath, req.url));
        }
      }
      
      // User access
      else if (pathname.startsWith('/dashboard/user')) {
        // All authenticated users can access user dashboard
        // But redirect admins to their respective dashboards
        if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
          const redirectPath = getRoleBasedDashboardPath(userRole);
          return NextResponse.redirect(new URL(redirectPath, req.url));
        }
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Allow access to auth pages without token
        if (pathname.startsWith('/auth/')) {
          return true;
        }
        
        // Require token for dashboard routes
        if (pathname.startsWith('/dashboard')) {
          return !!token;
        }
        
        // Allow access to public pages
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - public folder
    '/((?!api|_next/static|_next/image|favicon.ico|public/).*)'
  ]
}
