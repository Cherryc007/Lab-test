import { ActivityLogCategory } from '../../types';

export interface SubmitActivityLogInput {
  shiftId: string;
  siteId: string;
  content: string;
  category: ActivityLogCategory;
  latitude?: number;
  longitude?: number;
}

export interface ReviewActivityLogInput {
  logId: string;
  approved: boolean;
}
