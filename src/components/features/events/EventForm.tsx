import React, { useState, useRef, useEffect } from 'react';
import { Calendar, MapPin, DollarSign, Upload, X, Loader2 } from 'lucide-react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Badge, Textarea } from '@/components/ui';
import { LazyImage } from '@/components/common/LazyImage';
import { formatEventPrice } from '@/lib/utils/money';
import { toISOWithLocalOffset } from '@/lib/utils/date';
import { EventFormData, Event } from '@/types/api';
import { validateFile, createImagePreview, cleanupImagePreview } from '@/lib/utils/file-upload';
import { eventsApi } from '@/lib/api/events';
import { getBackendImageUrl } from '@/lib/utils/image';

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
    // Required fields from EventSerializer
    title: event?.title || '',
    date: event?.date || '',
    venue: event?.venue || '',
    description: event?.description || '',
    is_free: event?.is_free || false,
    is_registration_close: event?.is_registration_close || false,
    is_list_attendees: event?.is_list_attendees || true,

    // Optional fields from EventSerializer
    main_image: event?.main_image || null,
    price: event?.price || null,
    billing_deadline: event?.billing_deadline || null,

    // Fields not in EventSerializer (hidden for now)
    level: event?.level || undefined,
    published_at: event?.published_at || undefined,
    references: [], // Hidden for now
    medias: [], // Hidden for now
  });

  const [imagePreview, setImagePreview] = useState<string>(event?.main_image_url ? getBackendImageUrl(event.main_image_url) || '' : '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update form data when event prop changes
  useEffect(() => {
    if (event) {
      setFormData({
        // Required fields from EventSerializer
        title: event.title || '',
        date: event.date || '',
        venue: event.venue || '',
        description: event.description || '',
        is_free: event.is_free || false,
        is_registration_close: event.is_registration_close || false,
        is_list_attendees: event.is_list_attendees || true,

        // Optional fields from EventSerializer
        main_image: event.main_image || null,
        price: event.price || null,
        billing_deadline: event.billing_deadline || null,

        // Fields not in EventSerializer (hidden for now)
        level: event.level || undefined,
        published_at: event.published_at || undefined,
        references: [], // Hidden for now
        medias: [], // Hidden for now
      });
      setImagePreview(event.main_image_url ? getBackendImageUrl(event.main_image_url) || '' : '');
    }
  }, [event]);

  const handleInputChange = (field: keyof EventFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: field === 'price' || field === 'billing_deadline'
        ? (value === '' ? null : Number(value) || null)
        : field === 'main_image'
        ? (value === '' ? null : value)
        : value
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
      main_image: null
    }));
    setUploadProgress(0);
  };

  // Add request deduplication
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (loading || isSubmitting) {
      console.log('Form submission blocked - already in progress');
      return;
    }

    // Form validation - required fields dari EventSerializer
    const requiredFields = ['title', 'date', 'venue', 'description'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof EventFormData]);

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Price validation - required jika is_free=false
    if (!formData.is_free && (!formData.price || formData.price <= 0)) {
      alert('Price is required for paid events');
      return;
    }

    setLoading(true);
    setIsSubmitting(true);
    
    // Clear any existing timeout
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
    }
    
    try {
      // Payload untuk EventSerializer - hanya fields yang ada di serializer
      const payload = {
        // Required fields
        title: formData.title,
        date: formData.date ? toISOWithLocalOffset(formData.date) : formData.date,
        venue: formData.venue,
        description: formData.description,
        is_free: !!formData.is_free,
        is_registration_close: formData.is_registration_close,
        is_list_attendees: formData.is_list_attendees,

        // Optional fields (null=True di serializer)
        main_image: formData.main_image, // FileModel ID atau null
        price: formData.is_free ? null : (formData.price ?? null), // null jika gratis
        billing_deadline: formData.billing_deadline, // deprecated tapi masih ada di serializer
      };

      // Jika parent menyediakan onSubmit, delegasikan submit ke parent
      // agar tidak terjadi pemanggilan API ganda.
      if (onSubmit) {
        onSubmit(payload);
        return;
      }

      // Jika tidak ada onSubmit dari parent, lakukan submit langsung via API
      let result: Event;
      if (mode === 'edit' && event?.pk) {
        result = await eventsApi.updateEvent(event.pk, payload);
      } else {
        result = await eventsApi.createEvent(payload);
      }

      // Panggil onSuccess bila tersedia
      if (onSuccess) {
        onSuccess(result);
      }
      
    } catch (error) {
      console.error('Error submitting event:', error);
      // You can add toast notification here if available
    } finally {
      setLoading(false);
      
      // Reset submission state after a delay to prevent rapid resubmission
      submitTimeoutRef.current = setTimeout(() => {
        setIsSubmitting(false);
      }, 2000);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

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
                    <div className="relative group inline-block w-full">
                      <LazyImage
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
                  {formatEventPrice({ is_free: formData.is_free, price: formData.price })}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
        <Button
          type="submit"
          loading={loading || isSubmitting}
          disabled={loading || isSubmitting}
          className="w-full sm:flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-medium py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading || isSubmitting 
            ? (event ? 'Updating...' : 'Creating...') 
            : (event ? 'Update Event' : 'Create Event')
          }
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading || isSubmitting}
          className="w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};