import React, { useState } from 'react';
import {
  CompanyCard,
  CompanyForm,
  CompanyList,
  Company as CompanyCardType,
} from '@/components/features/companies';
import { Button, ConfirmDialog, EmptyState, LoadingSpinner, Input } from '@/components/ui';
import { Plus, Search, Filter } from 'lucide-react';
import { useCompanies, useCreateCompany, useUpdateCompany, useDeleteCompany } from '@/lib/hooks/useCompanies';
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
  memberCount: 0, // Default values - these would come from additional API calls
  eventCount: 0,
  joinDate: new Date().toISOString(),
  verified: true,
  status: 'active' as const,
  contactPerson: {
    name: apiCompany.contact || 'Unknown',
    email: apiCompany.email,
  },
  industry: 'Technology', // Default - this would come from API
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
  const { data: companies = [], isLoading, error } = useCompanies();
  const createCompanyMutation = useCreateCompany();
  const updateCompanyMutation = useUpdateCompany();
  const deleteCompanyMutation = useDeleteCompany();

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
    // Convert back to API format for state management
    const apiCompany = companies.find(c => c.pk === company.pk);
    if (apiCompany) {
      setSelectedCompany(apiCompany);
      // TODO: Navigate to company detail page or show detail modal
      console.log('View company:', apiCompany);
    }
  };

  const handleEditCompany = (company: CompanyCardType) => {
    // Convert back to API format for state management
    const apiCompany = companies.find(c => c.pk === company.pk);
    if (apiCompany) {
      setSelectedCompany(apiCompany);
      setShowForm(true);
    }
  };

  const handleDeleteClick = (company: CompanyCardType) => {
    // Convert back to API format for state management
    const apiCompany = companies.find(c => c.pk === company.pk);
    if (apiCompany) {
      setSelectedCompany(apiCompany);
      setShowDeleteDialog(true);
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting companies...');
  };

  const filteredCompanies = companies.filter(company =>
    company.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    {
      label: 'Total Companies',
      value: companies.length,
      color: 'text-orange-600',
    },
    {
      label: 'With Contact',
      value: companies.filter(c => c.contact).length,
      color: 'text-green-600',
    },
    {
      label: 'With Email',
      value: companies.filter(c => c.email).length,
      color: 'text-blue-600',
    },
    {
      label: 'With Address',
      value: companies.filter(c => c.address).length,
      color: 'text-purple-600',
    },
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load companies. Please try again.</p>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="p-6">
        <CompanyForm
          company={selectedCompany || undefined}
          onSubmit={selectedCompany ? handleUpdateCompany : handleCreateCompany}
          loading={selectedCompany ? updateCompanyMutation.isPending : createCompanyMutation.isPending}
          onCancel={() => {
            setShowForm(false);
            setSelectedCompany(null);
          }}
          title={selectedCompany ? 'Edit Company' : 'Create New Company'}
        />
      </div>
    );
  }

  if (companies.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <EmptyState
          type="companies"
          title="No companies yet"
          description="Get started by adding your first company to the platform."
          action={{
            text: 'Add Company',
            onClick: () => setShowForm(true),
            icon: <Plus className="w-4 h-4" />
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Companies</h1>
          <p className="text-muted-foreground mt-1">Manage partner companies and their members</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={view === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('list')}
            >
              List
            </Button>
            <Button
              variant={view === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('grid')}
            >
              Grid
            </Button>
          </div>
          <Button 
            leftIcon={<Plus className="w-4 h-4" />} 
            onClick={() => {
              setSelectedCompany(null);
              setShowForm(true);
            }}
          >
            Add Company
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search companies..." 
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-sm font-medium text-gray-600">{stat.label}</div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Companies Display */}
      {view === 'list' ? (
        <CompanyList
          companies={filteredCompanies}
          loading={isLoading}
          onView={(company) => handleViewCompany(adaptCompanyForCard(company))}
          onEdit={(company) => handleEditCompany(adaptCompanyForCard(company))}
          onDelete={(company) => handleDeleteClick(adaptCompanyForCard(company))}
          onCreate={() => {
            setSelectedCompany(null);
            setShowForm(true);
          }}
          onExport={handleExport}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <CompanyCard
              key={company.pk}
              company={adaptCompanyForCard(company)}
              variant="grid"
              onView={handleViewCompany}
              onEdit={handleEditCompany}
              onDelete={handleDeleteClick}
            />
          ))}
          {filteredCompanies.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No companies found matching your search.
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteCompany}
        title="Delete Company"
        description={`Are you sure you want to delete "${selectedCompany?.display_name}"? This action cannot be undone and will also remove all associated data.`}
        confirmText="Delete Company"
        cancelText="Cancel"
        variant="destructive"
        loading={deleteCompanyMutation.isPending}
      />
    </div>
  );
};