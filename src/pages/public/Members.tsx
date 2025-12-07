import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { memberLandingService } from '@/services/memberLandingService';
import { MemberLandingData } from '@/types/memberLanding';
import { Avatar, Card, CardHeader, CardContent, Button, LoadingSpinner, Input } from '@/components/ui';
import { Search, User } from 'lucide-react';
import PublicNavbar from '@/components/landing/PublicNavbar';

export const PublicMembersPage: React.FC = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<MemberLandingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await memberLandingService.getPublicMembers();
        setMembers(data);
      } catch (error) {
        console.error('Failed to load members', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const filteredMembers = members.filter(member => 
    member.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.bio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />
      <main className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Komunitas Kami
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Temukan dan terhubung dengan para profesional dan pegiat komunitas di TMClub.
          </p>
        </div>

        <div className="max-w-xl mx-auto mb-12 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input 
            placeholder="Cari member berdasarkan nama atau bio..." 
            className="pl-10 py-6 text-lg rounded-full shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMembers.map((member) => (
              <Card 
                key={member.username} 
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigate(`/member/${member.username}`)}
              >
                <div className="h-32 bg-gradient-to-r from-orange-400 to-orange-600 relative">
                  {/* Decorative pattern or header image if available */}
                </div>
                <CardHeader className="relative pt-0 pb-2">
                  <div className="flex justify-center -mt-12 mb-4">
                    <Avatar 
                      src={member.avatarUrl} 
                      name={member.displayName}
                      size="xl"
                      className="w-24 h-24 border-4 border-white shadow-md group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                      {member.displayName}
                    </h3>
                    <p className="text-sm text-gray-500">@{member.username}</p>
                  </div>
                </CardHeader>
                <CardContent className="text-center pb-8">
                  <p className="text-gray-600 line-clamp-2 min-h-[3rem]">
                    {member.bio || 'Belum ada bio.'}
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-6 w-full group-hover:bg-orange-50 group-hover:text-orange-600 group-hover:border-orange-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/member/${member.username}`);
                    }}
                  >
                    Lihat Profil
                  </Button>
                </CardContent>
              </Card>
            ))}
            
            {filteredMembers.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Tidak ada member yang ditemukan.</p>
              </div>
            )}
          </div>
        )}
      </div>
      </main>
    </div>
  );
};
