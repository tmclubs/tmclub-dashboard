import React, { useState } from 'react';
import { Building2, Upload, X, Mail, Phone, MapPin, User, Globe, Briefcase, Shield, Check } from 'lucide-react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Badge, Textarea } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

export interface CompanyFormData {
  name: string;
  description: string;
  logo?: string;
  industry: string;
  location: string;
  website?: string;
  email: string;
  phone?: string;
  contactPerson: {
    name: string;
    email: string;
    phone?: string;
  };
  status: 'active' | 'inactive' | 'pending';
}

export interface CompanyFormProps {
  company?: Partial<CompanyFormData>;
  onSubmit: (data: CompanyFormData) => void;
  loading?: boolean;
  onCancel?: () => void;
  title?: string;
}

const industries = [
  'Automotive',
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Manufacturing',
  'Retail',
  'Real Estate',
  'Consulting',
  'Other'
];

export const CompanyForm: React.FC<CompanyFormProps> = ({
  company,
  onSubmit,
  loading = false,
  onCancel,
  title = company ? 'Edit Company' : 'Create New Company'
}) => {
  const [formData, setFormData] = useState<CompanyFormData>({
    name: company?.name || '',
    description: company?.description || '',
    logo: company?.logo || '',
    industry: company?.industry || '',
    location: company?.location || '',
    website: company?.website || '',
    email: company?.email || '',
    phone: company?.phone || '',
    contactPerson: {
      name: company?.contactPerson?.name || '',
      email: company?.contactPerson?.email || '',
      phone: company?.contactPerson?.phone || '',
    },
    status: company?.status || 'active',
  });

  const [logoPreview, setLogoPreview] = useState<string>(company?.logo || '');

  const handleInputChange = (field: keyof CompanyFormData | keyof CompanyFormData['contactPerson']) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (field in formData.contactPerson) {
      setFormData(prev => ({
        ...prev,
        contactPerson: {
          ...prev.contactPerson,
          [field]: e.target.value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: e.target.value
      }));
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        setFormData(prev => ({ ...prev, logo: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview('');
    setFormData(prev => ({ ...prev, logo: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getIndustryColor = (industry: string) => {
    const colors: { [key: string]: string } = {
      'Automotive': 'bg-blue-100 text-blue-800 border-blue-200',
      'Technology': 'bg-purple-100 text-purple-800 border-purple-200',
      'Finance': 'bg-green-100 text-green-800 border-green-200',
      'Healthcare': 'bg-red-100 text-red-800 border-red-200',
      'Education': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Manufacturing': 'bg-orange-100 text-orange-800 border-orange-200',
      'Retail': 'bg-pink-100 text-pink-800 border-pink-200',
      'Real Estate': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Consulting': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'Other': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[industry] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                value={formData.name}
                onChange={handleInputChange('name')}
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

          {/* Industry & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <select
                value={formData.industry}
                onChange={handleInputChange('industry')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                required
              >
                <option value="">Select industry</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
              {formData.industry && (
                <Badge className={cn("mt-2", getIndustryColor(formData.industry))}>
                  <Briefcase className="w-3 h-3 mr-1" />
                  {formData.industry}
                </Badge>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  value={formData.location}
                  onChange={handleInputChange('location')}
                  placeholder="City, Country"
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Website & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="url"
                  value={formData.website}
                  onChange={handleInputChange('website')}
                  placeholder="https://example.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={handleInputChange('status')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
              <Badge className={cn("mt-2", getStatusColor(formData.status))}>
                {formData.status}
              </Badge>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5" />
              Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Email
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange('phone')}
                    placeholder="+62 21 1234 5678"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    value={formData.contactPerson.name}
                    onChange={handleInputChange('name')}
                    placeholder="John Doe"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="email"
                    value={formData.contactPerson.email}
                    onChange={handleInputChange('email')}
                    placeholder="john@example.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Person Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="tel"
                  value={formData.contactPerson.phone}
                  onChange={handleInputChange('phone')}
                  placeholder="+62 812 3456 7890"
                  className="pl-10"
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
                <span className="text-sm text-gray-600">Industry</span>
                {formData.industry && (
                  <Badge className={cn("text-xs", getIndustryColor(formData.industry))}>
                    {formData.industry}
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <Badge className={cn("text-xs", getStatusColor(formData.status))}>
                  {formData.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Location</span>
                <span className="text-xs font-medium text-gray-900 line-clamp-1">
                  {formData.location || '-'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Website</span>
                <span className="text-xs font-medium text-blue-600 line-clamp-1">
                  {formData.website ? '✓ Added' : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Contact Person</span>
                <span className="text-xs font-medium text-gray-900 line-clamp-1">
                  {formData.contactPerson.name || '-'}
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
              {formData.name && (
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">Company name</span>
                </div>
              )}
              {formData.industry && (
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">Industry</span>
                </div>
              )}
              {formData.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">Company email</span>
                </div>
              )}
              {formData.contactPerson.name && formData.contactPerson.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">Contact person</span>
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