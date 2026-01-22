import React, { useState, useRef } from 'react';
import { Upload, X, Building, MapPin, Phone, Mail, UserCog, Plus, Edit, Trash2, Package } from 'lucide-react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, RichTextEditor, ConfirmDialog } from '@/components/ui';
import { LazyImage } from '@/components/common/LazyImage';
import { CompanyFormData, Company, CompanyProduct, CompanyProductFormData } from '@/types/api';
import { getBackendImageUrl } from '@/lib/utils/image';

export interface CompanyFormProps {
  company?: Partial<Company>;
  onSubmit: (data: CompanyFormData) => void | Promise<void>;
  onProductAdd?: (data: CompanyProductFormData) => void | Promise<void>;
  onProductUpdate?: (productId: number, data: Partial<CompanyProductFormData>) => void | Promise<void>;
  onProductDelete?: (productId: number) => void | Promise<void>;
  products?: CompanyProduct[];
  loading?: boolean;
  onCancel?: () => void;
  title?: string;
}

export const CompanyForm: React.FC<CompanyFormProps> = ({
  company,
  onSubmit,
  onProductAdd,
  onProductUpdate,
  onProductDelete,
  products = [],
  loading = false,
  onCancel,
  title = company ? 'Edit Member' : 'Add New Member',
}) => {
  const [formData, setFormData] = useState<CompanyFormData>({
    display_name: company?.display_name || '',
    description: company?.description || '',
    main_image: company?.main_image || '',
    address: company?.address || '',
    contact: company?.contact || '',
    email: company?.email || '',
    city: company?.city || '',
    president_director: company?.president_director || '',
  });

  const [logoPreview, setLogoPreview] = useState<string>(
    company?.main_image && typeof company.main_image === 'string'
      ? getBackendImageUrl(company.main_image) || ''
      : ''
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Product form state
  const [showProductForm, setShowProductForm] = useState(false);
  const [productFormData, setProductFormData] = useState<CompanyProductFormData>({
    name: '',
    description: '',
    category: '',
  });
  const [editingProduct, setEditingProduct] = useState<Partial<CompanyProduct> | null>(null);
  const [productImagePreview, setProductImagePreview] = useState<string>('');
  const [showDeleteProductDialog, setShowDeleteProductDialog] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Partial<CompanyProduct> | null>(null);
  const productFileInputRef = useRef<HTMLInputElement>(null);

  // Temporary products for new company (before company is created)
  const [tempProducts, setTempProducts] = useState<CompanyProductFormData[]>([]);
  const [displayProducts, setDisplayProducts] = useState<CompanyProduct[]>(products);

  const handleInputChange = (field: keyof CompanyFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Store file in state
      setFormData(prev => ({ ...prev, logo_file: file }));
    }
  };

  const removeLogo = () => {
    setLogoPreview('');
    setFormData(prev => ({ ...prev, main_image: '', logo_file: undefined }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Product handlers
  const handleProductInputChange = (field: keyof CompanyProductFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    let value: string | number = e.target.value;
    setProductFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProductImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setProductFormData(prev => ({ ...prev, image: file }));
    }
  };

  const handleRemoveProductImage = () => {
    setProductImagePreview('');
    setProductFormData(prev => ({ ...prev, image: '' }));
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductFormData({
      name: '',
      description: '',
      category: '',
    });
    setProductImagePreview('');
    setShowProductForm(true);
  };

  const handleEditProduct = (product: CompanyProduct | any) => {
    setEditingProduct(product);

    // Check if it's a temp product or existing product
    if (product.tempIndex !== undefined) {
      // Temp product - get data from tempProducts
      const tempProduct = tempProducts[product.tempIndex];
      setProductFormData({
        name: tempProduct.name,
        description: tempProduct.description || '',
        category: tempProduct.category || '',
      });
      setProductImagePreview(
        typeof tempProduct.image === 'string' ? getBackendImageUrl(tempProduct.image) || '' : ''
      );
    } else {
      // Existing product
      setProductFormData({
        name: product.name,
        description: product.description || '',
        category: product.category || '',
      });
      setProductImagePreview(product.image_url || '');
    }
    setShowProductForm(true);
  };

  const handleSaveProduct = async () => {
    if (editingProduct) {
      // Edit mode - update existing product
      if (onProductUpdate) {
        await onProductUpdate(editingProduct.pk!, productFormData);
      } else {
        // Edit temp product (for new company)
        setTempProducts(prev =>
          prev.map((p, idx) =>
            idx === (editingProduct as any).tempIndex ? productFormData : p
          )
        );
        updateDisplayProducts();
      }
    } else {
      // Add mode
      if (onProductAdd && company?.pk) {
        // Add to existing company
        await onProductAdd(productFormData);
      } else {
        // Add to temp products (for new company)
        setTempProducts(prev => [...prev, productFormData]);
        updateDisplayProducts();
      }
    }
    setShowProductForm(false);
    setEditingProduct(null);
    setProductFormData({
      name: '',
      description: '',
      category: '',
    });
    setProductImagePreview('');
  };

  const handleDeleteProductClick = (product: CompanyProduct | any) => {
    setDeletingProduct(product);
    setShowDeleteProductDialog(true);
  };

  const handleConfirmDeleteProduct = async () => {
    if (deletingProduct) {
      if (onProductDelete && deletingProduct.pk) {
        // Delete from existing company
        await onProductDelete(deletingProduct.pk);
      } else {
        // Delete from temp products (for new company)
        setTempProducts(prev =>
          prev.filter((_, idx) => idx !== (deletingProduct as any).tempIndex)
        );
        updateDisplayProducts();
      }
      setShowDeleteProductDialog(false);
      setDeletingProduct(null);
    }
  };

  const updateDisplayProducts = () => {
    // Convert temp products to display format
    const tempDisplay = tempProducts.map((p, idx) => {
      let imageUrl = null;
      if (typeof p.image === 'string') {
        imageUrl = getBackendImageUrl(p.image) || null;
      } else if (p.image instanceof File) {
        imageUrl = URL.createObjectURL(p.image);
      }

      return {
        pk: -idx, // Negative pk to distinguish from real products
        tempIndex: idx, // Store the actual index in tempProducts
        name: p.name,
        description: p.description,
        category: p.category,
        image_url: imageUrl,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any;
    });

    setDisplayProducts([...tempDisplay, ...products]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Include temp products in the form data
    onSubmit({ ...formData, tempProducts });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{title}</CardTitle>
            {onCancel && (
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Logo */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Member Logo</h3>
              <div className="flex items-center gap-6">
                {logoPreview ? (
                  <div className="relative">
                    <LazyImage
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-32 h-32 rounded-lg object-contain border border-gray-200 bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                )}

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    leftIcon={<Upload className="w-4 h-4" />}
                    disabled={loading}
                  >
                    {logoPreview ? 'Change Logo' : 'Upload Logo'}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Recommended: 512x512px, PNG or JPG
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>

              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Member Name *"
                  placeholder="Enter member name"
                  value={formData.display_name}
                  onChange={handleInputChange('display_name')}
                  required
                  leftIcon={<Building className="w-4 h-4" />}
                />

                <div>
                  <Input
                    label="President Director"
                    placeholder="Enter president director name"
                    value={formData.president_director}
                    onChange={handleInputChange('president_director')}
                    leftIcon={<UserCog className="w-4 h-4" />}
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional: Name of the President Director</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <RichTextEditor
                    placeholder="Describe the member using rich text formatting..."
                    value={formData.description}
                    onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Contact Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email *"
                  type="email"
                  placeholder="member@example.com"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  required
                  leftIcon={<Mail className="w-4 h-4" />}
                />

                <Input
                  label="Phone *"
                  type="tel"
                  placeholder="Contact number"
                  value={formData.contact}
                  onChange={handleInputChange('contact')}
                  required
                  leftIcon={<Phone className="w-4 h-4" />}
                />
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Address Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="City *"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleInputChange('city')}
                  required
                  leftIcon={<MapPin className="w-4 h-4" />}
                />

                <Input
                  label="Full Address *"
                  placeholder="Street address, etc."
                  value={formData.address}
                  onChange={handleInputChange('address')}
                  required
                  leftIcon={<MapPin className="w-4 h-4" />}
                />
              </div>
            </div>

            {/* Products Section - Show for both create and edit */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-lg font-medium text-gray-900">Products</h3>
                {!showProductForm && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddProduct}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Add Product
                  </Button>
                )}
              </div>

              {/* Product Form */}
              {showProductForm && (
                <div className="border border-orange-200 rounded-lg p-4 bg-orange-50/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </h4>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShowProductForm(false);
                        setEditingProduct(null);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Product Image */}
                    <div>
                      {productImagePreview ? (
                        <div className="relative inline-block">
                          <LazyImage
                            src={productImagePreview}
                            alt="Product preview"
                            className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveProductImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <input
                        ref={productFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleProductImageUpload}
                        className="hidden"
                        id="product-image-upload"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => productFileInputRef.current?.click()}
                        className="mt-2"
                      >
                        {productImagePreview ? 'Change' : 'Upload'} Image
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <Input
                        label="Product Name *"
                        placeholder="Product name"
                        value={productFormData.name}
                        onChange={handleProductInputChange('name')}
                        required
                        leftIcon={<Package className="w-4 h-4" />}
                      />

                      <Input
                        label="Category"
                        placeholder="e.g., Electronics, Services"
                        value={productFormData.category}
                        onChange={handleProductInputChange('category')}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      placeholder="Product description..."
                      value={productFormData.description}
                      onChange={(e) => setProductFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={handleSaveProduct}
                      disabled={!productFormData.name}
                    >
                      {editingProduct ? 'Update Product' : 'Add Product'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowProductForm(false);
                        setEditingProduct(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Products List */}
              {!showProductForm && displayProducts && displayProducts.length > 0 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {displayProducts.map((product) => (
                      <div
                        key={product.pk}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                      >
                        {product.image_url && (
                          <LazyImage
                            src={product.image_url}
                            alt={product.name}
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{product.name}</p>
                          {product.category && (
                            <p className="text-xs text-gray-500">{product.category}</p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteProductClick(product)}
                            className="text-red-600 hover:text-red-700 hover:border-red-300"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddProduct}
                    leftIcon={<Plus className="w-4 h-4" />}
                    className="w-full"
                  >
                    Add Another Product
                  </Button>
                </div>
              )}

              {!showProductForm && (!displayProducts || displayProducts.length === 0) && (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-3">No products yet</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddProduct}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Add First Product
                  </Button>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-6 border-t">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                loading={loading}
                disabled={loading}
                className="flex-1"
              >
                {loading
                  ? 'Saving...'
                  : company
                    ? 'Update Member'
                    : 'Create Member'
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Delete Product Confirmation */}
      <ConfirmDialog
        open={showDeleteProductDialog}
        onClose={() => setShowDeleteProductDialog(false)}
        onConfirm={handleConfirmDeleteProduct}
        title="Delete Product"
        description={`Are you sure you want to delete "${deletingProduct?.name}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
};
