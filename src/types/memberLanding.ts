export interface SocialLink {
  id: string;
  label: string;
  url: string;
  icon?: string;
}

export interface MemberLandingData {
  username: string;
  displayName: string;
  bio: string;
  themeColor: string;
  avatarUrl?: string;
  headerUrl?: string;
  showContact: boolean;
  links: SocialLink[];
}

export const DEFAULT_MEMBER_THEME = '#f97316'; // Orange-500
