import { useState } from 'react';
import {
  Users,
  UserPlus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Download,
  Search,
  Edit,
  Trash2,
  Eye,
  Bell,
  Settings,
  Plus
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Input } from '../../ui/Input';
import { Column } from '../../ui/Table';
import { format } from 'date-fns';

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'email' | 'number' | 'select' | 'checkbox' | 'textarea';
  required: boolean;
  options?: string[];
}

export interface Registrant {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  registration_date: string;
  status: 'registered' | 'confirmed' | 'attended' | 'no_show' | 'cancelled';
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
  custom_fields?: Record<string, any>;
  notes?: string;
}

export interface WaitlistEntry {
  id: number;
  name: string;
  email: string;
  phone?: string;
  added_date: string;
  position: number;
  notified: boolean;
}

export interface AdvancedRegistrationProps {
  eventId: number;
  eventTitle: string;
  maxCapacity: number;
  currentRegistrations: number;
  registrants: Registrant[];
  waitlist: WaitlistEntry[];
  customFields: CustomField[];
  loading?: boolean;
  onRegistrantUpdate?: (registrantId: number, data: Partial<Registrant>) => void;
  onSendReminder?: (registrantId: number) => void;
  onExport?: (format: 'csv' | 'pdf') => void;
  onCustomFieldAdd?: (field: CustomField) => void;
  onWaitlistPromote?: (waitlistId: number) => void;
}

export function AdvancedRegistration({
  eventTitle,
  maxCapacity,
  currentRegistrations,
  registrants,
  waitlist,
  customFields,
  onRegistrantUpdate,
  onSendReminder,
  onExport,
  onCustomFieldAdd,
  onWaitlistPromote
}: Omit<AdvancedRegistrationProps, 'eventId' | 'loading'>) {
  const [activeTab, setActiveTab] = useState<'registrants' | 'waitlist' | 'settings'>('registrants');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCustomFieldModal, setShowCustomFieldModal] = useState(false);
  const [newCustomField, setNewCustomField] = useState<Partial<CustomField>>({
    name: '',
    type: 'text',
    required: false,
    options: []
  });

  const availableSlots = maxCapacity - currentRegistrations;
  const isAtCapacity = availableSlots <= 0;

  const filteredRegistrants = registrants.filter(registrant => {
    const matchesSearch = registrant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         registrant.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || registrant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'registered':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'attended':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'no_show':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'attended':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'no_show':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusIcon = (status?: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'refunded':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default:
        return null;
    }
  };

  const handleAddCustomField = () => {
    if (newCustomField.name && newCustomField.type) {
      onCustomFieldAdd?.(newCustomField as CustomField);
      setNewCustomField({
        name: '',
        type: 'text',
        required: false,
        options: []
      });
      setShowCustomFieldModal(false);
    }
  };

  const handlePromoteFromWaitlist = (waitlistEntry: WaitlistEntry) => {
    onWaitlistPromote?.(waitlistEntry.id);
  };

  const registrantColumns: Column<Registrant>[] = [
    {
      key: 'name' as keyof Registrant,
      title: 'Registrant',
      sortable: true,
      render: (registrant: Registrant) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{registrant.name}</div>
          <div className="text-sm text-gray-500">{registrant.email}</div>
          {registrant.company && (
            <div className="text-xs text-gray-400">{registrant.company}</div>
          )}
        </div>
      )
    },
    {
      key: 'status' as keyof Registrant,
      title: 'Status',
      sortable: true,
      render: (registrant: Registrant) => (
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(registrant.status)}`}>
          {getStatusIcon(registrant.status)}
          {registrant.status}
        </div>
      )
    },
    {
      key: 'payment_status' as keyof Registrant,
      title: 'Payment',
      render: (registrant: Registrant) => (
        registrant.payment_status ? (
          <div className="flex items-center gap-1">
            {getPaymentStatusIcon(registrant.payment_status)}
            <span className="text-sm text-gray-600">{registrant.payment_status}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-400">Free event</span>
        )
      )
    },
    {
      key: 'registration_date' as keyof Registrant,
      title: 'Registration Date',
      sortable: true,
      render: (registrant: Registrant) => (
        <span className="text-sm text-gray-500">
          {format(new Date(registrant.registration_date), 'MMM dd, yyyy')}
        </span>
      )
    },
    {
      key: 'id' as keyof Registrant,
      title: 'Actions',
      render: (registrant: Registrant) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSendReminder?.(registrant.id)}
            leftIcon={<Mail className="w-4 h-4" />}
            title="Send Reminder"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRegistrantUpdate?.(registrant.id, { status: 'attended' })}
            leftIcon={<CheckCircle className="w-4 h-4" />}
            title="Mark as Attended"
          />
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Eye className="w-4 h-4" />}
            title="View Details"
          />
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Registration Management</h2>
          <p className="text-gray-600">{eventTitle}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onExport?.('csv')}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Capacity Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Capacity Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{currentRegistrations}</div>
              <div className="text-sm text-gray-600">Current Registrations</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{maxCapacity}</div>
              <div className="text-sm text-gray-600">Max Capacity</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{availableSlots}</div>
              <div className="text-sm text-gray-600">Available Slots</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{waitlist.length}</div>
              <div className="text-sm text-gray-600">Waitlist</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Registration Progress</span>
              <span>{Math.round((currentRegistrations / maxCapacity) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  isAtCapacity ? 'bg-red-600' : currentRegistrations > maxCapacity * 0.8 ? 'bg-yellow-600' : 'bg-green-600'
                }`}
                style={{ width: `${Math.min((currentRegistrations / maxCapacity) * 100, 100)}%` }}
              />
            </div>
            {isAtCapacity && (
              <p className="text-sm text-red-600 mt-2">
                Event is at full capacity. New registrations will be added to waitlist.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            type="button"
            onClick={() => setActiveTab('registrants')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'registrants'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Registrants ({registrants.length})
            </div>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('waitlist')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'waitlist'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Waitlist ({waitlist.length})
            </div>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </div>
          </button>
        </nav>
      </div>

      {/* Registrants Tab */}
      {activeTab === 'registrants' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Registrant Management</CardTitle>
              <div className="flex gap-2">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search registrants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-1 text-sm"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="registered">Registered</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="attended">Attended</option>
                  <option value="no_show">No Show</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {registrantColumns.map((column) => (
                      <th
                        key={column.key as string}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRegistrants.map((registrant) => (
                    <tr key={registrant.id}>
                      {registrantColumns.map((column, columnIndex) => (
                        <td key={column.key as string} className="px-6 py-4 whitespace-nowrap">
                          {column.render ? column.render(registrant[column.key], registrant, columnIndex) : String(registrant[column.key] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Waitlist Tab */}
      {activeTab === 'waitlist' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Waitlist Management</span>
              <Badge variant="secondary">{waitlist.length} people waiting</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {waitlist.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No one is currently on the waitlist</p>
              </div>
            ) : (
              <div className="space-y-4">
                {waitlist.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">#{entry.position}</div>
                        <div className="text-xs text-gray-500">Position</div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{entry.name}</div>
                        <div className="text-sm text-gray-500">{entry.email}</div>
                        <div className="text-xs text-gray-400">
                          Added {format(new Date(entry.added_date), 'MMM dd, yyyy')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {entry.notified && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Bell className="w-3 h-3" />
                          Notified
                        </Badge>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePromoteFromWaitlist(entry)}
                        leftIcon={<UserPlus className="w-4 h-4" />}
                        disabled={!isAtCapacity}
                      >
                        Promote to Registration
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <Card>
          <CardHeader>
            <CardTitle>Registration Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Custom Fields */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Custom Registration Fields</h3>
                <Button
                  onClick={() => setShowCustomFieldModal(true)}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add Field
                </Button>
              </div>
              {customFields.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">No custom fields defined</p>
                  <p className="text-sm text-gray-500 mt-1">Add custom fields to collect additional information during registration</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {customFields.map((field) => (
                    <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{field.name}</div>
                        <div className="text-sm text-gray-500 capitalize">{field.type}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {field.required && <Badge variant="secondary">Required</Badge>}
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Field Modal */}
            {showCustomFieldModal && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-4">Add Custom Field</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Field Name</label>
                    <Input
                      type="text"
                      value={newCustomField.name || ''}
                      onChange={(e) => setNewCustomField(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Dietary Requirements"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Field Type</label>
                    <select
                      value={newCustomField.type || 'text'}
                      onChange={(e) => setNewCustomField(prev => ({ ...prev, type: e.target.value as CustomField['type'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="number">Number</option>
                      <option value="select">Select</option>
                      <option value="checkbox">Checkbox</option>
                      <option value="textarea">Textarea</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="required-field"
                      checked={newCustomField.required || false}
                      onChange={(e) => setNewCustomField(prev => ({ ...prev, required: e.target.checked }))}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <label htmlFor="required-field" className="text-sm font-medium text-gray-700">
                      Required field
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddCustomField}>
                      Add Field
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowCustomFieldModal(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}