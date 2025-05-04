
import { PotteryRecord, User } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'user@example.com',
    name: 'Test User',
    createdAt: new Date().toISOString(),
  }
];

export const mockPotteryRecords: PotteryRecord[] = [
  {
    id: '1',
    title: 'Coffee Mug',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: '1',
    stages: {
      greenware: {
        weight: 500,
        media: ['https://images.unsplash.com/photo-1482881497185-d4a9ddbe4151'],
        dimension: '10cm x 8cm',
        description: 'Started building a simple mug with handle',
        decoration: 'Added simple pattern with slip',
      },
      bisque: {
        weight: 450,
        media: ['https://images.unsplash.com/photo-1527576539890-dfa815648363'],
        dimension: '9.8cm x 7.8cm',
        description: 'Shrunk slightly after first firing',
        decoration: 'Applied underglaze in blue pattern',
      },
      final: {
        weight: 440,
        media: ['https://images.unsplash.com/photo-1618160702438-9b02ab6515c9'],
        dimension: '9.8cm x 7.8cm',
        description: 'Glaze came out well with nice shine',
        decoration: 'Clear glaze on top of blue underglaze pattern',
      },
    },
  },
  {
    id: '2',
    title: 'Small Bowl',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: '1',
    stages: {
      greenware: {
        weight: 750,
        media: ['https://images.unsplash.com/photo-1482881497185-d4a9ddbe4151'],
        dimension: '15cm diameter x 7cm height',
        description: 'Simple bowl form with flared rim',
        decoration: 'None at this stage',
      },
      bisque: {
        weight: 700,
        media: ['https://images.unsplash.com/photo-1527576539890-dfa815648363'],
        dimension: '14.5cm diameter x 6.8cm height',
        description: 'Fired at cone 04',
        decoration: 'Applied blue underglaze to rim',
      },
      final: {
        weight: 690,
        media: ['https://images.unsplash.com/photo-1618160702438-9b02ab6515c9'],
        dimension: '14.5cm diameter x 6.8cm height',
        description: 'Fired at cone 6, glaze turned out well',
        decoration: 'Clear glaze with blue rim',
      },
    },
  },
];
