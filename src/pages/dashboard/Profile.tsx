import React, { useState } from 'react';
import { ProfileForm, type ProfileFormData } from '@/components/features/profile';
import { Card, Button, Modal, ConfirmDialog } from '@/components/ui';
import { User, Settings, Shield, Bell, Key, Download, Trash2 } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock current user data
  const currentProfileData: Partial<ProfileFormData> = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@toyota-indonesia.com',
    phone: '+62 812 3456 7890',
    bio: 'Senior Software Engineer with expertise in automotive technology and digital transformation. Passionate about creating innovative solutions for the manufacturing industry.',
    location: 'Jakarta, Indonesia',
    birthDate: '1990-01-15',
    jobTitle: 'Senior Software Engineer',
    company: 'PT Toyota Motor Manufacturing Indonesia',
    department: 'IT Department',
    website: 'https://johndoe.dev',
    linkedin: 'https://linkedin.com/in/johndoe',
    twitter: '@johndoe',
    skills: ['React', 'TypeScript', 'Node.js', 'Cloud Architecture', 'DevOps', 'Agile'],
    interests: ['Automotive Technology', 'Innovation', 'Leadership', 'Mentoring'],
  };

  const handleProfileUpdate = async (data: ProfileFormData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Profile updated:', data);
      // TODO: Show success toast
    } catch (error) {
      console.error('Failed to update profile:', error);
      // TODO: Show error toast
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (_currentPassword: string, _newPassword: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Password changed');
      setShowPasswordModal(false);
      // TODO: Show success toast
    } catch (error) {
      console.error('Failed to change password:', error);
      // TODO: Show error toast
    } finally {
      setLoading(false);
    }
  };

  const handleAccountDeletion = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Account deleted');
      // Redirect to login or home page
      window.location.href = '/login';
    } catch (error) {
      console.error('Failed to delete account:', error);
      // TODO: Show error toast
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    // Simulate data export
    const dataStr = JSON.stringify(currentProfileData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'profile-data.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Settings },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-1">Manage your profile information and preferences</p>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'profile' && (
          <ProfileForm
            initialData={currentProfileData}
            onSubmit={handleProfileUpdate}
            loading={loading}
          />
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Password Section */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Key className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Password</h3>
                    <p className="text-sm text-gray-600">Change your account password</p>
                  </div>
                </div>
                <Button onClick={() => setShowPasswordModal(true)}>
                  Change Password
                </Button>
              </div>
            </Card>

            {/* Two-Factor Authentication */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  </div>
                </div>
                <Button variant="outline">Enable 2FA</Button>
              </div>
            </Card>

            {/* Active Sessions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Sessions</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-xs">🖥️</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Windows PC - Chrome</p>
                      <p className="text-xs text-gray-500">Jakarta, Indonesia • Current session</p>
                    </div>
                  </div>
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-xs">📱</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">iPhone - Safari</p>
                      <p className="text-xs text-gray-500">Jakarta, Indonesia • 2 hours ago</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Terminate</Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'notifications' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              {[
                { title: 'Email Notifications', description: 'Receive email updates about your account activity' },
                { title: 'Push Notifications', description: 'Get push notifications in your browser' },
                { title: 'Event Reminders', description: 'Remind me about upcoming events' },
                { title: 'Newsletter', description: 'Receive weekly newsletter with updates' },
              ].map((setting, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{setting.title}</p>
                    <p className="text-sm text-gray-600">{setting.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked={index < 3} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-6">
            {/* Data Export */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Download className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Export Your Data</h3>
                    <p className="text-sm text-gray-600">Download a copy of your personal data</p>
                  </div>
                </div>
                <Button variant="outline" onClick={handleExportData}>
                  Export Data
                </Button>
              </div>
            </Card>

            {/* Account Deletion */}
            <Card className="p-6 border-red-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-900">Delete Account</h3>
                    <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                  </div>
                </div>
                <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                  Delete Account
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Password Change Modal */}
      <Modal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
      >
        <PasswordChangeForm
          onSubmit={handlePasswordChange}
          loading={loading}
          onCancel={() => setShowPasswordModal(false)}
        />
      </Modal>

      {/* Delete Account Confirmation */}
      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleAccountDeletion}
        title="Delete Account"
        description="Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data, including profile information, activity history, and preferences."
        confirmText="Delete Account"
        cancelText="Cancel"
        variant="destructive"
        loading={loading}
      />
    </div>
  );
};

// Password Change Form Component
const PasswordChangeForm: React.FC<{
  onSubmit: (current: string, newPassword: string) => Promise<void>;
  loading?: boolean;
  onCancel?: () => void;
}> = ({ onSubmit, loading, onCancel }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    await onSubmit(currentPassword, newPassword);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Current Password
        </label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          New Password
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirm New Password
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Change Password
        </Button>
      </div>
    </form>
  );
};