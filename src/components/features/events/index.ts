// Export all Event components
export { EventCard } from './EventCard';
export type { EventCardProps } from './EventCard';

export { EventForm } from './EventForm';
export type { EventFormProps } from './EventForm';

export { EventList } from './EventList';
export type { EventListProps } from './EventList';
export type { Event } from '@/types/api';

export { EventRegistration } from './EventRegistration';
export type { EventRegistrationProps } from './EventRegistration';

export { EventDetail } from './EventDetail';
export type { EventDetailProps } from './EventDetail';

export { QRScanner } from './QRScanner';
export type { QRScannerProps, AttendeeInfo } from './QRScanner';

// Enhanced Event Components
export { EventAnalytics } from './EventAnalytics';
export type { EventAnalyticsProps, EventAnalyticsData, EventMetrics } from './EventAnalytics';

export { AdvancedRegistration } from './AdvancedRegistration';
export type { AdvancedRegistrationProps, Registrant, WaitlistEntry, CustomField } from './AdvancedRegistration';

export { EventPromotion } from './EventPromotion';
export type { EventPromotionProps, PromotionTemplate, SocialMediaPost } from './EventPromotion';