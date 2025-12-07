import React, { useState, useRef } from 'react';
import { Upload, X, Building, MapPin, Phone, Mail } from 'lucide-react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Textarea } from '@/components/ui';
import { CompanyFormData, Company } from '@/types/api';
import { getBackendImageUrl } from '@/lib/utils/image';

export interface CompanyFormProps {
  company?: Partial<Company>;
  onSubmit: (data: CompanyFormData) => void | Promise<void>;
  loading?: boolean;
  onCancel?: () => void;
  title?: string;
}

export const CompanyForm: React.FC<CompanyFormProps> = ({
  company,
  onSubmit,
  loading = false,
  onCancel,
  title = company ? 'Edit Company' : 'Add New Company',
}) => {
  const [formData, setFormData] = useState<CompanyFormData>({
    display_name: company?.display_name || '',
    description: company?.description || '',
    main_image: company?.main_image || '',
    address: company?.address || '',
    contact: company?.contact || '',
    email: company?.email || '',
    city: company?.city || '',
  });

  const [logoPreview, setLogoPreview] = useState<string>(
    company?.main_image && typeof company.main_image === 'string'
      ? getBackendImageUrl(company.main_image) || ''
      : ''
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Company Logo</h3>
              <div className="flex items-center gap-6">
                {logoPreview ? (
                  <div className="relative">
                    <img
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
                  label="Company Name *"
                  placeholder="Enter company name"
                  value={formData.display_name}
                  onChange={handleInputChange('display_name')}
                  required
                  leftIcon={<Building className="w-4 h-4" />}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <Textarea
                    placeholder="Describe the company..."
                    value={formData.description}
                    onChange={handleInputChange('description')}
                    className="w-full resize-none"
                    rows={4}
                    required
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
                  placeholder="company@example.com"
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
                    ? 'Update Company'
                    : 'Create Company'
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};