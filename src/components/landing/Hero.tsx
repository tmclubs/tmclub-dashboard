import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleStartClick = () => {
    if (isAuthenticated) {
      // Jika sudah login, arahkan berdasarkan role
      if (user?.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } else {
      // Jika belum login, arahkan ke halaman login
      navigate('/login');
    }
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-orange-200 blur-3xl opacity-50" />
        <div className="absolute top-1/2 -right-24 w-72 h-72 rounded-full bg-orange-300 blur-3xl opacity-40" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-sm mb-4">
              <Sparkles className="w-4 h-4" />
              <span>Platform komunitas dan event TMClub</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Bangun Komunitas, Kelola Event, dan Bagikan Cerita
            </h1>
            <p className="mt-4 text-gray-600 text-base sm:text-lg max-w-2xl">
              Modern, minimalis, dan cepat. Satu tempat untuk profil perusahaan, pengelolaan event, dan blog yang informatif.
            </p>

            <div className="mt-8 md:mt-10 flex items-center justify-center sm:justify-start gap-4">
              <Button
                size="lg"
                className="shadow-sm"
                onClick={handleStartClick}
                aria-label="Mulai Sekarang"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Mulai Sekarang
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleRegisterClick}
                aria-label="Daftar Gratis"
              >
                Daftar Gratis
              </Button>
            </div>

            <div className="mt-6 text-xs sm:text-sm text-gray-500">
              Gunakan akun untuk mengakses fitur lengkap events & analytics.
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="h-24 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 opacity-80" />
                <div className="h-24 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300" />
                <div className="h-24 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200" />
                <div className="h-24 rounded-xl bg-gradient-to-br from-orange-200 to-orange-300" />
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Ilustrasi antarmuka sederhana dengan palet warna existing.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;