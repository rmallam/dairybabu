import type { Farm, Profile, Cattle, MilkLog, HealthLog, Transaction } from '../types';

export const DEFAULT_FARM: Farm = {
  id: 'farm-khammam-001',
  name: 'Raade Farms',
  location: 'Khammam, Telangana',
  createdAt: new Date('2026-06-01').toISOString(),
};

export const MOCK_PROFILES: Profile[] = [
  {
    id: 'user-owner-001',
    farmId: DEFAULT_FARM.id,
    role: 'owner',
    fullName: 'Rakesh Kumar Mallam',
    phoneNumber: '+91 98765 43210',
    securityPin: '0000',
    createdAt: new Date('2026-06-01').toISOString(),
  },
  {
    id: 'user-manager-002',
    farmId: DEFAULT_FARM.id,
    role: 'manager',
    fullName: 'Raju (Manager)',
    phoneNumber: '+91 91234 56789',
    securityPin: '1111',
    createdAt: new Date('2026-06-02').toISOString(),
  },
];

export const INITIAL_CATTLE: Cattle[] = [
  {
    id: 'cattle-001',
    farmId: DEFAULT_FARM.id,
    tagNumber: 'IN-TG-101',
    name: 'Ganga',
    breed: 'Murrah Buffalo',
    status: 'milking',
    birthDate: '2022-04-12',
    purchaseDate: '2026-06-05',
    purchaseCost: 85000,
    notes: 'High milk yielder, prefers dry fodder mix.',
    createdAt: new Date('2026-06-05').toISOString(),
  },
  {
    id: 'cattle-002',
    farmId: DEFAULT_FARM.id,
    tagNumber: 'IN-TG-102',
    name: 'Gauri',
    breed: 'Holstein Friesian (HF) Cross',
    status: 'milking',
    birthDate: '2023-01-15',
    purchaseDate: '2026-06-05',
    purchaseCost: 75000,
    notes: 'Docile temperament. Sensitive to peak summer heat.',
    createdAt: new Date('2026-06-05').toISOString(),
  },
  {
    id: 'cattle-003',
    farmId: DEFAULT_FARM.id,
    tagNumber: 'IN-TG-103',
    name: 'Lakshmi',
    breed: 'Jersey Cross',
    status: 'pregnant',
    birthDate: '2023-05-20',
    purchaseDate: '2026-06-10',
    purchaseCost: 68000,
    notes: 'Due for calving in late September 2026.',
    createdAt: new Date('2026-06-10').toISOString(),
  },
  {
    id: 'cattle-004',
    farmId: DEFAULT_FARM.id,
    tagNumber: 'IN-TG-104',
    name: 'Sita',
    breed: 'Gir Cow',
    status: 'dry',
    birthDate: '2021-08-30',
    purchaseDate: '2026-06-05',
    purchaseCost: 90000,
    notes: 'Excellent A2 milk quality. Currently dry period.',
    createdAt: new Date('2026-06-05').toISOString(),
  },
];

// Generate recent milk yield logs (past 5 days)
const generateMilkLogs = (): MilkLog[] => {
  const logs: MilkLog[] = [];
  const today = new Date();
  
  for (let i = 4; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Day i Morning Session
    // Individual milk logging for Ganga and Gauri (active milking cows)
    logs.push({
      id: `milk-m-ganga-${i}`,
      farmId: DEFAULT_FARM.id,
      cattleId: 'cattle-001',
      cattleName: 'Ganga',
      cattleTag: 'IN-TG-101',
      logDate: dateStr,
      session: 'morning',
      quantityLiters: 8.5 + (Math.random() - 0.5),
      fatPercentage: 7.2,
      snfPercentage: 9.0,
      recordedBy: 'Raju (Manager)',
      createdAt: `${dateStr}T06:30:00.000Z`,
    });
    logs.push({
      id: `milk-m-gauri-${i}`,
      farmId: DEFAULT_FARM.id,
      cattleId: 'cattle-002',
      cattleName: 'Gauri',
      cattleTag: 'IN-TG-102',
      logDate: dateStr,
      session: 'morning',
      quantityLiters: 11.2 + (Math.random() - 0.5),
      fatPercentage: 3.9,
      snfPercentage: 8.5,
      recordedBy: 'Raju (Manager)',
      createdAt: `${dateStr}T06:45:00.000Z`,
    });

    // Day i Evening Session - logged in BULK (herd total) to show support for both
    logs.push({
      id: `milk-e-bulk-${i}`,
      farmId: DEFAULT_FARM.id,
      logDate: dateStr,
      session: 'evening',
      quantityLiters: 17.5 + (Math.random() * 2 - 1),
      recordedBy: 'Raju (Manager)',
      createdAt: `${dateStr}T17:30:00.000Z`,
    });
  }

  return logs;
};

export const INITIAL_MILK_LOGS: MilkLog[] = generateMilkLogs();

export const INITIAL_HEALTH_LOGS: HealthLog[] = [
  {
    id: 'health-001',
    farmId: DEFAULT_FARM.id,
    cattleId: 'cattle-001',
    cattleName: 'Ganga',
    cattleTag: 'IN-TG-101',
    treatmentType: 'deworming',
    title: 'Broad-spectrum Dewormer (Albendazole)',
    administeredDate: '2026-07-15',
    cost: 450,
    performedBy: 'Dr. Srinivasa Rao (Veterinary Officer)',
    status: 'completed',
    notes: 'Routine deworming. Administered orally.',
    createdAt: new Date('2026-07-15').toISOString(),
  },
  {
    id: 'health-002',
    farmId: DEFAULT_FARM.id,
    cattleId: 'cattle-003',
    cattleName: 'Lakshmi',
    cattleTag: 'IN-TG-103',
    treatmentType: 'artificial_insemination',
    title: 'AI Semen Injection (Jersey Premium Bull)',
    administeredDate: '2026-06-20',
    cost: 1500,
    performedBy: 'L.S.A. (Livestock Assistant)',
    status: 'completed',
    notes: 'Pregnancy confirmed via rectal palpation on 2026-08-25 (simulated in notes).',
    createdAt: new Date('2026-06-20').toISOString(),
  },
  {
    id: 'health-003',
    farmId: DEFAULT_FARM.id,
    cattleId: 'cattle-001',
    cattleName: 'Ganga',
    cattleTag: 'IN-TG-101',
    treatmentType: 'vaccination',
    title: 'FMD (Foot and Mouth Disease) Vaccine',
    nextDueDate: '2026-08-05', // Coming up soon
    cost: 100,
    status: 'scheduled',
    notes: 'Biannual government vaccination drive.',
    createdAt: new Date('2026-07-20').toISOString(),
  },
  {
    id: 'health-004',
    farmId: DEFAULT_FARM.id,
    cattleId: 'cattle-002',
    cattleName: 'Gauri',
    cattleTag: 'IN-TG-102',
    treatmentType: 'vaccination',
    title: 'FMD (Foot and Mouth Disease) Vaccine',
    nextDueDate: '2026-08-05',
    cost: 100,
    status: 'scheduled',
    notes: 'Biannual government vaccination drive.',
    createdAt: new Date('2026-07-20').toISOString(),
  },
  {
    id: 'health-005',
    farmId: DEFAULT_FARM.id,
    cattleId: 'cattle-003',
    cattleName: 'Lakshmi',
    cattleTag: 'IN-TG-103',
    treatmentType: 'vaccination',
    title: 'FMD (Foot and Mouth Disease) Vaccine',
    nextDueDate: '2026-08-05',
    cost: 100,
    status: 'scheduled',
    notes: 'Biannual government vaccination drive.',
    createdAt: new Date('2026-07-20').toISOString(),
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'trans-001',
    farmId: DEFAULT_FARM.id,
    type: 'expense',
    category: 'Feed Purchase',
    amount: 14500,
    transactionDate: '2026-07-10',
    paymentMethod: 'upi',
    notes: 'Purchased 10 bags of Sudarshan Buffalo Feed & dry fodder grass from Khammam Mandi.',
    recordedBy: 'Raju (Manager)',
    createdAt: new Date('2026-07-10').toISOString(),
  },
  {
    id: 'trans-002',
    farmId: DEFAULT_FARM.id,
    type: 'expense',
    category: 'Medicines',
    amount: 2150,
    transactionDate: '2026-07-15',
    paymentMethod: 'cash',
    notes: 'Dewormers and calcium supplement liquid.',
    recordedBy: 'Raju (Manager)',
    createdAt: new Date('2026-07-15').toISOString(),
  },
  {
    id: 'trans-003',
    farmId: DEFAULT_FARM.id,
    type: 'income',
    category: 'Milk Sales',
    amount: 18400,
    transactionDate: '2026-07-15',
    paymentMethod: 'bank_transfer',
    notes: 'Fortnightly milk payout from Dodla Dairy Collection Center.',
    recordedBy: 'Rakesh Kumar Mallam',
    createdAt: new Date('2026-07-15').toISOString(),
  },
  {
    id: 'trans-004',
    farmId: DEFAULT_FARM.id,
    type: 'expense',
    category: 'Salaries',
    amount: 12000,
    transactionDate: '2026-07-01',
    paymentMethod: 'bank_transfer',
    notes: 'Manager Raju salary for June 2026.',
    recordedBy: 'Rakesh Kumar Mallam',
    createdAt: new Date('2026-07-01').toISOString(),
  },
  {
    id: 'trans-005',
    farmId: DEFAULT_FARM.id,
    type: 'income',
    category: 'Milk Sales',
    amount: 3200,
    transactionDate: '2026-07-20',
    paymentMethod: 'upi',
    notes: 'Cash milk sales directly to local tea shop and households in the village.',
    recordedBy: 'Raju (Manager)',
    createdAt: new Date('2026-07-20').toISOString(),
  },
  {
    id: 'trans-006',
    farmId: DEFAULT_FARM.id,
    type: 'expense',
    category: 'Diesel',
    amount: 1200,
    transactionDate: '2026-07-25',
    paymentMethod: 'cash',
    notes: 'Fuel for grass chopper machine and water pump backup generator.',
    recordedBy: 'Raju (Manager)',
    createdAt: new Date('2026-07-25').toISOString(),
  },
];
