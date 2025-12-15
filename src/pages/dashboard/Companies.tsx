import React, { useState } from 'react';
import {
  CompanyCard,
  CompanyForm,
  Company as CompanyCardType,
} from '@/components/features/companies';
import { CompanyList } from '@/components/features/companies/CompanyList';
import { Button, ConfirmDialog, EmptyState, LoadingSpinner, Input, Badge } from '@/components/ui';
import { Plus, Search, Filter, Grid3x3, List, Building2, Mail, Phone, MapPin } from 'lucide-react';
import { useCompanies, useCreateCompany, useUpdateCompany, useDeleteCompany } from '@/lib/hooks/useCompanies';
import { useProfile } from '@/lib/hooks/useAuth';
import { Company as APICompany, CompanyFormData } from '@/types/api';

// Adapter function to convert API Company to CompanyCard format
const adaptCompanyForCard = (apiCompany: APICompany): CompanyCardType => ({
  id: apiCompany.pk.toString(),
  pk: apiCompany.pk,
  display_name: apiCompany.display_name,
  address: apiCompany.address,
  main_image: apiCompany.main_image,
  description: apiCompany.description,
  contact: apiCompany.contact,
  email: apiCompany.email,
  city: apiCompany.city,
  memberCount: apiCompany.members_count || 0,
  eventCount: 0,
  joinDate: new Date().toISOString(),
  verified: true,
  status: 'active' as const,
  contactPerson: {
    name: apiCompany.contact || 'Unknown',
    email: apiCompany.email,
  },
  industry: 'Manufacturing',
  location: apiCompany.city,
  website: undefined,
  logo: apiCompany.main_image,
});

export const CompaniesPage: React.FC = () => {
  const [view, setView] = useState<'list' | 'grid'>('grid');
  const [showForm, setShowForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<APICompany | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // API hooks
  const { data: userProfile } = useProfile();
  const { data: companies = [], isLoading, error } = useCompanies();
  const createCompanyMutation = useCreateCompany();
  const updateCompanyMutation = useUpdateCompany();
  const deleteCompanyMutation = useDeleteCompany();

  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin';

  const handleCreateCompany = async (data: CompanyFormData) => {
    createCompanyMutation.mutate(data, {
      onSuccess: () => {
        setShowForm(false);
      }
    });
  };

  const handleUpdateCompany = async (data: CompanyFormData) => {
    if (!selectedCompany) return;

    updateCompanyMutation.mutate(
      { companyId: selectedCompany.pk, data },
      {
        onSuccess: () => {
          setShowForm(false);
          setSelectedCompany(null);
        }
      }
    );
  };

  const handleDeleteCompany = async () => {
    if (!selectedCompany) return;

    deleteCompanyMutation.mutate(selectedCompany.pk, {
      onSuccess: () => {
        setShowDeleteDialog(false);
        setSelectedCompany(null);
      }
    });
  };

  const handleViewCompany = (company: CompanyCardType) => {
    const apiCompany = companies.find(c => c.pk === company.pk);
    if (apiCompany) {
      setSelectedCompany(apiCompany);
      console.log('View company:', apiCompany);
    }
  };

  const handleEditCompany = (company: CompanyCardType) => {
    const apiCompany = companies.find(c => c.pk === company.pk);
    if (apiCompany) {
      setSelectedCompany(apiCompany);
      setShowForm(true);
    }
  };

  const handleDeleteClick = (company: CompanyCardType) => {
    const apiCompany = companies.find(c => c.pk === company.pk);
    if (apiCompany) {
      setSelectedCompany(apiCompany);
      setShowDeleteDialog(true);
    }
  };

  const handleExport = () => {
    console.log('Exporting members...');
  };

  const filteredCompanies = companies.filter(company =>
    company.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    {
      label: 'Total Members',
      value: companies.length,
      icon: Building2,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100',
      textColor: 'text-orange-700',
    },
    {
      label: 'With Contact',
      value: companies.filter(c => c.contact).length,
      icon: Phone,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
      textColor: 'text-green-700',
    },
    {
      label: 'With Email',
      value: companies.filter(c => c.email).length,
      icon: Mail,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      textColor: 'text-blue-700',
    },
    {
      label: 'Active Locations',
      value: new Set(companies.map(c => c.city).filter(Boolean)).size,
      icon: MapPin,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
      textColor: 'text-purple-700',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-6">
        <Building2 className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load members</h3>
        <p className="text-gray-600 mb-6">Please try again later</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <CompanyForm
          company={selectedCompany || undefined}
          onSubmit={selectedCompany ? handleUpdateCompany : handleCreateCompany}
          loading={selectedCompany ? updateCompanyMutation.isPending : createCompanyMutation.isPending}
          onCancel={() => {
            setShowForm(false);
            setSelectedCompany(null);
          }}
          title={selectedCompany ? 'Edit Member' : 'Create New Member'}
        />
      </div>
    );
  }

  if (companies.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <EmptyState
          type="companies"
          title="No members yet"
          description={isAdmin ? "Get started by adding your first member to the platform." : "No members found."}
          action={isAdmin ? {
            text: 'Add Member',
            onClick: () => setShowForm(true),
            icon: <Plus className="w-4 h-4" />
          } : undefined}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/20 to-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* Modern Header with Gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 p-6 sm:p-8 shadow-xl">
          <div className="absolute inset-0 bg-grid-white/10" />
          <div className="relative">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Members</h1>
                    <Badge className="mt-1 bg-white/20 text-white border-white/30">
                      {companies.length} Member{companies.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
                <p className="text-orange-100 text-sm sm:text-base max-w-2xl">
                  Manage members, their profiles, and relationships
                </p>
              </div>
              {isAdmin && (
              <Button
                size="lg"
                className="text-orange-700 hover:bg-orange-50 shadow-lg hover:shadow-xl transition-all font-semibold"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => {
                  setSelectedCompany(null);
                  setShowForm(true);
                }}
              >
                Add Member
              </Button>
              )}
            </div>
          </div>
        </div>

        {/* Modern Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                    <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color} transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </div>
            );
          })}
        </div>

        {/* Search and View Toggle */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search members by name, description, or city..."
                className="pl-10 h-11 border-gray-200 focus:border-orange-300 focus:ring-orange-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setView('grid')}
                  className={`px-4 py-2 rounded-md transition-all flex items-center gap-2 ${view === 'grid'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm font-medium">Grid</span>
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`px-4 py-2 rounded-md transition-all flex items-center gap-2 ${view === 'list'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm font-medium">List</span>
                </button>
              </div>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </div>

        {/* Companies Display */}
        {view === 'list' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <CompanyList
              companies={filteredCompanies}
              loading={isLoading}
              onView={(company) => {
                setSelectedCompany(company);
                console.log('View company:', company);
              }}
              onEdit={isAdmin ? (company) => {
                setSelectedCompany(company);
                setShowForm(true);
              } : undefined}
              onDelete={isAdmin ? (company) => {
                setSelectedCompany(company);
                setShowDeleteDialog(true);
              } : undefined}
              onCreate={isAdmin ? () => {
                setSelectedCompany(null);
                setShowForm(true);
              } : undefined}
              onExport={handleExport}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredCompanies.map((company) => (
              <CompanyCard
                key={company.pk}
                company={adaptCompanyForCard(company)}
                variant="grid"
                onView={handleViewCompany}
                onEdit={isAdmin ? handleEditCompany : undefined}
                onDelete={isAdmin ? handleDeleteClick : undefined}
              />
            ))}
            {filteredCompanies.length === 0 && (
              <div className="col-span-full">
                <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No members found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your search terms</p>
                  <Button variant="outline" onClick={() => setSearchTerm('')}>
                    Clear Search
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteCompany}
        title="Delete Member"
        description={`Are you sure you want to delete "${selectedCompany?.display_name}"? This action cannot be undone and will also remove all associated data.`}
        confirmText="Delete Member"
        cancelText="Cancel"
        variant="destructive"
        loading={deleteCompanyMutation.isPending}
      />
    </div>
  );
};