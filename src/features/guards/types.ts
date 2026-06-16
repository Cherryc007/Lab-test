import { GuardStatus } from '../../types';

export interface CreateGuardInput {
  userId: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  eligibleSiteIds: string[];
  certifications?: string[];
  notes?: string;
}

export interface UpdateGuardInput {
  status?: GuardStatus;
  licenseNumber?: string;
  licenseExpiryDate?: string;
  eligibleSiteIds?: string[];
  certifications?: string[];
  notes?: string;
}
