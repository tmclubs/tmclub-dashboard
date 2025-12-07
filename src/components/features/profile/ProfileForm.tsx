import React, { useState, useEffect } from 'react';
import { Button, Input, Textarea, Card } from '@/components/ui';
import { Upload, Camera, User, Mail, Phone, MapPin, Calendar, Briefcase, Link2, Save } from 'lucide-react';
import { getBackendImageUrl } from '@/lib/utils/image';

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  birthDate: string;
  jobTitle: string;
  company: string;
  department: string;
  website: string;
  linkedin: string;
  twitter: string;
  skills: string[];
  interests: string[];
  avatar?: string;
}

export interface ProfileFormProps {
  initialData?: Partial<ProfileFormData>;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  loading?: boolean;
  onCancel?: () => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
  onCancel,
}) => {
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    bio: initialData?.bio || '',
    location: initialData?.location || '',
    birthDate: initialData?.birthDate || '',
    jobTitle: initialData?.jobTitle || '',
    company: initialData?.company || '',
    department: initialData?.department || '',
    website: initialData?.website || '',
    linkedin: initialData?.linkedin || '',
    twitter: initialData?.twitter || '',
    skills: initialData?.skills || [],
    interests: initialData?.interests || [],
  });

  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData?.avatar ? getBackendImageUrl(initialData.avatar) || null : null);

  // Update form data when initialData changes (e.g., when API data is loaded)
  useEffect(() => {
    if (initialData) {
      if (initialData.avatar) {
        setAvatarPreview(getBackendImageUrl(initialData.avatar) || null);
      }
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        bio: initialData.bio || '',
        location: initialData.location || '',
        birthDate: initialData.birthDate || '',
        jobTitle: initialData.jobTitle || '',
        company: initialData.company || '',
        department: initialData.department || '',
        website: initialData.website || '',
        linkedin: initialData.linkedin || '',
        twitter: initialData.twitter || '',
        skills: initialData.skills || [],
        interests: initialData.interests || [],
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const removeInterest = (interestToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(interest => interest !== interestToRemove)
    }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-1 bg-orange-500 rounded-full cursor-pointer hover:bg-orange-600">
              <Camera className="w-4 h-4 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Upload Profile Picture</h4>
            <p className="text-sm text-gray-600 mt-1">
              JPG, PNG or GIF. Maximum file size 2MB.
            </p>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Upload className="w-4 h-4" />}
              className="mt-2"
              onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
            >
              Choose File
            </Button>
          </div>
        </div>
      </Card>

      {/* Basic Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name"
            placeholder="Enter your first name"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            required
          />
          <Input
            label="Last Name"
            placeholder="Enter your last name"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />
          <Input
            label="Phone"
            type="tel"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            leftIcon={<Phone className="w-4 h-4" />}
          />
          <Input
            label="Location"
            placeholder="Enter your location"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            leftIcon={<MapPin className="w-4 h-4" />}
          />
          <Input
            label="Birth Date"
            type="date"
            value={formData.birthDate}
            onChange={(e) => handleInputChange('birthDate', e.target.value)}
            leftIcon={<Calendar className="w-4 h-4" />}
          />
        </div>
        <div className="mt-4">
          <Textarea
            label="Bio"
            placeholder="Tell us about yourself"
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            rows={4}
          />
        </div>
      </Card>

      {/* Professional Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Job Title"
            placeholder="Enter your job title"
            value={formData.jobTitle}
            onChange={(e) => handleInputChange('jobTitle', e.target.value)}
            leftIcon={<Briefcase className="w-4 h-4" />}
          />
          <Input
            label="Company"
            placeholder="Enter your company"
            value={formData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
          />
          <Input
            label="Department"
            placeholder="Enter your department"
            value={formData.department}
            onChange={(e) => handleInputChange('department', e.target.value)}
          />
          <Input
            label="Website"
            type="url"
            placeholder="https://yourwebsite.com"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            leftIcon={<Link2 className="w-4 h-4" />}
          />
          <Input
            label="LinkedIn"
            placeholder="https://linkedin.com/in/yourprofile"
            value={formData.linkedin}
            onChange={(e) => handleInputChange('linkedin', e.target.value)}
          />
          <Input
            label="Twitter"
            placeholder="@yourusername"
            value={formData.twitter}
            onChange={(e) => handleInputChange('twitter', e.target.value)}
          />
        </div>
      </Card>

      {/* Skills */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Add a skill"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
          />
          <Button type="button" onClick={addSkill}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.skills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="ml-1 text-orange-500 hover:text-orange-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </Card>

      {/* Interests */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Interests</h3>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Add an interest"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
          />
          <Button type="button" onClick={addInterest}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.interests.map((interest, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
            >
              {interest}
              <button
                type="button"
                onClick={() => removeInterest(interest)}
                className="ml-1 text-blue-500 hover:text-blue-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" leftIcon={<Save className="w-4 h-4" />} loading={loading}>
          Save Changes
        </Button>
      </div>
    </form>
  );
};