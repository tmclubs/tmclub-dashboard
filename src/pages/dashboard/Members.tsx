import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { MemberCard } from '../../components/features/members/MemberCard';
import { MemberForm } from '../../components/features/members/MemberForm';
import { MemberFilters } from '../../components/features/members/MemberFilters';
import { Plus } from 'lucide-react';

export const MembersPage: React.FC = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock member data
  const mockMembers = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@toyota-indonesia.com',
      avatar: null,
      role: 'Manager',
      company: 'Toyota Motor Manufacturing Indonesia',
      department: 'Production',
      joinDate: '2023-01-15',
      status: 'active',
      skills: ['Lean Manufacturing', 'Quality Control', 'Team Leadership'],
      location: 'Jakarta, Indonesia',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/johndoe',
        twitter: '@johndoe'
      },
      activity: {
        eventsAttended: 12,
        surveysCompleted: 8,
        lastLogin: '2024-10-06'
      }
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@daihatsu.com',
      avatar: null,
      role: 'Supervisor',
      company: 'PT Astra Daihatsu Motor',
      department: 'R&D',
      joinDate: '2023-03-22',
      status: 'active',
      skills: ['Product Design', 'CAD/CAM', 'Project Management'],
      location: 'Jakarta, Indonesia',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/sarahjohnson'
      },
      activity: {
        eventsAttended: 8,
        surveysCompleted: 6,
        lastLogin: '2024-10-07'
      }
    },
    {
      id: '3',
      name: 'Michael Chen',
      email: 'michael.chen@honda.com',
      avatar: null,
      role: 'Admin',
      company: 'PT Honda Prospect Motor',
      department: 'IT',
      joinDate: '2022-11-10',
      status: 'active',
      skills: ['System Administration', 'Cloud Computing', 'Cybersecurity'],
      location: 'Surabaya, Indonesia',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/michaelchen',
        github: 'https://github.com/michaelchen'
      },
      activity: {
        eventsAttended: 15,
        surveysCompleted: 10,
        lastLogin: '2024-10-07'
      }
    },
    {
      id: '4',
      name: 'Lisa Anderson',
      email: 'lisa.anderson@suzuki.com',
      avatar: null,
      role: 'Member',
      company: 'PT Suzuki Indomobil Motor',
      department: 'Marketing',
      joinDate: '2023-06-01',
      status: 'inactive',
      skills: ['Digital Marketing', 'Content Creation', 'Brand Management'],
      location: 'Bandung, Indonesia',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/lisaanderson',
        instagram: '@lisaanderson'
      },
      activity: {
        eventsAttended: 4,
        surveysCompleted: 3,
        lastLogin: '2024-09-28'
      }
    },
    {
      id: '5',
      name: 'David Kim',
      email: 'david.kim@mitsubishi.com',
      avatar: null,
      role: 'Member',
      company: 'PT Mitsubishi Motors Krama Yudha',
      department: 'Engineering',
      joinDate: '2023-08-14',
      status: 'pending',
      skills: ['Mechanical Engineering', 'Automotive Systems', 'CAD Design'],
      location: 'Bekasi, Indonesia',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/davidkim'
      },
      activity: {
        eventsAttended: 2,
        surveysCompleted: 1,
        lastLogin: '2024-10-05'
      }
    },
    {
      id: '6',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@toyota-indonesia.com',
      avatar: null,
      role: 'Supervisor',
      company: 'Toyota Motor Manufacturing Indonesia',
      department: 'HR',
      joinDate: '2022-05-20',
      status: 'active',
      skills: ['Recruitment', 'Employee Relations', 'Training & Development'],
      location: 'Jakarta, Indonesia',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/emilyrodriguez'
      },
      activity: {
        eventsAttended: 10,
        surveysCompleted: 7,
        lastLogin: '2024-10-06'
      }
    }
  ];

  useEffect(() => {
    // Simulate loading members
    const loadMembers = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMembers(mockMembers);
      setFilteredMembers(mockMembers);
      setLoading(false);
    };

    loadMembers();
  }, []);

  useEffect(() => {
    // Filter members based on current filters
    let filtered = members.filter(member => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          member.name.toLowerCase().includes(searchLower) ||
          member.email.toLowerCase().includes(searchLower) ||
          member.company.toLowerCase().includes(searchLower) ||
          member.role.toLowerCase().includes(searchLower)
        );
      }

      // Company filter
      if (companyFilter !== 'all') {
        const companyMap: { [key: string]: string } = {
          'toyota': 'Toyota Motor Manufacturing Indonesia',
          'daihatsu': 'PT Astra Daihatsu Motor',
          'honda': 'PT Honda Prospect Motor',
          'suzuki': 'PT Suzuki Indomobil Motor',
          'mitsubishi': 'PT Mitsubishi Motors Krama Yudha',
        };
        return member.company === companyMap[companyFilter];
      }

      // Role filter
      if (roleFilter !== 'all' && member.role.toLowerCase() !== roleFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all' && member.status !== statusFilter) {
        return false;
      }

      return true;
    });

    setFilteredMembers(filtered);
  }, [members, searchTerm, companyFilter, roleFilter, statusFilter]);

  const handleAddMember = () => {
    setEditingMember(null);
    setShowAddModal(true);
  };

  const handleEditMember = (member: any) => {
    setEditingMember(member);
    setShowAddModal(true);
  };

  const handleSaveMember = async (data: any) => {
    // Simulate saving member
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (editingMember) {
      // Update existing member
      setMembers(prev => prev.map(member =>
        member.id === editingMember.id
          ? { ...member, ...data }
          : member
      ));
    } else {
      // Add new member
      const newMember = {
        id: Date.now().toString(),
        ...data,
        joinDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        activity: {
          eventsAttended: 0,
          surveysCompleted: 0,
          lastLogin: new Date().toISOString().split('T')[0]
        }
      };
      setMembers(prev => [newMember, ...prev]);
    }

    setShowAddModal(false);
    setEditingMember(null);
  };

  const handleDeleteMember = async (memberId: string) => {
    if (confirm('Are you sure you want to delete this member?')) {
      setMembers(prev => prev.filter(member => member.id !== memberId));
    }
  };

  const handleInviteMember = () => {
    // Implement invite member functionality
    console.log('Invite member');
  };

  const handleExportMembers = () => {
    // Implement export functionality
    const csv = [
      ['Name', 'Email', 'Company', 'Role', 'Status', 'Join Date'],
      ...filteredMembers.map(member => [
        member.name,
        member.email,
        member.company,
        member.role,
        member.status,
        member.joinDate
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'members.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <p className="text-gray-600 mt-1">Manage community members and their profiles</p>
        </div>
      </div>

      {/* Member Filters */}
      <MemberFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        companyFilter={companyFilter}
        onCompanyFilterChange={setCompanyFilter}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onAddMember={handleAddMember}
        onInviteMember={handleInviteMember}
        onExportMembers={handleExportMembers}
        memberCount={filteredMembers.length}
      />

      {/* Members Grid */}
      <Card className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : filteredMembers.length === 0 ? (
          <EmptyState
            type="users"
            title="No members found"
            description={
              searchTerm || companyFilter !== 'all' || roleFilter !== 'all' || statusFilter !== 'all'
                ? 'No members match the selected filters. Try adjusting your criteria.'
                : 'No members have been added yet. Start by adding the first member to your community.'
            }
            action={{
              text: 'Add Member',
              onClick: handleAddMember,
              icon: <Plus className="w-4 h-4" />
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                variant="default"
                onEdit={() => handleEditMember(member)}
                onDelete={() => handleDeleteMember(member.id)}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Add/Edit Member Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingMember ? 'Edit Member' : 'Add New Member'}
        size="lg"
      >
        <MemberForm
          member={editingMember}
          companies={[]} // Add empty array for now, should be populated with actual companies
          onSubmit={handleSaveMember}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>
    </div>
  );
};