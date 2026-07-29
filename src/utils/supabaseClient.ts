import { createClient } from '@supabase/supabase-js';
import type { Farm, Profile, Cattle, MilkLog, HealthLog, Transaction } from '../types';
import { DEFAULT_FARM, MOCK_PROFILES, INITIAL_CATTLE, INITIAL_MILK_LOGS, INITIAL_HEALTH_LOGS, INITIAL_TRANSACTIONS } from './mockData';

// Fetch credentials from Vite env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isLiveDb = !!(supabaseUrl && supabaseAnonKey);
export const supabase = isLiveDb ? createClient(supabaseUrl, supabaseAnonKey) : null;

const STORAGE_KEYS = {
  FARM: 'ourdairy_farm',
  PROFILES: 'ourdairy_profiles',
  CATTLE: 'ourdairy_cattle',
  MILK_LOGS: 'ourdairy_milk_logs',
  HEALTH_LOGS: 'ourdairy_health_logs',
  TRANSACTIONS: 'ourdairy_transactions',
  ACTIVE_PROFILE: 'ourdairy_active_profile',
};

// Initialize local storage fallback
const initializeLocalDB = () => {
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
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE, JSON.stringify(MOCK_PROFILES[0]));
  }
};

initializeLocalDB();

// Helper to map DB profiles to Frontend Profiles
const mapProfile = (p: any): Profile => ({
  id: p.id,
  farmId: p.farm_id,
  role: p.role,
  fullName: p.full_name,
  phoneNumber: p.phone_number,
  securityPin: p.security_pin,
  createdAt: p.created_at
});

export const db = {
  // Farm & Profile APIs
  getFarm: async (): Promise<Farm> => {
    if (isLiveDb && supabase) {
      const { data, error } = await supabase.from('farms').select('*').limit(1).maybeSingle();
      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          location: data.location,
          createdAt: data.created_at
        };
      }
      
      // Seed default farm in database
      const dbFarm = {
        id: DEFAULT_FARM.id,
        name: DEFAULT_FARM.name,
        location: DEFAULT_FARM.location,
        created_at: DEFAULT_FARM.createdAt
      };
      const { data: seeded } = await supabase.from('farms').insert([dbFarm]).select().single();
      if (seeded) {
        return {
          id: seeded.id,
          name: seeded.name,
          location: seeded.location,
          createdAt: seeded.created_at
        };
      }
    }
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.FARM) || '{}');
  },

  getFarmById: async (id: string): Promise<Farm | null> => {
    if (id === 'farm-khammam-001') {
      // Automatic seed check for demo farm
      return db.getFarm();
    }
    if (isLiveDb && supabase) {
      const { data } = await supabase.from('farms').select('*').eq('id', id).maybeSingle();
      if (data) {
        return {
          id: data.id,
          name: data.name,
          location: data.location,
          createdAt: data.created_at
        };
      }
      return null;
    }
    const localFarm = JSON.parse(localStorage.getItem(STORAGE_KEYS.FARM) || '{}');
    if (localFarm.id === id) return localFarm;
    return null;
  },

  searchFarms: async (query: string): Promise<{ id: string, name: string, location: string, ownerName: string }[]> => {
    if (!query.trim()) return [];
    const cleanQuery = query.trim().toLowerCase();
    
    if (isLiveDb && supabase) {
      // 1. Fetch farms
      const { data: farms } = await supabase.from('farms').select('id, name, location');
      if (!farms) return [];
      
      // 2. Fetch owners
      const { data: profiles } = await supabase.from('profiles').select('farm_id, role, full_name').eq('role', 'owner');
      
      const results = farms.map(f => {
        const owner = profiles?.find(p => p.farm_id === f.id);
        return {
          id: f.id,
          name: f.name,
          location: f.location || '',
          ownerName: owner?.full_name || ''
        };
      }).filter(r => 
        r.name.toLowerCase().includes(cleanQuery) || 
        r.ownerName.toLowerCase().includes(cleanQuery)
      );
      
      return results;
    }
    
    const localFarm = JSON.parse(localStorage.getItem(STORAGE_KEYS.FARM) || '{}');
    const localProfiles = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILES) || '[]');
    const owner = localProfiles.find((p: any) => p.role === 'owner');
    
    if (localFarm.id && (
      localFarm.name.toLowerCase().includes(cleanQuery) || 
      (owner && owner.fullName.toLowerCase().includes(cleanQuery))
    )) {
      return [{
        id: localFarm.id,
        name: localFarm.name,
        location: localFarm.location || '',
        ownerName: owner ? owner.fullName : ''
      }];
    }
    return [];
  },
  
  updateFarm: async (name: string, location: string): Promise<Farm> => {
    if (isLiveDb && supabase) {
      const farm = await db.getFarm();
      const { data } = await supabase
        .from('farms')
        .update({ name, location })
        .eq('id', farm.id)
        .select()
        .single();
      if (data) {
        return {
          id: data.id,
          name: data.name,
          location: data.location,
          createdAt: data.created_at
        };
      }
    }
    const farm = JSON.parse(localStorage.getItem(STORAGE_KEYS.FARM) || '{}');
    farm.name = name;
    farm.location = location;
    localStorage.setItem(STORAGE_KEYS.FARM, JSON.stringify(farm));
    return farm;
  },

  createFarm: async (farmName: string, location: string, ownerName: string): Promise<{ farm: Farm, profiles: Profile[] }> => {
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

    if (isLiveDb && supabase) {
      await supabase.from('farms').insert([{
        id: newFarm.id,
        name: newFarm.name,
        location: newFarm.location,
        created_at: newFarm.createdAt
      }]);
      await supabase.from('profiles').insert(newProfiles.map(p => ({
        id: p.id,
        farm_id: p.farmId,
        role: p.role,
        full_name: p.fullName,
        phone_number: p.phoneNumber,
        security_pin: p.securityPin,
        created_at: p.createdAt
      })));
      return { farm: newFarm, profiles: newProfiles };
    }

    localStorage.setItem(STORAGE_KEYS.FARM, JSON.stringify(newFarm));
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(newProfiles));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE, JSON.stringify(newProfiles[0]));
    
    localStorage.setItem(STORAGE_KEYS.CATTLE, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.MILK_LOGS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.HEALTH_LOGS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    
    return { farm: newFarm, profiles: newProfiles };
  },

  updateProfiles: async (ownerName: string, managerName: string, managerPin?: string): Promise<Profile[]> => {
    if (isLiveDb && supabase) {
      const list = await db.getProfiles();
      const owner = list.find(p => p.role === 'owner');
      const manager = list.find(p => p.role === 'manager');
      
      if (owner) {
        await supabase.from('profiles').update({ full_name: ownerName }).eq('id', owner.id);
      }
      if (manager) {
        const updateData: any = { full_name: managerName };
        if (managerPin) updateData.security_pin = managerPin;
        await supabase.from('profiles').update(updateData).eq('id', manager.id);
      }
      return db.getProfiles();
    }

    const list: Profile[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILES) || '[]');
    const owner = list.find(p => p.role === 'owner');
    const manager = list.find(p => p.role === 'manager');
    if (owner) owner.fullName = ownerName;
    if (manager) {
      manager.fullName = managerName;
      if (managerPin) manager.securityPin = managerPin;
    }
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(list));
    
    const active = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE) || '{}');
    if (active.role === 'owner' && owner) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE, JSON.stringify(owner));
    } else if (active.role === 'manager' && manager) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE, JSON.stringify(manager));
    }
    return list;
  },

  resetToDemo: async (): Promise<void> => {
    if (isLiveDb && supabase) {
      const farm = await db.getFarm();
      await supabase.from('cattle').delete().eq('farm_id', farm.id);
      await supabase.from('milk_logs').delete().eq('farm_id', farm.id);
      await supabase.from('health_logs').delete().eq('farm_id', farm.id);
      await supabase.from('transactions').delete().eq('farm_id', farm.id);
      await supabase.from('profiles').delete().eq('farm_id', farm.id);
      await supabase.from('farms').delete().eq('id', farm.id);
    }
    localStorage.removeItem(STORAGE_KEYS.FARM);
    localStorage.removeItem(STORAGE_KEYS.PROFILES);
    localStorage.removeItem(STORAGE_KEYS.CATTLE);
    localStorage.removeItem(STORAGE_KEYS.MILK_LOGS);
    localStorage.removeItem(STORAGE_KEYS.HEALTH_LOGS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_PROFILE);
    initializeLocalDB();
  },
  
  getProfiles: async (): Promise<Profile[]> => {
    if (isLiveDb && supabase) {
      const farm = await db.getFarm();
      const { data } = await supabase.from('profiles').select('*').eq('farm_id', farm.id);
      if (data && data.length > 0) return data.map(mapProfile);
      
      // If live but empty profiles, seed them
      const dbProfiles = MOCK_PROFILES.map(p => ({
        id: p.id,
        farm_id: farm.id,
        role: p.role,
        full_name: p.fullName,
        phone_number: p.phoneNumber,
        security_pin: p.securityPin,
        created_at: p.createdAt
      }));
      await supabase.from('profiles').insert(dbProfiles);
      return MOCK_PROFILES;
    }
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILES) || '[]');
  },
  
  getActiveProfile: async (): Promise<Profile> => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE) || '{}');
  },
  
  setActiveProfile: async (profile: Profile): Promise<void> => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE, JSON.stringify(profile));
  },

  // Cattle APIs
  getCattle: async (): Promise<Cattle[]> => {
    if (isLiveDb && supabase) {
      const farm = await db.getFarm();
      const { data } = await supabase.from('cattle').select('*').eq('farm_id', farm.id);
      if (data) {
        const mapped = data.map(c => ({
          id: c.id,
          farmId: c.farm_id,
          tagNumber: c.tag_number,
          name: c.name,
          breed: c.breed,
          status: c.status,
          birthDate: c.birth_date,
          purchaseDate: c.purchase_date,
          purchaseCost: c.purchase_cost ? parseFloat(c.purchase_cost) : undefined,
          notes: c.notes,
          createdAt: c.created_at
        }));
        return mapped.sort((a, b) => a.tagNumber.localeCompare(b.tagNumber));
      }
    }
    const list: Cattle[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATTLE) || '[]');
    return list.sort((a, b) => a.tagNumber.localeCompare(b.tagNumber));
  },
  
  saveCattle: async (cow: Omit<Cattle, 'id' | 'farmId' | 'createdAt'> & { id?: string }): Promise<Cattle> => {
    const activeFarm = await db.getFarm();
    const id = cow.id || `cattle-${Date.now()}`;
    
    const dbCow = {
      id,
      farm_id: activeFarm.id,
      tag_number: cow.tagNumber,
      name: cow.name,
      breed: cow.breed,
      status: cow.status,
      birth_date: cow.birthDate || null,
      purchase_date: cow.purchaseDate || null,
      purchase_cost: cow.purchaseCost || null,
      notes: cow.notes
    };

    if (isLiveDb && supabase) {
      if (cow.id) {
        await supabase.from('cattle').update(dbCow).eq('id', cow.id);
      } else {
        await supabase.from('cattle').insert([dbCow]);
      }
      const list = await db.getCattle();
      return list.find(c => c.id === id) as Cattle;
    }

    const list = await db.getCattle();
    const newCow: Cattle = {
      ...cow,
      id,
      farmId: activeFarm.id,
      createdAt: new Date().toISOString(),
    };
    
    if (cow.id) {
      const idx = list.findIndex(c => c.id === cow.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...cow } as Cattle;
      }
    } else {
      list.push(newCow);
    }
    
    localStorage.setItem(STORAGE_KEYS.CATTLE, JSON.stringify(list));
    return newCow;
  },
  
  deleteCattle: async (id: string): Promise<void> => {
    if (isLiveDb && supabase) {
      await supabase.from('cattle').delete().eq('id', id);
      return;
    }
    const list = await db.getCattle();
    const updated = list.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CATTLE, JSON.stringify(updated));
  },

  // Milk Log APIs
  getMilkLogs: async (): Promise<MilkLog[]> => {
    if (isLiveDb && supabase) {
      const farm = await db.getFarm();
      const { data } = await supabase.from('milk_logs').select('*').eq('farm_id', farm.id);
      if (data) {
        const mapped = data.map(l => ({
          id: l.id,
          farmId: l.farm_id,
          cattleId: l.cattle_id,
          cattleName: l.cattle_name,
          cattleTag: l.cattle_tag,
          logDate: l.log_date,
          session: l.session,
          quantityLiters: parseFloat(l.quantity_liters),
          fatPercentage: l.fat_percentage ? parseFloat(l.fat_percentage) : undefined,
          snfPercentage: l.snf_percentage ? parseFloat(l.snf_percentage) : undefined,
          recordedBy: l.recorded_by,
          createdAt: l.created_at
        }));
        return mapped.sort((a, b) => new Date(b.logDate).getTime() - new Date(a.logDate).getTime());
      }
    }
    const list: MilkLog[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.MILK_LOGS) || '[]');
    return list.sort((a, b) => new Date(b.logDate).getTime() - new Date(a.logDate).getTime());
  },
  
  saveMilkLog: async (log: Omit<MilkLog, 'id' | 'farmId' | 'createdAt'>): Promise<MilkLog> => {
    const activeFarm = await db.getFarm();
    const id = `milk-${Date.now()}`;
    
    const dbLog = {
      id,
      farm_id: activeFarm.id,
      cattle_id: log.cattleId || null,
      cattle_name: log.cattleName || null,
      cattle_tag: log.cattleTag || null,
      log_date: log.logDate,
      session: log.session,
      quantity_liters: log.quantityLiters,
      fat_percentage: log.fatPercentage || null,
      snf_percentage: log.snfPercentage || null,
      recorded_by: log.recordedBy
    };

    if (isLiveDb && supabase) {
      await supabase.from('milk_logs').insert([dbLog]);
      const list = await db.getMilkLogs();
      return list.find(m => m.id === id) as MilkLog;
    }

    const list = await db.getMilkLogs();
    const newLog: MilkLog = {
      ...log,
      id,
      farmId: activeFarm.id,
      createdAt: new Date().toISOString(),
    };
    
    list.push(newLog);
    localStorage.setItem(STORAGE_KEYS.MILK_LOGS, JSON.stringify(list));
    return newLog;
  },
  
  deleteMilkLog: async (id: string): Promise<void> => {
    if (isLiveDb && supabase) {
      await supabase.from('milk_logs').delete().eq('id', id);
      return;
    }
    const list = await db.getMilkLogs();
    const updated = list.filter(l => l.id !== id);
    localStorage.setItem(STORAGE_KEYS.MILK_LOGS, JSON.stringify(updated));
  },

  // Health Log APIs
  getHealthLogs: async (): Promise<HealthLog[]> => {
    if (isLiveDb && supabase) {
      const farm = await db.getFarm();
      const { data } = await supabase.from('health_logs').select('*').eq('farm_id', farm.id);
      if (data) {
        const mapped = data.map(h => ({
          id: h.id,
          farmId: h.farm_id,
          cattleId: h.cattle_id,
          cattleName: h.cattle_name,
          cattleTag: h.cattle_tag,
          treatmentType: h.treatment_type,
          title: h.title,
          administeredDate: h.administered_date,
          nextDueDate: h.next_due_date,
          cost: parseFloat(h.cost),
          performedBy: h.performed_by,
          status: h.status,
          notes: h.notes,
          createdAt: h.created_at
        }));
        return mapped.sort((a, b) => {
          if (a.status === 'scheduled' && b.status !== 'scheduled') return -1;
          if (a.status !== 'scheduled' && b.status === 'scheduled') return 1;
          const dateA = a.nextDueDate || a.administeredDate || '';
          const dateB = b.nextDueDate || b.administeredDate || '';
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });
      }
    }
    const list: HealthLog[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.HEALTH_LOGS) || '[]');
    return list.sort((a, b) => {
      if (a.status === 'scheduled' && b.status !== 'scheduled') return -1;
      if (a.status !== 'scheduled' && b.status === 'scheduled') return 1;
      const dateA = a.nextDueDate || a.administeredDate || '';
      const dateB = b.nextDueDate || b.administeredDate || '';
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  },
  
  saveHealthLog: async (log: Omit<HealthLog, 'id' | 'farmId' | 'createdAt'> & { id?: string }): Promise<HealthLog> => {
    const activeFarm = await db.getFarm();
    const id = log.id || `health-${Date.now()}`;
    
    const dbLog = {
      id,
      farm_id: activeFarm.id,
      cattle_id: log.cattleId,
      cattle_name: log.cattleName,
      cattle_tag: log.cattleTag,
      treatment_type: log.treatmentType,
      title: log.title,
      administered_date: log.administeredDate || null,
      next_due_date: log.nextDueDate || null,
      cost: log.cost,
      performed_by: log.performedBy || null,
      status: log.status,
      notes: log.notes
    };

    if (isLiveDb && supabase) {
      if (log.id) {
        await supabase.from('health_logs').update(dbLog).eq('id', log.id);
      } else {
        await supabase.from('health_logs').insert([dbLog]);
      }
      const list = await db.getHealthLogs();
      return list.find(h => h.id === id) as HealthLog;
    }

    const list = await db.getHealthLogs();
    const newLog: HealthLog = {
      ...log,
      id,
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
  
  updateHealthStatus: async (id: string, status: 'completed' | 'missed', administeredDate?: string): Promise<void> => {
    if (isLiveDb && supabase) {
      const updateData: any = { status };
      if (administeredDate) updateData.administered_date = administeredDate;
      await supabase.from('health_logs').update(updateData).eq('id', id);
      return;
    }
    const list = await db.getHealthLogs();
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
  getTransactions: async (): Promise<Transaction[]> => {
    if (isLiveDb && supabase) {
      const farm = await db.getFarm();
      const { data } = await supabase.from('transactions').select('*').eq('farm_id', farm.id);
      if (data) {
        const mapped = data.map(t => ({
          id: t.id,
          farmId: t.farm_id,
          type: t.type,
          category: t.category,
          amount: parseFloat(t.amount),
          transactionDate: t.transaction_date,
          paymentMethod: t.payment_method,
          receiptUrl: t.receipt_url,
          notes: t.notes,
          recordedBy: t.recorded_by,
          createdAt: t.created_at
        }));
        return mapped.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
      }
    }
    const list: Transaction[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
    return list.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
  },
  
  saveTransaction: async (trans: Omit<Transaction, 'id' | 'farmId' | 'createdAt'>): Promise<Transaction> => {
    const activeFarm = await db.getFarm();
    const id = `trans-${Date.now()}`;
    
    const dbTrans = {
      id,
      farm_id: activeFarm.id,
      type: trans.type,
      category: trans.category,
      amount: trans.amount,
      transaction_date: trans.transactionDate,
      payment_method: trans.paymentMethod,
      receipt_url: trans.receiptUrl || null,
      notes: trans.notes || null,
      recorded_by: trans.recordedBy
    };

    if (isLiveDb && supabase) {
      await supabase.from('transactions').insert([dbTrans]);
      const list = await db.getTransactions();
      return list.find(t => t.id === id) as Transaction;
    }

    const list = await db.getTransactions();
    const newTrans: Transaction = {
      ...trans,
      id,
      farmId: activeFarm.id,
      createdAt: new Date().toISOString(),
    };
    
    list.push(newTrans);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(list));
    return newTrans;
  },
  
  deleteTransaction: async (id: string): Promise<void> => {
    if (isLiveDb && supabase) {
      await supabase.from('transactions').delete().eq('id', id);
      return;
    }
    const list = await db.getTransactions();
    const updated = list.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
  }
};
