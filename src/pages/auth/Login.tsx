import React from 'react';
import { LoginForm } from '@/components/features/auth';

export const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 px-4">
      <LoginForm />
    </div>
  );
};