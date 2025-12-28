export interface Company {
  id: string;
  name: string;
  slogan: string;
  description: string;
  rating: number;
  reviews: number;
  logo: string;
  banner: string;
  tags: string[];
  specialties: string[];
  industries: string[];
  projects: number;
  teamSize: string;
  founded: string;
  location: string;
  email: string;
  phone: string;
  website: string;
  portfolio: PortfolioItem[];
  // New SMB Fields
  pricing?: PricingModel;
  integrations?: string[]; // Simplified to string array for now (e.g. ['Shopify', 'Slack'])
  useCases?: UseCase[];
}

export interface PricingModel {
  type: 'Free' | 'Freemium' | 'Paid' | 'Contact';
  startingAt?: string;
  description?: string;
}

export interface UseCase {
  title: string;
  description: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  client: string;
  image: string;
  tags: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  relatedCompanyId?: string;
}

export enum ViewState {
  HOME = 'HOME',
  SEARCH = 'SEARCH',
  PROFILE = 'PROFILE',
  PROPOSAL = 'PROPOSAL',
  SUPPORT = 'SUPPORT',
  SIGNUP = 'SIGNUP',
}

export enum UserRole {
  CLIENT = 'CLIENT',
  VENDOR = 'VENDOR',
  ADMIN = 'ADMIN'
}
