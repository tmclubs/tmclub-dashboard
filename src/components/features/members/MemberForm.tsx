import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
} from 'lucide-react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { type Member } from './MemberCard';
import { getBackendImageUrl } from '@/lib/utils/image';

export interface MemberFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  avatarFile?: File;
  role: 'member' | 'admin' | 'moderator';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  companyId?: string;
  position?: string;
  location: string;
  membershipType: 'basic' | 'premium' | 'enterprise';
  bio?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
}

export interface MemberFormProps {
  member?: Partial<Member>;
  companies: Array<{ id: string; name: string }>;
  onSubmit: (data: MemberFormData) => void;
  loading?: boolean;
  onCancel?: () => void;
  title?: string;
}

export const MemberForm: React.FC<MemberFormProps> = ({
  member,
  companies,
  onSubmit,
  loading = false,
  onCancel,
  title = member ? 'Edit User' : 'Add New User',
}) => {
  const [formData, setFormData] = useState<MemberFormData>({
    firstName: member?.firstName || '',
    lastName: member?.lastName || '',
    email: member?.email || '',
    phone: member?.phone || '',
    avatar: member?.avatar || '',
    role: member?.role || 'member',
    status: member?.status || 'active',
    companyId: member?.company?.id || '',
    position: member?.company?.position || '',
    location: member?.location || '',
    membershipType: member?.membershipType || 'basic',
    bio: member?.bio || '',
    linkedin: member?.socialLinks?.linkedin || '',
    twitter: member?.socialLinks?.twitter || '',
    website: member?.socialLinks?.website || '',
  });

  const [imagePreview, setImagePreview] = useState<string>(member?.avatar ? getBackendImageUrl(member.avatar) || '' : '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof MemberFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, avatar: result, avatarFile: files[0] }));
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setFormData(prev => ({ ...prev, avatar: '', avatarFile: undefined }));
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
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Profile Picture</h3>
              <div className="flex items-center gap-6">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="w-24 h-24 rounded-full object-cover border border-gray-200"
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
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                )}

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    leftIcon={<Upload className="w-4 h-4" />}
                  >
                    {imagePreview ? 'Change Photo' : 'Upload Photo'}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Recommended: Square image, at least 200x200px
                  </p>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Personal Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name *"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                  leftIcon={<User className="w-4 h-4" />}
                />

                <Input
                  label="Last Name *"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                  leftIcon={<User className="w-4 h-4" />}
                />

                <Input
                  label="Email *"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  leftIcon={<Mail className="w-4 h-4" />}
                />

                <Input
                  label="Phone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  leftIcon={<Phone className="w-4 h-4" />}
                />
              </div>

              <Input
                label="Location *"
                placeholder="Enter city/country"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                required
                leftIcon={<MapPin className="w-4 h-4" />}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  placeholder="Brief biography (optional)"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>

            {/* Role and Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Role & Status</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  >
                    <option value="member">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Membership Type *
                </label>
                <select
                  value={formData.membershipType}
                  onChange={(e) => handleInputChange('membershipType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>

            {/* Member Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Member Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Member
                  </label>
                  <select
                    value={formData.companyId}
                    onChange={(e) => handleInputChange('companyId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select company</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Position"
                  placeholder="Job title or position"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  leftIcon={<Building2 className="w-4 h-4" />}
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Social Links</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="LinkedIn"
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={formData.linkedin}
                  onChange={(e) => handleInputChange('linkedin', e.target.value)}
                />

                <Input
                  label="Twitter"
                  type="url"
                  placeholder="https://twitter.com/username"
                  value={formData.twitter}
                  onChange={(e) => handleInputChange('twitter', e.target.value)}
                />
              </div>

              <Input
                label="Website"
                type="url"
                placeholder="https://example.com"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
              />
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
                  : member
                    ? 'Update Member'
                    : 'Add Member'
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};