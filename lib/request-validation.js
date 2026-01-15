// lib/request-validation.js
export function validateRequest(request) {
  const errors = [];
  
  // Check content type for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      errors.push('Content-Type must be application/json');
    }
  }
  
  // Check for common attack patterns in URL
  const url = request.url;
  const suspiciousPatterns = [
    /\.\.\//g, // Directory traversal
    /<script>/gi, // Script tags
    /javascript:/gi, // JavaScript protocol
    /onload=/gi, // Event handlers
    /union.*select/gi, // SQL injection
  ];
  
  suspiciousPatterns.forEach(pattern => {
    if (pattern.test(url)) {
      errors.push('Suspicious pattern detected in request');
    }
  });
  
  // Validate user agent
  const userAgent = request.headers.get('user-agent');
  if (!userAgent || userAgent.length > 500) {
    errors.push('Invalid user agent');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}