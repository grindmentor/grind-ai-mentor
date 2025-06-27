
export interface UserPreferences {
  id: string;
  user_id: string;
  weight_unit: 'kg' | 'lbs';
  height_unit: 'cm' | 'ft-in';
  notifications: boolean;
  email_updates: boolean;
  dark_mode: boolean;
  created_at: string;
  updated_at: string;
}
