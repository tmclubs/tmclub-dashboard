import React, { useState, useRef, useEffect } from 'react';
import { Calendar, MapPin, DollarSign, Upload, X, Loader2 } from 'lucide-react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Badge, Textarea } from '@/components/ui';
import { EventFormData, Event } from '@/types/api';
import { validateFile, createImagePreview, cleanupImagePreview } from '@/lib/utils/file-upload';
import { eventsApi } from '@/lib/api/events';

export interface EventFormProps {
  event?: Event | null;
  onSubmit?: (data: EventFormData) => void;
  onSuccess?: (event: Event) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
}

export const EventForm: React.FC<EventFormProps> = ({
  event,
  onSubmit,
  onSuccess,
  onCancel,
  mode = 'create',
}) => {
  const [formData, setFormData] = useState<EventFormData>({
    title: event?.title || '',
    description: event?.description || '',
    date: event?.date || '',
    venue: event?.venue || '',
    main_image: event?.main_image || undefined,
    is_free: event?.is_free || false,
    is_registration_close: event?.is_registration_close || false,
    is_list_attendees: event?.is_list_attendees || true,
    price: event?.price || undefined,
    billing_deadline: event?.billing_deadline || undefined,
  });

  const [imagePreview, setImagePreview] = useState<string>(event?.main_image_url || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update form data when event prop changes
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        date: event.date || '',
        venue: event.venue || '',
        main_image: event.main_image || undefined,
        is_free: event.is_free || false,
        is_registration_close: event.is_registration_close || false,
        is_list_attendees: event.is_list_attendees || true,
        price: event.price || undefined,
        billing_deadline: event.billing_deadline || undefined,
      });
      setImagePreview(event.main_image_url || '');
    }
  }, [event]);

  const handleInputChange = (field: keyof EventFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'price' || field === 'billing_deadline'
        ? Number(e.target.value) || undefined
        : e.target.value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create preview
      const preview = await createImagePreview(file);
      setImagePreview(preview);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      // Upload file
      const result = await eventsApi.uploadMainImage(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success && result.data) {
        setFormData(prev => ({
          ...prev,
          main_image: result.data?.file_id || ''
        }));
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
      // Clean up on error
      if (imagePreview) {
        cleanupImagePreview(imagePreview);
        setImagePreview('');
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = () => {
    if (imagePreview) {
      cleanupImagePreview(imagePreview);
      setImagePreview('');
    }
    setFormData(prev => ({
      ...prev,
      main_image: undefined
    }));
    setUploadProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) return;
    
    setLoading(true);
    
    try {
      let result: Event;
      
      if (mode === 'edit' && event?.pk) {
        // Update existing event
        result = await eventsApi.updateEvent(event.pk, formData);
      } else {
        // Create new event
        result = await eventsApi.createEvent(formData);
      }
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(result);
      } else if (onSubmit) {
        onSubmit(formData);
      }
      
    } catch (error) {
      console.error('Error submitting event:', error);
      // You can add toast notification here if available
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - 2 columns on desktop, 1 on mobile */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Title
            </label>
            <Input
              value={formData.title}
              onChange={handleInputChange('title')}
              placeholder="Enter event title"
              className="w-full"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={handleInputChange('description')}
              placeholder="Describe your event..."
              rows={6}
              className="w-full resize-none"
              required
            />
          </div>

          {/* Date only - removing level field */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Date & Time
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="datetime-local"
                  value={formData.date}
                  onChange={handleInputChange('date')}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Venue */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Venue Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                value={formData.venue}
                onChange={handleInputChange('venue')}
                placeholder="Enter event location"
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_free"
                  checked={formData.is_free}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_free: e.target.checked }))}
                  className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="is_free" className="text-sm font-medium text-gray-700">
                  This is a free event
                </label>
              </div>
              {formData.is_free && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  Free Event
                </Badge>
              )}
            </div>

            {!formData.is_free && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ticket Price (IDR)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="number"
                    value={formData.price || ''}
                    onChange={handleInputChange('price')}
                    placeholder="0"
                    min="0"
                    className="pl-10"
                    required={!formData.is_free}
                  />
                </div>
              </div>
            )}

            {!formData.is_free && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Billing Deadline (days before event)
                </label>
                <Input
                  type="number"
                  value={formData.billing_deadline || ''}
                  onChange={handleInputChange('billing_deadline')}
                  placeholder="e.g., 7"
                  min="0"
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Registration Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Registration Settings</h3>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_registration_close"
                checked={formData.is_registration_close}
                onChange={(e) => setFormData(prev => ({ ...prev, is_registration_close: e.target.checked }))}
                className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="is_registration_close" className="text-sm font-medium text-gray-700">
                Close registration
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_list_attendees"
                checked={formData.is_list_attendees}
                onChange={(e) => setFormData(prev => ({ ...prev, is_list_attendees: e.target.checked }))}
                className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="is_list_attendees" className="text-sm font-medium text-gray-700">
                Show attendees list publicly
              </label>
            </div>
          </div>
        </div>

        {/* Sidebar - 1 column on desktop, full width on mobile */}
        <div className="space-y-6">
          {/* Event Status Preview */}
          <Card className="bg-gradient-to-br from-orange-50 to-pink-50 border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Event Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Type</span>
                  <Badge variant="secondary">
                    {formData.is_free ? 'Free' : 'Paid'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Registration</span>
                  <Badge variant={formData.is_registration_close ? "error" : "default"}>
                    {formData.is_registration_close ? 'Closed' : 'Open'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Attendees List</span>
                  <Badge variant={formData.is_list_attendees ? "default" : "secondary"}>
                    {formData.is_list_attendees ? 'Public' : 'Private'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Event Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                  <div className="space-y-2">
                    {isUploading ? (
                      <Loader2 className="mx-auto h-8 w-8 text-orange-500 animate-spin" />
                    ) : (
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    )}
                    <div className="text-sm text-gray-600">
                      <label htmlFor="image-upload" className={`cursor-pointer text-orange-600 hover:text-orange-500 ${isUploading ? 'pointer-events-none opacity-50' : ''}`}>
                        {isUploading ? 'Uploading...' : 'Upload main image'}
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                    <input
                      ref={fileInputRef}
                      id="image-upload"
                      name="image-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                  </div>
                  
                  {/* Progress Bar */}
                  {isUploading && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{uploadProgress}%</p>
                    </div>
                  )}
                </div>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Event Image</p>
                    <div className="relative group inline-block">
                      <img
                        src={imagePreview}
                        alt="Event preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-900">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Price</span>
                <span className="font-medium">
                  {formData.is_free ? 'Free' : `Rp ${(formData.price || 0).toLocaleString()}`}
                </span>
              </div>

              {formData.billing_deadline && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Billing Deadline</span>
                  <span className="font-medium">{formData.billing_deadline} days</span>
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
          {event ? 'Update Event' : 'Create Event'}
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