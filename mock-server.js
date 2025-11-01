import express from 'express';
import cors from 'cors';
const app = express();
const PORT = 1338;

// Middleware
app.use(cors());
app.use(express.json());

// Mock user data
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@tmclub.id',
    password: 'admin123',
    role: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    company: 'TMC Admin'
  },
  {
    id: 2,
    username: 'user',
    email: 'user@tmclub.id',
    password: 'user123',
    role: 'member',
    firstName: 'Test',
    lastName: 'User',
    company: 'Test Company'
  }
];

// Mock login endpoint
app.post('/authentication/manual-login/', (req, res) => {
  const { username, password } = req.body;
  
  console.log('Mock API: Login attempt:', { username, password });
  
  // Find user by username or email
  const user = mockUsers.find(u => 
    (u.username === username || u.email === username) && u.password === password
  );
  
  if (user) {
    // Generate mock token
    const token = `mock_token_${user.id}_${Date.now()}`;
    
    const response = {
      status_code: 200,
      success_code: '2000102',
      message: {
        en: 'Login successful',
        id: 'Login berhasil'
      },
      data: {
        token: token,
        login_method: 'manual',
        role: user.role,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          company: user.company,
          role: user.role
        }
      }
    };
    
    console.log('Mock API: Login successful for user:', user.username);
    res.json(response);
  } else {
    const errorResponse = {
      status_code: 422,
      success_code: '4220101',
      message: {
        en: 'Invalid username or password',
        id: 'Username atau password salah'
      },
      data: null
    };
    
    console.log('Mock API: Login failed for username:', username);
    res.status(422).json(errorResponse);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Mock TMC API Server is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock TMC API Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('- POST /authentication/manual-login/');
  console.log('- GET /health');
  console.log('\nTest users:');
  console.log('- admin / admin123 (admin role)');
  console.log('- user / user123 (member role)');
});