// Test file untuk 401 flow
// Ini adalah file test sederhana untuk memverifikasi flow 401

import { apiClient } from '../api/client';

export const test401Flow = async () => {
  console.log('Testing 401 flow...');

  try {
    // Coba akses endpoint yang membutuhkan auth tanpa token
    const response = await apiClient.get('/account/me/');
    console.log('Response:', response);
  } catch (error) {
    console.log('Error caught:', error);

    // Harusnya redirect ke login
    console.log('Should redirect to login now...');
  }
};

// Test untuk token yang tidak valid
export const testInvalidToken = async () => {
  console.log('Testing invalid token flow...');

  // Set invalid token
  localStorage.setItem('auth_token', 'invalid-token-123');

  try {
    const response = await apiClient.get('/account/me/');
    console.log('Response:', response);
  } catch (error) {
    console.log('Error caught with invalid token:', error);
    console.log('Should redirect to login now...');
  }
};

// Test untuk logout
export const testLogout = () => {
  console.log('Testing logout flow...');

  // Set some auth data
  localStorage.setItem('auth_token', 'some-token');
  localStorage.setItem('user_data', JSON.stringify({ id: 1, name: 'Test User' }));

  console.log('Auth data before logout:', {
    token: localStorage.getItem('auth_token'),
    user: localStorage.getItem('user_data')
  });

  // Import logout function
  import('../api/client').then(({ logout }) => {
    logout();

    console.log('Auth data after logout:', {
      token: localStorage.getItem('auth_token'),
      user: localStorage.getItem('user_data')
    });

    console.log('Should redirect to login now...');
  });
};