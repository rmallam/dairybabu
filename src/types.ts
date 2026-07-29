export interface Farm {
  id: string;
  name: string;
  location: string;
  createdAt: string;
}

export interface Profile {
  id: string;
  farmId: string;
  role: 'owner' | 'manager';
  fullName: string;
  phoneNumber: string;
  securityPin?: string; // Secret login PIN (e.g. "0000" or "1111")
  createdAt: string;
}

export interface Cattle {
  id: string;
  farmId: string;
  tagNumber: string;
  name?: string;
  breed: string;
  status: 'milking' | 'dry' | 'pregnant' | 'heifer' | 'calf' | 'bull';
  birthDate?: string;
  purchaseDate?: string;
  purchaseCost?: number;
  notes?: string;
  createdAt: string;
}

export interface MilkLog {
  id: string;
  farmId: string;
  cattleId?: string; // If undefined, this is a bulk/herd log
  cattleName?: string; // Helper for UI display
  cattleTag?: string; // Helper for UI display
  logDate: string;
  session: 'morning' | 'evening';
  quantityLiters: number;
  fatPercentage?: number;
  snfPercentage?: number;
  recordedBy: string; // Profile Name / ID
  createdAt: string;
}

export interface HealthLog {
  id: string;
  farmId: string;
  cattleId: string;
  cattleName: string;
  cattleTag: string;
  treatmentType: 'vaccination' | 'deworming' | 'artificial_insemination' | 'medical_treatment' | 'routine_check';
  title: string;
  administeredDate?: string;
  nextDueDate?: string;
  cost: number;
  performedBy?: string;
  status: 'scheduled' | 'completed' | 'missed';
  notes?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  farmId: string;
  type: 'income' | 'expense';
  category: 'Milk Sales' | 'Feed Purchase' | 'Medicines' | 'Salaries' | 'Diesel' | 'Maintenance' | 'Manure Sales' | 'Cattle Purchase' | 'Cattle Sale' | 'Other';
  amount: number;
  transactionDate: string;
  paymentMethod: 'cash' | 'upi' | 'bank_transfer';
  receiptUrl?: string; // Base64 or mock URL
  notes?: string;
  recordedBy: string; // Profile Name / ID
  createdAt: string;
}

export interface BreedingLog {
  id: string;
  farmId: string;
  cattleId: string;
  eventType: 'heat' | 'ai' | 'pd' | 'dry_off' | 'calving';
  eventDate: string;
  notes?: string;
  recordedBy: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  farmId: string;
  category: 'silage' | 'concentrate' | 'dry_fodder' | 'medicine' | 'other';
  name: string;
  quantity: number;
  unit: 'kg' | 'tons' | 'liters' | 'units';
  lowStockThreshold: number;
  lastUpdated: string;
}
