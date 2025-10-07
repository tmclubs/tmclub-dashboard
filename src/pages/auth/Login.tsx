import React, { useState } from 'react';
import { LoginForm } from '@/components/features/auth';
import { LoginFormData } from '@/components/features/auth';
import { useLogin, useGoogleLogin } from '@/lib/hooks/useAuth';

export const Login: React.FC = () => {
  const [error, setError] = useState<string | undefined>();

  const loginMutation = useLogin();
  const googleLoginMutation = useGoogleLogin();

  const handleSubmit = async (data: LoginFormData) => {
    setError(undefined);

    // Use username/email as username field for API
    const username = data.email.includes('@') ? data.email.split('@')[0] : data.email;

    loginMutation.mutate({
      username: data.email,
      password: data.password,
    });
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth with proper OAuth flow
    // For now, we'll simulate Google login
    googleLoginMutation.mutate({
      uid: 'google_user_123',
      email: 'user@gmail.com',
      name: 'Google User',
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 px-4">
      {/* Demo credentials info */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm border border-orange-200 rounded-lg p-3 shadow-sm">
        <p className="text-xs text-orange-800">
          <strong className="text-xs">Demo:</strong><br />
          Email: admin@tmc.id<br />
          Password: password
        </p>
      </div>

      <LoginForm
        onSubmit={handleSubmit}
        onGoogleLogin={handleGoogleLogin}
        loading={loginMutation.isPending || googleLoginMutation.isPending}
        error={error}
      />
    </div>
  );
};