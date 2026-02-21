import React, { useState, useRef } from 'react';
import { Upload, X, Package, FileText } from 'lucide-react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { LazyImage } from '@/components/common/LazyImage';
import { CompanyProduct, CompanyProductFormData } from '@/types/api';


export interface CompanyProductFormProps {
  product?: Partial<CompanyProduct>;
  companyId: number;
  onSubmit: (data: CompanyProductFormData) => void | Promise<void>;
  loading?: boolean;
  onCancel?: () => void;
  title?: string;
}

export const CompanyProductForm: React.FC<CompanyProductFormProps> = ({
  product,

  onSubmit,
  loading = false,
  onCancel,
  title = product ? 'Edit Product' : 'Add New Product',
}) => {
  const [formData, setFormData] = useState<CompanyProductFormData>({
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || '',
    image: product?.image || '',
  });

  const [imagePreview, setImagePreview] = useState<string>(
    product?.image_url || ''
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof CompanyProductFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    let value: string | number = e.target.value;

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Store file in state
      setFormData(prev => ({ ...prev, image: file }));
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setFormData(prev => ({ ...prev, image: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
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
            {/* Product Image */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Product Image</h3>
              <div className="flex items-center gap-6">
                {imagePreview ? (
                  <div className="relative">
                    <LazyImage
                      src={imagePreview}
                      alt="Product preview"
                      className="rounded-lg object-cover border border-gray-200 bg-gray-50"
                      containerClassName="w-32 h-32"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                )}

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="product-image-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    leftIcon={<Upload className="w-4 h-4" />}
                    disabled={loading}
                  >
                    {imagePreview ? 'Change Image' : 'Upload Image'}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Recommended: Square image, PNG or JPG
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>

              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Product Name *"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  required
                  leftIcon={<Package className="w-4 h-4" />}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Describe the product..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <Input
                  label="Category"
                  placeholder="e.g., Electronics, Services, Food"
                  value={formData.category}
                  onChange={handleInputChange('category')}
                  leftIcon={<FileText className="w-4 h-4" />}
                />
              </div>
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
                  : product
                    ? 'Update Product'
                    : 'Create Product'
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyProductForm;
