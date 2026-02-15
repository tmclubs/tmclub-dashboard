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
} from 'lucide-react';
import { useCompany, useCompanyProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/lib/hooks/useCompanies';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { CompanyProductForm, CompanyMembersSection } from '@/components/features/companies';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  LoadingSpinner,
  EmptyState,
  Avatar,
  Badge
} from '@/components/ui';
import { LazyImage } from '@/components/common/LazyImage';
import { CompanyProduct, CompanyProductFormData } from '@/types/api';
import { getBackendImageUrl } from '@/lib/utils/image';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

export const CompanyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const companyId = id ? parseInt(id, 10) : null;
  const { data: company, isLoading: companyLoading } = useCompany(companyId || 0);
  const { data: products = [], isLoading: productsLoading } = useCompanyProducts(companyId || 0);
  const { isAdmin } = usePermissions();

  const [showProductForm, setShowProductForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Partial<CompanyProduct> | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

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
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="hover:bg-transparent pl-0 hover:pl-0"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Companies
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - President Director Profile */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="overflow-hidden border-orange-100 shadow-sm">
              <div className="h-32 bg-gradient-to-br from-orange-400 to-orange-600 relative">
                <div className="absolute inset-0 bg-transparent" />
              </div>
              <div className="relative -mt-12 flex justify-center mb-4">
                <Avatar
                  className="w-24 h-24 border-4 border-white shadow-md text-2xl bg-white"
                  name={company.president_director || 'PD'}
                  size="xl"
                />
              </div>
              <CardContent className="pb-8 pt-0 text-center space-y-2">
                <h3 className="text-xl font-bold text-gray-900">
                  {company.president_director || 'Not Specified'}
                </h3>
                <p className="text-sm font-medium text-orange-600 uppercase tracking-wide">
                  President Director
                </p>
                <div className="pt-4 border-t border-gray-100 w-full mt-4">
                  <p className="text-sm text-gray-500">{company.display_name}</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats/Info */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {company.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <a href={`mailto:${company.email}`} className="text-sm text-gray-600 hover:text-orange-600 break-all">
                        {company.email}
                      </a>
                    </div>
                  </div>
                )}
                {company.contact && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Phone</p>
                      <a href={`tel:${company.contact}`} className="text-sm text-gray-600 hover:text-orange-600">
                        {company.contact}
                      </a>
                    </div>
                  </div>
                )}
                {company.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Address</p>
                      <p className="text-sm text-gray-600">{company.address}</p>
                      <p className="text-sm text-gray-500">{company.city}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Description & Products */}
          <div className="lg:col-span-8 space-y-8">
            <div>
              <div className="flex items-center gap-4 mb-6">
                {company.main_image_url && (
                  <LazyImage
                    src={getBackendImageUrl(company.main_image_url)}
                    alt={company.display_name}
                    className="w-16 h-16 rounded-xl object-cover shadow-sm border border-gray-100"
                  />
                )}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{company.display_name}</h1>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {company.city}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description with Markdown Rendering */}
              <div className="prose prose-orange max-w-none text-gray-700">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-gray-900">
                  <Building2 className="w-5 h-5 text-orange-600" />
                  About Company
                </h2>
                {company.description ? (
                  <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                    {company.description}
                  </ReactMarkdown>
                ) : (
                  <p className="text-gray-500 italic">No description available.</p>
                )}
              </div>
            </div>

            {/* Members & PIC Section */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 mb-6">
                <Users className="w-5 h-5 text-orange-600" />
                Members & PIC
              </h2>
              <CompanyMembersSection
                companyId={companyId}
                members={company.members}
                isAdmin={isAdmin()}
              />
            </div>

            <div className="border-t border-gray-200 pt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                  <Package className="w-5 h-5 text-orange-600" />
                  Products & Services
                </h2>
                <Button onClick={() => { setSelectedProduct(null); setShowProductForm(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </div>

              {productsLoading ? (
                <LoadingSpinner size="sm" />
              ) : products && products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map((product) => (
                    <div
                      key={product.pk}
                      className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group"
                    >
                      <div className="flex gap-4 p-4">
                        {product.image_url ? (
                          <div className="flex-shrink-0">
                            <LazyImage
                              src={product.image_url}
                              alt={product.name}
                              className="w-20 h-20 rounded-lg object-cover bg-gray-50"
                            />
                          </div>
                        ) : (
                          <div className="flex-shrink-0 w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center text-gray-300">
                            <Package className="w-8 h-8" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                            {product.name}
                          </h4>
                          {product.category && (
                            <Badge variant="secondary" className="mt-1 text-xs font-normal">
                              {product.category}
                            </Badge>
                          )}
                          {product.description && (
                            <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                              {product.description}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditProduct(product)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteClick(product)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  type="data"
                  title="No Products"
                  description="No products have been added yet."
                  action={{
                    text: 'Add First Product',
                    onClick: () => {
                      setSelectedProduct(null);
                      setShowProductForm(true);
                    },
                    icon: <Plus className="w-4 h-4" />
                  }}
                />
              )}
            </div>
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
