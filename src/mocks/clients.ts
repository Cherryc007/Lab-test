import { Client, ClientStatus } from '../types';

export const mockClients: Client[] = [
  {
    id: 'client-cadillac-fairview',
    organizationId: 'org-guardon-canada',
    name: 'Cadillac Fairview Properties Ltd.',
    status: ClientStatus.Active,
    primaryContactName: 'Robert Vance',
    primaryContactEmail: 'robert.vance@cadillacfairview.ca',
    billingAddress: '20 Queen St West, Toronto, ON M5H 3R4',
    notes: 'Premium commercial property management account.'
  },
  {
    id: 'client-allied-reit',
    organizationId: 'org-guardon-canada',
    name: 'Allied Properties REIT',
    status: ClientStatus.Active,
    primaryContactName: 'Genevieve Roy',
    primaryContactEmail: 'groy@alliedreit.com',
    billingAddress: '191 Maud St, Toronto, ON M5V 2M7',
    notes: 'Urban workspace and heritage building sites.'
  },
  {
    id: 'client-loblaws-corp',
    organizationId: 'org-guardon-canada',
    name: 'Loblaws Companies Ltd.',
    status: ClientStatus.Active,
    primaryContactName: 'Gordie Howe',
    primaryContactEmail: 'gordie.howe@loblaws.ca',
    billingAddress: '1 President\'s Choice Circle, Brampton, ON L6Y 5S5',
    notes: 'Retail supermarket and supply chain operations.'
  }
];
