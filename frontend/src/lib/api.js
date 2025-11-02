export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Log API configuration on app start
if (typeof window !== 'undefined') {
  console.log('🔧 API Configuration:', {
    API_BASE,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    isProduction: process.env.NODE_ENV === 'production',
  });
}

/**
 * Helper to parse error response and extract detailed error message
 */
async function parseErrorResponse(res) {
  try {
    const data = await res.json();
    return {
      statusCode: res.status,
      statusText: res.statusText,
      error: data.error || data.message || 'Unknown error',
      details: data.details || data.data || null,
    };
  } catch {
    return {
      statusCode: res.status,
      statusText: res.statusText,
      error: res.statusText,
      details: null,
    };
  }
}

export async function apiGet(path) {
  const url = `${API_BASE}${path}`;
  const startTime = performance.now();

  console.log(`\n📡 [GET] Fetching: ${path}`);
  console.log(`   URL: ${url}`);

  try {
    const res = await fetch(url);
    const duration = performance.now() - startTime;

    if (!res.ok) {
      const errorInfo = await parseErrorResponse(res);
      console.error(`❌ [GET ${res.status}] ${path} (${duration.toFixed(2)}ms)`);
      console.error(`   Reason: ${errorInfo.statusText}`);
      console.error(`   Message: ${errorInfo.error}`);
      if (errorInfo.details) {
        console.error(`   Details:`, errorInfo.details);
      }
      throw new Error(`GET ${path} failed with status ${res.status}: ${errorInfo.error}`);
    }

    const data = await res.json();
    const responseSize = JSON.stringify(data).length;
    console.log(`✅ [GET 200] ${path} (${duration.toFixed(2)}ms)`);
    console.log(`   Response: ${Array.isArray(data) ? data.length + ' items' : typeof data === 'object' ? 'object' : 'scalar value'}`);
    console.log(`   Size: ${(responseSize / 1024).toFixed(2)}KB`);

    return data;
  } catch (error) {
    const duration = performance.now() - startTime;

    if (error instanceof TypeError) {
      console.error(`🚨 [Network Error] ${path} (${duration.toFixed(2)}ms)`);
      console.error(`   Type: ${error.name}`);
      console.error(`   Reason: ${error.message}`);
      console.error(`   Possible causes:`);
      console.error(`   - Server is not running on ${API_BASE}`);
      console.error(`   - CORS is not properly configured`);
      console.error(`   - Network connection issue`);
    } else {
      console.error(`🚨 [Request Error] ${path} (${duration.toFixed(2)}ms)`);
      console.error(`   Message: ${error.message}`);
    }
    throw error;
  }
}

export async function apiPost(path, body) {
  const url = `${API_BASE}${path}`;
  const startTime = performance.now();

  console.log(`\n📤 [POST] Sending: ${path}`);
  console.log(`   URL: ${url}`);
  console.log(`   Payload:`, body);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });

    const duration = performance.now() - startTime;

    if (!res.ok) {
      const errorInfo = await parseErrorResponse(res);
      console.error(`❌ [POST ${res.status}] ${path} (${duration.toFixed(2)}ms)`);
      console.error(`   Reason: ${errorInfo.statusText}`);
      console.error(`   Message: ${errorInfo.error}`);
      if (errorInfo.details) {
        console.error(`   Details:`, errorInfo.details);
      }
      throw new Error(`POST ${path} failed with status ${res.status}: ${errorInfo.error}`);
    }

    const data = await res.json();
    console.log(`✅ [POST ${res.status}] ${path} (${duration.toFixed(2)}ms)`);
    console.log(`   Created resource:`, data.id || data.name || 'unknown');

    return data;
  } catch (error) {
    const duration = performance.now() - startTime;

    if (error instanceof TypeError) {
      console.error(`🚨 [Network Error] ${path} (${duration.toFixed(2)}ms)`);
      console.error(`   Type: ${error.name}`);
      console.error(`   Reason: ${error.message}`);
      console.error(`   Possible causes:`);
      console.error(`   - Server is not running on ${API_BASE}`);
      console.error(`   - CORS is not properly configured`);
      console.error(`   - Network connection issue`);
    } else {
      console.error(`🚨 [Request Error] ${path} (${duration.toFixed(2)}ms)`);
      console.error(`   Message: ${error.message}`);
    }
    throw error;
  }
}

export async function apiPut(path, body) {
  const url = `${API_BASE}${path}`;
  const startTime = performance.now();

  console.log(`\n✏️  [PUT] Updating: ${path}`);
  console.log(`   URL: ${url}`);
  console.log(`   Payload:`, body);

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
    });

    const duration = performance.now() - startTime;

    if (!res.ok) {
      const errorInfo = await parseErrorResponse(res);
      console.error(`❌ [PUT ${res.status}] ${path} (${duration.toFixed(2)}ms)`);
      console.error(`   Reason: ${errorInfo.statusText}`);
      console.error(`   Message: ${errorInfo.error}`);
      if (errorInfo.details) {
        console.error(`   Details:`, errorInfo.details);
      }
      throw new Error(`PUT ${path} failed with status ${res.status}: ${errorInfo.error}`);
    }

    const data = await res.json();
    console.log(`✅ [PUT ${res.status}] ${path} (${duration.toFixed(2)}ms)`);
    console.log(`   Updated resource:`, data.id || data.name || 'unknown');

    return data;
  } catch (error) {
    const duration = performance.now() - startTime;

    if (error instanceof TypeError) {
      console.error(`🚨 [Network Error] ${path} (${duration.toFixed(2)}ms)`);
      console.error(`   Type: ${error.name}`);
      console.error(`   Reason: ${error.message}`);
      console.error(`   Possible causes:`);
      console.error(`   - Server is not running on ${API_BASE}`);
      console.error(`   - CORS is not properly configured`);
      console.error(`   - Network connection issue`);
    } else {
      console.error(`🚨 [Request Error] ${path} (${duration.toFixed(2)}ms)`);
      console.error(`   Message: ${error.message}`);
    }
    throw error;
  }
}

export async function apiDelete(path) {
  const url = `${API_BASE}${path}`;
  const startTime = performance.now();

  console.log(`\n🗑️  [DELETE] Removing: ${path}`);
  console.log(`   URL: ${url}`);

  try {
    const res = await fetch(url, { method: 'DELETE' });
    const duration = performance.now() - startTime;

    if (!res.ok) {
      const errorInfo = await parseErrorResponse(res);
      console.error(`❌ [DELETE ${res.status}] ${path} (${duration.toFixed(2)}ms)`);
      console.error(`   Reason: ${errorInfo.statusText}`);
      console.error(`   Message: ${errorInfo.error}`);
      if (errorInfo.details) {
        console.error(`   Details:`, errorInfo.details);
      }
      throw new Error(`DELETE ${path} failed with status ${res.status}: ${errorInfo.error}`);
    }

    const data = await res.json();
    console.log(`✅ [DELETE ${res.status}] ${path} (${duration.toFixed(2)}ms)`);

    return data;
  } catch (error) {
    const duration = performance.now() - startTime;

    if (error instanceof TypeError) {
      console.error(`🚨 [Network Error] ${path} (${duration.toFixed(2)}ms)`);
      console.error(`   Type: ${error.name}`);
      console.error(`   Reason: ${error.message}`);
      console.error(`   Possible causes:`);
      console.error(`   - Server is not running on ${API_BASE}`);
      console.error(`   - CORS is not properly configured`);
      console.error(`   - Network connection issue`);
    } else {
      console.error(`🚨 [Request Error] ${path} (${duration.toFixed(2)}ms)`);
      console.error(`   Message: ${error.message}`);
    }
    throw error;
  }
}
