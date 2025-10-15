import { useState } from 'react';
import {
  Share2,
  Mail,
  MessageSquare,
  Calendar,
  Users,
  Copy,
  ExternalLink,
  Facebook,
  Twitter,
  Linkedin,
  Send,
  Bell,
  Image as ImageIcon,
  FileText,
  QrCode,
  Link2,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { format } from 'date-fns';

export interface PromotionTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'email' | 'social' | 'announcement';
}

export interface SocialMediaPost {
  platform: 'facebook' | 'twitter' | 'linkedin';
  content: string;
  image?: string;
  hashtags?: string[];
  scheduledAt?: string;
}

export interface EventPromotionProps {
  eventId: number;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  eventDescription: string;
  eventImage?: string;
  registrationUrl: string;
  isFree: boolean;
  price?: number;
  maxCapacity: number;
  currentRegistrations: number;
  templates?: PromotionTemplate[];
  loading?: boolean;
  onSendEmail?: (templateId: string, recipients: string[]) => void;
  onSchedulePost?: (post: SocialMediaPost) => void;
  onGenerateQrCode?: () => void;
  onCreatePromoMaterial?: (type: 'banner' | 'flyer' | 'social') => void;
}

export function EventPromotion({
  eventTitle,
  eventDate,
  eventVenue,
  eventDescription,
  registrationUrl,
  isFree,
  price,
  maxCapacity,
  currentRegistrations,
  templates = [],
  loading = false,
  onSendEmail,
  onSchedulePost,
  onGenerateQrCode,
  onCreatePromoMaterial
}: EventPromotionProps) {
  const [activeTab, setActiveTab] = useState<'email' | 'social' | 'materials' | 'analytics'>('email');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [emailRecipients, setEmailRecipients] = useState<string>('');
  const [socialPost, setSocialPost] = useState<SocialMediaPost>({
    platform: 'facebook',
    content: '',
    hashtags: ['TMC', 'Toyota', 'Event', 'Community']
  });

  const availableSlots = maxCapacity - currentRegistrations;
  const urgencyLevel = availableSlots <= maxCapacity * 0.2 ? 'high' : availableSlots <= maxCapacity * 0.5 ? 'medium' : 'low';

  const generateSocialContent = (platform: SocialMediaPost['platform']) => {
    const baseContent = `🎉 ${eventTitle}\n\n📅 ${format(new Date(eventDate), 'EEEE, MMMM dd, yyyy')}\n📍 ${eventVenue}\n\n${eventDescription.substring(0, 200)}${eventDescription.length > 200 ? '...' : ''}\n\n`;

    switch (platform) {
      case 'twitter':
        return baseContent + `Register now: ${registrationUrl}\n\n#TMC #Toyota #Event #Community`;
      case 'linkedin':
        return baseContent + `Join us for this exciting event hosted by Toyota Manufacturers Club. Network with industry professionals and gain valuable insights.\n\n${registrationUrl}\n\n#Toyota #Manufacturing #Business #Networking #ProfessionalDevelopment`;
      case 'facebook':
        return baseContent + `Don't miss out on this amazing opportunity! Limited spots available.\n\n🔗 Register here: ${registrationUrl}\n\nTag a friend who might be interested!\n\n#TMC #ToyotaCommunity #CarEnthusiasts #Networking`;
      default:
        return baseContent;
    }
  };

  const handleSocialContentChange = (platform: SocialMediaPost['platform']) => {
    setSocialPost(prev => ({
      ...prev,
      platform,
      content: generateSocialContent(platform)
    }));
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleShareLink = (platform: string) => {
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(registrationUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join me at ${eventTitle}`)}&url=${encodeURIComponent(registrationUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(registrationUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`Join me at ${eventTitle}: ${registrationUrl}`)}`
    };

    window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400');
  };

  const getUrgencyBadge = () => {
    switch (urgencyLevel) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Limited Spots Available!</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Filling Up Fast</Badge>;
      default:
        return <Badge className="bg-green-100 text-green-800 border-green-200">Plenty of Spots</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Event Promotion</h2>
          <p className="text-gray-600">{eventTitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {getUrgencyBadge()}
          <div className="text-sm text-gray-600">
            {currentRegistrations}/{maxCapacity} registered
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{availableSlots}</div>
              <div className="text-sm text-gray-600">Spots Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{Math.round((currentRegistrations / maxCapacity) * 100)}%</div>
              <div className="text-sm text-gray-600">Registration Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{format(new Date(eventDate), 'MMM dd')}</div>
              <div className="text-sm text-gray-600">Event Date</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{isFree ? 'FREE' : `$${price}`}</div>
              <div className="text-sm text-gray-600">Ticket Price</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            type="button"
            onClick={() => setActiveTab('email')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'email'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Marketing
            </div>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('social')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'social'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Social Media
            </div>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('materials')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'materials'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Promo Materials
            </div>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </div>
          </button>
        </nav>
      </div>

      {/* Email Marketing Tab */}
      {activeTab === 'email' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Campaign</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Email Template
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Choose a template...</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Recipients */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipients (comma-separated emails)
                </label>
                <textarea
                  value={emailRecipients}
                  onChange={(e) => setEmailRecipients(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={3}
                  placeholder="email1@example.com, email2@example.com, ..."
                />
              </div>

              {/* Quick Templates */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Email Templates
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedTemplate('announcement');
                      setEmailRecipients('all@subscribers.com');
                    }}
                    className="justify-start"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Event Announcement
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedTemplate('reminder');
                      setEmailRecipients('registered@attendees.com');
                    }}
                    className="justify-start"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Event Reminder
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedTemplate('followup');
                      setEmailRecipients('attended@participants.com');
                    }}
                    className="justify-start"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Follow-up Survey
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedTemplate('cancellation');
                      setEmailRecipients('registered@attendees.com');
                    }}
                    className="justify-start"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Cancellation Notice
                  </Button>
                </div>
              </div>

              <Button
                onClick={() => onSendEmail?.(selectedTemplate, emailRecipients.split(',').map(e => e.trim()))}
                disabled={!selectedTemplate || !emailRecipients || loading}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Email Campaign
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Social Media Tab */}
      {activeTab === 'social' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Promotion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Platform
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { platform: 'facebook' as const, icon: Facebook, color: 'text-blue-600' },
                    { platform: 'twitter' as const, icon: Twitter, color: 'text-blue-400' },
                    { platform: 'linkedin' as const, icon: Linkedin, color: 'text-blue-700' }
                  ].map(({ platform, icon: Icon, color }) => (
                    <Button
                      key={platform}
                      variant={socialPost.platform === platform ? 'default' : 'outline'}
                      onClick={() => handleSocialContentChange(platform)}
                      className="flex items-center gap-2"
                    >
                      <Icon className={`w-4 h-4 ${color}`} />
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Social Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post Content
                </label>
                <textarea
                  value={socialPost.content}
                  onChange={(e) => setSocialPost(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={6}
                  placeholder="Write your social media post..."
                />
              </div>

              {/* Hashtags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hashtags
                </label>
                <input
                  type="text"
                  value={socialPost.hashtags?.join(', ') || ''}
                  onChange={(e) => setSocialPost(prev => ({
                    ...prev,
                    hashtags: e.target.value.split(',').map(tag => tag.trim())
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="#TMC #Toyota #Event"
                />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleShareLink(socialPost.platform)}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Share Now
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onSchedulePost?.(socialPost)}
                  className="flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Schedule Post
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleCopyToClipboard(socialPost.content)}
                  className="flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy Content
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSocialPost(prev => ({ ...prev, content: generateSocialContent(prev.platform) }))}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Share Links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Share</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleShareLink('facebook')}
                  className="flex items-center gap-2"
                >
                  <Facebook className="w-4 h-4 text-blue-600" />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleShareLink('twitter')}
                  className="flex items-center gap-2"
                >
                  <Twitter className="w-4 h-4 text-blue-400" />
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleShareLink('linkedin')}
                  className="flex items-center gap-2"
                >
                  <Linkedin className="w-4 h-4 text-blue-700" />
                  LinkedIn
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleShareLink('whatsapp')}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded hover:bg-gray-50 transition"
                >
                  <MessageSquare className="w-4 h-4 text-green-600" />
                  WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Promo Materials Tab */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Promotional Materials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* QR Code */}
                <div className="text-center p-6 border border-gray-200 rounded-lg">
                  <QrCode className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-medium text-gray-900 mb-2">QR Code</h3>
                  <p className="text-sm text-gray-600 mb-4">Generate QR code for easy registration access</p>
                  <Button
                    onClick={onGenerateQrCode}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Generate QR Code
                  </Button>
                </div>

                {/* Event Banner */}
                <div className="text-center p-6 border border-gray-200 rounded-lg">
                  <ImageIcon className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-medium text-gray-900 mb-2">Event Banner</h3>
                  <p className="text-sm text-gray-600 mb-4">Create promotional banner for social media</p>
                  <Button
                    onClick={() => onCreatePromoMaterial?.('banner')}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Create Banner
                  </Button>
                </div>

                {/* Event Flyer */}
                <div className="text-center p-6 border border-gray-200 rounded-lg">
                  <FileText className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h3 className="font-medium text-gray-900 mb-2">Event Flyer</h3>
                  <p className="text-sm text-gray-600 mb-4">Download printable event flyer</p>
                  <Button
                    onClick={() => onCreatePromoMaterial?.('flyer')}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Create Flyer
                  </Button>
                </div>
              </div>

              {/* Download Links */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-medium text-gray-900 mb-3">Quick Links & Materials</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium">Registration Link</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyToClipboard(registrationUrl)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(registrationUrl, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <Card>
          <CardHeader>
            <CardTitle>Promotion Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Promotion analytics will be available here</p>
              <p className="text-sm text-gray-500 mt-1">Track email opens, social media engagement, and conversion rates</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}