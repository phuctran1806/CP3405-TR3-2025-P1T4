# Quick Login API Guide

## Overview

The new quick login system allows users to select a role and login without a password (Student, Lecturer, Guest). Admin role still requires traditional password authentication.

## API Endpoints

### 1. Quick Login (Password-Free)

**Endpoint**: `POST /api/auth/quick-login`

**Supported Roles**: Student, Lecturer, Guest

**Request Body**:
```json
{
  "role": "student",
  "name": "John Doe"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "tracking_id": "550e8400-e29b-41d4-a716-446655440000",
  "role": "student",
  "name": "John Doe"
}
```

**Field Descriptions**:
- `access_token`: JWT token for subsequent API calls
- `tracking_id`: Unique tracking ID for identifying and tracking user sessions
- `role`: User's selected role
- `name`: User's display name

### 2. Traditional Login (Password Required)

**Endpoint**: `POST /api/auth/login`

**Supported Roles**: Admin (required), other roles optional

**Request Example**:
```bash
curl -X POST "http://45.77.44.161/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@jcu.edu.au&password=admin123"
```

**Response**: Returns complete Token object with user information

### 3. Get Session Information

**Endpoint**: `GET /api/auth/session`

**Description**: Supports both quick login and traditional login

**Request Example**:
```bash
curl -X GET "http://45.77.44.161/api/auth/session" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Quick Login Response**:
```json
{
  "session_type": "quick_login",
  "tracking_id": "550e8400-e29b-41d4-a716-446655440000",
  "role": "student",
  "name": "John Doe",
  "authenticated": true
}
```

**Traditional Login Response**:
```json
{
  "session_type": "traditional",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "admin@jcu.edu.au",
  "authenticated": true
}
```

## Frontend Integration Examples

### React/Vue Example

```javascript
// 1. Quick Login
async function quickLogin(role, name) {
  const response = await fetch('http://45.77.44.161/api/auth/quick-login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      role: role,  // "student" | "lecturer" | "guest"
      name: name || "Anonymous User"
    })
  });
  
  const data = await response.json();
  
  // Save token and tracking_id
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('tracking_id', data.tracking_id);
  localStorage.setItem('user_role', data.role);
  localStorage.setItem('user_name', data.name);
  
  return data;
}

// 2. Get Session Info
async function getSession() {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('http://45.77.44.161/api/auth/session', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
}

// 3. Usage Example
const loginResult = await quickLogin('student', 'Jane Smith');
console.log('Tracking ID:', loginResult.tracking_id);

const session = await getSession();
console.log('Current session:', session);
```

### React Native Example (Expo)

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

interface QuickLoginResponse {
  access_token: string;
  tracking_id: string;
  role: string;
  name: string;
}

async function quickLogin(
  role: 'student' | 'lecturer' | 'guest',
  name?: string
): Promise<QuickLoginResponse> {
  const response = await fetch('http://45.77.44.161/api/auth/quick-login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      role,
      name: name || 'Anonymous User'
    })
  });
  
  if (!response.ok) {
    throw new Error('Login failed');
  }
  
  const data: QuickLoginResponse = await response.json();
  
  // Save to local storage
  await AsyncStorage.multiSet([
    ['access_token', data.access_token],
    ['tracking_id', data.tracking_id],
    ['user_role', data.role],
    ['user_name', data.name],
  ]);
  
  return data;
}

// Role Selector Component Example
function RoleSelector() {
  const handleRoleSelect = async (role: 'student' | 'lecturer' | 'guest') => {
    try {
      const result = await quickLogin(role);
      console.log('Logged in with tracking ID:', result.tracking_id);
      // Navigate to home screen
    } catch (error) {
      console.error('Login error:', error);
    }
  };
  
  return (
    <View>
      <Button title="Login as Student" onPress={() => handleRoleSelect('student')} />
      <Button title="Login as Lecturer" onPress={() => handleRoleSelect('lecturer')} />
      <Button title="Login as Guest" onPress={() => handleRoleSelect('guest')} />
    </View>
  );
}
```

## Using tracking_id for User Tracking

In subsequent API calls, users are automatically identified through the JWT token:

```javascript
// All authenticated API calls
async function makeAuthenticatedRequest(url, options = {}) {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
}

// Example: Reserve a seat
const reservation = await makeAuthenticatedRequest(
  'http://45.77.44.161/api/reservations',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      seat_id: 'seat-123',
      // tracking_id automatically extracted from token
    })
  }
);
```

## Role Descriptions

| Role | Login Method | Permissions |
|------|-------------|-------------|
| **Student** | Quick login (no password) | Reserve seats, view availability |
| **Lecturer** | Quick login (no password) | Priority booking, view occupancy |
| **Guest** | Quick login (no password) | View seat availability only |
| **Admin** | Traditional login (password required) | Full admin access, analytics dashboard |

## cURL Test Commands

```bash
# 1. Quick login as Student
curl -X POST "http://45.77.44.161/api/auth/quick-login" \
  -H "Content-Type: application/json" \
  -d '{"role":"student","name":"Test Student"}'

# 2. Quick login as Lecturer
curl -X POST "http://45.77.44.161/api/auth/quick-login" \
  -H "Content-Type: application/json" \
  -d '{"role":"lecturer","name":"Test Lecturer"}'

# 3. Get session info (replace YOUR_TOKEN)
curl -X GET "http://45.77.44.161/api/auth/session" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Admin traditional login
curl -X POST "http://45.77.44.161/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@jcu.edu.au&password=admin123"

# 5. Try Admin quick login (should fail with 403)
curl -X POST "http://45.77.44.161/api/auth/quick-login" \
  -H "Content-Type: application/json" \
  -d '{"role":"admin","name":"Admin User"}'
```

## Security Considerations

1. **tracking_id Uniqueness**: Each quick login generates a new tracking_id
2. **Token Expiration**: JWT tokens have expiration time, handle expiry appropriately
3. **Admin Protection**: Admin role cannot use quick login, must authenticate with password
4. **Frontend Storage**: Recommend using httpOnly cookies or secure local storage solutions

## Testing Results

All API endpoints have been tested locally and passed:

- ✅ Student quick login
- ✅ Lecturer quick login  
- ✅ Guest quick login (with default name)
- ✅ Admin quick login rejection (403 Forbidden)
- ✅ Session info retrieval
- ✅ JWT token generation with tracking_id

## Changelog

- **2025-10-14**: Added quick login feature supporting Student/Lecturer/Guest password-free login
- **2025-10-14**: Added `/api/auth/session` endpoint for retrieving session information
