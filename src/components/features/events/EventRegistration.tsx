import React, { useState } from 'react';
import { User, Mail, Phone, Building, Check, AlertCircle, CreditCard } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Badge } from '@/components/ui';

export interface EventRegistrationProps {
  event: {
    id: string;
    title: string;
    date: string;
    venue: string;
    price: number;
    isFree: boolean;
    maxParticipants?: number;
    currentRegistrants?: number;
    isRegistrationClose: boolean;
    isPast: boolean;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
  loading?: boolean;
}

export const EventRegistration: React.FC<EventRegistrationProps> = ({
  event,
  onSuccess,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    notes: '',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Invalid email format';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Handle registration logic here
      onSuccess?.();
    }
  };

  const handleInputChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const isFullyBooked = event.maxParticipants && (event.currentRegistrants || 0) >= event.maxParticipants;
  const canRegister = !event.isPast && !event.isRegistrationClose && !isFullyBooked;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Event Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Event Registration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>

              <div className="mt-4 space-y-2">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(event.date).toLocaleString()}
                </div>

                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {event.venue}
                </div>

                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  {event.currentRegistrants || 0} registered
                  {event.maxParticipants && ` / ${event.maxParticipants} max`}
                </div>
              </div>

              <div className="mt-4">
                <Badge variant={event.isFree ? 'success' : 'default'} className="text-sm">
                  {event.isFree ? 'FREE' : `$${event.price}`}
                </Badge>

                {!canRegister && (
                  <div className="mt-2">
                    <Badge variant="error" size="sm">
                      {event.isPast ? 'Event has ended' :
                       event.isRegistrationClose ? 'Registration closed' :
                       'Fully booked'}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-4">Registration Status</h4>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {canRegister ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="text-sm">
                    {canRegister ? 'Registration open' : 'Registration closed'}
                  </span>
                </div>

                {event.maxParticipants && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min((event.currentRegistrants || 0) / event.maxParticipants * 100, 100)}%`
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registration Form */}
      {canRegister ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name *"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={handleInputChange('firstName')}
                  error={errors.firstName}
                  required
                />

                <Input
                  label="Last Name *"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={handleInputChange('lastName')}
                  error={errors.lastName}
                  required
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email Address *"
                  type="email"
                  placeholder="your.email@example.com"
                  leftIcon={<Mail className="h-4 w-4" />}
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  error={errors.email}
                  required
                />

                <Input
                  label="Phone Number *"
                  type="tel"
                  placeholder="+62 812-3456-7890"
                  leftIcon={<Phone className="h-4 w-4" />}
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  error={errors.phone}
                  required
                />
              </div>

              {/* Professional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Company"
                  placeholder="Your company name"
                  leftIcon={<Building className="h-4 w-4" />}
                  value={formData.company}
                  onChange={handleInputChange('company')}
                />

                <Input
                  label="Job Title"
                  placeholder="Your job title"
                  value={formData.jobTitle}
                  onChange={handleInputChange('jobTitle')}
                />
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  rows={4}
                  placeholder="Any special requirements or notes..."
                  value={formData.notes}
                  onChange={handleInputChange('notes')}
                />
              </div>

              {/* Terms and Conditions */}
              <div className="border-t pt-6">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange('agreeToTerms')}
                    className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <label htmlFor="terms" className="text-sm text-gray-700">
                      I agree to the <a href="#" className="text-orange-600 hover:text-orange-500">Terms and Conditions</a> and understand that my registration may be cancelled if I don't attend the event.
                    </label>
                    {errors.agreeToTerms && (
                      <p className="text-red-500 text-xs mt-1">{errors.agreeToTerms}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Information for Paid Events */}
              {!event.isFree && (
                <Card className="bg-gray-50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <CreditCard className="h-5 w-5 text-orange-600" />
                      <h4 className="font-medium text-gray-900">Payment Information</h4>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Registration Fee:</span>
                        <span className="text-xl font-bold text-orange-600">${event.price}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Payment will be processed after you complete the registration
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                {onCancel && (
                  <Button variant="outline" type="button" onClick={onCancel} disabled={loading}>
                    Cancel
                  </Button>
                )}
                <Button type="submit" loading={loading} disabled={!canRegister}>
                  Complete Registration
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Registration Not Available
            </h3>
            <p className="text-gray-600 mb-6">
              {event.isPast ? 'This event has already ended.' :
               event.isRegistrationClose ? 'Registration for this event has closed.' :
               'This event is fully booked.'}
            </p>
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Back to Events
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Import Calendar and MapPin icons
import { Calendar, MapPin, Users } from 'lucide-react';