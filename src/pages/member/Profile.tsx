import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Avatar, Card, PageLoading, ErrorState } from '@/components/ui';
import { User, Mail, Phone, Calendar, Building, Edit, ArrowLeft } from 'lucide-react';
import { useAuth, useUpdateProfile, useProfile } from '@/lib/hooks/useAuth';
import { authApi, getAuthData } from '@/lib/api/auth';
import { toast } from 'react-hot-toast';

interface ProfileFormData {
  name: string;
  phone_number: string;
}

// Extended user interface with additional fields from backend
interface ExtendedUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name?: string;
  phone_number?: string;
  role: string;
  company_name?: string;
  event_registered?: number;
}

export const MemberProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { data: profile, isLoading: profileLoading, error: profileError, refetch } = useProfile();
  const updateProfile = useUpdateProfile();
  const [debug, setDebug] = useState<{ authorization_header: string | null; is_authenticated: boolean; user_email: string | null } | null>(null);
  const [debugAuth, setDebugAuth] = useState<{ status: number; body?: any; error?: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: user?.first_name || '',
    phone_number: user?.phone_number || '',
  });

  // Type assertion to access additional properties
  const extendedUser = (profile || user) as ExtendedUser | null;

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (profileLoading) {
    return <PageLoading text="Memuat profil..." />;
  }

  if (profileError) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 space-y-4">
        <ErrorState title="Gagal memuat profil" description={String(profileError)} onRetry={() => refetch()} />
        <Button
          variant="outline"
          onClick={async () => {
            try {
              const info = await authApi.debugAuth();
              setDebug(info);
            } catch (error) {
              toast.error('Gagal cek status autentikasi');
            }
          }}
        >
          Cek Status Autentikasi
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            try {
              const base = (await import('@/lib/config/env')).env.apiUrl;
              let token = getAuthData().token;
              const scheme = token && token.split('.').length === 3 ? 'Bearer' : 'Token';
              const headers = token ? { Authorization: `${scheme} ${token}` } : undefined;
              const resp = await fetch(`${base}/account/debug-auth/`, {
                headers,
              });
              const status = resp.status;
              let body: any = null;
              try { body = await resp.json(); } catch { body = await resp.text(); }
              setDebugAuth({ status, body: body });
            } catch (e: any) {
              setDebugAuth({ status: 0, error: String(e?.message || e) });
            }
          }}
        >
          Cek dengan Header
        </Button>
        {debug && (
          <Card className="p-4 w-full max-w-xl">
            <div className="text-sm text-gray-700">
              <div className="mb-2">Header: {debug.authorization_header || '-'}</div>
              <div className="mb-2">Authenticated: {debug.is_authenticated ? 'Ya' : 'Tidak'}</div>
              <div>Email: {debug.user_email || '-'}</div>
            </div>
          </Card>
        )}
        {debugAuth && (
          <Card className="p-4 w-full max-w-xl">
            <div className="text-sm text-gray-700">
              <div className="mb-2">Status: {debugAuth.status}</div>
              <div className="mb-2">Token: {(() => { const t = getAuthData().token; return t ? `${t.slice(0,3)}***${t.slice(-2)}` : '-'; })()}</div>
              <pre className="text-xs whitespace-pre-wrap break-all">{typeof debugAuth.body === 'string' ? debugAuth.body : JSON.stringify(debugAuth.body, null, 2)}</pre>
              {debugAuth.error && <div className="text-red-600 mt-2">{debugAuth.error}</div>}
            </div>
          </Card>
        )}
      </div>
    );
  }

  useEffect(() => {
    setFormData({
      name: extendedUser?.first_name || '',
      phone_number: extendedUser?.phone_number || '',
    });
  }, [extendedUser]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      // Reset form data when entering edit mode
      setFormData({
        name: user?.first_name || '',
        phone_number: user?.phone_number || '',
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateProfile.mutate(formData, {
      onSuccess: () => {
        setIsEditing(false);
        toast.success('Profil berhasil diperbarui!');
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : 'Gagal memperbarui profil');
      },
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original values
    setFormData({
      name: user?.first_name || '',
      phone_number: user?.phone_number || '',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Kembali</span>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
            </div>
            <Button
              variant={isEditing ? "outline" : "default"}
              size="sm"
              onClick={handleEditToggle}
              className="flex items-center space-x-2"
            >
              {isEditing ? (
                <>
                  <span>Batal</span>
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/member/events')}
              className="ml-2"
            >
              Lihat Event Saya
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <Card className="p-6">
              <div className="flex flex-col items-center">
                <Avatar
                  size="xl"
                  name={user?.first_name || user?.username || 'User'}
                  className="h-24 w-24 mb-4"
                />
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  {user?.first_name || user?.username || 'User'}
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  {user?.role === 'admin' ? 'Administrator' : 
                   user?.role === 'pic' ? 'Person In Charge' : 'Member'}
                </p>
                <div className="w-full space-y-2 text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{user?.email}</span>
                  </div>
                  {extendedUser?.company_name && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Building className="h-4 w-4" />
                      <span className="truncate">{extendedUser.company_name}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Details Card */}
          <div className="md:col-span-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Detail</h3>
              
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      id="phone_number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="submit"
                      disabled={updateProfile.isPending}
                      className="flex-1"
                    >
                      {updateProfile.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      className="flex-1"
                    >
                      Batal
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Nama Lengkap</p>
                      <p className="text-sm text-gray-600">{user?.first_name || '-'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-600">{user?.email || '-'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Nomor Telepon</p>
                      <p className="text-sm text-gray-600">{user?.phone_number || '-'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Building className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Perusahaan</p>
                      <p className="text-sm text-gray-600">{extendedUser?.company_name || '-'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Event Terdaftar</p>
                      <p className="text-sm text-gray-600">{extendedUser?.event_registered || 0} event</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberProfilePage;
