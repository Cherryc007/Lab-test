import { Guard, GuardStatus } from '../types';

export const mockGuards: Guard[] = [
  {
    id: 'guard-jp-tremblay',
    userId: 'user-jp-tremblay',
    status: GuardStatus.Active,
    licenseNumber: 'ON-SEC-7294028',
    licenseExpiryDate: '2027-12-31',
    eligibleSiteIds: ['site-eaton-centre', 'site-terminal-ottawa'],
    certifications: ['First Aid', 'CPR', 'Use of Force'],
    notes: 'Bilingual (English/French). High reliability clearance.'
  },
  {
    id: 'guard-sarah-jenkins',
    userId: 'user-sarah-jenkins',
    status: GuardStatus.Active,
    licenseNumber: 'BC-SEC-8105927',
    licenseExpiryDate: '2027-06-30',
    eligibleSiteIds: ['site-glass-factory'],
    certifications: ['First Aid', 'CPR', 'Fire Warden'],
    notes: 'Excellent client reviews. Shift supervisor certified.'
  },
  {
    id: 'guard-david-johnston',
    userId: 'user-david-johnston',
    status: GuardStatus.Active,
    licenseNumber: 'AB-SEC-1930582',
    licenseExpiryDate: '2026-09-15',
    eligibleSiteIds: ['site-loblaws-calgary'],
    certifications: ['First Aid', 'De-escalation techniques'],
    notes: 'Experienced in retail loss prevention.'
  },
  {
    id: 'guard-marcus-wong',
    userId: 'user-marcus-wong',
    status: GuardStatus.Active,
    licenseNumber: 'ON-SEC-3940182',
    licenseExpiryDate: '2028-02-28',
    eligibleSiteIds: ['site-eaton-centre'],
    certifications: ['First Aid', 'CPR', 'Smart Serve'],
    notes: 'Punctual and detail-oriented.'
  },
  {
    id: 'guard-amira-mansour',
    userId: 'user-amira-mansour',
    status: GuardStatus.OnLeave,
    licenseNumber: 'ON-SEC-5829104',
    licenseExpiryDate: '2027-10-15',
    eligibleSiteIds: ['site-eaton-centre', 'site-terminal-ottawa'],
    certifications: ['First Aid', 'MAB (Management of Aggressive Behaviour)'],
    notes: 'On medical leave until September 2026.'
  }
];
