
export type RelationshipStatus = 'Lead' | 'Active' | 'Past' | 'Blocked';

export interface ClientProposal {
  id: string;
  date: string;
  title: string;
  amount: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Declined';
  voiceAgent?: VoiceAgentConfig;
}

export interface Client {
  id: string;
  name: string;
  industry: string;
  email: string;
  phone: string;
  city: string;
  status: RelationshipStatus;
  notes: string;
  proposals: ClientProposal[];
  createdAt: string;
}

export interface BusinessLead {
  id: string;
  name: string;
  industry: string;
  city: string;
  website?: string;
  email?: string;
  rating?: number;
  gap?: string;
  yearsInBusiness?: string;
  personalizedHook?: string;
  generatedEmail?: { subject: string; body: string };
  mapsUrl?: string;
  recommendedServices?: string[];
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface VoiceAgentConfig {
  enabled: boolean;
  name: string;
  language: 'English' | 'Spanish' | 'Bilingual';
  greeting: string;
  cost: number;
}

export interface ProposalData {
  title: string;
  clientId?: string;
  clientName: string;
  objective: string;
  solution: string;
  problem: string;
  deliverables: { title: string; details: string; price: string }[];
  timeline: { phase: string; duration: string; cost: string }[];
  caseStudy: string;
  totalInvestment: string;
  voiceAgent: VoiceAgentConfig;
}

export enum AppSection {
  DASHBOARD = 'dashboard',
  CLIENTS = 'clients',
  LEAD_RESEARCH = 'lead_research',
  TEMPLATES = 'templates',
  PROPOSALS = 'proposals',
  WORKFLOW = 'workflow'
}
