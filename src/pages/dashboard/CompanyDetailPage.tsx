import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Mail,
  Phone,
  Users,
  Package,
  Edit,
  Trash2,
  Plus,
  UserCog,
} from 'lucide-react';
import { useCompany, useCompanyProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/lib/hooks/useCompanies';
import { CompanyProductForm } from '@/components/features/companies';
import { Button, Card, CardContent, CardHeader, CardTitle, ConfirmDialog, LoadingSpinner, EmptyState } from '@/components/ui';
import { LazyImage } from '@/components/common/LazyImage';
import { CompanyProduct, CompanyProductFormData } from '@/types/api';
import { getBackendImageUrl } from '@/lib/utils/image';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

export const CompanyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const companyId = id ? parseInt(id, 10) : null;
  const { data: company, isLoading: companyLoading } = useCompany(companyId || 0);
  const { data: products = [], isLoading: productsLoading } = useCompanyProducts(companyId || 0);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/20 to-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              {company.main_image_url && (
                <LazyImage
                  src={getBackendImageUrl(company.main_image_url)}
                  alt={company.display_name}
                  className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-lg"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{company.display_name}</h1>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {company.city}
                  </span>
                  {company.members_count !== undefined && (
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {company.members_count} Members
                    </span>
                  )}
                  {company.products_count !== undefined && (
                    <span className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      {company.products_count} Products
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Company Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* President Director */}
            {company.president_director && (
              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <UserCog className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Presiden Direktur</p>
                      <p className="text-lg font-semibold text-gray-900">{company.president_director}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {company.description || 'No description available.'}
                </p>
              </CardContent>
            </Card>

            {/* Products Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-orange-600" />
                    Products & Services
                  </CardTitle>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedProduct(null);
                      setShowProductForm(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <LoadingSpinner size="sm" />
                ) : products && products.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {products.map((product) => (
                      <div
                        key={product.pk}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="flex gap-4 p-4">
                          {product.image_url && (
                            <div className="flex-shrink-0">
                              <LazyImage
                                src={product.image_url}
                                alt={product.name}
                                className="w-20 h-20 rounded-lg object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">{product.name}</h4>
                            {product.category && (
                              <p className="text-xs text-gray-500 mt-1">{product.category}</p>
                            )}
                            {product.description && (
                              <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                                {product.description}
                              </p>
                            )}
                          </div>
                          <div className="flex-shrink-0 flex flex-col gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteClick(product)}
                              className="text-red-600 hover:text-red-700 hover:border-red-300"
                            >
                              <Trash2 className="w-3 h-3" />
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
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Contact Info */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {company.email && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500">Email</p>
                      <a
                        href={`mailto:${company.email}`}
                        className="text-sm font-medium text-gray-900 hover:text-orange-600 break-all"
                      >
                        {company.email}
                      </a>
                    </div>
                  </div>
                )}

                {company.contact && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500">Phone</p>
                      <a
                        href={`tel:${company.contact}`}
                        className="text-sm font-medium text-gray-900 hover:text-orange-600"
                      >
                        {company.contact}
                      </a>
                    </div>
                  </div>
                )}

                {company.address && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="text-sm text-gray-900">{company.address}</p>
                      <p className="text-sm text-gray-500">{company.city}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
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
