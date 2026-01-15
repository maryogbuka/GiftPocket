// middleware/admin-auth.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function adminAuthMiddleware(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(
      token,
      process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET
    );

    // Add admin info to request headers
    const headers = new Headers(request.headers);
    headers.set('x-admin-id', decoded.id);
    headers.set('x-admin-role', decoded.role);
    headers.set('x-admin-permissions', JSON.stringify(decoded.permissions));

    return NextResponse.next({
      request: {
        headers
      }
    });

  } catch (error) {
    console.error('Admin auth error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { success: false, message: 'Token expired' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Invalid token' },
      { status: 401 }
    );
  }
}

// Permission checker
export function checkPermission(requiredPermissions) {
  return function(request) {
    const permissions = JSON.parse(request.headers.get('x-admin-permissions') || '[]');
    const role = request.headers.get('x-admin-role');
    
    // Super admin has all permissions
    if (role === 'super_admin') {
      return null;
    }
    
    const hasPermission = requiredPermissions.every(perm => 
      permissions.includes(perm)
    );
    
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    return null;
  };
}