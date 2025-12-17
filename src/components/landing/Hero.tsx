import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { LazyImage } from '@/components/ui/LazyImage';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useBlogPosts } from '@/lib/hooks/useBlog';
import { getBackendImageUrl } from '@/lib/utils/image';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { data: blogPosts, isLoading } = useBlogPosts({ status: 'published', ordering: '-created_at' });

  const latestPosts = blogPosts?.slice(0, 4) || [];

  const handleStartClick = () => {
    if (isAuthenticated) {
      // Jika sudah login, arahkan berdasarkan role
      if (user?.role === 'member') {
        navigate('/member');
      } else {
        navigate('/dashboard');
      }
    } else {
      // Jika belum login, arahkan ke halaman login
      navigate('/login');
    }
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
              Shaping Stories, Strengthening Identity
            </h1>
            <p className="mt-4 text-gray-600 text-base sm:text-lg max-w-2xl">
              Mari berkolaborasi dan turut membentuk kisah sukses bersama TMClub.
            </p>

            <div className="mt-8 md:mt-10 flex items-center justify-center sm:justify-start gap-4">
              <Button
                size="lg"
                className="shadow-sm"
                onClick={handleStartClick}
                aria-label="Mulai Sekarang"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Daftar Sekarang
              </Button>
            </div>

            <div className="mt-6 text-xs sm:text-sm text-gray-500">
              Gunakan akun untuk mengakses fitur lengkap events & analytics.
            </div>
          </div>

          <div className="hidden lg:block h-full min-h-[500px]">
            {isLoading ? (
               <div className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
               </div>
            ) : latestPosts.length > 0 ? (
              <div 
                className="relative group w-full h-full rounded-2xl overflow-hidden cursor-pointer shadow-xl transition-all hover:shadow-2xl"
                onClick={() => navigate(`/blog/${latestPosts[0].slug}`)}
              >
                <LazyImage
                  src={getBackendImageUrl(latestPosts[0].main_image_url) || '/hero.png'}
                  alt={latestPosts[0].title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  fallback={<LazyImage src="/hero.png" alt={latestPosts[0].title} className="w-full h-full object-cover" showSkeleton={false} />}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-8 transform transition-transform duration-300 translate-y-2 group-hover:translate-y-0">
                  <div className="mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-600/90 text-white text-xs font-bold tracking-wide uppercase backdrop-blur-sm">
                      Latest Update
                    </span>
                  </div>
                  
                  <h3 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-3 drop-shadow-lg">
                    {latestPosts[0].title}
                  </h3>
                  
                  {latestPosts[0].summary && (
                    <p className="text-gray-200 text-base md:text-lg line-clamp-3 mb-6 max-w-2xl font-medium drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                      {latestPosts[0].summary}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-white/90 text-sm font-medium">
                    <span className="flex items-center gap-2">
                      Read Article <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm h-full">
                <LazyImage
                  src="/hero.png"
                  alt="TMClub Community"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
