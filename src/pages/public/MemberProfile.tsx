import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Avatar, Card, CardHeader, CardContent, Button, LoadingSpinner } from '@/components/ui';
import { Mail, Phone, MapPin, Link as LinkIcon } from 'lucide-react';
import { MemberBio } from '@/components/public/MemberBio';
import { memberLandingService } from '@/services/memberLandingService';
import { MemberLandingData } from '@/types/memberLanding';
import PublicNavbar from '@/components/landing/PublicNavbar';

interface PublicMemberProfileData extends MemberLandingData {
  role: string;
  email?: string;
  phone?: string;
  location?: string;
  joinedAt?: string;
}

const PublicMemberProfilePage: React.FC = () => {
  const { username = '' } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<PublicMemberProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const landingData = await memberLandingService.getPublicProfile(username || 'member');

        setData({
          ...landingData,
          role: 'Member',
          email: 'member@tmclub.id',
          location: 'Jakarta, Indonesia',
        });
      } catch (error) {
        console.error('Failed to load profile', error);
        setError('Gagal memuat profil member. Member mungkin tidak ditemukan.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  if (loading) {
    return (
      <>
        <PublicNavbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <PublicNavbar />
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Member Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">{error || 'Data member tidak tersedia.'}</p>
          <Button onClick={() => navigate('/members')}>
            Kembali ke Daftar Member
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <PublicNavbar />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar profile */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="text-center">
                  <div className="flex flex-col items-center gap-4">
                    <Avatar name={data.displayName} src={data.avatarUrl} size="xl" className="w-24 h-24 border-4 border-white shadow" />
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{data.displayName}</h1>
                      <p className="text-sm text-gray-500">@{data.username}</p>
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-medium mt-2">
                        {data.role}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900">Tautan</h3>
                    {data.links.length > 0 ? (
                      <div className="space-y-2">
                        {data.links.map(link => (
                          <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm text-gray-600 hover:text-orange-600 transition-colors"
                          >
                            <LinkIcon className="w-4 h-4 mr-2" />
                            {link.label}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 italic">Tidak ada tautan.</p>
                    )}
                  </div>

                  {data.showContact && (
                    <div className="space-y-2 pt-4 border-t border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Kontak</h3>
                      {data.email && (<div className="flex items-center text-gray-600"><Mail className="w-4 h-4 mr-2" /><span className="text-sm">{data.email}</span></div>)}
                      {data.phone && (<div className="flex items-center text-gray-600"><Phone className="w-4 h-4 mr-2" /><span className="text-sm">{data.phone}</span></div>)}
                      {data.location && (<div className="flex items-center text-gray-600"><MapPin className="w-4 h-4 mr-2" /><span className="text-sm">{data.location}</span></div>)}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main content - Bio */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-bold text-gray-900">Tentang Saya</h2>
                </CardHeader>
                <CardContent>
                  <MemberBio
                    bio={data.bio}
                    isEditable={false}
                    showTitle={false}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default PublicMemberProfilePage;
