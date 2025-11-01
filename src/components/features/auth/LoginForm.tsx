import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { useAuthStore } from '@/lib/stores';
import { useGoogleAuth } from '@/lib/hooks/useGoogleAuth';
import { env } from '@/lib/config/env';

export interface LoginFormData {
  username: string; // Changed from email to username to support both email and username
  password: string;
  rememberMe: boolean;
}

export interface LoginFormProps {
  className?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  className,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';
  const { login, isLoading } = useAuthStore();
  const {
    loginWithRedirect,
    loginWithPopup,
    isLoading: isGoogleLoading,
    error: googleError,
    hasOAuthCallback
  } = useGoogleAuth({
    onSuccess: () => {
      // Redirect to returnUrl or dashboard after successful Google login
      navigate(decodeURIComponent(returnUrl));
    },
    redirectTo: decodeURIComponent(returnUrl)
  });

  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState<Partial<LoginFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    if (!formData.username) {
      newErrors.username = 'Email or username is required';
    }
    // Optional: validate email format if it looks like an email
    // else if (formData.username.includes('@') && !/\S+@\S+\.\S+/.test(formData.username)) {
    //   newErrors.username = 'Invalid email format';
    // }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    // Temporarily disabled password length validation for development
    // } else if (formData.password.length < 6) {
    //   newErrors.password = 'Password must be at least 6 characters';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      await login({
        username: formData.username,
        password: formData.password,
      });
      
      console.log('Login berhasil, akan redirect ke:', decodeURIComponent(returnUrl));
      // Redirect to returnUrl or dashboard after successful login
      navigate(decodeURIComponent(returnUrl));
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const handleGoogleLogin = () => {
    // Use popup for better UX, fallback to redirect
    try {
      loginWithPopup();
    } catch (error) {
      // If popup fails (e.g., blocked), use redirect
      loginWithRedirect();
    }
  };

  // Show loading state if OAuth callback is being processed
  React.useEffect(() => {
    if (hasOAuthCallback) {
      setError('Processing Google authentication...');
    }
  }, [hasOAuthCallback]);

  const handleInputChange = (field: keyof LoginFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className={className}>
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Sign in to your TMC account
            </p>
          </div>

          {/* Error Message */}
          {(error || googleError) && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{googleError || error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <Input
              label="Email or Username"
              type="text"
              placeholder="Enter your email or username"
              leftIcon={<Mail className="w-4 h-4" />}
              value={formData.username}
              onChange={handleInputChange('username')}
              error={errors.username}
              disabled={isLoading}
              autoComplete="username"
              required
            />

            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
                value={formData.password}
                onChange={handleInputChange('password')}
                error={errors.password}
                disabled={isLoading}
                autoComplete="current-password"
                required
              />

              {/* Forgot Password Link */}
              <div className="mt-2 text-right">
                <button
                  type="button"
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors touch-manipulation"
                  disabled={isLoading}
                  aria-label="Reset password"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full touch-manipulation"
              loading={isLoading}
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-4 sm:my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google Login Button */}
          {env.enableGoogleAuth && (
            <Button
              variant="outline"
              className="w-full touch-manipulation"
              onClick={handleGoogleLogin}
              disabled={isLoading || isGoogleLoading}
              loading={isGoogleLoading}
              size="lg"
              leftIcon={
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              }
            >
              {isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}
            </Button>
          )}

          {/* Google Auth Disabled Message */}
          {!env.enableGoogleAuth && (
            <div className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <p className="text-gray-500 text-sm">
                Google authentication is currently disabled
              </p>
            </div>
          )}

          {/* Sign Up Link */}
          <div className="text-center mt-4 sm:mt-6">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a
                href="/register"
                className="font-medium text-orange-600 hover:text-orange-700 transition-colors touch-manipulation"
              >
                Sign up for free
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};