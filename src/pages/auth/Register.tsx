import React, { useState } from 'react';
import { RegisterForm } from '@/components/features/auth';
import { RegisterFormData } from '@/components/features/auth';
import { useRegister, useGoogleLogin } from '@/lib/hooks/useAuth';

export const Register: React.FC = () => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const registerMutation = useRegister();
  const googleLoginMutation = useGoogleLogin();

  const handleSubmit = async (data: RegisterFormData) => {
    setError(undefined);
    setSuccess(undefined);

    // Extract username from email for API
    const username = data.email.includes('@') ? data.email.split('@')[0] : data.email;

    registerMutation.mutate({
      username,
      email: data.email,
      password: data.password,
      first_name: `${data.firstName} ${data.lastName}`,
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 px-4 py-8">
      {/* Info banner */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm border border-orange-200 rounded-lg p-3 shadow-sm max-w-xs">
        <p className="text-xs text-orange-800">
          <strong className="text-xs">Join TMC Community</strong><br />
          Connect with Toyota manufacturers and industry professionals
        </p>
      </div>

      <RegisterForm
        onSubmit={handleSubmit}
        onGoogleLogin={handleGoogleLogin}
        loading={registerMutation.isPending || googleLoginMutation.isPending}
        error={error}
        success={success}
      />
    </div>
  );
};