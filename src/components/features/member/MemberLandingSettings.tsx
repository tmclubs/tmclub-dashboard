import React, { useState, useEffect } from 'react';
import { Button, Input, Card, CardHeader, CardContent, LoadingSpinner } from '@/components/ui';
import { Plus, Trash2, Save, Eye, Upload, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { MemberLandingData } from '@/types/memberLanding';
import { memberLandingService } from '@/services/memberLandingService';
import { getBackendImageUrl } from '@/lib/utils/image';
import { Link } from 'react-router-dom';

interface MemberLandingSettingsProps {
  username: string;
}

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-sm font-medium text-gray-700 mb-1">{children}</label>
);

export const MemberLandingSettings: React.FC<MemberLandingSettingsProps> = ({ username }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<MemberLandingData | null>(null);

  useEffect(() => {
    loadData();
  }, [username]);

  const loadData = async () => {
    try {
      setLoading(true);
      const profile = await memberLandingService.getMyProfile();
      setData(profile);
    } catch (error) {
      toast.error('Gagal memuat data profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!data) return;
    try {
      setSaving(true);
      await memberLandingService.updateProfile(username, data);
      toast.success('Profil berhasil disimpan');
    } catch (error) {
      toast.error('Gagal menyimpan profil');
    } finally {
      setSaving(false);
    }
  };

  const addLink = () => {
    if (!data) return;
    const newLink = {
      id: Date.now().toString(),
      label: '',
      url: '',
    };
    setData({ ...data, links: [...data.links, newLink] });
  };

  const removeLink = (id: string) => {
    if (!data) return;
    setData({ ...data, links: data.links.filter(l => l.id !== id) });
  };

  const updateLink = (id: string, field: 'label' | 'url', value: string) => {
    if (!data) return;
    setData({
      ...data,
      links: data.links.map(l => l.id === id ? { ...l, [field]: value } : l)
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      // Optimistic update or waiting?
      // Since it returns a URL, we can just wait.
      const url = await memberLandingService.uploadAvatar(file);
      if (data) setData({ ...data, avatarUrl: url });
      toast.success('Avatar berhasil diupload');
    } catch (error) {
      toast.error('Gagal upload avatar');
    }
  };

  const handleHeaderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await memberLandingService.uploadHeader(file);
      if (data) setData({ ...data, headerUrl: url });
      toast.success('Header image berhasil diupload');
    } catch (error) {
      toast.error('Gagal upload header image');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!data) return <div>Error loading data</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Landing Page Settings</h2>
          <p className="text-sm text-gray-500">Atur tampilan halaman profil publik Anda.</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/member/${username}`} target="_blank">
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </Link>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <h3 className="font-medium">Informasi Dasar</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nama Tampilan</Label>
              <Input 
                value={data.displayName} 
                onChange={e => setData({ ...data, displayName: e.target.value })}
                placeholder="Nama yang muncul di header"
              />
            </div>
            <div>
              <Label>Bio Singkat</Label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                rows={4}
                value={data.bio}
                onChange={e => setData({ ...data, bio: e.target.value })}
                placeholder="Ceritakan sedikit tentang diri Anda..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Visual & Contact */}
        <Card>
          <CardHeader>
            <h3 className="font-medium">Tampilan & Kontak</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Warna Tema</Label>
              <div className="flex items-center gap-3 mt-1">
                <input
                  type="color"
                  value={data.themeColor}
                  onChange={e => setData({ ...data, themeColor: e.target.value })}
                  className="h-10 w-20 cursor-pointer rounded border border-gray-300 p-1"
                />
                <span className="text-sm text-gray-500">{data.themeColor}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox"
                id="showContact"
                checked={data.showContact}
                onChange={e => setData({ ...data, showContact: e.target.checked })}
                className="rounded text-orange-600 focus:ring-orange-500"
              />
              <label htmlFor="showContact" className="text-sm font-medium text-gray-700">
                Tampilkan Info Kontak (Email/HP) di Profil
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Profile Images */}
        <Card className="md:col-span-2">
          <CardHeader>
            <h3 className="font-medium">Gambar Profil</h3>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center space-y-3">
              <Label>Foto Profil (Avatar)</Label>
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100">
                {data.avatarUrl ? (
                  <img src={getBackendImageUrl(data.avatarUrl)} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <User className="w-8 h-8" />
                  </div>
                )}
              </div>
              <input 
                type="file" 
                id="avatar-upload" 
                className="hidden" 
                onChange={handleAvatarUpload} 
                accept="image/*" 
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => document.getElementById('avatar-upload')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" /> Upload Avatar
              </Button>
            </div>

            <div className="flex flex-col space-y-3">
              <Label>Gambar Header</Label>
              <div className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
                {data.headerUrl ? (
                  <img src={getBackendImageUrl(data.headerUrl)} alt="Header" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Header Image
                  </div>
                )}
              </div>
              <input 
                type="file" 
                id="header-upload" 
                className="hidden" 
                onChange={handleHeaderUpload} 
                accept="image/*" 
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => document.getElementById('header-upload')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" /> Upload Header
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Links */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <h3 className="font-medium">Tautan / Link</h3>
            <Button size="sm" variant="outline" onClick={addLink}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Link
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.links.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">Belum ada link ditambahkan.</p>
            )}
            {data.links.map((link) => (
              <div key={link.id} className="flex gap-3 items-start">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    placeholder="Label (mis: Instagram)"
                    value={link.label}
                    onChange={e => updateLink(link.id, 'label', e.target.value)}
                  />
                  <Input
                    placeholder="URL (https://...)"
                    value={link.url}
                    onChange={e => updateLink(link.id, 'url', e.target.value)}
                  />
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => removeLink(link.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
