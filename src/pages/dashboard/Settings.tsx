import React, { useState } from 'react';
import { Card, Button, Switch, Input, Select, Modal, ConfirmDialog } from '@/components/ui';
import {
  Settings,
  Globe,
  Mail,
  Bell,
  Shield,
  Database,
  Palette,
  Users,
  Building,
  Save,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Mock settings data
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'TMC Web App',
    siteDescription: 'Toyota Manufacturers Club - Official Platform',
    contactEmail: 'admin@tmc.id',
    contactPhone: '+62 21 1234 5678',
    address: 'Jakarta, Indonesia',
    timezone: 'Asia/Jakarta',
    language: 'id-ID',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    eventReminders: true,
    systemAlerts: true,
    marketingEmails: false,
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    sessionTimeout: 30,
    passwordExpiry: 90,
    maxLoginAttempts: 5,
    requireStrongPassword: true,
    autoLogout: true,
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    primaryColor: 'orange',
    theme: 'light',
    fontSize: 'medium',
    compactMode: false,
    showSidebar: true,
    animationEnabled: true,
  });

  const tabs = [
    { id: 'general', label: 'General Settings', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'system', label: 'System', icon: Database },
  ];

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setUnsavedChanges(false);
      console.log('Settings saved');
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Settings reset to defaults');
      setShowResetDialog(false);
    } catch (error) {
      console.error('Failed to reset settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportSettings = () => {
    const settings = {
      general: generalSettings,
      notifications: notificationSettings,
      security: securitySettings,
      appearance: appearanceSettings,
    };

    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'settings-export.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const settings = JSON.parse(reader.result as string);
          // Apply imported settings
          console.log('Settings imported:', settings);
          setUnsavedChanges(true);
        } catch (error) {
          console.error('Failed to import settings:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const markAsUnsaved = () => {
    setUnsavedChanges(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">App Settings</h1>
          <p className="text-gray-600 mt-1">Manage system configuration and preferences</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExportSettings}
          >
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Upload className="w-4 h-4" />}
            onClick={() => document.getElementById('import-settings')?.click()}
          >
            Import
          </Button>
          <input
            id="import-settings"
            type="file"
            accept=".json"
            onChange={handleImportSettings}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={() => setShowResetDialog(true)}
          >
            Reset to Defaults
          </Button>
          <Button
            leftIcon={<Save className="w-4 h-4" />}
            onClick={handleSaveSettings}
            loading={loading}
            disabled={!unsavedChanges}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* Unsaved Changes Alert */}
      {unsavedChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600">⚠️</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">
                You have unsaved changes
              </p>
              <p className="text-sm text-yellow-600">
                Remember to save your changes before leaving this page.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <div className="w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 space-y-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Site Information</h3>
                <div className="space-y-4">
                  <Input
                    label="Site Name"
                    value={generalSettings.siteName}
                    onChange={(e) => {
                      setGeneralSettings(prev => ({ ...prev, siteName: e.target.value }));
                      markAsUnsaved();
                    }}
                  />
                  <Input
                    label="Site Description"
                    value={generalSettings.siteDescription}
                    onChange={(e) => {
                      setGeneralSettings(prev => ({ ...prev, siteDescription: e.target.value }));
                      markAsUnsaved();
                    }}
                  />
                  <Input
                    label="Contact Email"
                    type="email"
                    value={generalSettings.contactEmail}
                    onChange={(e) => {
                      setGeneralSettings(prev => ({ ...prev, contactEmail: e.target.value }));
                      markAsUnsaved();
                    }}
                  />
                  <Input
                    label="Contact Phone"
                    value={generalSettings.contactPhone}
                    onChange={(e) => {
                      setGeneralSettings(prev => ({ ...prev, contactPhone: e.target.value }));
                      markAsUnsaved();
                    }}
                  />
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Localization</h3>
                <div className="space-y-4">
                  <Select
                    label="Timezone"
                    value={generalSettings.timezone}
                    onChange={(e) => {
                      setGeneralSettings(prev => ({ ...prev, timezone: e.target.value }));
                      markAsUnsaved();
                    }}
                    options={[
                      { value: 'Asia/Jakarta', label: 'Asia/Jakarta (WIB)' },
                      { value: 'Asia/Singapore', label: 'Asia/Singapore' },
                      { value: 'UTC', label: 'UTC' },
                    ]}
                  />
                  <Select
                    label="Language"
                    value={generalSettings.language}
                    onChange={(e) => {
                      setGeneralSettings(prev => ({ ...prev, language: e.target.value }));
                      markAsUnsaved();
                    }}
                    options={[
                      { value: 'id-ID', label: 'Bahasa Indonesia' },
                      { value: 'en-US', label: 'English' },
                    ]}
                  />
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'notifications' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
              <div className="space-y-4">
                {Object.entries({
                  emailNotifications: 'Email Notifications',
                  pushNotifications: 'Push Notifications',
                  smsNotifications: 'SMS Notifications',
                  eventReminders: 'Event Reminders',
                  systemAlerts: 'System Alerts',
                  marketingEmails: 'Marketing Emails',
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">{label}</p>
                      <p className="text-sm text-gray-600">
                        {key === 'emailNotifications' && 'Send notifications via email'}
                        {key === 'pushNotifications' && 'Send push notifications to browser'}
                        {key === 'smsNotifications' && 'Send SMS notifications'}
                        {key === 'eventReminders' && 'Remind users about upcoming events'}
                        {key === 'systemAlerts' && 'Alert about system updates and maintenance'}
                        {key === 'marketingEmails' && 'Send marketing and promotional emails'}
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings[key as keyof typeof notificationSettings]}
                      onCheckedChange={(checked) => {
                        setNotificationSettings(prev => ({ ...prev, [key]: checked }));
                        markAsUnsaved();
                      }}
                    />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
              <div className="space-y-6">
                <div className="space-y-4">
                  {Object.entries({
                    twoFactorAuth: 'Two-Factor Authentication',
                    requireStrongPassword: 'Require Strong Passwords',
                    autoLogout: 'Auto-logout on Inactivity',
                  }).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{label}</p>
                        <p className="text-sm text-gray-600">
                          {key === 'twoFactorAuth' && 'Require 2FA for all admin accounts'}
                          {key === 'requireStrongPassword' && 'Enforce strong password requirements'}
                          {key === 'autoLogout' && 'Automatically logout inactive users'}
                        </p>
                      </div>
                      <Switch
                        checked={securitySettings[key as keyof typeof securitySettings]}
                        onCheckedChange={(checked) => {
                          setSecuritySettings(prev => ({ ...prev, [key]: checked }));
                          markAsUnsaved();
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <Input
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => {
                        setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }));
                        markAsUnsaved();
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password Expiry (days)
                    </label>
                    <Input
                      type="number"
                      value={securitySettings.passwordExpiry}
                      onChange={(e) => {
                        setSecuritySettings(prev => ({ ...prev, passwordExpiry: parseInt(e.target.value) }));
                        markAsUnsaved();
                      }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance Settings</h3>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Color
                    </label>
                    <Select
                      value={appearanceSettings.primaryColor}
                      onChange={(e) => {
                        setAppearanceSettings(prev => ({ ...prev, primaryColor: e.target.value }));
                        markAsUnsaved();
                      }}
                      options={[
                        { value: 'orange', label: 'Orange (Default)' },
                        { value: 'blue', label: 'Blue' },
                        { value: 'green', label: 'Green' },
                        { value: 'purple', label: 'Purple' },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Theme
                    </label>
                    <Select
                      value={appearanceSettings.theme}
                      onChange={(e) => {
                        setAppearanceSettings(prev => ({ ...prev, theme: e.target.value }));
                        markAsUnsaved();
                      }}
                      options={[
                        { value: 'light', label: 'Light' },
                        { value: 'dark', label: 'Dark' },
                        { value: 'auto', label: 'Auto (System)' },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Font Size
                    </label>
                    <Select
                      value={appearanceSettings.fontSize}
                      onChange={(e) => {
                        setAppearanceSettings(prev => ({ ...prev, fontSize: e.target.value }));
                        markAsUnsaved();
                      }}
                      options={[
                        { value: 'small', label: 'Small' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'large', label: 'Large' },
                      ]}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {Object.entries({
                    compactMode: 'Compact Mode',
                    showSidebar: 'Show Sidebar by Default',
                    animationEnabled: 'Enable Animations',
                  }).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{label}</p>
                        <p className="text-sm text-gray-600">
                          {key === 'compactMode' && 'Use more compact layout'}
                          {key === 'showSidebar' && 'Show sidebar navigation by default'}
                          {key === 'animationEnabled' && 'Enable interface animations'}
                        </p>
                      </div>
                      <Switch
                        checked={appearanceSettings[key as keyof typeof appearanceSettings]}
                        onCheckedChange={(checked) => {
                          setAppearanceSettings(prev => ({ ...prev, [key]: checked }));
                          markAsUnsaved();
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'users' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Management</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">1,234</div>
                    <div className="text-sm text-gray-600">Total Users</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">856</div>
                    <div className="text-sm text-gray-600">Active Users</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">45</div>
                    <div className="text-sm text-gray-600">New This Month</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">User Registration</h4>
                    <Switch defaultChecked />
                  </div>
                  <p className="text-sm text-gray-600">
                    Allow new users to register for an account. Admin approval may be required.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Email Verification</h4>
                    <Switch defaultChecked />
                  </div>
                  <p className="text-sm text-gray-600">
                    Require users to verify their email address before accessing the system.
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button>Manage Users</Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'system' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Configuration</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">System Information</h4>
                    <dl className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-600">Version:</dt>
                        <dd className="font-medium">1.0.0</dd>
                      </div>
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-600">Environment:</dt>
                        <dd className="font-medium">Development</dd>
                      </div>
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-600">Database:</dt>
                        <dd className="font-medium">PostgreSQL 14</dd>
                      </div>
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-600">Last Backup:</dt>
                        <dd className="font-medium">2 hours ago</dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Storage Usage</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-600">Database:</dt>
                        <dd className="font-medium">2.3 GB</dd>
                      </div>
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-600">File Storage:</dt>
                        <dd className="font-medium">5.7 GB</dd>
                      </div>
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-600">Cache:</dt>
                        <dd className="font-medium">1.2 GB</dd>
                      </div>
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-600">Total:</dt>
                        <dd className="font-medium">9.2 GB</dd>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">System Actions</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" size="sm">
                      Clear Cache
                    </Button>
                    <Button variant="outline" size="sm">
                      Run Backup
                    </Button>
                    <Button variant="outline" size="sm">
                      Optimize Database
                    </Button>
                    <Button variant="outline" size="sm">
                      Send Test Email
                    </Button>
                    <Button variant="outline" size="sm">
                      View System Logs
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        open={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        onConfirm={handleResetSettings}
        title="Reset Settings to Defaults"
        description="Are you sure you want to reset all settings to their default values? This action cannot be undone and will permanently remove all your current settings."
        confirmText="Reset to Defaults"
        cancelText="Cancel"
        variant="destructive"
        loading={loading}
      />
    </div>
  );
};