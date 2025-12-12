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
