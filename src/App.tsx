import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  Check, 
  Calendar, 
  Camera, 
  X, 
  Search, 
  Trash, 
  Edit, 
  FileText,
  Layers,
  Lock,
  LogOut
} from 'lucide-react';
import { db } from './utils/supabaseClient';
import type { Farm, Cattle, MilkLog, HealthLog, Transaction, Profile } from './types';

function App() {
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Login/Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginRole, setLoginRole] = useState<'owner' | 'manager'>('owner');
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showRegisterFarm, setShowRegisterFarm] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    ownerName: '',
    farmName: '',
    location: '',
    managerName: '',
    ownerPhone: '',
  });

  // Active Farm Code ID (SaaS Multi-Tenancy Gateway)
  const [activeFarmId, setActiveFarmId] = useState<string | null>(localStorage.getItem('ourdairy_active_farm_id'));
  const [farmCodeInput, setFarmCodeInput] = useState('');
  const [farmCodeError, setFarmCodeError] = useState('');
  
  // Forgot Code Recovery States
  const [showFarmFinder, setShowFarmFinder] = useState(false);
  
  // Owner PIN Recovery States
  const [showOwnerPinReset, setShowOwnerPinReset] = useState(false);
  const [resetOwnerCodeInput, setResetOwnerCodeInput] = useState('');
  const [resetOwnerPhoneInput, setResetOwnerPhoneInput] = useState('');
  const [resetOwnerNewPinInput, setResetOwnerNewPinInput] = useState('');
  const [resetOwnerError, setResetOwnerError] = useState('');
  const [farmFinderSearch, setFarmFinderSearch] = useState('');
  const [farmFinderResults, setFarmFinderResults] = useState<{ id: string, name: string, location: string, ownerName: string }[]>([]);

  // Farm State
  const [farm, setFarm] = useState<Farm>({ id: '', name: 'Loading...', location: '', createdAt: '' });

  // App Role / User State
  const [activeProfile, setActiveProfile] = useState<Profile>({ id: '', farmId: '', role: 'owner', fullName: 'Loading...', phoneNumber: '', createdAt: '' });
  const [profiles, setProfiles] = useState<Profile[]>([]);

  // Database Data States
  const [cattle, setCattle] = useState<Cattle[]>([]);
  const [milkLogs, setMilkLogs] = useState<MilkLog[]>([]);
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Navigation tab state (consistent for both Owner and Manager)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cattle' | 'financials' | 'health'>('dashboard');

  // Search/Filters
  const [cattleSearch, setCattleSearch] = useState('');
  const [cattleFilterStatus, setCattleFilterStatus] = useState<string>('all');
  const [txFilterCategory, setTxFilterCategory] = useState<string>('all');

  // Modals visibility
  const [showAddCattleModal, setShowAddCattleModal] = useState(false);
  const [showLogMilkModal, setShowLogMilkModal] = useState(false);
  const [milkLogType, setMilkLogType] = useState<'individual' | 'bulk'>('individual');
  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [showAddHealthModal, setShowAddHealthModal] = useState(false);
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(null);

  // Dynamic Rate Configuration (DairyKhata Feature)
  const [fatPriceInput, setFatPriceInput] = useState('5.20');
  const [snfPriceInput, setSnfPriceInput] = useState('2.80');

  // Form States
  const [cattleForm, setCattleForm] = useState({
    id: '',
    tagNumber: '',
    name: '',
    breed: 'Murrah Buffalo',
    status: 'milking' as Cattle['status'],
    birthDate: '',
    purchaseDate: '',
    purchaseCost: '',
    notes: '',
  });

  const [milkLogForm, setMilkLogForm] = useState({
    cattleId: '',
    logDate: new Date().toISOString().split('T')[0],
    session: 'morning' as 'morning' | 'evening',
    quantityLiters: '',
    fatPercentage: '',
    snfPercentage: '',
  });

  const [txForm, setTxForm] = useState({
    type: 'expense' as 'income' | 'expense',
    category: 'Feed Purchase' as Transaction['category'],
    amount: '',
    transactionDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'upi' as 'cash' | 'upi' | 'bank_transfer',
    notes: '',
    receiptPhoto: null as string | null, // Simulated photo upload
  });

  const [healthForm, setHealthForm] = useState({
    cattleId: '',
    treatmentType: 'vaccination' as HealthLog['treatmentType'],
    title: '',
    nextDueDate: '',
    administeredDate: '',
    cost: '',
    performedBy: '',
    notes: '',
  });

  // Sync state from database (Multi-Tenant Sandboxed)
  const refreshData = async () => {
    try {
      if (!activeFarmId) {
        setFarm({ id: '', name: 'Select Farm', location: '', createdAt: '' });
        return;
      }
      
      const f = await db.getFarmById(activeFarmId);
      if (!f) {
        // Active farm ID not found, clear settings
        setActiveFarmId(null);
        localStorage.removeItem('ourdairy_active_farm_id');
        return;
      }
      setFarm(f);

      const [c, m, h, t, p, active] = await Promise.all([
        db.getCattle(),
        db.getMilkLogs(),
        db.getHealthLogs(),
        db.getTransactions(),
        db.getProfiles(),
        db.getActiveProfile()
      ]);
      setCattle(c);
      setMilkLogs(m);
      setHealthLogs(h);
      setTransactions(t);
      setProfiles(p);
      if (active && active.id && active.farmId === activeFarmId) {
        setActiveProfile(active);
      } else if (p.length > 0) {
        setActiveProfile(p[0]);
        await db.setActiveProfile(p[0]);
      }
    } catch (err) {
      console.error("Database initialization failed:", err);
    }
  };

  useEffect(() => {
    refreshData();
  }, [activeFarmId]);

  // Theme Toggle Effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);



  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const profile = profiles.find(p => p.role === loginRole);
    if (!profile) return;
    
    const expectedPin = profile.securityPin || (loginRole === 'owner' ? '0000' : '1111');
    if (pinInput === expectedPin) {
      db.setActiveProfile(profile);
      setActiveProfile(profile);
      setIsLoggedIn(true);
      setPinInput('');
      setLoginError('');
      setActiveTab('dashboard');
    } else {
      setLoginError(`Incorrect PIN for ${profile.fullName}.`);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleEnterFarmPortal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmCodeInput.trim()) return;

    setFarmCodeError('');
    const code = farmCodeInput.trim();
    const f = await db.getFarmById(code);
    if (f) {
      localStorage.setItem('ourdairy_active_farm_id', f.id);
      setActiveFarmId(f.id);
      setFarmCodeInput('');
      setFarmCodeError('');
    } else {
      setFarmCodeError('Invalid Access Code. For the demo, use: farm-khammam-001');
    }
  };

  const handleExitFarmPortal = () => {
    localStorage.removeItem('ourdairy_active_farm_id');
    setActiveFarmId(null);
    setPinInput('');
    setLoginError('');
  };

  const handleResetOwnerPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetOwnerCodeInput.trim() || !resetOwnerPhoneInput.trim() || !resetOwnerNewPinInput.trim()) return;

    setResetOwnerError('');
    const code = resetOwnerCodeInput.trim();
    const phone = resetOwnerPhoneInput.trim();
    const pin = resetOwnerNewPinInput.trim();

    if (code !== activeFarmId) {
      setResetOwnerError('Incorrect Farm Access Code.');
      return;
    }

    const ownerProfile = profiles.find(p => p.role === 'owner');
    if (!ownerProfile || ownerProfile.phoneNumber.replace(/\s+/g, '') !== phone.replace(/\s+/g, '')) {
      setResetOwnerError('Incorrect registered Owner Phone Number.');
      return;
    }

    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      setResetOwnerError('Security PIN must be exactly 4 digits.');
      return;
    }

    await db.resetOwnerPin(code, pin);
    alert('Owner PIN reset successfully! Please log in using your new PIN.');
    
    // Clear state
    setResetOwnerCodeInput('');
    setResetOwnerPhoneInput('');
    setResetOwnerNewPinInput('');
    setResetOwnerError('');
    setShowOwnerPinReset(false);
    
    await refreshData();
  };

  const handleFarmSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFarmFinderSearch(val);
    if (val.trim().length >= 2) {
      const results = await db.searchFarms(val);
      setFarmFinderResults(results);
    } else {
      setFarmFinderResults([]);
    }
  };

  const handleRegisterFarmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.farmName || !registerForm.ownerName || !registerForm.managerName || !registerForm.ownerPhone) return;

    const result = await db.createFarm(
      registerForm.farmName,
      registerForm.location,
      registerForm.ownerName,
      registerForm.ownerPhone,
      registerForm.managerName
    );

    localStorage.setItem('ourdairy_active_farm_id', result.farm.id);
    setActiveFarmId(result.farm.id);
    setFarm(result.farm);
    setActiveProfile(result.profiles[0]); // Logs in as new Owner
    setIsLoggedIn(true);
    setShowRegisterFarm(false);
    setRegisterForm({ ownerName: '', farmName: '', location: '', managerName: '', ownerPhone: '' });
    await refreshData();
  };



  // Simulated receipt file selection (saves base64 in state)
  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTxForm(prev => ({ ...prev, receiptPhoto: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCattleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cattleForm.tagNumber) return;

    await db.saveCattle({
      id: cattleForm.id || undefined,
      tagNumber: cattleForm.tagNumber,
      name: cattleForm.name || undefined,
      breed: cattleForm.breed,
      status: cattleForm.status,
      birthDate: cattleForm.birthDate || undefined,
      purchaseDate: cattleForm.purchaseDate || undefined,
      purchaseCost: cattleForm.purchaseCost ? parseFloat(cattleForm.purchaseCost) : undefined,
      notes: cattleForm.notes || undefined,
    });

    setShowAddCattleModal(false);
    // Reset form
    setCattleForm({
      id: '',
      tagNumber: '',
      name: '',
      breed: 'Murrah Buffalo',
      status: 'milking',
      birthDate: '',
      purchaseDate: '',
      purchaseCost: '',
      notes: '',
    });
    await refreshData();
  };

  const handleMilkLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milkLogForm.quantityLiters) return;

    let selectedCow: Cattle | undefined;
    if (milkLogType === 'individual' && milkLogForm.cattleId) {
      selectedCow = cattle.find(c => c.id === milkLogForm.cattleId);
    }

    await db.saveMilkLog({
      cattleId: milkLogType === 'individual' ? milkLogForm.cattleId : undefined,
      cattleName: milkLogType === 'individual' ? selectedCow?.name : undefined,
      cattleTag: milkLogType === 'individual' ? selectedCow?.tagNumber : undefined,
      logDate: milkLogForm.logDate,
      session: milkLogForm.session,
      quantityLiters: parseFloat(milkLogForm.quantityLiters),
      fatPercentage: milkLogForm.fatPercentage ? parseFloat(milkLogForm.fatPercentage) : undefined,
      snfPercentage: milkLogForm.snfPercentage ? parseFloat(milkLogForm.snfPercentage) : undefined,
      recordedBy: activeProfile.fullName,
    });

    // Automatically record income transaction based on FAT/SNF pricing (DairyKhata Feature)
    const lit = parseFloat(milkLogForm.quantityLiters);
    const fat = milkLogForm.fatPercentage ? parseFloat(milkLogForm.fatPercentage) : undefined;
    const snf = milkLogForm.snfPercentage ? parseFloat(milkLogForm.snfPercentage) : undefined;
    const rate = calculateMilkRate(fat, snf);
    const totalPayout = Math.round(lit * rate);

    await db.saveTransaction({
      type: 'income',
      category: 'Milk Sales',
      amount: totalPayout,
      transactionDate: milkLogForm.logDate,
      paymentMethod: 'upi',
      notes: milkLogType === 'individual' 
        ? `Milk payout for Cow ${selectedCow?.name || 'Unnamed'} (${selectedCow?.tagNumber}) - ${lit} Liters (Fat: ${fat || '—'}%, SNF: ${snf || '—'}%) at ₹${rate.toFixed(2)}/L`
        : `Bulk milk sales yield log (${milkLogForm.session}) - ${lit} Liters at ₹${rate.toFixed(2)}/L`,
      recordedBy: activeProfile.fullName,
    });

    setShowLogMilkModal(false);
    setMilkLogForm({
      cattleId: '',
      logDate: new Date().toISOString().split('T')[0],
      session: 'morning',
      quantityLiters: '',
      fatPercentage: '',
      snfPercentage: '',
    });
    await refreshData();
  };

  const handleTxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txForm.amount) return;

    await db.saveTransaction({
      type: txForm.type,
      category: txForm.category,
      amount: parseFloat(txForm.amount),
      transactionDate: txForm.transactionDate,
      paymentMethod: txForm.paymentMethod,
      receiptUrl: txForm.receiptPhoto || undefined, // Store base64 photo
      notes: txForm.notes || undefined,
      recordedBy: activeProfile.fullName,
    });

    setShowAddTxModal(false);
    setTxForm({
      type: 'expense',
      category: 'Feed Purchase',
      amount: '',
      transactionDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'upi',
      notes: '',
      receiptPhoto: null,
    });
    await refreshData();
  };

  const handleHealthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!healthForm.cattleId || !healthForm.title) return;

    const selectedCow = cattle.find(c => c.id === healthForm.cattleId);
    if (!selectedCow) return;

    const costNum = healthForm.cost ? parseFloat(healthForm.cost) : 0;

    await db.saveHealthLog({
      cattleId: healthForm.cattleId,
      cattleName: selectedCow.name || 'Unnamed',
      cattleTag: selectedCow.tagNumber,
      treatmentType: healthForm.treatmentType,
      title: healthForm.title,
      administeredDate: healthForm.administeredDate || undefined,
      nextDueDate: healthForm.nextDueDate || undefined,
      cost: costNum,
      performedBy: healthForm.performedBy || undefined,
      status: healthForm.administeredDate ? 'completed' : 'scheduled',
      notes: healthForm.notes || undefined,
    });

    // Record health cost in financials automatically
    if (costNum > 0) {
      await db.saveTransaction({
        type: 'expense',
        category: 'Medicines',
        amount: costNum,
        transactionDate: healthForm.administeredDate || healthForm.nextDueDate || new Date().toISOString().split('T')[0],
        paymentMethod: 'cash',
        notes: `${healthForm.treatmentType.toUpperCase()}: ${healthForm.title} for Cow ${selectedCow.name} (${selectedCow.tagNumber})`,
        recordedBy: activeProfile.fullName,
      });
    }

    setShowAddHealthModal(false);
    setHealthForm({
      cattleId: '',
      treatmentType: 'vaccination',
      title: '',
      nextDueDate: '',
      administeredDate: '',
      cost: '',
      performedBy: '',
      notes: '',
    });
    await refreshData();
  };

  const handleCompleteVaccine = async (logId: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    await db.updateHealthStatus(logId, 'completed', todayStr);
    await refreshData();
  };

  // Calculations
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netCashFlow = totalIncome - totalExpense;

  const totalMilkingCattle = cattle.filter(c => c.status === 'milking').length;
  
  const uniqueDates = Array.from(new Set(milkLogs.map(l => l.logDate))).slice(0, 5);
  const averageDailyYield = uniqueDates.length > 0 
    ? (milkLogs.reduce((sum, l) => sum + l.quantityLiters, 0) / uniqueDates.length).toFixed(1) 
    : '0';

  const pendingHealthTasks = healthLogs.filter(h => h.status === 'scheduled');

  // FAT/SNF Rate Payout Calculator (DairyKhata Feature)
  const calculateMilkRate = (fat?: number, snf?: number, customFatPrice?: number, customSnfPrice?: number): number => {
    const fPrice = customFatPrice !== undefined ? customFatPrice : parseFloat(fatPriceInput || '5.20');
    const sPrice = customSnfPrice !== undefined ? customSnfPrice : parseFloat(snfPriceInput || '2.80');
    if (!fat || !snf) return 48; // Default base rate if metrics aren't entered
    return parseFloat(((fat * fPrice) + (snf * sPrice)).toFixed(2));
  };

  // Nitara-Style Health Yield drop Alerts
  const yieldAlerts = cattle
    .filter(cow => cow.status === 'milking')
    .map(cow => {
      const cowLogs = milkLogs.filter(l => l.cattleId === cow.id);
      if (cowLogs.length < 3) return null; 

      const sortedLogs = [...cowLogs].sort((a, b) => new Date(b.logDate).getTime() - new Date(a.logDate).getTime());
      const historicLogs = sortedLogs.slice(1);
      if (historicLogs.length < 2) return null;

      const averageHistoric = historicLogs.reduce((sum, l) => sum + l.quantityLiters, 0) / historicLogs.length;
      const latestLog = sortedLogs[0];
      
      const percentDrop = ((averageHistoric - latestLog.quantityLiters) / averageHistoric) * 100;
      
      if (percentDrop > 18) { // Alert if production drops by more than 18%
        return {
          cowId: cow.id,
          name: cow.name || 'Unnamed',
          tag: cow.tagNumber,
          average: averageHistoric.toFixed(1),
          latest: latestLog.quantityLiters.toFixed(1),
          drop: percentDrop.toFixed(0),
          date: latestLog.logDate
        };
      }
      return null;
    })
    .filter((a): a is NonNullable<typeof a> => a !== null);

  // Filters
  const filteredCattle = cattle.filter(c => {
    const matchesSearch = c.tagNumber.toLowerCase().includes(cattleSearch.toLowerCase()) || 
                          (c.name && c.name.toLowerCase().includes(cattleSearch.toLowerCase()));
    const matchesStatus = cattleFilterStatus === 'all' || c.status === cattleFilterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredTransactions = transactions.filter(t => {
    const matchesCategory = txFilterCategory === 'all' || t.category === txFilterCategory;
    return matchesCategory;
  });

  if (!isLoggedIn) {
    return (
      <div className="login-overlay">
        <div className="login-card">
          <div className="login-logo">🐄</div>
          
          {showRegisterFarm ? (
            <div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '0.25rem', fontFamily: 'var(--font-title)' }}>Register SaaS Farm</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>Create a new isolated tenant database</p>

              <form onSubmit={handleRegisterFarmSubmit} style={{ textAlign: 'left' }}>
                <div className="form-group">
                  <label>Owner Name *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    placeholder="e.g. Rakesh Kumar"
                    value={registerForm.ownerName}
                    onChange={e => setRegisterForm(prev => ({ ...prev, ownerName: e.target.value }))}
                    autoComplete="off"
                  />
                </div>

                <div className="form-group">
                  <label>Owner Phone Number * (For PIN Recovery)</label>
                  <input 
                    type="tel" 
                    className="form-control" 
                    required 
                    placeholder="e.g. +61 412 345 678"
                    value={registerForm.ownerPhone}
                    onChange={e => setRegisterForm(prev => ({ ...prev, ownerPhone: e.target.value }))}
                    autoComplete="off"
                  />
                </div>

                <div className="form-group">
                  <label>Manager Name *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    placeholder="e.g. Gopal"
                    value={registerForm.managerName}
                    onChange={e => setRegisterForm(prev => ({ ...prev, managerName: e.target.value }))}
                    autoComplete="off"
                  />
                </div>

                <div className="form-group">
                  <label>Farm Name *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    placeholder="e.g. Sri Krishna Ghee Farms"
                    value={registerForm.farmName}
                    onChange={e => setRegisterForm(prev => ({ ...prev, farmName: e.target.value }))}
                    autoComplete="off"
                  />
                </div>

                <div className="form-group">
                  <label>Location (Mandi/Village)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Khammam rural, Telangana"
                    value={registerForm.location}
                    onChange={e => setRegisterForm(prev => ({ ...prev, location: e.target.value }))}
                    autoComplete="off"
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ flex: 1 }} 
                    onClick={() => setShowRegisterFarm(false)}
                  >
                    Back to Log In
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Register & Enter
                  </button>
                </div>
              </form>
            </div>
          ) : !activeFarmId ? (
            showFarmFinder ? (
              <div>
                <h2 style={{ fontSize: '1.6rem', marginBottom: '0.25rem', fontFamily: 'var(--font-title)' }}>Find Your Farm 🔍</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>Search by Farm Name or Owner Name to retrieve your access code.</p>

                <div style={{ textAlign: 'left' }}>
                  <div className="form-group">
                    <label htmlFor="farm-finder-input">Search Farm / Owner *</label>
                    <input 
                      id="farm-finder-input"
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Raade or Rakesh"
                      value={farmFinderSearch}
                      onChange={handleFarmSearchChange}
                      style={{ padding: '0.6rem 0.8rem', fontSize: '0.9rem' }}
                    />
                  </div>

                  <div style={{ maxHeight: '180px', overflowY: 'auto', margin: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {farmFinderResults.map(r => (
                      <div 
                        key={r.id} 
                        style={{ padding: '0.75rem', background: 'var(--card-hover)', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', textAlign: 'left' }}
                        onClick={() => {
                          localStorage.setItem('ourdairy_active_farm_id', r.id);
                          setActiveFarmId(r.id);
                          setShowFarmFinder(false);
                          setFarmFinderSearch('');
                          setFarmFinderResults([]);
                        }}
                      >
                        <p style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text)' }}>🏠 {r.name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Owner: {r.ownerName} &bull; {r.location}</p>
                        <code style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.25rem', display: 'block' }}>Code: {r.id}</code>
                      </div>
                    ))}
                    {farmFinderSearch.trim().length >= 2 && farmFinderResults.length === 0 && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No farms found matching "{farmFinderSearch}"</p>
                    )}
                  </div>

                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }}
                    onClick={() => {
                      setShowFarmFinder(false);
                      setFarmFinderSearch('');
                      setFarmFinderResults([]);
                    }}
                  >
                    Back to Portal Login
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '0.25rem', fontFamily: 'var(--font-title)' }}>OurDairy 🐄</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Enter your Farm Code to access your ledger.</p>

                <form onSubmit={handleEnterFarmPortal} style={{ textAlign: 'left', marginTop: '1.5rem' }}>
                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <label htmlFor="farm-code-input" style={{ marginBottom: 0 }}>Farm Access Code *</label>
                      <span 
                        onClick={() => setShowFarmFinder(true)} 
                        style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer', fontWeight: '600' }}
                      >
                        Forgot Code?
                      </span>
                    </div>
                    <input 
                      id="farm-code-input"
                      type="text" 
                      className="form-control" 
                      required 
                      placeholder="e.g. farm-khammam-001"
                      value={farmCodeInput}
                      onChange={e => setFarmCodeInput(e.target.value)}
                    />
                    <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--card-hover)', borderRadius: '6px', border: '1px dashed var(--border)', fontSize: '0.8rem', textAlign: 'center' }}>
                      💡 Want to try the Demo Farm?<br />
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        style={{ marginTop: '0.4rem', padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: 'var(--primary)', borderColor: 'var(--primary)', height: 'auto', display: 'inline-block' }}
                        onClick={() => setFarmCodeInput('farm-khammam-001')}
                      >
                        Autofill Code: farm-khammam-001
                      </button>
                    </div>
                    {farmCodeError && (
                      <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                        ⚠️ {farmCodeError}
                      </p>
                    )}
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '0.8rem' }}>
                    Enter Farm Portal
                  </button>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <button 
                      type="button"
                      onClick={() => setShowRegisterFarm(true)}
                      className="btn btn-secondary" 
                      style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
                    >
                      🚀 Register New Farm
                    </button>
                  </div>
                </form>
              </div>
            )
          ) : showOwnerPinReset ? (
            <div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '0.25rem', fontFamily: 'var(--font-title)' }}>Reset Owner PIN 🔑</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>Verify your details to set a new owner security PIN.</p>

              <form onSubmit={handleResetOwnerPinSubmit} style={{ textAlign: 'left' }}>
                <div className="form-group">
                  <label htmlFor="reset-code-input">Farm Access Code *</label>
                  <input 
                    id="reset-code-input"
                    type="text" 
                    className="form-control" 
                    required 
                    placeholder="e.g. farm-khammam-001"
                    value={resetOwnerCodeInput}
                    onChange={e => setResetOwnerCodeInput(e.target.value)}
                    autoComplete="off"
                  />
                </div>

                <div className="form-group" style={{ marginTop: '0.5rem' }}>
                  <label htmlFor="reset-phone-input">Owner Registered Phone *</label>
                  <input 
                    id="reset-phone-input"
                    type="tel" 
                    className="form-control" 
                    required 
                    placeholder="e.g. +61 412 345 678"
                    value={resetOwnerPhoneInput}
                    onChange={e => setResetOwnerPhoneInput(e.target.value)}
                    autoComplete="off"
                  />
                </div>

                <div className="form-group" style={{ marginTop: '0.5rem' }}>
                  <label htmlFor="reset-pin-input">New 4-Digit Owner PIN *</label>
                  <input 
                    id="reset-pin-input"
                    type="password" 
                    maxLength={4}
                    className="form-control" 
                    required 
                    placeholder="••••"
                    style={{ letterSpacing: '0.5em', fontSize: '1.1rem' }}
                    value={resetOwnerNewPinInput}
                    onChange={e => setResetOwnerNewPinInput(e.target.value)}
                  />
                </div>

                {resetOwnerError && (
                  <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                    ⚠️ {resetOwnerError}
                  </p>
                )}

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '0.8rem' }}>
                  Reset Owner PIN
                </button>
                
                <div style={{ marginTop: '0.75rem' }}>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowOwnerPinReset(false);
                      setResetOwnerCodeInput('');
                      setResetOwnerPhoneInput('');
                      setResetOwnerNewPinInput('');
                      setResetOwnerError('');
                    }}
                    className="btn btn-secondary" 
                    style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem' }}
                  >
                    Back to Log In
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '0.25rem', fontFamily: 'var(--font-title)' }}>OurDairy 🐄</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Secure Portal for <strong>{farm.name}</strong></p>

              <form onSubmit={handleLogin} style={{ marginTop: '2rem' }}>
                <div className="form-group" style={{ textAlign: 'left' }}>
                  <label>Select Role</label>
                  <div className="role-selector-grid">
                    <div 
                      className={`role-select-card ${loginRole === 'owner' ? 'active' : ''}`}
                      onClick={() => { setLoginRole('owner'); setLoginError(''); }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>👤</span>
                      <h4 style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                        {profiles.find(p => p.role === 'owner')?.fullName || 'Owner'}
                      </h4>
                    </div>
                    <div 
                      className={`role-select-card ${loginRole === 'manager' ? 'active' : ''}`}
                      onClick={() => { setLoginRole('manager'); setLoginError(''); }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>🧑</span>
                      <h4 style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                        {profiles.find(p => p.role === 'manager')?.fullName || 'Manager'}
                      </h4>
                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label htmlFor="pin-input" style={{ marginBottom: 0 }}>Enter Security PIN</label>
                    {loginRole === 'owner' && (
                      <span 
                        onClick={() => setShowOwnerPinReset(true)} 
                        style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer', fontWeight: '600' }}
                      >
                        Forgot PIN?
                      </span>
                    )}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                    <input 
                      id="pin-input"
                      type="password" 
                      className="form-control" 
                      placeholder="••••"
                      maxLength={4}
                      required
                      style={{ paddingLeft: '2.5rem', letterSpacing: '0.5em', fontSize: '1.1rem' }}
                      value={pinInput}
                      onChange={e => setPinInput(e.target.value)}
                    />
                  </div>
                  {loginError && (
                    <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.5rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                      ⚠️ {loginError}
                    </p>
                  )}
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.25rem', padding: '0.8rem' }}>
                  Sign In
                </button>
                
                <div style={{ marginTop: '0.75rem' }}>
                  <button 
                    type="button"
                    onClick={handleExitFarmPortal}
                    className="btn btn-secondary" 
                    style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem' }}
                  >
                    ← Switch Farm
                  </button>
                </div>


              </form>
            </div>
          )
}
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="header">
        <div className="logo-container">
          <div className="logo-icon">🐄</div>
          <div>
            <h1 className="logo-text">OurDairy</h1>
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem' }}>
              <span className="role-badge" style={{ background: 'var(--primary-glow)', color: 'var(--primary)', border: '1px solid rgba(46, 125, 50, 0.2)', fontSize: '0.7rem' }}>
                🏠 {farm.name}
              </span>
              <span className={`role-badge ${activeProfile.role}`} style={{ fontSize: '0.7rem' }}>
                {activeProfile.role === 'owner' ? 'Owner Portal' : 'Manager App'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="nav-controls">
          <div className="role-switch desktop-nav-pills">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`role-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('cattle')} 
              className={`role-btn ${activeTab === 'cattle' ? 'active' : ''}`}
            >
              Cattle ({cattle.length})
            </button>
            <button 
              onClick={() => setActiveTab('financials')} 
              className={`role-btn ${activeTab === 'financials' ? 'active' : ''}`}
            >
              Cash Ledger
            </button>
            <button 
              onClick={() => setActiveTab('health')} 
              className={`role-btn ${activeTab === 'health' ? 'active' : ''}`}
            >
              Vaccines ({pendingHealthTasks.length})
            </button>
          </div>

          {/* User profile identifier */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.25rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>
              {activeProfile.role === 'owner' ? '👤' : '🧑'} {activeProfile.fullName.split(' ')[0]}
            </span>
          </div>

          {/* Light/Dark Mode toggle */}
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="btn btn-secondary" 
            style={{ borderRadius: '50px', padding: '0.5rem', width: '38px', height: '38px' }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="btn btn-secondary" 
            style={{ padding: '0.5rem', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* MAIN VIEW AREA */}
      <main className="main-content">
        
        {/* ========================================================
            TAB: DASHBOARD
            ======================================================== */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Greetings & Roles */}
            {activeProfile.role === 'manager' ? (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem', color: 'var(--text)' }}>నమస్కారం, {activeProfile.fullName.split(' ')[0]}! 👋</h2>
                <p style={{ color: 'var(--text-muted)' }}>Quickly log daily actions. All updates are sent to the owner in real-time.</p>
              </div>
            ) : (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem', color: 'var(--text)' }}>Owner Dashboard</h2>
                <p style={{ color: 'var(--text-muted)' }}>Overview of {farm.name} Operations & Net Margin.</p>
              </div>
            )}

            {/* Quick Action Panels for Manager */}
            {activeProfile.role === 'manager' && (
              <section className="manager-actions">
                <div className="action-card" onClick={() => { setMilkLogType('individual'); setShowLogMilkModal(true); }}>
                  <div className="action-icon">🐄</div>
                  <h4 style={{ fontWeight: '700' }}>Individual Milk</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Log by ear tag</p>
                </div>
                <div className="action-card" onClick={() => { setMilkLogType('bulk'); setShowLogMilkModal(true); }}>
                  <div className="action-icon">🥛</div>
                  <h4 style={{ fontWeight: '700' }}>Bulk Milk Yield</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Log herd session</p>
                </div>
                <div className="action-card" onClick={() => setShowAddTxModal(true)}>
                  <div className="action-icon">💸</div>
                  <h4 style={{ fontWeight: '700' }}>Log Expense</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Feed, medicine bills</p>
                </div>
                <div className="action-card" onClick={() => setShowAddCattleModal(true)}>
                  <div className="action-icon">➕</div>
                  <h4 style={{ fontWeight: '700' }}>Add Cattle</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Profile new cow</p>
                </div>
              </section>
            )}

            {/* Nitara Health & Sickness Alerts (only visible if yields drop significantly) */}
            {activeProfile.role === 'owner' && yieldAlerts.length > 0 && (
              <div className="card" style={{ borderLeft: '5px solid var(--danger)', marginBottom: '1.5rem', background: 'rgba(239, 68, 68, 0.04)', borderColor: 'var(--danger)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--danger)', fontWeight: '700' }}>Nitara Precision Sickness Warnings</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {yieldAlerts.map(alert => (
                    <p key={alert.cowId} style={{ fontSize: '0.85rem', color: 'var(--text)' }}>
                      Cattle <strong>{alert.name} ({alert.tag})</strong> yield dropped to <strong style={{ color: 'var(--danger)' }}>{alert.latest}L</strong> (Average: {alert.average}L). 
                      This represents a <strong style={{ color: 'var(--danger)' }}>{alert.drop}% drop</strong>. Recommend checking for Mastitis, fever, or udder block.
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* STATS WIDGETS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              {activeProfile.role === 'owner' && (
                <div className="card">
                  <div className="card-header">
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700' }}>NET MARGIN</span>
                    <DollarSign size={20} color="var(--primary)" />
                  </div>
                  <div className="stat-value" style={{ color: netCashFlow >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {netCashFlow >= 0 ? '₹' : '-₹'}{Math.abs(netCashFlow)}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Income: <span style={{ color: 'var(--success)', fontWeight: '600' }}>₹{totalIncome}</span> | Bills: <span style={{ color: 'var(--danger)', fontWeight: '600' }}>₹{totalExpense}</span>
                  </p>
                </div>
              )}

              <div className="card">
                <div className="card-header">
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700' }}>AVG DAILY YIELD</span>
                  <TrendingUp size={20} color="var(--primary)" />
                </div>
                <div className="stat-value">
                  {averageDailyYield} <span className="stat-unit">Liters</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  From {totalMilkingCattle} active milking cattle
                </p>
              </div>

              <div className="card">
                <div className="card-header">
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700' }}>HERD SIZE</span>
                  <Activity size={20} color="var(--secondary)" />
                </div>
                <div className="stat-value">
                  {cattle.length} <span className="stat-unit">Heads</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  {cattle.filter(c => c.status === 'pregnant').length} pregnant &bull; {cattle.filter(c => c.status === 'dry').length} dry
                </p>
              </div>

              <div className="card">
                <div className="card-header">
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700' }}>VACCINES DUE</span>
                  <Calendar size={20} color="var(--accent)" />
                </div>
                <div className="stat-value" style={{ color: 'var(--accent)' }}>
                  {pendingHealthTasks.length} <span className="stat-unit">Alerts</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Check Vaccine checklist tab
                </p>
              </div>
            </div>

            {/* DASHBOARD GRIDS */}
            <div className="dashboard-grid">
              
              {/* SVG Charts section */}
              {activeProfile.role === 'owner' ? (
                <div className="card col-span-8">
                  <div className="card-header">
                    <h3 className="card-title"><TrendingUp size={18} /> Milk Production Trend (Past 5 Days)</h3>
                  </div>
                  <div className="chart-container">
                    <svg width="100%" height="100%" viewBox="0 0 600 220" preserveAspectRatio="none">
                      {/* Grid lines */}
                      <line x1="50" y1="30" x2="560" y2="30" className="chart-grid-line" />
                      <line x1="50" y1="80" x2="560" y2="80" className="chart-grid-line" />
                      <line x1="50" y1="130" x2="560" y2="130" className="chart-grid-line" />
                      <line x1="50" y1="180" x2="560" y2="180" stroke="var(--border)" strokeWidth="1.5" />

                      {/* Y-axis labels */}
                      <text x="10" y="34" className="chart-axis-text" style={{ textAnchor: 'start' }}>40 L</text>
                      <text x="10" y="84" className="chart-axis-text" style={{ textAnchor: 'start' }}>20 L</text>
                      <text x="10" y="134" className="chart-axis-text" style={{ textAnchor: 'start' }}>10 L</text>
                      <text x="10" y="184" className="chart-axis-text" style={{ textAnchor: 'start' }}>0 L</text>

                      {/* Bars mapping yield */}
                      {uniqueDates.map((dateStr, idx) => {
                        const morningLit = milkLogs
                          .filter(l => l.logDate === dateStr && l.session === 'morning')
                          .reduce((sum, l) => sum + l.quantityLiters, 0);
                        const eveningLit = milkLogs
                          .filter(l => l.logDate === dateStr && l.session === 'evening')
                          .reduce((sum, l) => sum + l.quantityLiters, 0);
                        
                        const totalLit = morningLit + eveningLit;
                        const scale = 150 / 40; // Max 40 Liters mapped to 150px height
                        
                        const morningHeight = morningLit * scale;
                        const eveningHeight = eveningLit * scale;
                        const xPos = 85 + idx * 95;
                        
                        return (
                          <g key={dateStr}>
                            {/* Evening Segment */}
                            <rect 
                              x={xPos} 
                              y={180 - morningHeight - eveningHeight} 
                              width="36" 
                              height={eveningHeight} 
                              className="chart-bar-secondary" 
                            />
                            {/* Morning Segment */}
                            <rect 
                              x={xPos} 
                              y={180 - morningHeight} 
                              width="36" 
                              height={morningHeight} 
                              className="chart-bar" 
                            />
                            {/* Quantity label above bar */}
                            <text 
                              x={xPos + 18} 
                              y={172 - morningHeight - eveningHeight} 
                              style={{ fill: 'var(--text)', fontSize: '11px', fontWeight: '700', textAnchor: 'middle' }}
                            >
                              {totalLit.toFixed(1)}L
                            </text>
                            {/* X-axis date labels */}
                            <text 
                              x={xPos + 18} 
                              y="202" 
                              className="chart-axis-text"
                              style={{ textAnchor: 'middle', fontWeight: '600' }}
                            >
                              {dateStr.split('-')[2]}/{dateStr.split('-')[1]}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '1.5rem', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ display: 'inline-block', width: '12px', height: '12px', background: 'var(--primary)', borderRadius: '3px' }}></span>
                      Morning Yield
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ display: 'inline-block', width: '12px', height: '12px', background: 'var(--secondary)', borderRadius: '3px' }}></span>
                      Evening Yield
                    </div>
                  </div>
                </div>
              ) : (
                /* Manager Task Checklist on Dashboard */
                <div className="card col-span-8">
                  <div className="card-header">
                    <h3 className="card-title"><Calendar size={18} /> Today's Action Checklist</h3>
                    <span className="role-badge" style={{ background: 'var(--accent-glow)', color: 'var(--accent)', border: 'none' }}>
                      {pendingHealthTasks.length} pending
                    </span>
                  </div>
                  
                  {pendingHealthTasks.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>
                      🎉 No schedules or vaccines for today. Good job!
                    </p>
                  ) : (
                    <div>
                      {pendingHealthTasks.map(task => (
                        <div key={task.id} className="task-item">
                          <div>
                            <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>{task.title}</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                              Cattle: <strong>{task.cattleName} ({task.cattleTag})</strong>
                            </p>
                            {task.nextDueDate && (
                              <p style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: '600', marginTop: '0.25rem' }}>
                                Due Date: {task.nextDueDate}
                              </p>
                            )}
                          </div>
                          <button 
                            className="btn btn-secondary"
                            style={{ borderColor: 'var(--success)', color: 'var(--success)', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                            onClick={() => handleCompleteVaccine(task.id)}
                          >
                            <Check size={14} /> Mark Done
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sidebar Info/Audit panel */}
              <div className="card col-span-4">
                <div className="card-header">
                  <h3 className="card-title"><FileText size={18} /> Recent Field Updates</h3>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  Logs collected from manager {profiles.find(p => p.role === 'manager')?.fullName.split(' ')[0] || 'Raju'}'s mobile device:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {milkLogs.slice(0, 3).map(l => (
                    <div key={l.id} style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                      <span style={{ fontSize: '1.25rem' }}>🥛</span>
                      <div>
                        <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                          Milk logged by <strong>{l.recordedBy}</strong>
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          {l.cattleName ? `${l.cattleName}: ` : 'Bulk Session: '}{l.quantityLiters} Liters &bull; {l.logDate}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {transactions.slice(0, 2).map(t => (
                    <div key={t.id} style={{ display: 'flex', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.25rem' }}>💸</span>
                      <div>
                        <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                          {t.category} logged by <strong>{t.recordedBy}</strong>
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          ₹{t.amount} via {t.paymentMethod.toUpperCase()} &bull; {t.transactionDate}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Farm Settings Card (Owner Only) - Dairy SaaS Demonstration */}
              {activeProfile.role === 'owner' && (
                <div className="card col-span-4">
                  <div className="card-header">
                    <h3 className="card-title">⚙️ Farm Profile Settings</h3>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Configure the tenant farm details displayed in the app header and login screens.
                  </p>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const nameInput = (e.currentTarget.elements.namedItem('farm-name-edit') as HTMLInputElement).value;
                    const locInput = (e.currentTarget.elements.namedItem('farm-loc-edit') as HTMLInputElement).value;
                    const oName = (e.currentTarget.elements.namedItem('owner-name-edit') as HTMLInputElement).value;
                    const oPin = (e.currentTarget.elements.namedItem('owner-pin-edit') as HTMLInputElement).value;
                    const mName = (e.currentTarget.elements.namedItem('manager-name-edit') as HTMLInputElement).value;
                    const mPin = (e.currentTarget.elements.namedItem('manager-pin-edit') as HTMLInputElement).value;
                    
                    if (nameInput) {
                      db.updateFarm(nameInput, locInput);
                      db.updateProfiles(oName, oPin, mName, mPin);
                      refreshData();
                      alert('Farm Profile & Staff Credentials updated successfully!');
                    }
                  }}>
                    <div className="form-group" style={{ textAlign: 'left', background: 'var(--card-hover)', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', border: '1px solid var(--border)' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)' }}>Farm Access Code (Share with Staff)</label>
                      <code style={{ fontSize: '0.95rem', fontWeight: '700', display: 'block', marginTop: '0.2rem', wordBreak: 'break-all', color: 'var(--text)' }}>
                        {farm.id}
                      </code>
                    </div>

                    <div className="form-group" style={{ textAlign: 'left' }}>
                      <label style={{ fontSize: '0.75rem' }}>Farm Name</label>
                      <input 
                        id="farm-name-edit"
                        type="text" 
                        className="form-control" 
                        defaultValue={farm.name}
                        required
                        style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div className="form-group" style={{ textAlign: 'left', marginTop: '0.5rem' }}>
                      <label style={{ fontSize: '0.75rem' }}>Location</label>
                      <input 
                        id="farm-loc-edit"
                        type="text" 
                        className="form-control" 
                        defaultValue={farm.location || ''}
                        style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                      />
                    </div>
                    
                    <div style={{ borderTop: '1px dashed var(--border)', marginTop: '1rem', paddingTop: '1rem' }}>
                      <h4 style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.5rem' }}>Staff Directory (Farm Linked)</h4>
                      
                      <div className="form-group" style={{ textAlign: 'left' }}>
                        <label style={{ fontSize: '0.75rem' }}>Owner Full Name</label>
                        <input 
                          id="owner-name-edit"
                          type="text" 
                          className="form-control" 
                          defaultValue={profiles.find(p => p.role === 'owner')?.fullName || ''}
                          required
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                        />
                      </div>
                      
                      <div className="form-group" style={{ textAlign: 'left', marginTop: '0.5rem' }}>
                        <label style={{ fontSize: '0.75rem' }}>Owner Login PIN</label>
                        <input 
                          id="owner-pin-edit"
                          type="text" 
                          maxLength={4}
                          className="form-control" 
                          defaultValue={profiles.find(p => p.role === 'owner')?.securityPin || '0000'}
                          required
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', letterSpacing: '0.1em' }}
                        />
                      </div>
                      
                      <div className="form-group" style={{ textAlign: 'left', marginTop: '0.5rem' }}>
                        <label style={{ fontSize: '0.75rem' }}>Manager Name</label>
                        <input 
                          id="manager-name-edit"
                          type="text" 
                          className="form-control" 
                          defaultValue={profiles.find(p => p.role === 'manager')?.fullName || ''}
                          required
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                        />
                      </div>

                      <div className="form-group" style={{ textAlign: 'left', marginTop: '0.5rem' }}>
                        <label style={{ fontSize: '0.75rem' }}>Manager Login PIN</label>
                        <input 
                          id="manager-pin-edit"
                          type="text" 
                          maxLength={4}
                          className="form-control" 
                          defaultValue={profiles.find(p => p.role === 'manager')?.securityPin || '1111'}
                          required
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', letterSpacing: '0.1em' }}
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.5rem', fontSize: '0.8rem' }}>
                      Save Farm Profile
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ========================================================
            TAB: CATTLE INVENTORY
            ======================================================== */}
        {activeTab === 'cattle' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem' }}>Herd Inventory & Profiles</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Track breeds, pregnancy status, and feed preferences.</p>
            </div>

            {/* Search/Filter Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '1rem', flex: 1, maxWidth: '500px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search Tag or Cow Name..."
                    className="form-control"
                    style={{ paddingLeft: '2.5rem' }}
                    value={cattleSearch}
                    onChange={e => setCattleSearch(e.target.value)}
                  />
                </div>
                
                <select
                  className="form-control"
                  style={{ maxWidth: '160px' }}
                  value={cattleFilterStatus}
                  onChange={e => setCattleFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="milking">Milking</option>
                  <option value="dry">Dry</option>
                  <option value="pregnant">Pregnant</option>
                  <option value="heifer">Heifer</option>
                  <option value="calf">Calf</option>
                </select>
              </div>
              
              <button onClick={() => setShowAddCattleModal(true)} className="btn btn-primary">
                <Plus size={16} /> Profile New Cow
              </button>
            </div>

            {/* Cattle Cards */}
            {filteredCattle.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>No cattle profiles match filters.</p>
            ) : (
              <div className="cattle-grid">
                {filteredCattle.map(cow => (
                  <div key={cow.id} className="cattle-card">
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div className="cattle-avatar">🐄</div>
                        <span className={`status-badge ${cow.status}`}>{cow.status}</span>
                      </div>
                      
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{cow.name || 'Unnamed Cow'}</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                        Ear Tag: <strong style={{ color: 'var(--text)' }}>{cow.tagNumber}</strong>
                      </p>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', margin: '0.75rem 0', padding: '0.75rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Breed:</span>
                          <p style={{ fontWeight: '700', marginTop: '0.1rem' }}>{cow.breed}</p>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Cost Value:</span>
                          <p style={{ fontWeight: '700', marginTop: '0.1rem' }}>₹{cow.purchaseCost || '—'}</p>
                        </div>
                      </div>
                      
                      {cow.notes && (
                        <p style={{ fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                          &ldquo;{cow.notes}&rdquo;
                        </p>
                      )}

                      {/* Nitara Feed Curve Recommendation */}
                      <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'var(--primary-glow)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(46, 125, 50, 0.1)', fontSize: '0.75rem' }}>
                        <span style={{ fontWeight: '700', color: 'var(--primary)' }}>🌾 Nitara Feed Curve Tip:</span>
                        <p style={{ color: 'var(--text)', marginTop: '0.15rem', fontStyle: 'italic' }}>
                          {cow.status === 'milking' && "Peak milking ration: Suggest 5kg Sudarshan concentrate + 25kg green fodder + calcium."}
                          {cow.status === 'pregnant' && "Gestating ration: Add 1.5kg extra dry fodder + mineral mix."}
                          {cow.status === 'dry' && "Dry off ration: Maintenance feed only (2kg concentrate + silage)."}
                          {cow.status === 'heifer' && "Heifer grow-out: High-fiber balanced grower concentrate."}
                          {cow.status === 'calf' && "Growing calf: High-protein calf starter mix + creep feed."}
                          {cow.status === 'bull' && "Breeding bull: Maintenance grower concentrate + exercise fodder."}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }}
                        onClick={() => {
                          setCattleForm({
                            id: cow.id,
                            tagNumber: cow.tagNumber,
                            name: cow.name || '',
                            breed: cow.breed,
                            status: cow.status,
                            birthDate: cow.birthDate || '',
                            purchaseDate: cow.purchaseDate || '',
                            purchaseCost: cow.purchaseCost?.toString() || '',
                            notes: cow.notes || '',
                          });
                          setShowAddCattleModal(true);
                        }}
                      >
                        <Edit size={14} /> Edit
                      </button>
                      {(activeProfile.role === 'owner' || activeProfile.role === 'manager') && (
                        <button 
                          className="btn btn-danger" 
                          style={{ padding: '0.4rem 0.6rem' }}
                          onClick={() => {
                            if (confirm('Delete cow profile permanently?')) {
                              db.deleteCattle(cow.id);
                              refreshData();
                            }
                          }}
                        >
                          <Trash size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB: FINANCIALS CASH LEDGER
            ======================================================== */}
        {activeTab === 'financials' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem' }}>Cash Flow Ledger</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {activeProfile.role === 'owner' 
                  ? 'Audit farm financial entries, purchases, and milk revenues.' 
                  : 'Ledger of transactions you recorded.'}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
              <select
                className="form-control"
                style={{ maxWidth: '180px' }}
                value={txFilterCategory}
                onChange={e => setTxFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="Milk Sales">Milk Sales</option>
                <option value="Feed Purchase">Feed Purchase</option>
                <option value="Medicines">Medicines</option>
                <option value="Salaries">Salaries</option>
                <option value="Diesel">Diesel</option>
                <option value="Maintenance">Maintenance</option>
              </select>

              <button onClick={() => setShowAddTxModal(true)} className="btn btn-primary">
                <Plus size={16} /> Record Transaction
              </button>
            </div>

            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Notes / Info</th>
                    <th>Receipt File</th>
                    <th>Logged By</th>
                    <th>Amount</th>
                    {activeProfile.role === 'owner' && <th>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map(tx => (
                    <tr key={tx.id}>
                      <td>{tx.transactionDate}</td>
                      <td>
                        <span style={{ 
                          padding: '0.2rem 0.5rem', 
                          borderRadius: '4px', 
                          fontSize: '0.75rem', 
                          fontWeight: '700',
                          background: tx.type === 'income' ? 'var(--success-glow)' : 'var(--danger-glow)',
                          color: tx.type === 'income' ? 'var(--success)' : 'var(--danger)'
                        }}>
                          {tx.type.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ fontWeight: '700' }}>{tx.category}</td>
                      <td style={{ color: 'var(--text-muted)', maxWidth: '300px' }}>{tx.notes || '—'}</td>
                      <td>
                        {tx.receiptUrl ? (
                          <button 
                            className="role-badge" 
                            style={{ background: 'var(--primary-glow)', color: 'var(--primary)', cursor: 'pointer', border: 'none' }}
                            onClick={() => setReceiptPreviewUrl(tx.receiptUrl || null)}
                          >
                            Show Receipt 📄
                          </button>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No File</span>
                        )}
                      </td>
                      <td>{tx.recordedBy}</td>
                      <td style={{ 
                        fontWeight: '700', 
                        color: tx.type === 'income' ? 'var(--success)' : 'var(--danger)' 
                      }}>
                        {tx.type === 'income' ? '+' : '-'}₹{tx.amount}
                      </td>
                      {activeProfile.role === 'owner' && (
                        <td>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '0.25rem 0.5rem', borderColor: 'transparent' }}
                            onClick={() => {
                              db.deleteTransaction(tx.id);
                              refreshData();
                            }}
                          >
                            <Trash size={14} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB: VACCINATIONS & VET LOGS
            ======================================================== */}
        {activeTab === 'health' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem' }}>Vaccination & Veterinary Records</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Schedules, deworming calendars, and treatment records.</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem' }}>All Farm Treatment Schedules</h3>
              {(activeProfile.role === 'owner' || activeProfile.role === 'manager') && (
                <button onClick={() => setShowAddHealthModal(true)} className="btn btn-primary">
                  <Plus size={16} /> Schedule Treatment
                </button>
              )}
            </div>

            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Animal (Tag)</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Administered</th>
                    <th>Next Due</th>
                    <th>Vet Fee</th>
                    <th>Performed By</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {healthLogs.map(log => (
                    <tr key={log.id}>
                      <td style={{ fontWeight: '700' }}>{log.cattleName} ({log.cattleTag})</td>
                      <td>
                        <span className="role-badge" style={{ fontSize: '0.7rem' }}>
                          {log.treatmentType.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td style={{ fontWeight: '500' }}>{log.title}</td>
                      <td>{log.administeredDate || '—'}</td>
                      <td>
                        <span style={{ color: log.status === 'scheduled' ? 'var(--warning)' : 'var(--text-muted)', fontWeight: '600' }}>
                          {log.nextDueDate || '—'}
                        </span>
                      </td>
                      <td>₹{log.cost}</td>
                      <td>{log.performedBy || '—'}</td>
                      <td>
                        <span style={{ 
                          padding: '0.2rem 0.5rem', 
                          borderRadius: '4px', 
                          fontSize: '0.75rem', 
                          fontWeight: '700',
                          background: log.status === 'completed' ? 'var(--success-glow)' : 'var(--accent-glow)',
                          color: log.status === 'completed' ? 'var(--success)' : 'var(--accent)'
                        }}>
                          {log.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="bottom-nav">
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`bottom-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
        >
          <Layers size={20} />
          <span>Dashboard</span>
        </button>
        <button 
          onClick={() => setActiveTab('cattle')} 
          className={`bottom-nav-item ${activeTab === 'cattle' ? 'active' : ''}`}
        >
          <Activity size={20} />
          <span>Cattle</span>
        </button>
        <button 
          onClick={() => setActiveTab('financials')} 
          className={`bottom-nav-item ${activeTab === 'financials' ? 'active' : ''}`}
        >
          <DollarSign size={20} />
          <span>Ledger</span>
        </button>
        <button 
          onClick={() => setActiveTab('health')} 
          className={`bottom-nav-item ${activeTab === 'health' ? 'active' : ''}`}
        >
          <Calendar size={20} />
          <span>Vaccines</span>
        </button>
      </nav>

      {/* ========================================================
          MODAL: PROFILE NEW CATTLE
          ======================================================== */}
      {showAddCattleModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="btn btn-secondary" style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', padding: '0.25rem' }} onClick={() => setShowAddCattleModal(false)}>
              <X size={18} />
            </button>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>
              {cattleForm.id ? 'Edit Cattle Profile' : 'Profile Newly Purchased Cattle'}
            </h3>
            
            <form onSubmit={handleCattleSubmit}>
              <div className="form-group">
                <label>Ear Tag Number *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. IN-TG-105" 
                  required 
                  value={cattleForm.tagNumber}
                  onChange={e => setCattleForm(prev => ({ ...prev, tagNumber: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label>Cattle Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Ganga / Heifer-A"
                  value={cattleForm.name}
                  onChange={e => setCattleForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Breed</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Murrah Buffalo / HF Cross"
                    value={cattleForm.breed}
                    onChange={e => setCattleForm(prev => ({ ...prev, breed: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select 
                    className="form-control"
                    value={cattleForm.status}
                    onChange={e => setCattleForm(prev => ({ ...prev, status: e.target.value as Cattle['status'] }))}
                  >
                    <option value="milking">Milking</option>
                    <option value="dry">Dry</option>
                    <option value="pregnant">Pregnant</option>
                    <option value="heifer">Heifer</option>
                    <option value="calf">Calf</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Purchase Date</label>
                  <input 
                    type="date" 
                    className="form-control"
                    value={cattleForm.purchaseDate}
                    onChange={e => setCattleForm(prev => ({ ...prev, purchaseDate: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Purchase Cost (₹)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="e.g. 75000"
                    value={cattleForm.purchaseCost}
                    onChange={e => setCattleForm(prev => ({ ...prev, purchaseCost: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notes / Health Remarks</label>
                <textarea 
                  className="form-control" 
                  rows={2} 
                  placeholder="Feed schedules, feed preference, health history"
                  value={cattleForm.notes}
                  onChange={e => setCattleForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddCattleModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: LOG DAILY MILK YIELD
          ======================================================== */}
      {showLogMilkModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="btn btn-secondary" style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', padding: '0.25rem' }} onClick={() => setShowLogMilkModal(false)}>
              <X size={18} />
            </button>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Log Milk Yield</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Mode: <strong>{milkLogType === 'individual' ? 'Individual (Per Animal)' : 'Bulk (Herd Session)'}</strong>
            </p>

            <form onSubmit={handleMilkLogSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Date</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    required 
                    value={milkLogForm.logDate}
                    onChange={e => setMilkLogForm(prev => ({ ...prev, logDate: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Session</label>
                  <select 
                    className="form-control"
                    value={milkLogForm.session}
                    onChange={e => setMilkLogForm(prev => ({ ...prev, session: e.target.value as 'morning' | 'evening' }))}
                  >
                    <option value="morning">Morning (ఉదయం)</option>
                    <option value="evening">Evening (సాయంత్రం)</option>
                  </select>
                </div>
              </div>

              {milkLogType === 'individual' && (
                <div className="form-group">
                  <label>Select Animal (Tag)</label>
                  <select 
                    className="form-control" 
                    required 
                    value={milkLogForm.cattleId}
                    onChange={e => setMilkLogForm(prev => ({ ...prev, cattleId: e.target.value }))}
                  >
                    <option value="">-- Select Cattle --</option>
                    {cattle.filter(c => c.status === 'milking').map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name ? `${c.name} (${c.tagNumber})` : c.tagNumber}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Yield Quantity (Liters) *</label>
                <input 
                  type="number" 
                  step="0.1" 
                  className="form-control" 
                  placeholder="e.g. 10.5" 
                  required
                  value={milkLogForm.quantityLiters}
                  onChange={e => setMilkLogForm(prev => ({ ...prev, quantityLiters: e.target.value }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Fat % (Optional)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    className="form-control" 
                    placeholder="e.g. 7.2"
                    value={milkLogForm.fatPercentage}
                    onChange={e => setMilkLogForm(prev => ({ ...prev, fatPercentage: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>SNF % (Optional)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    className="form-control" 
                    placeholder="e.g. 9.0"
                    value={milkLogForm.snfPercentage}
                    onChange={e => setMilkLogForm(prev => ({ ...prev, snfPercentage: e.target.value }))}
                  />
                </div>
              </div>

              {/* Rate Chart Inputs (Configurable place by place) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px dashed var(--border)', paddingTop: '1rem', marginTop: '1rem' }}>
                <div className="form-group">
                  <label>Price per Fat % (₹)</label>
                  <input 
                    type="number" 
                    step="0.05" 
                    className="form-control" 
                    placeholder="e.g. 5.20" 
                    value={fatPriceInput}
                    onChange={e => setFatPriceInput(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Price per SNF % (₹)</label>
                  <input 
                    type="number" 
                    step="0.05" 
                    className="form-control" 
                    placeholder="e.g. 2.80" 
                    value={snfPriceInput}
                    onChange={e => setSnfPriceInput(e.target.value)}
                  />
                </div>
              </div>

              {/* Live Payout Calculator (DairyKhata Feature) */}
              {milkLogForm.quantityLiters && (
                <div style={{ background: 'var(--primary-glow)', border: '1px solid rgba(46, 125, 50, 0.2)', borderRadius: 'var(--radius-sm)', padding: '1rem', margin: '1rem 0', fontSize: '0.85rem' }}>
                  <p style={{ fontWeight: '700', color: 'var(--primary)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Estimated Payout Rate:</span>
                    <span>₹{calculateMilkRate(
                      milkLogForm.fatPercentage ? parseFloat(milkLogForm.fatPercentage) : undefined,
                      milkLogForm.snfPercentage ? parseFloat(milkLogForm.snfPercentage) : undefined
                    ).toFixed(2)} / L</span>
                  </p>
                  <p style={{ fontWeight: '800', fontSize: '1.05rem', marginTop: '0.4rem', color: 'var(--text)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Total Milk Value:</span>
                    <span>₹{Math.round(
                      parseFloat(milkLogForm.quantityLiters) * 
                      calculateMilkRate(
                        milkLogForm.fatPercentage ? parseFloat(milkLogForm.fatPercentage) : undefined,
                        milkLogForm.snfPercentage ? parseFloat(milkLogForm.snfPercentage) : undefined
                      )
                    )}</span>
                  </p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem', fontStyle: 'italic', lineHeight: '1.3' }}>
                    * Dodla Cooperative Payout Formula: (Fat% × ₹5.20) + (SNF% × ₹2.80) per Liter. Auto-records to cash ledger.
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowLogMilkModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Log Yield
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: RECORD TRANSACTION (FINANCIALS)
          ======================================================== */}
      {showAddTxModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="btn btn-secondary" style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', padding: '0.25rem' }} onClick={() => setShowAddTxModal(false)}>
              <X size={18} />
            </button>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Record Transaction</h3>

            <form onSubmit={handleTxSubmit}>
              <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', padding: '0.25rem', gap: '0.25rem', marginBottom: '1.25rem', border: '1px solid var(--border)' }}>
                <button 
                  type="button" 
                  className={`btn ${txForm.type === 'expense' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '0.4rem' }}
                  onClick={() => setTxForm(prev => ({ ...prev, type: 'expense', category: 'Feed Purchase' }))}
                >
                  Expense (ఖర్చు)
                </button>
                <button 
                  type="button" 
                  className={`btn ${txForm.type === 'income' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '0.4rem' }}
                  onClick={() => setTxForm(prev => ({ ...prev, type: 'income', category: 'Milk Sales' }))}
                >
                  Income (ఆదాయం)
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Date</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    required 
                    value={txForm.transactionDate}
                    onChange={e => setTxForm(prev => ({ ...prev, transactionDate: e.target.value }))}
                  />
                </div>
                
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    className="form-control"
                    value={txForm.category}
                    onChange={e => setTxForm(prev => ({ ...prev, category: e.target.value as Transaction['category'] }))}
                  >
                    {txForm.type === 'expense' ? (
                      <>
                        <option value="Feed Purchase">Feed Purchase (దానా)</option>
                        <option value="Medicines">Medicines (మందులు)</option>
                        <option value="Salaries">Salaries (జీతాలు)</option>
                        <option value="Diesel">Diesel (డీజిల్)</option>
                        <option value="Maintenance">Maintenance (నిర్వహణ)</option>
                        <option value="Cattle Purchase">Cattle Purchase</option>
                        <option value="Other">Other Expense</option>
                      </>
                    ) : (
                      <>
                        <option value="Milk Sales">Milk Sales (పాలు అమ్మకం)</option>
                        <option value="Manure Sales">Manure Sales (ఎరువులు)</option>
                        <option value="Cattle Sale">Cattle Sale</option>
                        <option value="Other">Other Income</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Amount (₹) *</label>
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="e.g. 500" 
                  required
                  value={txForm.amount}
                  onChange={e => setTxForm(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <select 
                  className="form-control"
                  value={txForm.paymentMethod}
                  onChange={e => setTxForm(prev => ({ ...prev, paymentMethod: e.target.value as Transaction['paymentMethod'] }))}
                >
                  <option value="upi">UPI (PhonePe/GPay)</option>
                  <option value="cash">Cash (నగదు)</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>

              <div className="form-group">
                <label>Upload Receipt/Bill Photo</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '1.5px dashed var(--border)', padding: '1rem', borderRadius: 'var(--radius-sm)', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
                  {txForm.receiptPhoto ? (
                    <div style={{ position: 'relative', width: '100%' }}>
                      <img src={txForm.receiptPhoto} alt="Receipt Preview" style={{ width: '100%', maxHeight: '100px', objectFit: 'contain' }} />
                      <button 
                        type="button" 
                        className="btn btn-danger" 
                        style={{ position: 'absolute', top: 0, right: 0, padding: '0.2rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setTxForm(prev => ({ ...prev, receiptPhoto: null }));
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Camera size={20} color="var(--text-muted)" />
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tap to snap receipt photo</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment" 
                        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0, cursor: 'pointer' }}
                        onChange={handleReceiptChange}
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Description / Notes</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Sudarshan buffalo feeds, 5 bags"
                  value={txForm.notes}
                  onChange={e => setTxForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddTxModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: SCHEDULE TREATMENT (VACCINE/AI)
          ======================================================== */}
      {showAddHealthModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="btn btn-secondary" style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', padding: '0.25rem' }} onClick={() => setShowAddHealthModal(false)}>
              <X size={18} />
            </button>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Schedule/Record Treatment</h3>

            <form onSubmit={handleHealthSubmit}>
              <div className="form-group">
                <label>Select Animal *</label>
                <select 
                  className="form-control" 
                  required 
                  value={healthForm.cattleId}
                  onChange={e => setHealthForm(prev => ({ ...prev, cattleId: e.target.value }))}
                >
                  <option value="">-- Select Cattle --</option>
                  {cattle.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name ? `${c.name} (${c.tagNumber})` : c.tagNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Type</label>
                  <select 
                    className="form-control"
                    value={healthForm.treatmentType}
                    onChange={e => setHealthForm(prev => ({ ...prev, treatmentType: e.target.value as HealthLog['treatmentType'] }))}
                  >
                    <option value="vaccination">Vaccination (టీకా)</option>
                    <option value="deworming">Deworming (నట్టల నివారణ)</option>
                    <option value="artificial_insemination">AI Breeding</option>
                    <option value="medical_treatment">Vet Medical Treatment</option>
                    <option value="routine_check">Routine Checkup</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Treatment Name *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. FMD Vaccine / Albendazole" 
                    required
                    value={healthForm.title}
                    onChange={e => setHealthForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Administered Date (Completed)</label>
                  <input 
                    type="date" 
                    className="form-control"
                    value={healthForm.administeredDate}
                    onChange={e => setHealthForm(prev => ({ ...prev, administeredDate: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Next Due Date (Schedule)</label>
                  <input 
                    type="date" 
                    className="form-control"
                    value={healthForm.nextDueDate}
                    onChange={e => setHealthForm(prev => ({ ...prev, nextDueDate: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Veterinary Cost (₹)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="e.g. 500"
                    value={healthForm.cost}
                    onChange={e => setHealthForm(prev => ({ ...prev, cost: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Performed By</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Dr. Rao"
                    value={healthForm.performedBy}
                    onChange={e => setHealthForm(prev => ({ ...prev, performedBy: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Treatment/Vet Notes</label>
                <textarea 
                  className="form-control" 
                  rows={2} 
                  placeholder="Notes about dosage, reaction, etc."
                  value={healthForm.notes}
                  onChange={e => setHealthForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddHealthModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: SHOW RECEIPT PHOTO PREVIEW
          ======================================================== */}
      {receiptPreviewUrl && (
        <div className="modal-overlay" onClick={() => setReceiptPreviewUrl(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', textAlign: 'center' }}>
            <button className="btn btn-secondary" style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', padding: '0.25rem' }} onClick={() => setReceiptPreviewUrl(null)}>
              <X size={18} />
            </button>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Receipt File Preview</h3>
            <img src={receiptPreviewUrl} alt="Receipt Payout Document" style={{ width: '100%', maxHeight: '450px', objectFit: 'contain', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
            <button className="btn btn-primary" style={{ marginTop: '1.5rem', width: '120px' }} onClick={() => setReceiptPreviewUrl(null)}>
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
