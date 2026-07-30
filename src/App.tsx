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
  LogOut,
  Droplet,
  Stethoscope
} from 'lucide-react';
import { db } from './utils/supabaseClient';
import type { Farm, Profile, Cattle, MilkLog, HealthLog, Transaction, BreedingLog, InventoryItem } from './types';
import { useTranslation } from "react-i18next";
import i18n from './i18n';
import { injectDemoData } from './utils/demoData';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const SECRET_QUESTIONS = [
  "What is your mother's maiden name?",
  "What was the name of your first pet?",
  "What is your favorite cow's name?",
  "In what city or town was your first job?",
  "What was the make and model of your first tractor?"
];

function App() {
    const { t } = useTranslation();
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

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
    recoveryQuestionIndex: '0',
    recoveryAnswer: '',
  });

  // Active Farm Code ID (SaaS Multi-Tenancy Gateway)
  const [activeFarmId, setActiveFarmId] = useState<string | null>(localStorage.getItem('ourdairy_active_farm_id'));
  const [farmFinderSearch, setFarmFinderSearch] = useState('');
  const [farmFinderResults, setFarmFinderResults] = useState<{id: string, name: string, location: string, ownerName: string}[]>([]);
  
  // Owner PIN Recovery States
  const [showOwnerPinReset, setShowOwnerPinReset] = useState(false);
  const [resetOwnerCodeInput, setResetOwnerCodeInput] = useState('');
  const [resetOwnerPhoneInput, setResetOwnerPhoneInput] = useState('');
  const [resetOwnerNewPinInput, setResetOwnerNewPinInput] = useState('');
  const [resetOwnerError, setResetOwnerError] = useState('');
  const [resetOwnerStep, setResetOwnerStep] = useState(1); // 1 = Code & Phone, 2 = Answer & New PIN
  const [resetOwnerQuestionText, setResetOwnerQuestionText] = useState('');
  const [resetOwnerAnswerInput, setResetOwnerAnswerInput] = useState('');
  const [resetOwnerSecretMatch, setResetOwnerSecretMatch] = useState(''); // Holds the exact answer value to match

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
  const [breedingLogs, setBreedingLogs] = useState<BreedingLog[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

  // Navigation tab state (consistent for both Owner and Manager)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cattle' | 'milk' | 'financials' | 'health'>('dashboard');
  const [cattleSubTab, setCattleSubTab] = useState<'herd' | 'feed'>('herd');

  // Search/Filters
  const [cattleSearch, setCattleSearch] = useState('');
  const [cattleFilterStatus, setCattleFilterStatus] = useState<string>('all');
  
  // Analytics
  const [selectedCowProfileId, setSelectedCowProfileId] = useState<string | null>(null);
  const [txFilterCategory, setTxFilterCategory] = useState<string>('all');

  // Modals visibility
  const [showAddCattleModal, setShowAddCattleModal] = useState(false);
  const [showLogMilkModal, setShowLogMilkModal] = useState(false);
  const [milkLogType, setMilkLogType] = useState<'individual' | 'bulk'>('individual');
  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [showAddHealthModal, setShowAddHealthModal] = useState(false);
  const [showAddInventoryModal, setShowAddInventoryModal] = useState(false);
  const [showConsumeInventoryModal, setShowConsumeInventoryModal] = useState(false);
  const [showAddBreedingModal, setShowAddBreedingModal] = useState(false);
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

  const [inventoryForm, setInventoryForm] = useState({
    id: '',
    category: 'concentrate' as InventoryItem['category'],
    name: '',
    quantity: '',
    unit: 'kg' as InventoryItem['unit'],
    lowStockThreshold: '50',
  });

  const [consumeInventoryForm, setConsumeInventoryForm] = useState({
    itemId: '',
    quantity: '',
  });

  const [breedingForm, setBreedingForm] = useState({
    cattleId: '',
    eventType: 'heat' as BreedingLog['eventType'],
    eventDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Sync state from database (Multi-Tenant Sandboxed)
  const refreshData = async (overrideFarmId?: string | null) => {
    try {
      const targetFarmId = overrideFarmId !== undefined ? overrideFarmId : activeFarmId;
      if (!targetFarmId) {
        setFarm({ id: '', name: 'Select Farm', location: '', createdAt: '' });
        return;
      }
      
      const f = await db.getFarmById(targetFarmId);
      if (!f) {
        // Active farm ID not found, clear settings
        setActiveFarmId(null);
        localStorage.removeItem('ourdairy_active_farm_id');
        return;
      }
      setFarm(f);

      const [c, m, h, t, p, active, bl, inv] = await Promise.all([
        db.getCattle(),
        db.getMilkLogs(),
        db.getHealthLogs(),
        db.getTransactions(),
        db.getProfiles(),
        db.getActiveProfile(),
        db.getBreedingLogs(),
        db.getInventoryItems()
      ]);
      setCattle(c);
      setMilkLogs(m);
      setHealthLogs(h);
      setTransactions(t);
      setProfiles(p);
      setBreedingLogs(bl);
      setInventoryItems(inv);
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

  const handleExitFarmPortal = () => {
    localStorage.removeItem('ourdairy_active_farm_id');
    setActiveFarmId(null);
    setPinInput('');
    setLoginError('');
  };

  const handleResetOwnerPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetOwnerError('');

    if (resetOwnerStep === 1) {
      if (!resetOwnerCodeInput.trim() || !resetOwnerPhoneInput.trim()) return;
      const code = resetOwnerCodeInput.trim();
      const phone = resetOwnerPhoneInput.trim();

      if (code !== activeFarmId) {
        setResetOwnerError('Incorrect Farm Access Code.');
        return;
      }

      const ownerProfile = profiles.find(p => p.role === 'owner');
      if (!ownerProfile) {
        setResetOwnerError('Owner profile not found.');
        return;
      }

      // Check if packed phone matches
      const [rawPhone, questionIdx, secretAnswer] = ownerProfile.phoneNumber.split('|');
      const normalizedRegistered = (rawPhone || ownerProfile.phoneNumber).replace(/\s+/g, '');
      const normalizedEntered = phone.replace(/\s+/g, '');

      if (normalizedRegistered !== normalizedEntered) {
        setResetOwnerError('Incorrect registered Owner Phone Number.');
        return;
      }

      if (secretAnswer && questionIdx !== undefined) {
        // Move to step 2: answer the secret question
        setResetOwnerQuestionText(SECRET_QUESTIONS[parseInt(questionIdx)] || 'Secret Recovery Question');
        setResetOwnerSecretMatch(secretAnswer);
        setResetOwnerStep(2);
      } else {
        // Fallback for older profiles without secret questions
        setResetOwnerStep(3); // Direct PIN input step
      }
    } else if (resetOwnerStep === 2) {
      if (!resetOwnerAnswerInput.trim()) return;
      
      const enteredAnswer = resetOwnerAnswerInput.trim().toLowerCase();
      if (enteredAnswer !== resetOwnerSecretMatch) {
        setResetOwnerError('Incorrect answer to your secret question.');
        return;
      }
      
      // Correct! Proceed to set PIN
      setResetOwnerStep(3);
    } else if (resetOwnerStep === 3) {
      if (!resetOwnerNewPinInput.trim()) return;
      const pin = resetOwnerNewPinInput.trim();

      if (pin.length !== 4 || !/^\d+$/.test(pin)) {
        setResetOwnerError('Security PIN must be exactly 4 digits.');
        return;
      }

      await db.resetOwnerPin(activeFarmId || '', pin);
      alert(t('owner_pin_reset_succ'));
      
      // Clear state
      setResetOwnerCodeInput('');
      setResetOwnerPhoneInput('');
      setResetOwnerNewPinInput('');
      setResetOwnerAnswerInput('');
      setResetOwnerQuestionText('');
      setResetOwnerSecretMatch('');
      setResetOwnerError('');
      setResetOwnerStep(1);
      setShowOwnerPinReset(false);
      
      await refreshData();
    }
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
    if (!registerForm.farmName || !registerForm.ownerName || !registerForm.managerName || !registerForm.ownerPhone || !registerForm.recoveryAnswer) return;

    // Pack: Phone|QuestionIndex|NormalizedAnswer (Allows recovery without DB schema migrations)
    const packedPhone = `${registerForm.ownerPhone.trim()}|${registerForm.recoveryQuestionIndex}|${registerForm.recoveryAnswer.trim().toLowerCase()}`;

    const result = await db.createFarm(
      registerForm.farmName,
      registerForm.location,
      registerForm.ownerName,
      packedPhone,
      registerForm.managerName
    );

    localStorage.setItem('ourdairy_active_farm_id', result.farm.id);
    setActiveFarmId(result.farm.id);
    setFarm(result.farm);
    setActiveProfile(result.profiles[0]); // Logs in as new Owner
    setIsLoggedIn(true);
    setShowRegisterFarm(false);
    setRegisterForm({ ownerName: '', farmName: '', location: '', managerName: '', ownerPhone: '', recoveryQuestionIndex: '0', recoveryAnswer: '' });
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
  const handleInventorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.saveInventoryItem({
      category: inventoryForm.category,
      name: inventoryForm.name,
      quantity: parseFloat(inventoryForm.quantity),
      unit: inventoryForm.unit,
      lowStockThreshold: parseFloat(inventoryForm.lowStockThreshold)
    }, inventoryForm.id ? inventoryForm.id : undefined);
    
    // Optionally create an expense transaction here if the user wanted, but keeping simple for now.
    
    setShowAddInventoryModal(false);
    await refreshData();
  };

  const handleConsumeInventorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const item = inventoryItems.find(i => i.id === consumeInventoryForm.itemId);
    if (!item) return;

    const consumedAmount = parseFloat(consumeInventoryForm.quantity);
    if (consumedAmount > item.quantity) {
      alert(t('cannot_consume_more_'));
      return;
    }

    await db.saveInventoryItem({
      category: item.category,
      name: item.name,
      quantity: item.quantity - consumedAmount,
      unit: item.unit,
      lowStockThreshold: item.lowStockThreshold
    }, item.id);

    setShowConsumeInventoryModal(false);
    await refreshData();
  };


  const handleBreedingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.saveBreedingLog({
      cattleId: breedingForm.cattleId,
      eventType: breedingForm.eventType,
      eventDate: breedingForm.eventDate,
      notes: breedingForm.notes,
      recordedBy: activeProfile.id
    });
    setShowAddBreedingModal(false);
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
        <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }}>
          <select 
            className="form-control" 
            style={{ width: 'auto', display: 'inline-block', backgroundColor: 'var(--bg-card)', padding: '0.5rem' }}
            value={i18n.language}
            onChange={(e) => {
              i18n.changeLanguage(e.target.value);
              localStorage.setItem('dairy_app_language', e.target.value);
            }}
          >
            <option value="en">English</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="te">తెలుగు (Telugu)</option>
            <option value="mr">मराठी (Marathi)</option>
            <option value="ta">தமிழ் (Tamil)</option>
            <option value="kn">ಕನ್ನಡ (Kannada)</option>
          </select>
        </div>
        <div className="login-card">
          <div className="login-logo">{t('key')}</div>
          
          {showRegisterFarm ? (
            <div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '0.25rem', fontFamily: 'var(--font-title)' }}>{t('register_saas_farm')}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>{t('create_a_new_isolate')}</p>

              <form onSubmit={handleRegisterFarmSubmit} style={{ textAlign: 'left' }}>
                <div className="form-group">
                  <label>{t('owner_name_')}</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    placeholder={t('eg_john_doe')}
                    value={registerForm.ownerName}
                    onChange={e => setRegisterForm(prev => ({ ...prev, ownerName: e.target.value }))}
                    autoComplete="off"
                  />
                </div>

                <div className="form-group">
                  <label>{t('owner_phone_number_f')}</label>
                  <input 
                    type="tel" 
                    className="form-control" 
                    required 
                    placeholder={t('eg_61_412_345_678')}
                    value={registerForm.ownerPhone}
                    onChange={e => setRegisterForm(prev => ({ ...prev, ownerPhone: e.target.value }))}
                    autoComplete="off"
                  />
                </div>

                <div className="form-group">
                  <label>{t('manager_name_')}</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    placeholder={t('eg_jane_smith')}
                    value={registerForm.managerName}
                    onChange={e => setRegisterForm(prev => ({ ...prev, managerName: e.target.value }))}
                    autoComplete="off"
                  />
                </div>

                <div className="form-group">
                  <label>{t('farm_name_')}</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    placeholder={t('eg_sri_krishna_ghee_')}
                    value={registerForm.farmName}
                    onChange={e => setRegisterForm(prev => ({ ...prev, farmName: e.target.value }))}
                    autoComplete="off"
                  />
                </div>

                <div className="form-group">
                  <label>{t('location_mandivillag')}</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder={t('eg_khammam_rural_tel')}
                    value={registerForm.location}
                    onChange={e => setRegisterForm(prev => ({ ...prev, location: e.target.value }))}
                    autoComplete="off"
                  />
                </div>

                <div className="form-group" style={{ marginTop: '0.5rem' }}>
                  <label>{t('secret_recovery_ques')}</label>
                  <select 
                    className="form-control" 
                    required
                    value={registerForm.recoveryQuestionIndex}
                    onChange={e => setRegisterForm(prev => ({ ...prev, recoveryQuestionIndex: e.target.value }))}
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                  >
                    {SECRET_QUESTIONS.map((q, idx) => (
                      <option key={idx} value={idx}>{q}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginTop: '0.5rem' }}>
                  <label>{t('secret_answer_')}</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    placeholder={t('eg_ganga')}
                    value={registerForm.recoveryAnswer}
                    onChange={e => setRegisterForm(prev => ({ ...prev, recoveryAnswer: e.target.value }))}
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
                    {t('back_to_log_in')}</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    {t('register_enter')}</button>
                </div>
              </form>
            </div>
          ) : !activeFarmId ? (
              <div>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '0.25rem', fontFamily: 'var(--font-title)' }}>{t('ourdairy_')}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>{t('search_by_farm_name_')}</p>

                <div style={{ textAlign: 'left' }}>
                  <div className="form-group">
                    <label htmlFor="farm-finder-input">{t('search_farm_owner_')}</label>
                    <input 
                      id="farm-finder-input"
                      type="text" 
                      className="form-control" 
                      placeholder={t('eg_raade_or_rakesh')}
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
                        onClick={async () => {
                          localStorage.setItem('ourdairy_active_farm_id', r.id);
                          setActiveFarmId(r.id);
                          setFarmFinderSearch('');
                          setFarmFinderResults([]);
                          await refreshData(r.id);
                        }}
                      >
                        <p style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text)' }}>{t('key_1')}{r.name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('owner')}{r.ownerName} {t('bull')}{r.location}</p>
                        <code style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.25rem', display: 'block' }}>{t('code')}{r.id}</code>
                      </div>
                    ))}
                    {farmFinderSearch.trim().length >= 2 && farmFinderResults.length === 0 && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>{t('no_farms_found_match')}{farmFinderSearch}{t('key_2')}</p>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                    <button 
                      type="button"
                      onClick={() => setShowRegisterFarm(true)}
                      className="btn btn-secondary" 
                      style={{ flex: 1, padding: '0.8rem', fontSize: '0.9rem' }}
                    >
                      {t('_register_new_farm')}</button>
                  </div>
                </div>
              </div>

          ) : showOwnerPinReset ? (
            <div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '0.25rem', fontFamily: 'var(--font-title)' }}>{t('reset_owner_pin_')}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>{t('verify_your_details_')}</p>

              <form onSubmit={handleResetOwnerPinSubmit} style={{ textAlign: 'left' }}>
                {resetOwnerStep === 1 && (
                  <>
                    <div className="form-group">
                      <label htmlFor="reset-code-input">{t('farm_access_code_')}</label>
                      <input 
                        id="reset-code-input"
                        type="text" 
                        className="form-control" 
                        required 
                        placeholder={t('eg_farm17852992')}
                        value={resetOwnerCodeInput}
                        onChange={e => setResetOwnerCodeInput(e.target.value)}
                        autoComplete="off"
                      />
                    </div>

                    <div className="form-group" style={{ marginTop: '0.5rem' }}>
                      <label htmlFor="reset-phone-input">{t('owner_registered_pho')}</label>
                      <input 
                        id="reset-phone-input"
                        type="tel" 
                        className="form-control" 
                        required 
                        placeholder={t('eg_61_412_345_678')}
                        value={resetOwnerPhoneInput}
                        onChange={e => setResetOwnerPhoneInput(e.target.value)}
                        autoComplete="off"
                      />
                    </div>
                  </>
                )}

                {resetOwnerStep === 2 && (
                  <>
                    <div style={{ background: 'var(--card-hover)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                      <strong>{t('recovery_question')}</strong><br />
                      <span style={{ color: 'var(--text-muted)' }}>{resetOwnerQuestionText}</span>
                    </div>

                    <div className="form-group">
                      <label htmlFor="reset-answer-input">{t('secret_answer_')}</label>
                      <input 
                        id="reset-answer-input"
                        type="text" 
                        className="form-control" 
                        required 
                        placeholder={t('eg_ganga')}
                        value={resetOwnerAnswerInput}
                        onChange={e => setResetOwnerAnswerInput(e.target.value)}
                        autoComplete="off"
                      />
                    </div>
                  </>
                )}

                {resetOwnerStep === 3 && (
                  <div className="form-group">
                    <label htmlFor="reset-pin-input">{t('new_4digit_owner_pin')}</label>
                    <input 
                      id="reset-pin-input"
                      type="password" 
                      maxLength={4}
                      className="form-control" 
                      required 
                      placeholder={t('key_45')}
                      style={{ letterSpacing: '0.5em', fontSize: '1.1rem' }}
                      value={resetOwnerNewPinInput}
                      onChange={e => setResetOwnerNewPinInput(e.target.value)}
                    />
                  </div>
                )}

                {resetOwnerError && (
                  <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                    {t('key_3')}{resetOwnerError}
                  </p>
                )}

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '0.8rem' }}>
                  {resetOwnerStep === 1 ? 'Verify Phone & Proceed' : resetOwnerStep === 2 ? 'Verify Answer & Proceed' : 'Set New Owner PIN'}
                </button>
                
                <div style={{ marginTop: '0.75rem' }}>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowOwnerPinReset(false);
                      setResetOwnerCodeInput('');
                      setResetOwnerPhoneInput('');
                      setResetOwnerNewPinInput('');
                      setResetOwnerAnswerInput('');
                      setResetOwnerQuestionText('');
                      setResetOwnerSecretMatch('');
                      setResetOwnerError('');
                      setResetOwnerStep(1);
                    }}
                    className="btn btn-secondary" 
                    style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem' }}
                  >
                    {t('back_to_log_in')}</button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '0.25rem', fontFamily: 'var(--font-title)' }}>{t('ourdairy_')}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('secure_portal_for')}<strong>{farm.name}</strong></p>

              <form onSubmit={handleLogin} style={{ marginTop: '2rem' }}>
                <div className="form-group" style={{ textAlign: 'left' }}>
                  <label>{t('select_role')}</label>
                  <div className="role-selector-grid">
                    <div 
                      className={`role-select-card ${loginRole === 'owner' ? 'active' : ''}`}
                      onClick={() => { setLoginRole('owner'); setLoginError(''); }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>{t('key_4')}</span>
                      <h4 style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                        {profiles.find(p => p.role === 'owner')?.fullName || 'Owner'}
                      </h4>
                    </div>
                    <div 
                      className={`role-select-card ${loginRole === 'manager' ? 'active' : ''}`}
                      onClick={() => { setLoginRole('manager'); setLoginError(''); }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>{t('key_5')}</span>
                      <h4 style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                        {profiles.find(p => p.role === 'manager')?.fullName || 'Manager'}
                      </h4>
                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label htmlFor="pin-input" style={{ marginBottom: 0 }}>{t('enter_security_pin')}</label>
                    {loginRole === 'owner' && (
                      <span 
                        onClick={() => {
                          setShowOwnerPinReset(true);
                          setResetOwnerCodeInput(activeFarmId || '');
                        }} 
                        style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer', fontWeight: '600' }}
                      >
                        {t('forgot_pin')}</span>
                    )}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                    <input 
                      id="pin-input"
                      type="password" 
                      className="form-control" 
                      placeholder={t('key_46')}
                      maxLength={4}
                      required
                      style={{ paddingLeft: '2.5rem', letterSpacing: '0.5em', fontSize: '1.1rem' }}
                      value={pinInput}
                      onChange={e => setPinInput(e.target.value)}
                    />
                  </div>
                  {loginError && (
                    <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.5rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                      {t('key_6')}{loginError}
                    </p>
                  )}
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.25rem', padding: '0.8rem' }}>
                  {t('sign_in')}</button>
                
                <div style={{ marginTop: '0.75rem' }}>
                  <button 
                    type="button"
                    onClick={handleExitFarmPortal}
                    className="btn btn-secondary" 
                    style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem' }}
                  >
                    {t('_switch_farm')}</button>
                </div>
                
                <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                  <button 
                    type="button"
                    onClick={() => {
                      injectDemoData();
                      window.location.reload();
                    }}
                    className="btn" 
                    style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem', background: 'var(--primary-glow)', color: 'var(--primary)', border: '1px solid rgba(46, 125, 50, 0.2)' }}
                  >
                    🚀 Play Store Review / Demo Login
                  </button>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Click this to instantly load a fully populated test farm.</p>
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
          <div className="logo-icon">{t('key')}</div>
          <div>
            <h1 className="logo-text">{t('ourdairy')}</h1>
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem' }}>
              <span className="role-badge" style={{ background: 'var(--primary-glow)', color: 'var(--primary)', border: '1px solid rgba(46, 125, 50, 0.2)', fontSize: '0.7rem' }}>
                {t('key_7')}{farm.name}
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
              {t('dashboard')}</button>
            <button 
              onClick={() => setActiveTab('cattle')} 
              className={`role-btn ${activeTab === 'cattle' ? 'active' : ''}`}
            >
              {t('cattle_')}{cattle.length}{t('key_8')}</button>
            <button 
              onClick={() => setActiveTab('milk')} 
              className={`role-btn ${activeTab === 'milk' ? 'active' : ''}`}
            >
              {t('milk_logs')}</button>
            <button 
              onClick={() => setActiveTab('financials')} 
              className={`role-btn ${activeTab === 'financials' ? 'active' : ''}`}
            >
              {t('cash_ledger')}</button>
            <button 
              onClick={() => setActiveTab('health')} 
              className={`role-btn ${activeTab === 'health' ? 'active' : ''}`}
            >
              {t('vaccines_')}{pendingHealthTasks.length}{t('key_9')}</button>
          </div>

          {/* User profile identifier */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.25rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>
              {activeProfile.role === 'owner' ? '👤' : '🧑'} {activeProfile.fullName.split(' ')[0]}
            </span>
          </div>

          {/* Language toggle */}
          <select 
            className="form-control" 
            style={{ width: 'auto', padding: '0.2rem 0.5rem', borderRadius: '50px', fontSize: '0.8rem', backgroundColor: 'var(--bg-card)', height: '38px' }}
            value={i18n.language}
            onChange={(e) => {
              i18n.changeLanguage(e.target.value);
              localStorage.setItem('dairy_app_language', e.target.value);
            }}
          >
            <option value="en">EN</option>
            <option value="hi">HI</option>
            <option value="te">TE</option>
            <option value="mr">MR</option>
            <option value="ta">TA</option>
            <option value="kn">KN</option>
          </select>

          {/* Light/Dark Mode toggle */}
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="btn btn-secondary" 
            style={{ borderRadius: '50px', padding: '0.5rem', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="btn btn-secondary" 
            style={{ padding: '0.5rem', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={t('sign_out')}
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
                <h2 style={{ fontSize: '1.8rem', color: 'var(--text)' }}>{getGreeting()}{t('key_10')}{activeProfile.fullName.split(' ')[0]}{t('_')}</h2>
                <p style={{ color: 'var(--text-muted)' }}>{t('a_companion_to_track')}</p>
              </div>
            ) : (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem', color: 'var(--text)' }}>{t('owner_dashboard')}</h2>
                <p style={{ color: 'var(--text-muted)' }}>{t('overview_of')}{farm.name} {t('operations_net_margi')}</p>
              </div>
            )}

            {/* Quick Action Panels for Manager */}
            {activeProfile.role === 'manager' && (
              <section className="manager-actions">
                <div className="action-card" onClick={() => { setMilkLogType('individual'); setShowLogMilkModal(true); }}>
                  <div className="action-icon">{t('key')}</div>
                  <h4 style={{ fontWeight: '700' }}>{t('individual_milk')}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('log_by_ear_tag')}</p>
                </div>
                <div className="action-card" onClick={() => { setMilkLogType('bulk'); setShowLogMilkModal(true); }}>
                  <div className="action-icon">{t('key_11')}</div>
                  <h4 style={{ fontWeight: '700' }}>{t('bulk_milk_yield')}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('log_herd_session')}</p>
                </div>
                <div className="action-card" onClick={() => setShowAddTxModal(true)}>
                  <div className="action-icon">{t('key_12')}</div>
                  <h4 style={{ fontWeight: '700' }}>{t('log_expense')}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('feed_medicine_bills')}</p>
                </div>
                <div className="action-card" onClick={() => setShowAddCattleModal(true)}>
                  <div className="action-icon">{t('key_13')}</div>
                  <h4 style={{ fontWeight: '700' }}>{t('add_cattle')}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('profile_new_cow')}</p>
                </div>
              </section>
            )}

            {/* Nitara Health & Sickness Alerts (only visible if yields drop significantly) */}
            {activeProfile.role === 'owner' && yieldAlerts.length > 0 && (
              <div className="card" style={{ borderLeft: '5px solid var(--danger)', marginBottom: '1.5rem', background: 'rgba(239, 68, 68, 0.04)', borderColor: 'var(--danger)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{t('key_14')}</span>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--danger)', fontWeight: '700' }}>{t('nitara_precision_sic')}</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {yieldAlerts.map(alert => (
                    <p key={alert.cowId} style={{ fontSize: '0.85rem', color: 'var(--text)' }}>
                      {t('cattle')}<strong>{alert.name} {t('key_15')}{alert.tag}{t('key_16')}</strong> {t('yield_dropped_to')}<strong style={{ color: 'var(--danger)' }}>{alert.latest}{t('l')}</strong> {t('average')}{alert.average}{t('l_this_represents_a')}<strong style={{ color: 'var(--danger)' }}>{alert.drop}{t('_drop')}</strong>{t('_recommend_checking_')}</p>
                  ))}
                </div>
              </div>
            )}

            {/* STATS WIDGETS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              {activeProfile.role === 'owner' && (
                <div className="card">
                  <div className="card-header">
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700' }}>{t('net_margin')}</span>
                    <DollarSign size={20} color="var(--primary)" />
                  </div>
                  <div className="stat-value" style={{ color: netCashFlow >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {netCashFlow >= 0 ? '₹' : '-₹'}{Math.abs(netCashFlow)}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    {t('income')}<span style={{ color: 'var(--success)', fontWeight: '600' }}>{t('key_17')}{totalIncome}</span> {t('_bills')}<span style={{ color: 'var(--danger)', fontWeight: '600' }}>{t('key_18')}{totalExpense}</span>
                  </p>
                </div>
              )}

              <div className="card">
                <div className="card-header">
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700' }}>{t('avg_daily_yield')}</span>
                  <TrendingUp size={20} color="var(--primary)" />
                </div>
                <div className="stat-value">
                  {averageDailyYield} <span className="stat-unit">{t('liters')}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  {t('from')}{totalMilkingCattle} {t('active_milking_cattl')}</p>
              </div>

              <div className="card">
                <div className="card-header">
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700' }}>{t('herd_size')}</span>
                  <Activity size={20} color="var(--secondary)" />
                </div>
                <div className="stat-value">
                  {cattle.length} <span className="stat-unit">{t('heads')}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  {cattle.filter(c => c.status === 'pregnant').length} {t('pregnant_bull')}{cattle.filter(c => c.status === 'dry').length} {t('dry')}</p>
              </div>

              <div className="card">
                <div className="card-header">
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700' }}>{t('vaccines_due')}</span>
                  <Calendar size={20} color="var(--accent)" />
                </div>
                <div className="stat-value" style={{ color: 'var(--accent)' }}>
                  {pendingHealthTasks.length} <span className="stat-unit">{t('alerts')}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  {t('check_vaccine_checkl')}</p>
              </div>
            </div>

            {/* DASHBOARD GRIDS */}
            <div className="dashboard-grid">
              
              {/* SVG Charts section */}
              {activeProfile.role === 'owner' ? (
                <div className="card col-span-8">
                  <div className="card-header">
                    <h3 className="card-title"><TrendingUp size={18} /> {t('milk_production_tren')}</h3>
                  </div>
                  <div className="chart-container">
                    <svg width="100%" height="100%" viewBox="0 0 600 220" preserveAspectRatio="none">
                      {/* Grid lines */}
                      <line x1="50" y1="30" x2="560" y2="30" className="chart-grid-line" />
                      <line x1="50" y1="80" x2="560" y2="80" className="chart-grid-line" />
                      <line x1="50" y1="130" x2="560" y2="130" className="chart-grid-line" />
                      <line x1="50" y1="180" x2="560" y2="180" stroke="var(--border)" strokeWidth="1.5" />

                      {/* Y-axis labels */}
                      <text x="10" y="34" className="chart-axis-text" style={{ textAnchor: 'start' }}>{t('40_l')}</text>
                      <text x="10" y="84" className="chart-axis-text" style={{ textAnchor: 'start' }}>{t('20_l')}</text>
                      <text x="10" y="134" className="chart-axis-text" style={{ textAnchor: 'start' }}>{t('10_l')}</text>
                      <text x="10" y="184" className="chart-axis-text" style={{ textAnchor: 'start' }}>{t('0_l')}</text>

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
                              {totalLit.toFixed(1)}{t('l')}</text>
                            {/* X-axis date labels */}
                            <text 
                              x={xPos + 18} 
                              y="202" 
                              className="chart-axis-text"
                              style={{ textAnchor: 'middle', fontWeight: '600' }}
                            >
                              {dateStr.split('-')[2]}{t('key_19')}{dateStr.split('-')[1]}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '1.5rem', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ display: 'inline-block', width: '12px', height: '12px', background: 'var(--primary)', borderRadius: '3px' }}></span>
                      {t('morning_yield')}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ display: 'inline-block', width: '12px', height: '12px', background: 'var(--secondary)', borderRadius: '3px' }}></span>
                      {t('evening_yield')}</div>
                  </div>
                </div>
              ) : (
                /* Manager Task Checklist on Dashboard */
                <div className="card col-span-8">
                  <div className="card-header">
                    <h3 className="card-title"><Calendar size={18} /> {t('todays_action_checkl')}</h3>
                    <span className="role-badge" style={{ background: 'var(--accent-glow)', color: 'var(--accent)', border: 'none' }}>
                      {pendingHealthTasks.length} {t('pending')}</span>
                  </div>
                  
                  {pendingHealthTasks.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>
                      {t('_no_schedules_or_vac')}</p>
                  ) : (
                    <div>
                      {pendingHealthTasks.map(task => (
                        <div key={task.id} className="task-item">
                          <div>
                            <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>{task.title}</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                              {t('cattle_20')}<strong>{task.cattleName} {t('key_21')}{task.cattleTag}{t('key_22')}</strong>
                            </p>
                            {task.nextDueDate && (
                              <p style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: '600', marginTop: '0.25rem' }}>
                                {t('due_date')}{task.nextDueDate}
                              </p>
                            )}
                          </div>
                          <button 
                            className="btn btn-secondary"
                            style={{ borderColor: 'var(--success)', color: 'var(--success)', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                            onClick={() => handleCompleteVaccine(task.id)}
                          >
                            <Check size={14} /> {t('mark_done')}</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sidebar Info/Audit panel */}
              <div className="card col-span-4">
                <div className="card-header">
                  <h3 className="card-title"><FileText size={18} /> {t('recent_field_updates')}</h3>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  {t('logs_collected_from_')}{profiles.find(p => p.role === 'manager')?.fullName.split(' ')[0] || 'Raju'}{t('s_mobile_device')}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {milkLogs.slice(0, 3).map(l => (
                    <div key={l.id} style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                      <span style={{ fontSize: '1.25rem' }}>{t('key_23')}</span>
                      <div>
                        <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                          {t('milk_logged_by')}<strong>{l.recordedBy}</strong>
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          {l.cattleName ? `${l.cattleName}: ` : 'Bulk Session: '}{l.quantityLiters} {t('liters_bull')}{l.logDate}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {transactions.slice(0, 2).map(tx => (
                    <div key={tx.id} style={{ display: 'flex', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.25rem' }}>{t('key_24')}</span>
                      <div>
                        <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                          {tx.category} {t('logged_by')}<strong>{tx.recordedBy}</strong>
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          {t('key_25')}{tx.amount} {t('via')}{tx.paymentMethod.toUpperCase()} {t('bull')}{tx.transactionDate}
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
                    <h3 className="card-title">{t('_farm_profile_settin')}</h3>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    {t('configure_the_tenant')}</p>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const nameInput = (e.currentTarget.elements.namedItem('farm-name-edit') as HTMLInputElement).value.trim();
                    const locInput = (e.currentTarget.elements.namedItem('farm-loc-edit') as HTMLInputElement).value.trim();
                    const oName = (e.currentTarget.elements.namedItem('owner-name-edit') as HTMLInputElement).value.trim();
                    const oPin = (e.currentTarget.elements.namedItem('owner-pin-edit') as HTMLInputElement).value.trim();
                    const mName = (e.currentTarget.elements.namedItem('manager-name-edit') as HTMLInputElement).value.trim();
                    const mPin = (e.currentTarget.elements.namedItem('manager-pin-edit') as HTMLInputElement).value.trim();
                    
                    if (nameInput && nameInput !== 'Select Farm' && nameInput !== 'Loading...') {
                      await db.updateFarm(nameInput, locInput);
                      await db.updateProfiles(oName, oPin, mName, mPin);
                      await refreshData(farm.id);
                      alert(t('farm_profile_staff_c'));
                    }
                  }}>
                    <div className="form-group" style={{ textAlign: 'left', background: 'var(--card-hover)', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', border: '1px solid var(--border)' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)' }}>{t('farm_access_code_sha')}</label>
                      <code style={{ fontSize: '0.95rem', fontWeight: '700', display: 'block', marginTop: '0.2rem', wordBreak: 'break-all', color: 'var(--text)' }}>
                        {farm.id}
                      </code>
                    </div>

                    <div className="form-group" style={{ textAlign: 'left' }}>
                      <label style={{ fontSize: '0.75rem' }}>{t('farm_name')}</label>
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
                      <label style={{ fontSize: '0.75rem' }}>{t('location')}</label>
                      <input 
                        id="farm-loc-edit"
                        type="text" 
                        className="form-control" 
                        defaultValue={farm.location || ''}
                        style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                      />
                    </div>
                    
                    <div style={{ borderTop: '1px dashed var(--border)', marginTop: '1rem', paddingTop: '1rem' }}>
                      <h4 style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.5rem' }}>{t('staff_directory_farm')}</h4>
                      
                      <div className="form-group" style={{ textAlign: 'left' }}>
                        <label style={{ fontSize: '0.75rem' }}>{t('owner_full_name')}</label>
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
                        <label style={{ fontSize: '0.75rem' }}>{t('owner_login_pin')}</label>
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
                        <label style={{ fontSize: '0.75rem' }}>{t('manager_name')}</label>
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
                        <label style={{ fontSize: '0.75rem' }}>{t('manager_login_pin')}</label>
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
                      {t('save_farm_profile')}</button>
                  </form>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ========================================================
            TAB: MILK LOGS
            ======================================================== */}
        {activeTab === 'milk' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem' }}>{t('daily_milk_logs')}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('a_complete_history_o')}</p>
              </div>
              {activeProfile.role === 'manager' && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-primary" style={{ padding: '0.6rem 1rem' }} onClick={() => { setMilkLogType('individual'); setShowLogMilkModal(true); }}>
                    {t('_individual_log')}</button>
                  <button className="btn btn-secondary" style={{ padding: '0.6rem 1rem' }} onClick={() => { setMilkLogType('bulk'); setShowLogMilkModal(true); }}>
                    {t('_bulk_log')}</button>
                </div>
              )}
            </div>

            {milkLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)' }}>
                <p style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>{t('key_26')}</p>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text)', marginBottom: '0.5rem' }}>{t('no_milk_logs_yet')}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('start_logging_milk_y')}</p>
              </div>
            ) : (
              <div className="card">
                {milkLogs.map((log, index) => (
                  <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: index < milkLogs.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: log.session === 'morning' ? 'var(--primary-glow)' : 'var(--secondary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                        {log.session === 'morning' ? '🌅' : '🌇'}
                      </div>
                      <div>
                        <h4 style={{ fontWeight: '600', fontSize: '1rem' }}>{log.cattleName ? `${log.cattleName} (${log.cattleTag})` : 'Bulk Herd Session'}</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          {new Date(log.logDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} {t('bull')}{log.session.charAt(0).toUpperCase() + log.session.slice(1)} {t('bull_by')}{log.recordedBy.split(' ')[0]}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text)' }}>{log.quantityLiters}{t('l')}</span>
                      {(log.fatPercentage || log.snfPercentage) && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--info)', marginTop: '0.2rem' }}>
                          {t('fat')}{log.fatPercentage || '-'}{t('_bull_snf')}{log.snfPercentage || '-'}{t('key_27')}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB: CATTLE INVENTORY
            ======================================================== */}
        {activeTab === 'cattle' && (
          <div>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem' }}>{t('cattle_feed_manageme')}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('track_your_herd_bree')}</p>
              </div>
              <div className="tab-pill-container" style={{ display: 'flex', background: 'var(--bg-card)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <button 
                  className={`role-btn ${cattleSubTab === 'herd' ? 'active' : ''}`} 
                  onClick={() => setCattleSubTab('herd')}
                  style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', borderRadius: 'var(--radius-sm)', border: 'none', background: cattleSubTab === 'herd' ? 'var(--primary)' : 'transparent', color: cattleSubTab === 'herd' ? 'white' : 'var(--text)' }}
                >
                  {t('herd_profiles')}</button>
                <button 
                  className={`role-btn ${cattleSubTab === 'feed' ? 'active' : ''}`} 
                  onClick={() => setCattleSubTab('feed')}
                  style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', borderRadius: 'var(--radius-sm)', border: 'none', background: cattleSubTab === 'feed' ? 'var(--primary)' : 'transparent', color: cattleSubTab === 'feed' ? 'white' : 'var(--text)' }}
                >
                  {t('feed_inventory')}</button>
              </div>
            </div>

            {cattleSubTab === 'herd' && (
              <>
                {/* Search/Filter Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '1rem', flex: 1, maxWidth: '500px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        placeholder={t('search_tag_or_cow_na')}
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
                      <option value="all">{t('all_status')}</option>
                      <option value="milking">{t('milking')}</option>
                      <option value="dry">{t('dry_28')}</option>
                      <option value="pregnant">{t('pregnant')}</option>
                      <option value="heifer">{t('heifer')}</option>
                      <option value="calf">{t('calf')}</option>
                    </select>
                  </div>
                  
                  <button onClick={() => setShowAddCattleModal(true)} className="btn btn-primary">
                    <Plus size={16} /> {t('profile_new_cow_29')}</button>
                </div>

                {/* Cattle Cards */}
                {filteredCattle.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>{t('no_cattle_profiles_m')}</p>
                ) : (
                  <div className="cattle-grid">
                    {filteredCattle.map(cow => (
                      <div key={cow.id} className="cattle-card" onClick={() => setSelectedCowProfileId(cow.id)} style={{ cursor: 'pointer' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div className="cattle-avatar">{t('key')}</div>
                            <span className={`status-badge ${cow.status}`}>{cow.status}</span>
                          </div>
                          
                          <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{cow.name || 'Unnamed Cow'}</h3>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                            {t('ear_tag')}<strong style={{ color: 'var(--text)' }}>{cow.tagNumber}</strong>
                          </p>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', margin: '0.75rem 0', padding: '0.75rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                            <div>
                              <span style={{ color: 'var(--text-muted)' }}>{t('breed')}</span>
                              <p style={{ fontWeight: '700', marginTop: '0.1rem' }}>{cow.breed}</p>
                            </div>
                            <div>
                              <span style={{ color: 'var(--text-muted)' }}>{t('cost_value')}</span>
                              <p style={{ fontWeight: '700', marginTop: '0.1rem' }}>{t('key_30')}{cow.purchaseCost || '—'}</p>
                            </div>
                          </div>
                          
                          {cow.notes && (
                            <p style={{ fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                              {t('ldquo')}{cow.notes}{t('rdquo')}</p>
                          )}

                          {/* Nitara Feed Curve Recommendation */}
                          <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'var(--primary-glow)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(46, 125, 50, 0.1)', fontSize: '0.75rem' }}>
                            <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{t('_nitara_feed_curve_t')}</span>
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
                            onClick={(e) => {
                              e.stopPropagation();
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
                            <Edit size={14} /> {t('edit')}</button>
                          {(activeProfile.role === 'owner' || activeProfile.role === 'manager') && (
                            <button 
                              className="btn btn-danger" 
                              style={{ padding: '0.4rem 0.6rem' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(t('delete_cow_profile_p'))) {
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
              </>
            )}

            {cattleSubTab === 'feed' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem' }}>{t('current_stock_levels')}</h3>
                  <button className="btn btn-primary" onClick={() => {
                    setInventoryForm({ id: '', category: 'concentrate', name: '', quantity: '', unit: 'kg', lowStockThreshold: '50' });
                    setShowAddInventoryModal(true);
                  }}>
                    <Plus size={16} /> {t('add_feed_delivery')}</button>
                </div>
                
                {inventoryItems.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>{t('no_feed_inventory_tr')}</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                    {inventoryItems.map(item => (
                      <div key={item.id} className="card" style={{ borderLeft: item.quantity <= item.lowStockThreshold ? '4px solid var(--danger)' : '4px solid var(--success)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', fontWeight: '700' }}>{item.category.replace('_', ' ')}</span>
                            <h4 style={{ fontSize: '1.2rem', marginTop: '0.2rem' }}>{item.name}</h4>
                          </div>
                          {item.quantity <= item.lowStockThreshold && (
                            <span style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                              {t('low_stock')}</span>
                          )}
                        </div>
                        
                        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                          <span style={{ fontSize: '2rem', fontWeight: '800', lineHeight: '1' }}>{item.quantity}</span>
                          <span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{item.unit}</span>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ flex: 1, padding: '0.4rem', fontSize: '0.85rem' }}
                            onClick={() => {
                              setConsumeInventoryForm({ itemId: item.id, quantity: '' });
                              setShowConsumeInventoryModal(true);
                            }}
                          >
                            <Droplet size={14} style={{ marginRight: '0.2rem' }} /> {t('consume')}</button>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '0.4rem 0.6rem' }}
                            onClick={() => {
                              setInventoryForm({
                                id: item.id,
                                category: item.category,
                                name: item.name,
                                quantity: item.quantity.toString(),
                                unit: item.unit,
                                lowStockThreshold: item.lowStockThreshold.toString()
                              });
                              setShowAddInventoryModal(true);
                            }}
                          >
                            <Edit size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ========================================================
            TAB: FINANCIALS CASH LEDGER
            ======================================================== */}
        {activeTab === 'financials' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem' }}>{t('cash_flow_ledger')}</h2>
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
                <option value="all">{t('all_categories')}</option>
                <option value="Milk Sales">{t('milk_sales')}</option>
                <option value="Feed Purchase">{t('feed_purchase')}</option>
                <option value="Medicines">{t('medicines')}</option>
                <option value="Salaries">{t('salaries')}</option>
                <option value="Diesel">{t('diesel')}</option>
                <option value="Maintenance">{t('maintenance')}</option>
              </select>

              <button onClick={() => setShowAddTxModal(true)} className="btn btn-primary">
                <Plus size={16} /> {t('record_transaction')}</button>
            </div>

            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('date')}</th>
                    <th>{t('type')}</th>
                    <th>{t('category')}</th>
                    <th>{t('notes_info')}</th>
                    <th>{t('receipt_file')}</th>
                    <th>{t('logged_by_31')}</th>
                    <th>{t('amount')}</th>
                    {activeProfile.role === 'owner' && <th>{t('action')}</th>}
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
                            {t('show_receipt_')}</button>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('no_file')}</span>
                        )}
                      </td>
                      <td>{tx.recordedBy}</td>
                      <td style={{ 
                        fontWeight: '700', 
                        color: tx.type === 'income' ? 'var(--success)' : 'var(--danger)' 
                      }}>
                        {tx.type === 'income' ? '+' : '-'}{t('key_32')}{tx.amount}
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
              <h2 style={{ fontSize: '1.5rem' }}>{t('vaccination_veterina')}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('schedules_deworming_')}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem' }}>{t('all_farm_treatment_s')}</h3>
              {(activeProfile.role === 'owner' || activeProfile.role === 'manager') && (
                <button onClick={() => setShowAddHealthModal(true)} className="btn btn-primary">
                  <Plus size={16} /> {t('schedule_treatment')}</button>
              )}
            </div>

            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('animal_tag')}</th>
                    <th>{t('type')}</th>
                    <th>{t('description')}</th>
                    <th>{t('administered')}</th>
                    <th>{t('next_due')}</th>
                    <th>{t('vet_fee')}</th>
                    <th>{t('performed_by')}</th>
                    <th>{t('status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {healthLogs.map(log => (
                    <tr key={log.id}>
                      <td style={{ fontWeight: '700' }}>{log.cattleName} {t('key_33')}{log.cattleTag}{t('key_34')}</td>
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
                      <td>{t('key_35')}{log.cost}</td>
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
          <Activity size={20} />
          <span>{t('dash')}</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('cattle')} 
          className={`bottom-nav-item ${activeTab === 'cattle' ? 'active' : ''}`}
        >
          <Layers size={20} />
          <span>{t('cattle')}</span>
        </button>

        <button 
          onClick={() => setActiveTab('milk')} 
          className={`bottom-nav-item ${activeTab === 'milk' ? 'active' : ''}`}
        >
          <Droplet size={20} />
          <span>{t('milk')}</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('financials')} 
          className={`bottom-nav-item ${activeTab === 'financials' ? 'active' : ''}`}
        >
          <DollarSign size={20} />
          <span>{t('ledger')}</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('health')} 
          className={`bottom-nav-item ${activeTab === 'health' ? 'active' : ''}`}
        >
          <Stethoscope size={20} />
          <span>{t('vet')}</span>
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
                <label>{t('ear_tag_number_')}</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder={t('eg_intg105')} 
                  required 
                  value={cattleForm.tagNumber}
                  onChange={e => setCattleForm(prev => ({ ...prev, tagNumber: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label>{t('cattle_name')}</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder={t('eg_ganga_heifera')}
                  value={cattleForm.name}
                  onChange={e => setCattleForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>{t('breed_36')}</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder={t('eg_murrah_buffalo_hf')}
                    value={cattleForm.breed}
                    onChange={e => setCattleForm(prev => ({ ...prev, breed: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>{t('status')}</label>
                  <select 
                    className="form-control"
                    value={cattleForm.status}
                    onChange={e => setCattleForm(prev => ({ ...prev, status: e.target.value as Cattle['status'] }))}
                  >
                    <option value="milking">{t('milking')}</option>
                    <option value="dry">{t('dry_37')}</option>
                    <option value="pregnant">{t('pregnant')}</option>
                    <option value="heifer">{t('heifer')}</option>
                    <option value="calf">{t('calf')}</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>{t('purchase_date')}</label>
                  <input 
                    type="date" 
                    className="form-control"
                    value={cattleForm.purchaseDate}
                    onChange={e => setCattleForm(prev => ({ ...prev, purchaseDate: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>{t('purchase_cost_')}</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder={t('eg_75000')}
                    value={cattleForm.purchaseCost}
                    onChange={e => setCattleForm(prev => ({ ...prev, purchaseCost: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>{t('notes_health_remarks')}</label>
                <textarea 
                  className="form-control" 
                  rows={2} 
                  placeholder={t('feed_schedules_feed_')}
                  value={cattleForm.notes}
                  onChange={e => setCattleForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddCattleModal(false)}>
                  {t('cancel')}</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {t('save_profile')}</button>
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
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>{t('log_milk_yield')}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              {t('mode')}<strong>{milkLogType === 'individual' ? 'Individual (Per Animal)' : 'Bulk (Herd Session)'}</strong>
            </p>

            <form onSubmit={handleMilkLogSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>{t('date')}</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    required 
                    value={milkLogForm.logDate}
                    onChange={e => setMilkLogForm(prev => ({ ...prev, logDate: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>{t('session')}</label>
                  <select 
                    className="form-control"
                    value={milkLogForm.session}
                    onChange={e => setMilkLogForm(prev => ({ ...prev, session: e.target.value as 'morning' | 'evening' }))}
                  >
                    <option value="morning">{t('morning_')}</option>
                    <option value="evening">{t('evening_')}</option>
                  </select>
                </div>
              </div>

              {milkLogType === 'individual' && (
                <div className="form-group">
                  <label>{t('select_animal_tag')}</label>
                  <select 
                    className="form-control" 
                    required 
                    value={milkLogForm.cattleId}
                    onChange={e => setMilkLogForm(prev => ({ ...prev, cattleId: e.target.value }))}
                  >
                    <option value="">{t('_select_cattle_')}</option>
                    {cattle.filter(c => c.status === 'milking').map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name ? `${c.name} (${c.tagNumber})` : c.tagNumber}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>{t('yield_quantity_liter')}</label>
                <input 
                  type="number" 
                  step="0.1" 
                  className="form-control" 
                  placeholder={t('eg_105')} 
                  required
                  value={milkLogForm.quantityLiters}
                  onChange={e => setMilkLogForm(prev => ({ ...prev, quantityLiters: e.target.value }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>{t('fat_optional')}</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    className="form-control" 
                    placeholder={t('eg_72')}
                    value={milkLogForm.fatPercentage}
                    onChange={e => setMilkLogForm(prev => ({ ...prev, fatPercentage: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>{t('snf_optional')}</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    className="form-control" 
                    placeholder={t('eg_90')}
                    value={milkLogForm.snfPercentage}
                    onChange={e => setMilkLogForm(prev => ({ ...prev, snfPercentage: e.target.value }))}
                  />
                </div>
              </div>

              {/* Rate Chart Inputs (Configurable place by place) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px dashed var(--border)', paddingTop: '1rem', marginTop: '1rem' }}>
                <div className="form-group">
                  <label>{t('price_per_fat_')}</label>
                  <input 
                    type="number" 
                    step="0.05" 
                    className="form-control" 
                    placeholder={t('eg_520')} 
                    value={fatPriceInput}
                    onChange={e => setFatPriceInput(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>{t('price_per_snf_')}</label>
                  <input 
                    type="number" 
                    step="0.05" 
                    className="form-control" 
                    placeholder={t('eg_280')} 
                    value={snfPriceInput}
                    onChange={e => setSnfPriceInput(e.target.value)}
                  />
                </div>
              </div>

              {/* Live Payout Calculator (DairyKhata Feature) */}
              {milkLogForm.quantityLiters && (
                <div style={{ background: 'var(--primary-glow)', border: '1px solid rgba(46, 125, 50, 0.2)', borderRadius: 'var(--radius-sm)', padding: '1rem', margin: '1rem 0', fontSize: '0.85rem' }}>
                  <p style={{ fontWeight: '700', color: 'var(--primary)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{t('estimated_payout_rat')}</span>
                    <span>{t('key_38')}{calculateMilkRate(
                      milkLogForm.fatPercentage ? parseFloat(milkLogForm.fatPercentage) : undefined,
                      milkLogForm.snfPercentage ? parseFloat(milkLogForm.snfPercentage) : undefined
                    ).toFixed(2)} {t('_l')}</span>
                  </p>
                  <p style={{ fontWeight: '800', fontSize: '1.05rem', marginTop: '0.4rem', color: 'var(--text)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{t('total_milk_value')}</span>
                    <span>{t('key_39')}{Math.round(
                      parseFloat(milkLogForm.quantityLiters) * 
                      calculateMilkRate(
                        milkLogForm.fatPercentage ? parseFloat(milkLogForm.fatPercentage) : undefined,
                        milkLogForm.snfPercentage ? parseFloat(milkLogForm.snfPercentage) : undefined
                      )
                    )}</span>
                  </p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem', fontStyle: 'italic', lineHeight: '1.3' }}>
                    {t('_payout_formula_fat_')}{fatPriceInput || '5.20'}{t('_snf_')}{snfPriceInput || '2.80'}{t('_per_liter_base_flat')}</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowLogMilkModal(false)}>
                  {t('cancel')}</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {t('log_yield')}</button>
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
            <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>{t('record_transaction')}</h3>

            <form onSubmit={handleTxSubmit}>
              <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', padding: '0.25rem', gap: '0.25rem', marginBottom: '1.25rem', border: '1px solid var(--border)' }}>
                <button 
                  type="button" 
                  className={`btn ${txForm.type === 'expense' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '0.4rem' }}
                  onClick={() => setTxForm(prev => ({ ...prev, type: 'expense', category: 'Feed Purchase' }))}
                >
                  {t('expense_')}</button>
                <button 
                  type="button" 
                  className={`btn ${txForm.type === 'income' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '0.4rem' }}
                  onClick={() => setTxForm(prev => ({ ...prev, type: 'income', category: 'Milk Sales' }))}
                >
                  {t('income_')}</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>{t('date')}</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    required 
                    value={txForm.transactionDate}
                    onChange={e => setTxForm(prev => ({ ...prev, transactionDate: e.target.value }))}
                  />
                </div>
                
                <div className="form-group">
                  <label>{t('category')}</label>
                  <select 
                    className="form-control"
                    value={txForm.category}
                    onChange={e => setTxForm(prev => ({ ...prev, category: e.target.value as Transaction['category'] }))}
                  >
                    {txForm.type === 'expense' ? (
                      <>
                        <option value="Feed Purchase">{t('feed_purchase_')}</option>
                        <option value="Medicines">{t('medicines_')}</option>
                        <option value="Salaries">{t('salaries_')}</option>
                        <option value="Diesel">{t('diesel_')}</option>
                        <option value="Maintenance">{t('maintenance_')}</option>
                        <option value="Cattle Purchase">{t('cattle_purchase')}</option>
                        <option value="Other">{t('other_expense')}</option>
                      </>
                    ) : (
                      <>
                        <option value="Milk Sales">{t('milk_sales_')}</option>
                        <option value="Manure Sales">{t('manure_sales_')}</option>
                        <option value="Cattle Sale">{t('cattle_sale')}</option>
                        <option value="Other">{t('other_income')}</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>{t('amount_')}</label>
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder={t('eg_500')} 
                  required
                  value={txForm.amount}
                  onChange={e => setTxForm(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label>{t('payment_method')}</label>
                <select 
                  className="form-control"
                  value={txForm.paymentMethod}
                  onChange={e => setTxForm(prev => ({ ...prev, paymentMethod: e.target.value as Transaction['paymentMethod'] }))}
                >
                  <option value="upi">{t('upi_phonepegpay')}</option>
                  <option value="cash">{t('cash_')}</option>
                  <option value="bank_transfer">{t('bank_transfer')}</option>
                </select>
              </div>

              <div className="form-group">
                <label>{t('upload_receiptbill_p')}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '1.5px dashed var(--border)', padding: '1rem', borderRadius: 'var(--radius-sm)', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
                  {txForm.receiptPhoto ? (
                    <div style={{ position: 'relative', width: '100%' }}>
                      <img src={txForm.receiptPhoto} alt={t('receipt_preview')} style={{ width: '100%', maxHeight: '100px', objectFit: 'contain' }} />
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
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('tap_to_snap_receipt_')}</span>
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
                <label>{t('description_notes')}</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder={t('eg_sudarshan_buffalo')}
                  value={txForm.notes}
                  onChange={e => setTxForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddTxModal(false)}>
                  {t('cancel')}</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {t('save_entry')}</button>
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
            <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>{t('schedulerecord_treat')}</h3>

            <form onSubmit={handleHealthSubmit}>
              <div className="form-group">
                <label>{t('select_animal_')}</label>
                <select 
                  className="form-control" 
                  required 
                  value={healthForm.cattleId}
                  onChange={e => setHealthForm(prev => ({ ...prev, cattleId: e.target.value }))}
                >
                  <option value="">{t('_select_cattle_')}</option>
                  {cattle.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name ? `${c.name} (${c.tagNumber})` : c.tagNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>{t('type')}</label>
                  <select 
                    className="form-control"
                    value={healthForm.treatmentType}
                    onChange={e => setHealthForm(prev => ({ ...prev, treatmentType: e.target.value as HealthLog['treatmentType'] }))}
                  >
                    <option value="vaccination">{t('vaccination_')}</option>
                    <option value="deworming">{t('deworming_')}</option>
                    <option value="artificial_insemination">{t('ai_breeding')}</option>
                    <option value="medical_treatment">{t('vet_medical_treatmen')}</option>
                    <option value="routine_check">{t('routine_checkup')}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{t('treatment_name_')}</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder={t('eg_fmd_vaccine_alben')} 
                    required
                    value={healthForm.title}
                    onChange={e => setHealthForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>{t('administered_date_co')}</label>
                  <input 
                    type="date" 
                    className="form-control"
                    value={healthForm.administeredDate}
                    onChange={e => setHealthForm(prev => ({ ...prev, administeredDate: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>{t('next_due_date_schedu')}</label>
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
                  <label>{t('veterinary_cost_')}</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder={t('eg_500')}
                    value={healthForm.cost}
                    onChange={e => setHealthForm(prev => ({ ...prev, cost: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>{t('performed_by')}</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder={t('eg_dr_rao')}
                    value={healthForm.performedBy}
                    onChange={e => setHealthForm(prev => ({ ...prev, performedBy: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>{t('treatmentvet_notes')}</label>
                <textarea 
                  className="form-control" 
                  rows={2} 
                  placeholder={t('notes_about_dosage_r')}
                  value={healthForm.notes}
                  onChange={e => setHealthForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddHealthModal(false)}>
                  {t('cancel')}</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {t('schedule')}</button>
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
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>{t('receipt_file_preview')}</h3>
            <img src={receiptPreviewUrl} alt={t('receipt_payout_docum')} style={{ width: '100%', maxHeight: '450px', objectFit: 'contain', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
            <button className="btn btn-primary" style={{ marginTop: '1.5rem', width: '120px' }} onClick={() => setReceiptPreviewUrl(null)}>
              {t('close')}</button>
          </div>
        </div>
      )}
      {/* ========================================================
          MODAL: COW ANALYTICS PROFILE
          ======================================================== */}
      {selectedCowProfileId && (() => {
        const selectedCow = cattle.find(c => c.id === selectedCowProfileId);
        if (!selectedCow) return null;

        const cowLogs = milkLogs.filter(l => l.cattleId === selectedCowProfileId);
        const cowHealth = healthLogs.filter(h => h.cattleId === selectedCowProfileId);
        
        // Income
        let totalIncome = 0;
        cowLogs.forEach(log => {
           const rate = (log.fatPercentage && log.snfPercentage) 
             ? calculateMilkRate(log.fatPercentage, log.snfPercentage) 
             : 48; 
           totalIncome += (log.quantityLiters * rate);
        });

        // Expenses
        const vetCost = cowHealth.reduce((sum, h) => sum + h.cost, 0);
        
        // Pro-rated Feed Cost
        const feedTxs = transactions.filter(t => t.category === 'Feed Purchase' && t.type === 'expense');
        const totalFarmFeedCost = feedTxs.reduce((sum, t) => sum + t.amount, 0);
        const activeCattleCount = cattle.length || 1; // Divide by total herd size
        const proratedFeedCost = Math.round(totalFarmFeedCost / activeCattleCount);

        const netMargin = Math.round(totalIncome) - (vetCost + proratedFeedCost);

        // Chart Data (Last 7 days of yields for this cow)
        const recentDates = Array.from(new Set(cowLogs.map(l => l.logDate)))
          .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
          .slice(-7);

        return (
          <div className="modal-overlay" onClick={() => setSelectedCowProfileId(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
              <button className="btn btn-secondary" style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', padding: '0.25rem' }} onClick={() => setSelectedCowProfileId(null)}>
                <X size={18} />
              </button>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.4rem' }}>{selectedCow.name || 'Unnamed Cow'} {t('analytics')}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>{t('ear_tag')}<strong>{selectedCow.tagNumber}</strong> {t('bull_status')}<span className={`status-badge ${selectedCow.status}`}>{selectedCow.status}</span></p>
                </div>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setSelectedCowProfileId(null);
                    setCattleForm({
                      id: selectedCow.id,
                      tagNumber: selectedCow.tagNumber,
                      name: selectedCow.name || '',
                      breed: selectedCow.breed,
                      status: selectedCow.status,
                      birthDate: selectedCow.birthDate || '',
                      purchaseDate: selectedCow.purchaseDate || '',
                      purchaseCost: selectedCow.purchaseCost?.toString() || '',
                      notes: selectedCow.notes || '',
                    });
                    setShowAddCattleModal(true);
                  }}
                >
                  <Edit size={14} /> {t('edit_profile')}</button>
              </div>

              {/* Profitability Widgets */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="card" style={{ background: netMargin >= 0 ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)', borderColor: netMargin >= 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('net_margin_40')}</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '800', color: netMargin >= 0 ? 'var(--success)' : 'var(--danger)', marginTop: '0.25rem' }}>
                    {netMargin >= 0 ? '₹' : '-₹'}{Math.abs(netMargin)}
                  </p>
                </div>
                <div className="card">
                  <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('milk_revenue')}</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text)', marginTop: '0.25rem' }}>{t('key_41')}{Math.round(totalIncome)}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--success)', marginTop: '0.2rem' }}>{cowLogs.reduce((sum, l) => sum + l.quantityLiters, 0).toFixed(1)}{t('l_total')}</p>
                </div>
                <div className="card">
                  <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('vet_expenses')}</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text)', marginTop: '0.25rem' }}>{t('key_42')}{vetCost}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--danger)', marginTop: '0.2rem' }}>{cowHealth.length} {t('treatments')}</p>
                </div>
                <div className="card">
                  <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('est_feed_cost')}</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text)', marginTop: '0.25rem' }}>{t('key_43')}{proratedFeedCost}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{t('farm_avg_prorated')}</p>
                </div>
              </div>

              {/* Yield Curve SVG Chart */}
              <div className="card" style={{ marginBottom: '0' }}>
                <div className="card-header" style={{ marginBottom: '1.5rem' }}>
                  <h3 className="card-title"><TrendingUp size={16} /> {t('individual_yield_cur')}</h3>
                </div>
                {recentDates.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>{t('no_milk_logs_recorde')}</p>
                ) : (
                  <div style={{ height: '220px', width: '100%', position: 'relative' }}>
                    <svg width="100%" height="100%" viewBox={`0 0 ${recentDates.length * 100 + 40} 220`} preserveAspectRatio="none">
                      {/* Grid lines */}
                      <line x1="40" y1="30" x2="100%" y2="30" className="chart-grid-line" />
                      <line x1="40" y1="80" x2="100%" y2="80" className="chart-grid-line" />
                      <line x1="40" y1="130" x2="100%" y2="130" className="chart-grid-line" />
                      <line x1="40" y1="180" x2="100%" y2="180" stroke="var(--border)" strokeWidth="1.5" />

                      {/* Y-axis labels */}
                      <text x="5" y="34" className="chart-axis-text">{t('20_l')}</text>
                      <text x="5" y="84" className="chart-axis-text">{t('15_l')}</text>
                      <text x="5" y="134" className="chart-axis-text">{t('10_l')}</text>
                      <text x="5" y="184" className="chart-axis-text">{t('0_l')}</text>

                      {/* Render line and points */}
                      {(() => {
                        const points = recentDates.map((dateStr, idx) => {
                          const dailyLogs = cowLogs.filter(l => l.logDate === dateStr);
                          const totalLit = dailyLogs.reduce((sum, l) => sum + l.quantityLiters, 0);
                          const scale = 150 / 20; // Max 20L for individual mapped to 150px
                          const y = 180 - (totalLit * scale);
                          const x = 70 + idx * 80;
                          return { x, y, totalLit, dateStr };
                        });

                        const pathD = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');

                        return (
                          <>
                            <path d={pathD} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            {points.map((p, i) => (
                              <g key={i}>
                                <circle cx={p.x} cy={p.y} r="5" fill="var(--bg-card)" stroke="var(--primary)" strokeWidth="2" />
                                <text x={p.x} y={p.y - 12} style={{ fill: 'var(--text)', fontSize: '10px', fontWeight: '700', textAnchor: 'middle' }}>
                                  {p.totalLit.toFixed(1)}{t('l')}</text>
                                <text x={p.x} y="202" className="chart-axis-text" style={{ textAnchor: 'middle' }}>
                                  {p.dateStr.split('-')[2]}{t('key_44')}{p.dateStr.split('-')[1]}
                                </text>
                              </g>
                            ))}
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Reproduction Timeline */}
              <div className="card" style={{ marginTop: '1.5rem', marginBottom: '0' }}>
                <div className="card-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="card-title"><Calendar size={16} /> {t('reproduction_timelin')}</h3>
                  <button className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }} onClick={() => {
                    setBreedingForm(prev => ({ ...prev, cattleId: selectedCow.id }));
                    setShowAddBreedingModal(true);
                  }}>
                    <Plus size={14} /> {t('log_event')}</button>
                </div>
                
                {(() => {
                  const cowBreeding = breedingLogs.filter(b => b.cattleId === selectedCow.id).sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
                  
                  if (cowBreeding.length === 0) {
                    return <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>{t('no_breeding_logs_rec')}</p>;
                  }

                  return (
                    <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                      {/* Timeline line */}
                      <div style={{ position: 'absolute', left: '0', top: '0', bottom: '0', width: '2px', background: 'var(--border)' }}></div>
                      
                      {cowBreeding.map(log => (
                        <div key={log.id} style={{ position: 'relative', marginBottom: '1.5rem' }}>
                          <div style={{ position: 'absolute', left: '-1.85rem', top: '0.2rem', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)', border: '2px solid var(--bg-card)' }}></div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <h4 style={{ fontSize: '1rem', fontWeight: '600' }}>
                                {log.eventType === 'heat' && 'Heat (Estrus)'}
                                {log.eventType === 'ai' && 'AI / Mating'}
                                {log.eventType === 'pd' && 'Pregnancy Diagnosis'}
                                {log.eventType === 'dry_off' && 'Dry Off'}
                                {log.eventType === 'calving' && 'Calving'}
                              </h4>
                              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                                {new Date(log.eventDate).toLocaleDateString()}
                              </p>
                              {log.notes && (
                                <p style={{ fontSize: '0.85rem', marginTop: '0.4rem', color: 'var(--text)' }}>
                                  {log.notes}
                                </p>
                              )}
                            </div>
                            <button className="btn btn-secondary" style={{ padding: '0.25rem', color: 'var(--danger)' }} onClick={async () => {
                              if (confirm(t('delete_this_event'))) {
                                await db.deleteBreedingLog(log.id);
                                refreshData();
                              }
                            }}>
                              <Trash size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
              
            </div>
          </div>
        );
      })()}

      {/* ========================================================
          MODAL: ADD/EDIT FEED INVENTORY
          ======================================================== */}
      {showAddInventoryModal && (
        <div className="modal-overlay" onClick={() => setShowAddInventoryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem' }}>{inventoryForm.id ? 'Edit Stock' : 'Add Feed Delivery'}</h3>
              <button className="btn btn-secondary" style={{ padding: '0.25rem' }} onClick={() => setShowAddInventoryModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleInventorySubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label>{t('category')}</label>
                <select 
                  className="form-control" 
                  value={inventoryForm.category}
                  onChange={e => setInventoryForm(prev => ({ ...prev, category: e.target.value as any }))}
                >
                  <option value="concentrate">{t('concentrate_sudarsha')}</option>
                  <option value="silage">{t('silage')}</option>
                  <option value="dry_fodder">{t('dry_fodder_hay')}</option>
                  <option value="medicine">{t('medicine_supplements')}</option>
                  <option value="other">{t('other')}</option>
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>{t('item_name_brand')}</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required
                  placeholder={t('eg_sudarshan_5000_co')}
                  value={inventoryForm.name}
                  onChange={e => setInventoryForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label>{t('total_quantity_deliv')}</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="form-control" 
                    required
                    value={inventoryForm.quantity}
                    onChange={e => setInventoryForm(prev => ({ ...prev, quantity: e.target.value }))}
                  />
                </div>
                <div>
                  <label>{t('unit')}</label>
                  <select 
                    className="form-control" 
                    value={inventoryForm.unit}
                    onChange={e => setInventoryForm(prev => ({ ...prev, unit: e.target.value as any }))}
                  >
                    <option value="kg">{t('kg')}</option>
                    <option value="tons">{t('tons')}</option>
                    <option value="liters">{t('liters')}</option>
                    <option value="units">{t('units_bags')}</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label>{t('low_stock_warning_th')}</label>
                <input 
                  type="number" 
                  className="form-control" 
                  required
                  placeholder={t('warn_me_when_stock_d')}
                  value={inventoryForm.lowStockThreshold}
                  onChange={e => setInventoryForm(prev => ({ ...prev, lowStockThreshold: e.target.value }))}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                {inventoryForm.id ? 'Update Stock' : 'Add Stock'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: CONSUME FEED INVENTORY
          ======================================================== */}
      {showConsumeInventoryModal && (
        <div className="modal-overlay" onClick={() => setShowConsumeInventoryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem' }}>{t('consume_stock')}</h3>
              <button className="btn btn-secondary" style={{ padding: '0.25rem' }} onClick={() => setShowConsumeInventoryModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleConsumeInventorySubmit}>
              <div style={{ marginBottom: '1.5rem', background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('you_are_updating_the')}</p>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label>{t('amount_consumed')}</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="form-control" 
                  required
                  placeholder={t('eg_25')}
                  value={consumeInventoryForm.quantity}
                  onChange={e => setConsumeInventoryForm(prev => ({ ...prev, quantity: e.target.value }))}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                {t('deduct_from_stock')}</button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD BREEDING LOG
          ======================================================== */}
      {showAddBreedingModal && (
        <div className="modal-overlay" onClick={() => setShowAddBreedingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem' }}>{t('log_breeding_event')}</h3>
              <button className="btn btn-secondary" style={{ padding: '0.25rem' }} onClick={() => setShowAddBreedingModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleBreedingSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label>{t('event_type')}</label>
                <select 
                  className="form-control" 
                  value={breedingForm.eventType}
                  onChange={e => setBreedingForm(prev => ({ ...prev, eventType: e.target.value as any }))}
                >
                  <option value="heat">{t('heat_estrus')}</option>
                  <option value="ai">{t('artificial_inseminat')}</option>
                  <option value="pd">{t('pregnancy_diagnosis_')}</option>
                  <option value="dry_off">{t('dry_off')}</option>
                  <option value="calving">{t('calving_birth')}</option>
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>{t('date')}</label>
                <input 
                  type="date" 
                  className="form-control" 
                  required
                  value={breedingForm.eventDate}
                  onChange={e => setBreedingForm(prev => ({ ...prev, eventDate: e.target.value }))}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label>{t('notes')}</label>
                <textarea 
                  className="form-control" 
                  rows={2} 
                  placeholder={
                    breedingForm.eventType === 'ai' ? "Semen straw details (Bull ID, Breed)" : 
                    breedingForm.eventType === 'pd' ? "Result: Positive/Negative" : 
                    breedingForm.eventType === 'calving' ? "Calf gender, health notes" : 
                    "Any additional observations..."
                  }
                  value={breedingForm.notes}
                  onChange={e => setBreedingForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                {t('save_event')}</button>
            </form>
          </div>
        </div>
      )}


    </div>
  );
}

export default App;
