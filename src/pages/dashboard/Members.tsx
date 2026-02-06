import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, Loader2 } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { MemberCard, Member } from '@/components/features/members/MemberCard';
import { MemberForm, MemberFormData } from '@/components/features/members/MemberForm';
import { memberService } from '@/services/memberService';
import { useCompanies } from '@/lib/hooks/useCompanies';
import { toast } from 'react-hot-toast';

import { useNavigate } from 'react-router-dom';

import { usePermissions } from '@/lib/hooks/usePermissions';

export const MembersPage: React.FC = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch companies for the dropdown
  const { data: companies = [] } = useCompanies();
  const { isCompanyAdmin, isAdmin, getUserCompanyId } = usePermissions();

  const visibleCompanies = React.useMemo(() => {
    if (isCompanyAdmin() && !isAdmin()) {
      const userCompanyId = getUserCompanyId();
      return companies.filter(c => c.pk === userCompanyId);
    }
    return companies;
  }, [companies, isCompanyAdmin, isAdmin, getUserCompanyId]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const data = await memberService.getMembers();
      setMembers(data);
    } catch (error) {
      console.error(error);
      toast.error('Gagal memuat data user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleCreateMember = async (data: MemberFormData) => {
    try {
      if (selectedMember) {
        await memberService.updateMember(selectedMember.id, data);
        toast.success('User berhasil diperbarui');
      } else {
        await memberService.createMember(data);
        toast.success('User berhasil ditambahkan');
      }
      setShowForm(false);
      setSelectedMember(null);
      fetchMembers();
    } catch (error) {
      toast.error(selectedMember ? 'Gagal memperbarui user' : 'Gagal menambahkan user');
      console.error(error);
    }
  };

  const handleEdit = (member: Member) => {
    setSelectedMember(member);
    setShowForm(true);
  };

  const handleViewProfile = (member: Member) => {
    if (member.username) {
      navigate(`/member/${member.username}`);
    } else {
      toast.error('Username tidak tersedia untuk user ini');
    }
  };

  const filteredMembers = members.filter(member =>
    member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showForm) {
    return (
      <div className="p-6">
        <MemberForm
          member={selectedMember || undefined}
          companies={visibleCompanies.map(c => ({ id: String(c.pk), name: c.display_name }))}
          onSubmit={handleCreateMember}
          onCancel={() => {
            setShowForm(false);
            setSelectedMember(null);
          }}
          title={selectedMember ? 'Edit User' : 'Add New User'}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Kelola semua user dalam komunitas Anda</p>
        </div>
        <Button onClick={() => {
          setSelectedMember(null);
          setShowForm(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onEdit={() => handleEdit(member)}
              onView={() => handleViewProfile(member)}
            />
          ))}
          {filteredMembers.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              Tidak ada user ditemukan
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MembersPage;
