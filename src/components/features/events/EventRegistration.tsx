import React, { useState, useEffect } from 'react';
import { User, Calendar, MapPin, Users, Check, AlertCircle, CreditCard } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { formatEventDateTime } from '@/lib/utils/date';
import { formatEventPrice } from '@/lib/utils/money';
import { EventRegistration as EventRegistrationData } from '@/types/api';
import { useAuthStore } from '@/lib/stores/authStore';

export interface EventRegistrationProps {
  eventId: number; // Required for API call
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
  registerMutation?: {
    mutate: (data: { eventId: number; data: EventRegistrationData }) => void;
    isPending: boolean;
    error?: Error | null;
  };
  onCancel?: () => void;
  loading?: boolean;
}

export const EventRegistration: React.FC<EventRegistrationProps> = ({
  eventId,
  event,
  registerMutation,
  onCancel,
  loading = false,
}) => {
  // Get authenticated user data
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    company: '',
    jobTitle: '',
    notes: '',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submissionError, setSubmissionError] = useState<string>('');

  // Use loading from registerMutation if available, otherwise use prop loading
  const isLoading = registerMutation?.isPending || loading;

  // Handle mutation success and error
  useEffect(() => {
    if (registerMutation?.error) {
      setSubmissionError(registerMutation.error.message || 'Registration failed. Please try again.');
    }
    // Note: onSuccess will be called by the parent component
    // The useRegisterForEvent hook already handles success with toast notification
  }, [registerMutation?.error]);

  // Clear submission error when user starts typing again
  useEffect(() => {
    if (submissionError && isLoading) {
      setSubmissionError('');
    }
  }, [isLoading, submissionError]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Only validate terms agreement since user data comes from authentication
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Backend uses token authentication - minimal data needed
      const registrationData: EventRegistrationData = {
        // Empty object or optional company_id if needed
        // Backend will identify user from JWT token
      };

      // Call API through registerMutation
      if (registerMutation) {
        registerMutation.mutate({
          eventId: eventId,
          data: registrationData,
        });
      } else {
        // Fallback if no registerMutation provided
        console.error('registerMutation prop is required for registration');
        return;
      }
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
                  {formatEventDateTime(event.date)}
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
                  {event.isFree ? 'FREE' : formatEventPrice({ is_free: false, price: event.price })}
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
              {/* User Information - Display from authenticated user */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Your Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="font-medium text-gray-900">
                      {user?.first_name} {user?.last_name || user?.username}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium text-gray-900">{user?.email}</p>
                  </div>
                  {user?.phone_number && (
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <p className="font-medium text-gray-900">{user.phone_number}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Role:</span>
                    <p className="font-medium text-gray-900 capitalize">{user?.role}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Information retrieved from your authenticated account
                </p>
              </div>

              {/* Optional Additional Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  rows={4}
                  placeholder="Any special requirements or notes for the event organizer..."
                  value={formData.notes}
                  onChange={handleInputChange('notes')}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This information is for event organizer reference only
                </p>
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
                        <span className="text-xl font-bold text-orange-600">{formatEventPrice({ is_free: event.isFree, price: event.price })}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Payment will be processed after you complete the registration
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Error Display */}
              {submissionError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800">Registration Error</h4>
                      <p className="text-sm text-red-700 mt-1">{submissionError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                {onCancel && (
                  <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>
                    Cancel
                  </Button>
                )}
                <Button type="submit" loading={isLoading} disabled={!canRegister || isLoading}>
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

