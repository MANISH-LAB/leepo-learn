export type Role = 'admin' | 'student';
export type SubscriptionStatus = 'active' | 'inactive';
export type NodeType = 'DEGREE' | 'YEAR' | 'SUBJECT' | 'CHAPTER' | 'TOPIC';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  subscription_status: SubscriptionStatus;
  subscription_expiry: string | null;
  created_at: string;
}

export interface HierarchyNode {
  id: string;
  parent_id: string | null;
  type: NodeType;
  title: string;
  order_index: number;
}

export interface ContentAsset {
  node_id: string;
  video_url: string | null;
  thumbnail_url: string | null;
  pdf_url: string | null;
  is_premium: boolean;
}

export interface UserProgress {
  user_id: string;
  node_id: string;
  is_completed: boolean;
  private_notes: string | null;
}

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'pending';
  transaction_id: string | null;
  created_at: string;
}
