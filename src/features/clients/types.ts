import { ClientStatus, SiteStatus } from '../../types';

export interface CreateClientInput {
  name: string;
  primaryContactName: string;
  primaryContactEmail: string;
  billingAddress?: string;
  notes?: string;
}

export interface CreateSiteInput {
  clientId: string;
  name: string;
  address: string;
  geofenceLatitude: number;
  geofenceLongitude: number;
  geofenceRadiusMeters: number;
  coverageNotes?: string;
}

export interface UpdateSiteGeofenceInput {
  siteId: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
}
