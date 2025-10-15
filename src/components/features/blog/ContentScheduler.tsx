import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Calendar,
  Clock,
  Eye,
  Archive,
  Edit3,
  AlertCircle,
  Play
} from 'lucide-react';
import { format, addDays, isAfter, isBefore, startOfDay } from 'date-fns';
import { useScheduleBlogPost, usePublishBlogPost } from '@/lib/hooks/useBlog';

const schedulingSchema = z.object({
  published_at: z.string().min(1, 'Publish date is required'),
  status: z.enum(['draft', 'published', 'archived']),
});

type SchedulingFormData = z.infer<typeof schedulingSchema>;

interface ContentSchedulerProps {
  currentStatus?: 'draft' | 'published' | 'archived';
  currentPublishDate?: string;
  postId?: number;
  onUpdate?: (status: string, publishDate?: string) => void;
  disabled?: boolean;
}

export function ContentScheduler({
  currentStatus = 'draft',
  currentPublishDate,
  postId,
  onUpdate,
  disabled = false
}: ContentSchedulerProps) {
  const [isScheduling, setIsScheduling] = useState(false);

  const schedulePostMutation = useScheduleBlogPost();
  const publishPostMutation = usePublishBlogPost();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<SchedulingFormData>({
    resolver: zodResolver(schedulingSchema),
    defaultValues: {
      published_at: currentPublishDate || '',
      status: currentStatus,
    },
  });

  const watchedPublishDate = watch('published_at');
  const watchedStatus = watch('status');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Edit3 className="w-4 h-4 text-gray-500" />;
      case 'published':
        return <Eye className="w-4 h-4 text-green-600" />;
      case 'archived':
        return <Archive className="w-4 h-4 text-gray-400" />;
      default:
        return <Edit3 className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'archived':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'published':
        return 'Published';
      case 'archived':
        return 'Archived';
      default:
        return 'Draft';
    }
  };

  const isScheduled = watchedStatus === 'draft' && watchedPublishDate && isAfter(new Date(watchedPublishDate), new Date());
  const isPastDue = watchedPublishDate && isBefore(new Date(watchedPublishDate), new Date()) && watchedStatus === 'draft';

  const generateQuickDates = () => {
    const today = startOfDay(new Date());
    return [
      { label: 'Tomorrow', date: addDays(today, 1) },
      { label: 'In 3 days', date: addDays(today, 3) },
      { label: 'Next week', date: addDays(today, 7) },
      { label: 'In 2 weeks', date: addDays(today, 14) },
      { label: 'Next month', date: addDays(today, 30) },
    ];
  };

  const handleQuickDateSelect = (date: Date) => {
    setValue('published_at', date.toISOString());
    if (watchedStatus === 'archived') {
      setValue('status', 'draft');
    }
  };

  const handlePublishNow = async () => {
    if (!postId) return;

    try {
      await publishPostMutation.mutateAsync(postId);
      setValue('status', 'published');
      setValue('published_at', new Date().toISOString());
      onUpdate?.('published', new Date().toISOString());
    } catch (error) {
      console.error('Failed to publish post:', error);
    }
  };

  const handleSchedule = async (data: SchedulingFormData) => {
    if (!postId) return;

    setIsScheduling(true);
    try {
      await schedulePostMutation.mutateAsync({
        postId,
        publishAt: data.published_at,
      });
      setValue('status', 'draft');
      onUpdate?.('draft', data.published_at);
    } catch (error) {
      console.error('Failed to schedule post:', error);
    } finally {
      setIsScheduling(false);
    }
  };

  const handleStatusChange = (status: string) => {
    setValue('status', status as 'draft' | 'published' | 'archived');
    if (status === 'published' && !watchedPublishDate) {
      setValue('published_at', new Date().toISOString());
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Publishing Schedule</h3>
        </div>

        <div className={`px-3 py-1 rounded-full border flex items-center gap-2 ${getStatusColor(currentStatus)}`}>
          {getStatusIcon(currentStatus)}
          <span className="text-sm font-medium">{getStatusLabel(currentStatus)}</span>
        </div>
      </div>

      {/* Status Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Publication Status
        </label>
        <div className="flex flex-wrap gap-2">
          {(['draft', 'published', 'archived'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => handleStatusChange(status)}
              disabled={disabled}
              className={`px-4 py-2 rounded-md border flex items-center gap-2 transition-colors ${
                watchedStatus === status
                  ? getStatusColor(status)
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {getStatusIcon(status)}
              <span className="text-sm font-medium">{getStatusLabel(status)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Scheduling Section */}
      {(watchedStatus === 'draft' || watchedStatus === 'published') && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {watchedStatus === 'published' ? 'Published Date' : 'Schedule Publish Date'}
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="datetime-local"
                  {...register('published_at')}
                  disabled={disabled || watchedStatus === 'published'}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
              {watchedStatus === 'draft' && (
                <button
                  type="button"
                  onClick={handlePublishNow}
                  disabled={disabled || !postId || publishPostMutation.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {publishPostMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Publish Now
                    </>
                  )}
                </button>
              )}
            </div>
            {errors.published_at && (
              <p className="mt-1 text-sm text-red-600">{errors.published_at.message}</p>
            )}
          </div>

          {/* Quick Date Selection */}
          {watchedStatus === 'draft' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Schedule
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {generateQuickDates().map(({ label, date }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleQuickDateSelect(date)}
                    disabled={disabled}
                    className="px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Scheduling Status Messages */}
          {isScheduled && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <h5 className="font-medium">Scheduled for Publishing</h5>
                  <p className="text-blue-700">
                    This article will be automatically published on{' '}
                    {format(new Date(watchedPublishDate), 'MMM dd, yyyy at HH:mm')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {isPastDue && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <h5 className="font-medium">Past Due Schedule</h5>
                  <p className="text-yellow-700">
                    This article was scheduled for{' '}
                    {format(new Date(watchedPublishDate), 'MMM dd, yyyy at HH:mm')}
                    {' '}but hasn't been published yet.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {watchedStatus === 'draft' && watchedPublishDate && isDirty && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSubmit(handleSchedule)}
                disabled={disabled || isScheduling || !postId}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isScheduling ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    Schedule Publication
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Archived Status Info */}
      {watchedStatus === 'archived' && (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <div className="flex items-start gap-2">
            <Archive className="w-4 h-4 text-gray-600 mt-0.5" />
            <div className="text-sm text-gray-700">
              <h5 className="font-medium">Archived Content</h5>
              <p>
                This article is archived and won't appear in search results or listings.
                You can restore it by changing the status back to 'Draft' or 'Published'.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content Calendar Preview */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-md font-medium text-gray-900 mb-3">Content Calendar Preview</h4>
        <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {getStatusIcon(watchedStatus)}
              <span className="font-medium">{getStatusLabel(watchedStatus)}</span>
            </div>
            <span className="text-gray-500">
              {watchedPublishDate
                ? format(new Date(watchedPublishDate), 'MMM dd, yyyy HH:mm')
                : 'Not scheduled'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}