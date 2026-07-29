import type { Cattle, MilkLog, HealthLog, Transaction, Profile, Farm } from '../types';
import { 
  DEFAULT_FARM, 
  MOCK_PROFILES, 
  INITIAL_CATTLE, 
  INITIAL_MILK_LOGS, 
  INITIAL_HEALTH_LOGS, 
  INITIAL_TRANSACTIONS 
} from './mockData';

// This acts as a mock database engine using localStorage
// Under the hood, this is structurally identical to Supabase's schemas.
// When the owner is ready to deploy to a real database, they can simply swap these functions
// to call supabase.from('table').select(...) with zero changes to UI components.

const STORAGE_KEYS = {
  FARM: 'df_farm',
  PROFILES: 'df_profiles',
  CATTLE: 'df_cattle',
  MILK_LOGS: 'df_milk_logs',
  HEALTH_LOGS: 'df_health_logs',
  TRANSACTIONS: 'df_transactions',
  ACTIVE_PROFILE: 'df_active_profile',
};

// Helper to initialize local storage if empty
const initializeDB = () => {
  if (!localStorage.getItem(STORAGE_KEYS.FARM)) {
    localStorage.setItem(STORAGE_KEYS.FARM, JSON.stringify(DEFAULT_FARM));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PROFILES)) {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(MOCK_PROFILES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATTLE)) {
    localStorage.setItem(STORAGE_KEYS.CATTLE, JSON.stringify(INITIAL_CATTLE));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MILK_LOGS)) {
    localStorage.setItem(STORAGE_KEYS.MILK_LOGS, JSON.stringify(INITIAL_MILK_LOGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.HEALTH_LOGS)) {
    localStorage.setItem(STORAGE_KEYS.HEALTH_LOGS, JSON.stringify(INITIAL_HEALTH_LOGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE)) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE, JSON.stringify(MOCK_PROFILES[0])); // Default is Owner
  }
};

initializeDB();

export const db = {
  // Farm & Profile APIs
  getFarm: (): Farm => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.FARM) || '{}');
  },
  
  updateFarm: (name: string, location: string): Farm => {
    const farm = db.getFarm();
    farm.name = name;
    farm.location = location;
    localStorage.setItem(STORAGE_KEYS.FARM, JSON.stringify(farm));
    return farm;
  },

  updateProfiles: (ownerName: string, managerName: string, managerPin?: string): Profile[] => {
    const list: Profile[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILES) || '[]');
    const owner = list.find(p => p.role === 'owner');
    const manager = list.find(p => p.role === 'manager');
    if (owner) owner.fullName = ownerName;
    if (manager) {
      manager.fullName = managerName;
      if (managerPin) manager.securityPin = managerPin;
    }
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(list));
    
    // Update active profile copy as well if it matches
    const active = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE) || '{}');
    if (active.role === 'owner' && owner) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE, JSON.stringify(owner));
    } else if (active.role === 'manager' && manager) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE, JSON.stringify(manager));
    }
    return list;
  },

  createFarm: (farmName: string, location: string, ownerName: string): { farm: Farm, profiles: Profile[] } => {
    const farmId = `farm-${Date.now()}`;
    const newFarm: Farm = {
      id: farmId,
      name: farmName,
      location,
      createdAt: new Date().toISOString(),
    };
    
    const ownerId = `user-owner-${Date.now()}`;
    const managerId = `user-manager-${Date.now()}`;
    const newProfiles: Profile[] = [
      {
        id: ownerId,
        farmId,
        role: 'owner',
        fullName: ownerName,
        phoneNumber: '+91 99999 88888',
        securityPin: '0000',
        createdAt: new Date().toISOString(),
      },
      {
        id: managerId,
        farmId,
        role: 'manager',
        fullName: 'Raju (Manager)',
        phoneNumber: '+91 99999 77777',
        securityPin: '1111',
        createdAt: new Date().toISOString(),
      }
    ];

    localStorage.setItem(STORAGE_KEYS.FARM, JSON.stringify(newFarm));
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(newProfiles));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE, JSON.stringify(newProfiles[0]));
    
    // Clear lists for the new farm tenant
    localStorage.setItem(STORAGE_KEYS.CATTLE, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.MILK_LOGS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.HEALTH_LOGS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    
    return { farm: newFarm, profiles: newProfiles };
  },

  resetToDemo: (): void => {
    localStorage.removeItem(STORAGE_KEYS.FARM);
    localStorage.removeItem(STORAGE_KEYS.PROFILES);
    localStorage.removeItem(STORAGE_KEYS.CATTLE);
    localStorage.removeItem(STORAGE_KEYS.MILK_LOGS);
    localStorage.removeItem(STORAGE_KEYS.HEALTH_LOGS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_PROFILE);
    initializeDB();
  },
  
  getProfiles: (): Profile[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILES) || '[]');
  },
  
  getActiveProfile: (): Profile => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE) || '{}');
  },
  
  setActiveProfile: (profile: Profile): void => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE, JSON.stringify(profile));
  },

  // Cattle APIs
  getCattle: (): Cattle[] => {
    const list: Cattle[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATTLE) || '[]');
    return list.sort((a, b) => a.tagNumber.localeCompare(b.tagNumber));
  },
  
  saveCattle: (cow: Omit<Cattle, 'id' | 'farmId' | 'createdAt'> & { id?: string }): Cattle => {
    const list = db.getCattle();
    const activeFarm = db.getFarm();
    
    const newCow: Cattle = {
      ...cow,
      id: cow.id || `cattle-${Date.now()}`,
      farmId: activeFarm.id,
      createdAt: new Date().toISOString(),
    };
    
    if (cow.id) {
      // Edit mode
      const idx = list.findIndex(c => c.id === cow.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...cow } as Cattle;
      }
    } else {
      // Add mode
      list.push(newCow);
    }
    
    localStorage.setItem(STORAGE_KEYS.CATTLE, JSON.stringify(list));
    return newCow;
  },
  
  deleteCattle: (id: string): void => {
    const list = db.getCattle();
    const updated = list.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CATTLE, JSON.stringify(updated));
  },

  // Milk Log APIs
  getMilkLogs: (): MilkLog[] => {
    const list: MilkLog[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.MILK_LOGS) || '[]');
    return list.sort((a, b) => new Date(b.logDate).getTime() - new Date(a.logDate).getTime());
  },
  
  saveMilkLog: (log: Omit<MilkLog, 'id' | 'farmId' | 'createdAt'>): MilkLog => {
    const list = db.getMilkLogs();
    const activeFarm = db.getFarm();
    
    const newLog: MilkLog = {
      ...log,
      id: `milk-${Date.now()}`,
      farmId: activeFarm.id,
      createdAt: new Date().toISOString(),
    };
    
    list.push(newLog);
    localStorage.setItem(STORAGE_KEYS.MILK_LOGS, JSON.stringify(list));
    return newLog;
  },
  
  deleteMilkLog: (id: string): void => {
    const list = db.getMilkLogs();
    const updated = list.filter(l => l.id !== id);
    localStorage.setItem(STORAGE_KEYS.MILK_LOGS, JSON.stringify(updated));
  },

  // Health Log APIs
  getHealthLogs: (): HealthLog[] => {
    const list: HealthLog[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.HEALTH_LOGS) || '[]');
    return list.sort((a, b) => {
      // Scheduled ones first, then by date descending
      if (a.status === 'scheduled' && b.status !== 'scheduled') return -1;
      if (a.status !== 'scheduled' && b.status === 'scheduled') return 1;
      
      const dateA = a.nextDueDate || a.administeredDate || '';
      const dateB = b.nextDueDate || b.administeredDate || '';
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  },
  
  saveHealthLog: (log: Omit<HealthLog, 'id' | 'farmId' | 'createdAt'> & { id?: string }): HealthLog => {
    const list = db.getHealthLogs();
    const activeFarm = db.getFarm();
    
    const newLog: HealthLog = {
      ...log,
      id: log.id || `health-${Date.now()}`,
      farmId: activeFarm.id,
      createdAt: new Date().toISOString(),
    } as HealthLog;
    
    if (log.id) {
      const idx = list.findIndex(l => l.id === log.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...log } as HealthLog;
      }
    } else {
      list.push(newLog);
    }
    
    localStorage.setItem(STORAGE_KEYS.HEALTH_LOGS, JSON.stringify(list));
    return newLog;
  },
  
  updateHealthStatus: (id: string, status: 'completed' | 'missed', administeredDate?: string): void => {
    const list = db.getHealthLogs();
    const idx = list.findIndex(l => l.id === id);
    if (idx !== -1) {
      list[idx].status = status;
      if (administeredDate) {
        list[idx].administeredDate = administeredDate;
      }
      localStorage.setItem(STORAGE_KEYS.HEALTH_LOGS, JSON.stringify(list));
    }
  },

  // Transaction APIs
  getTransactions: (): Transaction[] => {
    const list: Transaction[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
    return list.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
  },
  
  saveTransaction: (trans: Omit<Transaction, 'id' | 'farmId' | 'createdAt'>): Transaction => {
    const list = db.getTransactions();
    const activeFarm = db.getFarm();
    
    const newTrans: Transaction = {
      ...trans,
      id: `trans-${Date.now()}`,
      farmId: activeFarm.id,
      createdAt: new Date().toISOString(),
    };
    
    list.push(newTrans);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(list));
    return newTrans;
  },
  
  deleteTransaction: (id: string): void => {
    const list = db.getTransactions();
    const updated = list.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
  }
};
