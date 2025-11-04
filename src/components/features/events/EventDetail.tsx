import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  User,
  Edit,
  Trash2,
  Download,
  QrCode,
  Settings,
  CheckCircle,
  Image as ImageIcon,
  FileText,
  BarChart3,
  UserPlus
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Modal,
  ConfirmDialog,
  LoadingSpinner,
  EmptyState
} from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { Event } from '@/types/api';
import {
  useEventQRCode,
  useExportRegistrants,
  useSetEventDone,
  useDeleteEvent,
  useDownloadCertificate
} from '@/lib/hooks/useEvents';
import { formatEventDateTime } from '@/lib/utils/date';
import { formatEventPrice } from '@/lib/utils/money';
import { cn } from '@/lib/utils/cn';

export interface EventDetailProps {
  event: Event;
  onBack?: () => void;
  onEdit?: (event: Event) => void;
  onDelete?: (event: Event) => void;
  onRegister?: (event: Event) => void;
  showActions?: boolean;
  loading?: boolean;
}

export const EventDetail: React.FC<EventDetailProps> = ({
  event,
  onBack,
  onEdit,
  onDelete,
  onRegister,
  showActions = true,
  loading = false
}) => {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'registrants' | 'media' | 'surveys'>('overview');

  // Hooks for event actions
  const { data: qrCodeData, isLoading: qrLoading } = useEventQRCode(event.pk);
  const exportRegistrants = useExportRegistrants();
  const setEventDone = useSetEventDone();
  const deleteEvent = useDeleteEvent();


  const downloadCertificate = useDownloadCertificate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/events');
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(event);
    }
  };

  const handleDelete = () => {
    deleteEvent.mutate(event.pk, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
        if (onDelete) {
          onDelete(event);
        } else {
          navigate('/events');
        }
      }
    });
  };

  const handleExportRegistrants = () => {
    exportRegistrants.mutate(event.pk);
  };

  const handleMarkAsDone = () => {
    setEventDone.mutate(event.pk);
  };

  const handleDownloadCertificate = () => {
    downloadCertificate.mutate(event.pk);
  };

  // Calculate event status
  const now = new Date();
  const eventDate = new Date(event.date);
  const isPast = eventDate < now;
  const isToday = eventDate.toDateString() === now.toDateString();
  const isUpcoming = eventDate > now;

  let statusType: "draft" | "upcoming" | "completed" | "cancelled" = "draft";
  if (event.is_registration_close) {
    statusType = "cancelled";
  } else if (isPast) {
    statusType = "completed";
  } else if (isToday || isUpcoming) {
    statusType = "upcoming";
  } else if (!event.published_at) {
    statusType = "draft";
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={statusType} />
              {event.level && (
                <Badge variant="secondary">{event.level}</Badge>
              )}
            </div>
          </div>
        </div>

        {showActions && (
          <div className="flex items-center gap-2">
            {!isPast && !event.is_registration_close && onRegister && (
              <Button
                onClick={() => onRegister(event)}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Register
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setShowQRCode(true)}
              disabled={qrLoading}
            >
              <QrCode className="w-4 h-4 mr-2" />
              QR Code
            </Button>
            <Button
              variant="outline"
              onClick={handleExportRegistrants}
              disabled={exportRegistrants.isPending}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            {onEdit && (
              <Button
                variant="outline"
                onClick={handleEdit}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
            {!isPast && (
              <Button
                variant="outline"
                onClick={handleMarkAsDone}
                disabled={setEventDone.isPending}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark Done
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 hover:text-red-700 hover:border-red-300"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Event Image */}
      {event.main_image_url && (
        <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
          <img
            src={event.main_image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Event Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Event Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-medium">{formatEventDateTime(event.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-gray-500">{event.venue}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium">Price</p>
                    <p className="text-sm text-gray-500">
                      {formatEventPrice({ is_free: event.is_free, price: event.price })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Participants</p>
                    <p className="text-sm text-gray-500">
                      {event.registrant_count || 0} registered
                    </p>
                  </div>
                </div>
              </div>
              {event.owned_by_email && (
                <div className="flex items-center gap-3 pt-4 border-t">
                  <User className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="font-medium">Organizer</p>
                    <p className="text-sm text-gray-500">{event.owned_by_email}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
            </CardContent>
          </Card>

          {/* Tabs for additional content */}
          <Card>
            <CardHeader>
              <div className="flex space-x-1 border-b">
                {[
                  { key: 'overview', label: 'Overview', icon: BarChart3 },
                  { key: 'registrants', label: 'Registrants', icon: Users },
                  { key: 'media', label: 'Media', icon: ImageIcon },
                  { key: 'surveys', label: 'Surveys', icon: FileText }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
                      activeTab === tab.key
                        ? "bg-orange-50 text-orange-600 border-b-2 border-orange-600"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{event.registrant_count || 0}</p>
                      <p className="text-sm text-gray-500">Registrants</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatEventPrice({ is_free: event.is_free, price: event.price })}
                      </p>
                      <p className="text-sm text-gray-500">Price</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">
                        {event.is_registration_close ? 'Closed' : 'Open'}
                      </p>
                      <p className="text-sm text-gray-500">Registration</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">
                        {event.is_list_attendees ? 'Public' : 'Private'}
                      </p>
                      <p className="text-sm text-gray-500">Attendee List</p>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'registrants' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Event Registrants</h3>
                    <Button
                      variant="outline"
                      onClick={handleExportRegistrants}
                      disabled={exportRegistrants.isPending}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export List
                    </Button>
                  </div>
                  <EmptyState
                    type="users"
                    title="Registrant Management"
                    description="Registrant details will be displayed here. Use the export button to download the full list."
                  />
                </div>
              )}
              {activeTab === 'media' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Event Media</h3>
                    <Button variant="outline">
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Upload Media
                    </Button>
                  </div>
                  {event.medias_url && event.medias_url.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {event.medias_url.map((url, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                          <img
                            src={url}
                            alt={`Event media ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      type="data"
                      title="No Media"
                      description="No media files have been uploaded for this event yet."
                    />
                  )}
                </div>
              )}
              {activeTab === 'surveys' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Event Surveys</h3>
                    <Button variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Manage Surveys
                    </Button>
                  </div>
                  <EmptyState
                    type="data"
                    title="No Surveys"
                    description="No surveys have been configured for this event yet."
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowQRCode(true)}
                disabled={qrLoading}
              >
                <QrCode className="w-4 h-4 mr-2" />
                Show QR Code
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleExportRegistrants}
                disabled={exportRegistrants.isPending}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Registrants
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleDownloadCertificate}
                disabled={downloadCertificate.isPending}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Certificate
              </Button>
              {!isPast && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleMarkAsDone}
                  disabled={setEventDone.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Done
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Event Status */}
          <Card>
            <CardHeader>
              <CardTitle>Event Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Registration</span>
                <Badge variant={event.is_registration_close ? "error" : "success"}>
                  {event.is_registration_close ? "Closed" : "Open"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Attendee List</span>
                <Badge variant={event.is_list_attendees ? "info" : "secondary"}>
                  {event.is_list_attendees ? "Public" : "Private"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Event Date</span>
                <Badge variant={isPast ? "secondary" : isToday ? "warning" : "info"}>
                  {isPast ? "Past" : isToday ? "Today" : "Upcoming"}
                </Badge>
              </div>
              {event.published_at && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Published</span>
                  <Badge variant="success">Published</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* QR Code Modal */}
      <Modal
        open={showQRCode}
        onClose={() => setShowQRCode(false)}
        title="Event QR Code"
      >
        <div className="text-center space-y-4">
          {qrLoading ? (
            <LoadingSpinner />
          ) : qrCodeData ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={qrCodeData.qr_code}
                  alt="Event QR Code"
                  className="w-64 h-64 border rounded-lg"
                />
              </div>
              <p className="text-sm text-gray-600">
                Scan this QR code to check in attendees
              </p>
            </div>
          ) : (
            <EmptyState
              type="error"
              title="QR Code Unavailable"
              description="Unable to generate QR code for this event."
            />
          )}
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Event"
        description={`Are you sure you want to delete "${event.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={deleteEvent.isPending}
      />
    </div>
  );
};