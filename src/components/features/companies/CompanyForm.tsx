import React, { useState } from 'react';
import { Upload, X, Building, MapPin, Phone, Mail, Shield, Check } from 'lucide-react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Textarea } from '@/components/ui';
import { CompanyFormData, Company } from '@/types/api';

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

  const [logoPreview, setLogoPreview] = useState<string>(company?.main_image || '');

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
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        setFormData(prev => ({ ...prev, main_image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview('');
    setFormData(prev => ({ ...prev, main_image: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - 2 columns on desktop, 1 on mobile */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                value={formData.display_name}
                onChange={handleInputChange('display_name')}
                placeholder="Enter company name"
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Description
            </label>
            <Textarea
              value={formData.description}
              onChange={handleInputChange('description')}
              placeholder="Describe your company..."
              rows={4}
              className="w-full resize-none"
              required
            />
          </div>

          {/* Address & City */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  value={formData.address}
                  onChange={handleInputChange('address')}
                  placeholder="Company address"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  value={formData.city}
                  onChange={handleInputChange('city')}
                  placeholder="City"
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Contact & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  value={formData.contact}
                  onChange={handleInputChange('contact')}
                  placeholder="Contact number"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  placeholder="company@example.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>


        </div>

        {/* Sidebar - 1 column on desktop, full width on mobile */}
        <div className="space-y-6">
          {/* Company Logo */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Company Logo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Logo Preview */}
              {logoPreview ? (
                <div className="relative group">
                  <img
                    src={logoPreview}
                    alt="Company logo"
                    className="w-full h-32 object-contain rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-orange-400 transition-colors">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="logo-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Upload Logo
                        </span>
                        <span className="mt-1 block text-xs text-gray-500">
                          PNG, JPG up to 5MB
                        </span>
                      </label>
                      <input
                        id="logo-upload"
                        name="logo-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleLogoUpload}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Company Summary */}
          <Card className="bg-gradient-to-br from-orange-50 to-pink-50 border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Company Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Company Name</span>
                <span className="text-xs font-medium text-gray-900 line-clamp-1">
                  {formData.display_name || '-'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Address</span>
                <span className="text-xs font-medium text-gray-900 line-clamp-1">
                  {formData.address || '-'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">City</span>
                <span className="text-xs font-medium text-gray-900 line-clamp-1">
                  {formData.city || '-'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Contact</span>
                <span className="text-xs font-medium text-gray-900 line-clamp-1">
                  {formData.contact || '-'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Email</span>
                <span className="text-xs font-medium text-blue-600 line-clamp-1">
                  {formData.email || '-'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Validation Status */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-900 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Validation Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {formData.display_name && (
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">Company name</span>
                </div>
              )}
              {formData.description && (
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">Description</span>
                </div>
              )}
              {formData.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">Company email</span>
                </div>
              )}
              {formData.contact && (
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">Contact information</span>
                </div>
              )}
              {formData.address && formData.city && (
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">Address information</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
        <Button
          type="submit"
          loading={loading}
          disabled={loading}
          className="w-full sm:flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-medium py-3"
        >
          {company ? 'Update Company' : 'Create Company'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};