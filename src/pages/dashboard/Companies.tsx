import React, { useState } from 'react';
import {
  CompanyCard,
  CompanyForm,
  CompanyList,
  Company as CompanyCardType,
} from '@/components/features/companies';
import { Button, Modal, ConfirmDialog, EmptyState, LoadingSpinner } from '@/components/ui';
import { Plus } from 'lucide-react';
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
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<APICompany | null>(null);

  // API hooks
  const { data: companies = [], isLoading, error } = useCompanies();
  const createCompanyMutation = useCreateCompany();
  const updateCompanyMutation = useUpdateCompany();
  const deleteCompanyMutation = useDeleteCompany();

  const handleCreateCompany = async (data: CompanyFormData) => {
    createCompanyMutation.mutate(data, {
      onSuccess: () => {
        setShowCreateModal(false);
      }
    });
  };

  const handleUpdateCompany = async (data: CompanyFormData) => {
    if (!selectedCompany) return;

    updateCompanyMutation.mutate(
      { companyId: selectedCompany.pk, data },
      {
        onSuccess: () => {
          setShowEditModal(false);
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
      setShowEditModal(true);
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

  if (companies.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <EmptyState
          type="companies"
          title="No companies yet"
          description="Get started by adding your first company to the platform."
          action={{
            text: 'Add Company',
            onClick: () => setShowCreateModal(true),
            icon: <Plus className="w-4 h-4" />
          }}
        />

        <Modal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Company"
        >
          <CompanyForm
            onSubmit={handleCreateCompany}
            loading={createCompanyMutation.isPending}
            onCancel={() => setShowCreateModal(false)}
          />
        </Modal>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-600 mt-1">Manage partner companies and their members</p>
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
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowCreateModal(true)}>
            Add Company
          </Button>
        </div>
      </div>

      {/* Companies Display */}
      {view === 'list' ? (
        <CompanyList
          companies={companies}
          loading={isLoading}
          onView={(company) => handleViewCompany(adaptCompanyForCard(company))}
          onEdit={(company) => handleEditCompany(adaptCompanyForCard(company))}
          onDelete={(company) => handleDeleteClick(adaptCompanyForCard(company))}
          onCreate={() => setShowCreateModal(true)}
          onExport={handleExport}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <CompanyCard
              key={company.pk}
              company={adaptCompanyForCard(company)}
              variant="default"
              onView={handleViewCompany}
              onEdit={handleEditCompany}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Create Company Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Company"
        size="lg"
        preventClose={createCompanyMutation.isPending}
      >
        <CompanyForm
          onSubmit={handleCreateCompany}
          loading={createCompanyMutation.isPending}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Edit Company Modal */}
      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Company"
        size="lg"
        preventClose={updateCompanyMutation.isPending}
      >
        <CompanyForm
          company={selectedCompany || undefined}
          onSubmit={handleUpdateCompany}
          loading={updateCompanyMutation.isPending}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedCompany(null);
          }}
        />
      </Modal>

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