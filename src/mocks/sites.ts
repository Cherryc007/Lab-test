import { Site, SiteStatus } from '../types';

export const mockSites: Site[] = [
  {
    id: 'site-eaton-centre',
    clientId: 'client-cadillac-fairview',
    name: 'CF Toronto Eaton Centre',
    address: '220 Yonge St, Toronto, ON M5B 2H1',
    status: SiteStatus.Active,
    geofenceLatitude: 43.6539,
    geofenceLongitude: -79.3803,
    geofenceRadiusMeters: 150,
    coverageNotes: 'Require guard patrols of malls, loading docks, and exterior courtyard. Escalation contacts: Security Supervisor desk (Ext 4102).'
  },
  {
    id: 'site-glass-factory',
    clientId: 'client-allied-reit',
    name: 'Allied Glass-Factory Site',
    address: '154 West 5th Ave, Vancouver, BC V5Y 1H8',
    status: SiteStatus.Active,
    geofenceLatitude: 49.2662,
    geofenceLongitude: -123.1078,
    geofenceRadiusMeters: 100,
    coverageNotes: 'Heritage brick site undergoing development. Guard must do hourly fire patrols of building perimeter.'
  },
  {
    id: 'site-terminal-ottawa',
    clientId: 'client-allied-reit',
    name: 'Allied Terminal Ottawa',
    address: '340 Albert St, Ottawa, ON K1R 7Y6',
    status: SiteStatus.Active,
    geofenceLatitude: 45.4194,
    geofenceLongitude: -75.7011,
    geofenceRadiusMeters: 120,
    coverageNotes: 'High-security multi-tenant commercial office site. Keep visitor access log updated.'
  },
  {
    id: 'site-loblaws-calgary',
    clientId: 'client-loblaws-corp',
    name: 'Real Canadian Superstore Calgary',
    address: '3636 226th Ave SE, Calgary, AB T2Z 3Y7',
    status: SiteStatus.Active,
    geofenceLatitude: 50.8872,
    geofenceLongitude: -113.9744,
    geofenceRadiusMeters: 200,
    coverageNotes: 'Large retail environment. Guard must watch customer flow, loss prevention, and parking lot safety.'
  }
];
