import type { Farm, Profile, Cattle, MilkLog, HealthLog, Transaction, BreedingLog, InventoryItem } from '../types';

export const injectDemoData = () => {
  const farm: Farm = {
    id: 'demo-farm-123',
    name: 'Sudarshan Demo Farm',
    location: 'Telangana',
    createdAt: new Date().toISOString()
  };

  const profiles: Profile[] = [
    {
      id: 'owner-demo',
      farmId: 'demo-farm-123',
      role: 'owner',
      fullName: 'Sudarshan (Owner)',
      phoneNumber: '9876543210',
      securityPin: '1111', 
      createdAt: new Date().toISOString()
    },
    {
      id: 'manager-demo',
      farmId: 'demo-farm-123',
      role: 'manager',
      fullName: 'Ramesh (Manager)',
      phoneNumber: '9876543211',
      securityPin: '2222',
      createdAt: new Date().toISOString()
    }
  ];

  const cattle: Cattle[] = [
    { id: 'cow-1', farmId: 'demo-farm-123', tagNumber: 'TAG-001', name: 'Gowri', breed: 'Holstein Friesian', birthDate: '2021-05-10', status: 'milking', createdAt: new Date().toISOString() },
    { id: 'cow-2', farmId: 'demo-farm-123', tagNumber: 'TAG-002', name: 'Lakshmi', breed: 'Jersey', birthDate: '2022-01-15', status: 'milking', createdAt: new Date().toISOString() },
    { id: 'cow-3', farmId: 'demo-farm-123', tagNumber: 'TAG-003', name: 'Nandini', breed: 'Murrah', birthDate: '2020-11-20', status: 'dry', createdAt: new Date().toISOString() },
    { id: 'cow-4', farmId: 'demo-farm-123', tagNumber: 'TAG-004', name: 'Bhadra', breed: 'Ongole', birthDate: '2023-04-05', status: 'pregnant', createdAt: new Date().toISOString() },
    { id: 'cow-5', farmId: 'demo-farm-123', tagNumber: 'TAG-005', name: 'Surabhi', breed: 'Holstein Friesian', birthDate: '2021-08-30', status: 'milking', createdAt: new Date().toISOString() }
  ];

  const milkLogs: MilkLog[] = [];
  const today = new Date();
  ['cow-1', 'cow-2', 'cow-5'].forEach(cowId => {
    for (let i = 0; i < 15; i++) {
      const logDate = new Date(today);
      logDate.setDate(logDate.getDate() - i);
      const dateStr = logDate.toISOString().split('T')[0];
      
      // Morning
      milkLogs.push({
        id: `milk-${cowId}-${i}-m`,
        farmId: 'demo-farm-123',
        cattleId: cowId,
        logDate: dateStr,
        session: 'morning',
        quantityLiters: parseFloat((Math.random() * (12 - 8) + 8).toFixed(1)),
        fatPercentage: parseFloat((Math.random() * (4.5 - 3.5) + 3.5).toFixed(1)),
        snfPercentage: parseFloat((Math.random() * (9.0 - 8.2) + 8.2).toFixed(1)),
        recordedBy: 'Ramesh',
        createdAt: new Date().toISOString()
      });

      // Evening
      milkLogs.push({
        id: `milk-${cowId}-${i}-e`,
        farmId: 'demo-farm-123',
        cattleId: cowId,
        logDate: dateStr,
        session: 'evening',
        quantityLiters: parseFloat((Math.random() * (10 - 7) + 7).toFixed(1)),
        fatPercentage: parseFloat((Math.random() * (4.5 - 3.5) + 3.5).toFixed(1)),
        snfPercentage: parseFloat((Math.random() * (9.0 - 8.2) + 8.2).toFixed(1)),
        recordedBy: 'Ramesh',
        createdAt: new Date().toISOString()
      });
    }
  });

  const transactions: Transaction[] = [
    { id: 'tx-1', farmId: 'demo-farm-123', type: 'expense', category: 'Feed Purchase', amount: 15000, transactionDate: new Date(today.getTime() - 5*24*60*60*1000).toISOString().split('T')[0], paymentMethod: 'upi', notes: 'Sudarshan Concentrate 500kg', recordedBy: 'Sudarshan', createdAt: new Date().toISOString() },
    { id: 'tx-2', farmId: 'demo-farm-123', type: 'expense', category: 'Medicines', amount: 2500, transactionDate: new Date(today.getTime() - 2*24*60*60*1000).toISOString().split('T')[0], paymentMethod: 'cash', notes: 'PD Check for Bhadra', recordedBy: 'Ramesh', createdAt: new Date().toISOString() },
    { id: 'tx-3', farmId: 'demo-farm-123', type: 'income', category: 'Milk Sales', amount: 32000, transactionDate: new Date(today.getTime() - 1*24*60*60*1000).toISOString().split('T')[0], paymentMethod: 'bank_transfer', notes: 'Weekly Dairy Cooperative payment', recordedBy: 'Sudarshan', createdAt: new Date().toISOString() }
  ];

  const inventory: InventoryItem[] = [
    { id: 'inv-1', farmId: 'demo-farm-123', category: 'concentrate', name: 'Sudarshan Super', quantity: 450, unit: 'kg', lowStockThreshold: 100, lastUpdated: new Date().toISOString() },
    { id: 'inv-2', farmId: 'demo-farm-123', category: 'silage', name: 'Corn Silage', quantity: 2000, unit: 'kg', lowStockThreshold: 500, lastUpdated: new Date().toISOString() },
    { id: 'inv-3', farmId: 'demo-farm-123', category: 'medicine', name: 'Calcium Supplements', quantity: 15, unit: 'units', lowStockThreshold: 5, lastUpdated: new Date().toISOString() }
  ];

  const breeding: BreedingLog[] = [
    { id: 'br-1', farmId: 'demo-farm-123', cattleId: 'cow-3', eventType: 'dry_off', eventDate: new Date(today.getTime() - 15*24*60*60*1000).toISOString().split('T')[0], notes: 'Dried off for upcoming calving', recordedBy: 'Ramesh', createdAt: new Date().toISOString() },
    { id: 'br-2', farmId: 'demo-farm-123', cattleId: 'cow-4', eventType: 'ai', eventDate: new Date(today.getTime() - 60*24*60*60*1000).toISOString().split('T')[0], notes: 'AI Semen: HF-Premium', recordedBy: 'Vet', createdAt: new Date().toISOString() },
    { id: 'br-3', farmId: 'demo-farm-123', cattleId: 'cow-4', eventType: 'pd', eventDate: new Date(today.getTime() - 2*24*60*60*1000).toISOString().split('T')[0], notes: 'Confirmed Pregnant!', recordedBy: 'Vet', createdAt: new Date().toISOString() }
  ];

  const health: HealthLog[] = [
    { id: 'hl-1', farmId: 'demo-farm-123', cattleId: 'cow-2', cattleName: 'Lakshmi', cattleTag: 'TAG-002', treatmentType: 'medical_treatment', title: 'Mastitis Check', administeredDate: new Date(today.getTime() - 10*24*60*60*1000).toISOString().split('T')[0], notes: 'Antibiotic course', performedBy: 'Dr. Rao', cost: 850, nextDueDate: new Date(today.getTime() + 5*24*60*60*1000).toISOString().split('T')[0], status: 'completed', createdAt: new Date().toISOString() }
  ];

  localStorage.setItem('ourdairy_farm', JSON.stringify(farm));
  localStorage.setItem('ourdairy_profiles', JSON.stringify(profiles));
  localStorage.setItem('ourdairy_cattle', JSON.stringify(cattle));
  localStorage.setItem('ourdairy_milk_logs', JSON.stringify(milkLogs));
  localStorage.setItem('ourdairy_health_logs', JSON.stringify(health));
  localStorage.setItem('ourdairy_transactions', JSON.stringify(transactions));
  localStorage.setItem('ourdairy_breeding_logs', JSON.stringify(breeding));
  localStorage.setItem('ourdairy_inventory', JSON.stringify(inventory));
  
  // Set active profile to owner automatically
  localStorage.setItem('ourdairy_active_profile', JSON.stringify(profiles[0]));
};
