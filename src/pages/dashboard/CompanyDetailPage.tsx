import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Mail,
  Phone,
  Package,
  Edit,
  Trash2,
  Plus,
  Users,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { useCompany, useCompanyProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useUpdateCompany } from '@/lib/hooks/useCompanies';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { CompanyProductForm, CompanyPICSection, CompanyRegularMembersSection, CompanyForm } from '@/components/features/companies';
import {
  Button,
  Card,
  ConfirmDialog,
  LoadingSpinner,
  Avatar,
  Badge,
  CardContent,
  EmptyState
} from '@/components/ui';
import { LazyImage } from '@/components/common/LazyImage';
import { CompanyProduct, CompanyProductFormData, CompanyFormData } from '@/types/api';
import { getBackendImageUrl } from '@/lib/utils/image';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Company as APICompany } from '@/types/api';

interface LocalCompany extends APICompany {
  industry?: string;
  location?: string;
}

export const CompanyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const companyId = id ? parseInt(id, 10) : null;
  const { data: company, isLoading: companyLoading } = useCompany(companyId || 0);
  const { data: products = [], isLoading: productsLoading } = useCompanyProducts(companyId || 0);
  const { isAdmin, canManageCompany } = usePermissions();
  const canEdit = companyId ? canManageCompany(companyId) : false;

  const [showProductForm, setShowProductForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Partial<CompanyProduct> | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  const updateCompanyMutation = useUpdateCompany();

  const handleUpdateCompany = async (data: CompanyFormData) => {
    if (!companyId) return;
    updateCompanyMutation.mutate(
      { companyId, data },
      {
        onSuccess: () => {
          setShowEditForm(false);
          queryClient.invalidateQueries({ queryKey: ['companies', companyId] });
          toast.success('Company updated successfully!');
        },
      }
    );
  };

  const handleBack = () => {
    navigate('/dashboard/companies');
  };

  const handleCreateProduct = async (data: CompanyProductFormData) => {
    if (!companyId) return;

    createProductMutation.mutate(
      { companyId, data },
      {
        onSuccess: () => {
          setShowProductForm(false);
          queryClient.invalidateQueries({ queryKey: ['company-products', companyId] });
          queryClient.invalidateQueries({ queryKey: ['companies', companyId] });
          toast.success('Product created successfully!');
        },
      }
    );
  };

  const handleUpdateProduct = async (data: CompanyProductFormData) => {
    if (!companyId || !selectedProduct?.pk) return;

    updateProductMutation.mutate(
      { companyId, productId: selectedProduct.pk, data },
      {
        onSuccess: () => {
          setShowProductForm(false);
          setSelectedProduct(null);
          queryClient.invalidateQueries({ queryKey: ['company-products', companyId] });
          toast.success('Product updated successfully!');
        },
      }
    );
  };

  const handleDeleteProduct = async () => {
    if (!companyId || !selectedProduct?.pk) return;

    deleteProductMutation.mutate(
      { companyId, productId: selectedProduct.pk },
      {
        onSuccess: () => {
          setShowDeleteDialog(false);
          setSelectedProduct(null);
          queryClient.invalidateQueries({ queryKey: ['company-products', companyId] });
          queryClient.invalidateQueries({ queryKey: ['companies', companyId] });
          toast.success('Product deleted successfully!');
        },
      }
    );
  };

  const handleEditProduct = (product: CompanyProduct) => {
    setSelectedProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteClick = (product: CompanyProduct) => {
    setSelectedProduct(product);
    setShowDeleteDialog(true);
  };

  if (companyLoading || !companyId) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-6">
        <Building2 className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Not Found</h2>
        <p className="text-gray-600 mb-6">The requested company could not be found.</p>
        <Button onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Companies
        </Button>
      </div>
    );
  }

  // Show edit company form
  if (showEditForm) {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <CompanyForm
          company={company}
          products={products}
          onSubmit={handleUpdateCompany}
          onProductAdd={async (data) => {
            if (!companyId) return;
            await createProductMutation.mutateAsync(
              { companyId, data }
            );
          }}
          onProductUpdate={async (productId, data) => {
            if (!companyId) return;
            await updateProductMutation.mutateAsync(
              { companyId, productId, data }
            );
          }}
          onProductDelete={async (productId) => {
            if (!companyId) return;
            await deleteProductMutation.mutateAsync(
              { companyId, productId }
            );
          }}
          loading={updateCompanyMutation.isPending}
          onCancel={() => setShowEditForm(false)}
          title="Edit Company"
        />
      </div>
    );
  }

  // Show product form
  if (showProductForm) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <CompanyProductForm
          product={selectedProduct || undefined}
          companyId={companyId}
          onSubmit={selectedProduct ? handleUpdateProduct : handleCreateProduct}
          loading={createProductMutation.isPending || updateProductMutation.isPending}
          onCancel={() => {
            setShowProductForm(false);
            setSelectedProduct(null);
          }}
          title={selectedProduct ? 'Edit Product' : 'Add New Product'}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* Hero Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 pl-0 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Companies
            </Button>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Main Company Logo */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center p-3 shrink-0">
                {company.main_image_url ? (
                  <LazyImage
                    src={getBackendImageUrl(company.main_image_url)}
                    alt={`${company.display_name} Logo`}
                    className="w-full h-full object-contain"
                    containerClassName="w-full h-full"
                  />
                ) : (
                  <Building2 className="w-12 h-12 text-orange-200" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                    {company.display_name}
                  </h1>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                    {(company as LocalCompany).industry || 'Industry not specified'}
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {company.city || company.address || 'Location not specified'}
                  </div>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            {canEdit && (
              <Button
                size="lg"
                onClick={() => setShowEditForm(true)}
                className="w-full md:w-auto bg-white text-orange-600 border border-orange-200 hover:bg-orange-50 hover:border-orange-300 shadow-sm transition-all"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Company
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <Card className="shadow-sm border-gray-200 overflow-hidden">
              <div className="p-6 sm:p-8">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-gray-900">
                  <Building2 className="w-5 h-5 text-orange-600" />
                  About Company
                </h2>
                <div className="prose prose-orange max-w-none text-gray-700">
                  {company.description ? (
                    <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                      {company.description}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-gray-500 italic">No description available.</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Products & Services Section */}
            <Card className="shadow-sm border-gray-200">
              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                    <Package className="w-5 h-5 text-orange-600" />
                    Products & Services
                  </h2>
                  {(isAdmin() || canManageCompany(companyId)) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setSelectedProduct(null); setShowProductForm(true); }}
                      className="shrink-0"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  )}
                </div>

                {productsLoading ? (
                  <div className="flex justify-center py-12">
                    <LoadingSpinner size="md" />
                  </div>
                ) : products && products.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {products.map((product) => (
                      <div
                        key={product.pk}
                        className="group relative bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md hover:border-orange-200 transition-all duration-300 flex flex-col h-full"
                      >
                        {/* Improved Product Image Handling */}
                        <div className="aspect-[4/3] w-full bg-gray-50 border-b border-gray-50 overflow-hidden flex items-center justify-center p-4">
                          {product.image_url ? (
                            <LazyImage
                              src={getBackendImageUrl(product.image_url)}
                              alt={product.name}
                              className="w-full h-full object-contain mix-blend-multiply"
                              containerClassName="w-full h-full"
                              showSkeleton={true}
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-orange-200">
                              <Package className="w-8 h-8" />
                            </div>
                          )}
                        </div>

                        <div className="p-4 flex flex-col flex-1">
                          <h4 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                            {product.name}
                          </h4>
                          {product.category && (
                            <Badge variant="secondary" className="mt-2 text-[10px] w-fit">
                              {product.category}
                            </Badge>
                          )}
                          <p className="text-sm text-gray-500 mt-auto line-clamp-2">
                            {product.description || "No description provided."}
                          </p>
                        </div>

                        {/* Hover Actions */}
                        {(isAdmin() || canManageCompany(companyId)) && (
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white/90 backdrop-blur-sm p-1 rounded-lg border border-gray-100 shadow-sm">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditProduct(product)}
                              className="h-7 w-7 p-0 hover:bg-orange-50 hover:text-orange-600"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteClick(product)}
                              className="h-7 w-7 p-0 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    type="data"
                    title="No Products Yet"
                    description="Showcase what this company offers by adding products or services."
                    action={(isAdmin() || canManageCompany(companyId)) ? {
                      text: 'Add First Product',
                      onClick: () => {
                        setSelectedProduct(null);
                        setShowProductForm(true);
                      },
                      icon: <Plus className="w-4 h-4" />
                    } : undefined}
                    className="py-12 bg-gray-50/50 rounded-xl border border-dashed border-gray-200"
                  />
                )}
              </div>
            </Card>

            {/* Regular Members Section (Below Products) */}
            <CompanyRegularMembersSection
              companyId={companyId || 0}
              members={company.members}
              isAdmin={isAdmin()}
            />
          </div>

          {/* Sidebar / Right Column */}
          <div className="space-y-6">
            {/* President Director Profile (Matching Public Design) */}
            {company.president_director && (
              <Card className="overflow-hidden border-orange-100 shadow-sm">
                <div className="h-24 bg-gradient-to-br from-orange-400 to-orange-600 relative">
                  <div className="absolute inset-0 bg-transparent" />
                </div>
                <div className="relative -mt-12 flex justify-center mb-4">
                  <Avatar
                    className="w-24 h-24 border-4 border-white shadow-md text-2xl bg-white"
                    name={company.president_director || 'PD'}
                    src={getBackendImageUrl(company.president_director_image_url || '')}
                    size="xl"
                  />
                </div>
                <CardContent className="pb-6 pt-0 text-center space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {company.president_director}
                  </h3>
                  <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200">
                    President Director
                  </Badge>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats / Info Widget */}
            <Card className="shadow-sm border-gray-200">
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-orange-600" />
                  Key Information
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-blue-600 mb-1">
                        <Users className="w-4 h-4" />
                        <span className="font-bold">{company.members?.length || 0}</span>
                      </div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Members</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-orange-600 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="font-bold">--</span>
                      </div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Events</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-gray-100 mt-4">
                    {company.email && (
                      <div className="flex items-start gap-3">
                        <Mail className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <a href={`mailto:${company.email}`} className="text-sm text-gray-600 hover:text-orange-600 break-all">
                          {company.email}
                        </a>
                      </div>
                    )}
                    {company.contact && (
                      <div className="flex items-start gap-3">
                        <Phone className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <a href={`tel:${company.contact}`} className="text-sm text-gray-600 hover:text-orange-600">
                          {company.contact}
                        </a>
                      </div>
                    )}
                    {company.address && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <div className="text-sm text-gray-600 leading-relaxed">
                          <p>{company.address}</p>
                          <p className="text-gray-500 mt-0.5">{company.city}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* PIC Section */}
            <CompanyPICSection
              companyId={companyId || 0}
              members={company.members}
              isAdmin={isAdmin()}
            />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteProduct}
        title="Delete Product"
        description={`Are you sure you want to delete "${selectedProduct?.name}"? This action cannot be undone.`}
        confirmText="Delete Product"
        cancelText="Cancel"
        variant="destructive"
        loading={deleteProductMutation.isPending}
      />
    </div>
  );
};

export default CompanyDetailPage;
