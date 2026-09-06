import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ExpenseForm from './components/ExpenseForm';
import Dashboard from './components/Dashboard';
import ExpenseList from './components/ExpenseList';
import LiquidityManager from './components/LiquidityManager';
import CloudConfigModal from './components/CloudConfigModal';
import AuthModal from './components/AuthModal';
import UserProfileModal from './components/UserProfileModal';
import LandingPage from './components/LandingPage';
import GuidedTutorialModal from './components/GuidedTutorialModal';
import InteractiveTour from './components/InteractiveTour';
import { DEMO_PROFILES } from './lib/demoData';
import {
  fetchExpenses,
  saveExpense,
  updateExpense,
  deleteExpense,
  getMonthlyBudget,
  setMonthlyBudget as saveMonthlyBudget,
  getCloudConfig,
  getPreferredCurrency,
  setPreferredCurrency,
  fetchLiveExchangeRate,
  getCurrentUser,
  signOutUser,
  onAuthStateChange,
  fetchAccounts,
  fetchIncomes,
  fetchFixedExpenses
} from './lib/supabaseClient';
import { PlusCircle, LayoutDashboard, ListFilter, Cloud, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

export default function App() {
  // Navigation mode: 'landing', 'app' (real user), or 'demo' (interactive test)
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('saveahorro_view_mode') || 'landing';
  });

  const [demoProfileKey, setDemoProfileKey] = useState('carlos'); // 'carlos' or 'pepe'
  const [demoExpenses, setDemoExpenses] = useState(DEMO_PROFILES.carlos.expenses);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);

  const [activeTab, setActiveTab] = useState('form');
  const [expenses, setExpenses] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [fixedExpenses, setFixedExpenses] = useState([]);
  
  // Real user profile state
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('saveahorro_user_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { firstName: 'Jonathan', lastName: 'Figueroa' };
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Supabase Auth kept intact in standby
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const [monthlyBudget, setMonthlyBudgetState] = useState(1500);
  const [currency, setCurrency] = useState(getPreferredCurrency());
  const [exchangeRate, setExchangeRate] = useState(3.75);
  const [exchangeUpdatedAt, setExchangeUpdatedAt] = useState('');
  const [isCloudConfigOpen, setIsCloudConfigOpen] = useState(false);
  const [cloudEnabled, setCloudEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sync demo expenses whenever demo profile changes
  useEffect(() => {
    if (viewMode === 'demo') {
      const p = DEMO_PROFILES[demoProfileKey] || DEMO_PROFILES.carlos;
      setDemoExpenses([...p.expenses]);
    }
  }, [demoProfileKey, viewMode]);

  const handleSaveProfile = (newProfile) => {
    setUserProfile(newProfile);
    localStorage.setItem('saveahorro_user_profile', JSON.stringify(newProfile));
  };

  // Load live market exchange rate
  const loadExchangeRate = async (forceRefresh = false) => {
    if (forceRefresh) {
      localStorage.removeItem('control_ahorro_exchange_rate_v1');
    }
    const data = await fetchLiveExchangeRate();
    if (data?.rate) {
      setExchangeRate(data.rate);
      setExchangeUpdatedAt(data.updatedAt || 'Reciente');
    }
  };

  // Load initial data (expenses, accounts, incomes, fixed expenses, user)
  const loadData = async () => {
    setLoading(true);
    const config = getCloudConfig();
    setCloudEnabled(config.isEnabled && Boolean(config.supabaseUrl));
    
    const user = await getCurrentUser();
    setCurrentUser(user);

    const budget = getMonthlyBudget();
    setMonthlyBudgetState(budget);

    const [loadedExpenses, loadedAccounts, loadedIncomes, loadedFixed] = await Promise.all([
      fetchExpenses(),
      fetchAccounts(),
      fetchIncomes(),
      fetchFixedExpenses()
    ]);

    setExpenses(loadedExpenses);
    setAccounts(loadedAccounts);
    setIncomes(loadedIncomes);
    setFixedExpenses(loadedFixed);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    loadExchangeRate();

    const subscription = onAuthStateChange(async (event, user) => {
      setCurrentUser(user);
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        loadData();
      }
    });

    return () => {
      if (subscription?.unsubscribe) subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await signOutUser();
    setCurrentUser(null);
    loadData();
  };

  const handleCurrencyChange = (newCur) => {
    setPreferredCurrency(newCur);
    setCurrency(newCur);
  };

  // Expense Handlers (Dispatches to real state or demo state)
  const handleAddExpense = async (expenseData) => {
    if (viewMode === 'demo') {
      const newDemoExpense = {
        ...expenseData,
        id: 'demo_exp_' + Date.now()
      };
      setDemoExpenses(prev => [newDemoExpense, ...prev]);
      return { expense: newDemoExpense, isCloudEnabled: false };
    }

    const result = await saveExpense(expenseData);
    const saved = result.expense || result;
    setExpenses(prev => [saved, ...prev.filter(e => e.id !== saved.id)]);
    return result;
  };

  const handleUpdateExpense = async (id, updatedFields) => {
    if (viewMode === 'demo') {
      setDemoExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updatedFields } : e));
      return { expense: { id, ...updatedFields } };
    }

    const result = await updateExpense(id, updatedFields);
    const updated = result.expense || { id, ...updatedFields };
    setExpenses(prev => prev.map(e => (e.id === id ? { ...e, ...updated } : e)));
    return result;
  };

  const handleDeleteExpense = async (id) => {
    if (viewMode === 'demo') {
      setDemoExpenses(prev => prev.filter(e => e.id !== id));
      return;
    }

    await deleteExpense(id);
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const handleUpdateBudget = (newBudget) => {
    if (viewMode === 'demo') return;
    saveMonthlyBudget(newBudget);
    setMonthlyBudgetState(newBudget);
  };

  const handleStartDemo = (profileKey = 'carlos') => {
    setDemoProfileKey(profileKey);
    setViewMode('demo');
    setActiveTab('form'); // Empezar en el formulario para guiar el registro de gastos hormiga
    setIsTourOpen(true);  // Activar el tour interactivo guiado de inmediato
  };

  const handleEnterRealApp = () => {
    setViewMode('app');
    localStorage.setItem('saveahorro_view_mode', 'app');
  };

  // Active data selection
  const isDemo = viewMode === 'demo';
  const activeDemoProfile = DEMO_PROFILES[demoProfileKey] || DEMO_PROFILES.carlos;

  const currentExpenses = isDemo ? demoExpenses : expenses;
  const currentAccounts = isDemo ? activeDemoProfile.accounts : accounts;
  const currentBudget = isDemo ? activeDemoProfile.monthlyBudget : monthlyBudget;
  const currentDisplayedProfile = isDemo ? activeDemoProfile.userProfile : userProfile;

  // VIEW 1: LANDING PAGE
  if (viewMode === 'landing') {
    return (
      <div className="app-container">
        <LandingPage
          onStartDemo={handleStartDemo}
          onEnterApp={handleEnterRealApp}
          onOpenTutorial={() => setIsTutorialOpen(true)}
        />

        <GuidedTutorialModal
          isOpen={isTutorialOpen}
          onClose={() => setIsTutorialOpen(false)}
        />
      </div>
    );
  }

  // VIEW 2 & 3: APPLICATION (REAL O DEMO INTERACTIVA)
  return (
    <div className="app-container">
      
      {/* DEMO MODE STICKY TOP BANNER */}
      {isDemo && (
        <div className="demo-banner animate-fade-in">
          <div className="demo-banner-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                padding: '0.2rem 0.55rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(245, 158, 11, 0.2)',
                color: '#fef08a',
                border: '1px solid rgba(245, 158, 11, 0.4)'
              }}>
                🎭 MODO DEMO INTERACTIVO
              </span>

              {/* Persona Switcher Buttons */}
              <div className="demo-profile-pills">
                <button
                  type="button"
                  onClick={() => setDemoProfileKey('carlos')}
                  className="demo-pill"
                  style={{
                    background: demoProfileKey === 'carlos' ? '#10b981' : 'transparent',
                    color: demoProfileKey === 'carlos' ? '#fff' : 'var(--text-muted)'
                  }}
                >
                  <span>🐜 Carlos (Ahorrador 🟢)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDemoProfileKey('pepe')}
                  className="demo-pill"
                  style={{
                    background: demoProfileKey === 'pepe' ? '#ef4444' : 'transparent',
                    color: demoProfileKey === 'pepe' ? '#fff' : 'var(--text-muted)'
                  }}
                >
                  <span>💸 Pepe (En Déficit 🔴)</span>
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setIsTourOpen(true)}
                className="btn btn-secondary"
                style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem', gap: '0.3rem' }}
                title="Abrir la guía interactiva paso a paso"
              >
                <Sparkles size={13} color="#f59e0b" />
                <span>Tutorial Guiado</span>
              </button>
              <button
                onClick={handleEnterRealApp}
                className="btn btn-primary"
                style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem', fontWeight: 700, gap: '0.3rem' }}
              >
                <span>✨ Ir a Mi Cuenta</span>
                <ArrowRight size={13} />
              </button>
              <button
                onClick={() => setViewMode('landing')}
                className="btn btn-secondary"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                title="Volver a la portada principal"
              >
                <span>🏠 Inicio</span>
              </button>
            </div>
          </div>

          {/* Subtitle tag explaining the active persona */}
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>Viendo a:</span>
            <strong style={{ color: demoProfileKey === 'carlos' ? '#10b981' : '#fca5a5' }}>
              {activeDemoProfile.fullName} ({activeDemoProfile.nickname}) {activeDemoProfile.emoji}
            </strong>
            <span>— {activeDemoProfile.tagline}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cloudEnabled={cloudEnabled}
        onOpenCloudConfig={() => setIsCloudConfigOpen(true)}
        monthlyBudget={currentBudget}
        currentCurrency={currency}
        onCurrencyChange={handleCurrencyChange}
        exchangeRate={exchangeRate}
        onRefreshExchangeRate={() => loadExchangeRate(true)}
        userProfile={currentDisplayedProfile}
        onOpenProfileModal={() => !isDemo && setIsProfileModalOpen(true)}
        onOpenTutorial={() => setIsTourOpen(true)}
        onShowLanding={() => setViewMode('landing')}
      />

      {/* Main Content Area */}
      <main style={{ marginTop: '1rem' }}>
        {loading && !isDemo ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.1rem' }}>Cargando tus datos de SaveAhorro...</p>
          </div>
        ) : (
          <>
            {activeTab === 'form' && (
              <ExpenseForm
                onAddExpense={handleAddExpense}
                currentCurrency={currency}
                onCurrencyChange={handleCurrencyChange}
                accounts={currentAccounts}
              />
            )}

            {activeTab === 'dashboard' && (
              <Dashboard
                expenses={currentExpenses}
                monthlyBudget={currentBudget}
                setMonthlyBudget={handleUpdateBudget}
                currentCurrency={currency}
                onCurrencyChange={handleCurrencyChange}
                exchangeRate={exchangeRate}
                exchangeUpdatedAt={exchangeUpdatedAt}
                onRefreshExchangeRate={() => loadExchangeRate(true)}
              />
            )}

            {activeTab === 'list' && (
              <ExpenseList
                expenses={currentExpenses}
                onDeleteExpense={handleDeleteExpense}
                onUpdateExpense={handleUpdateExpense}
                currentCurrency={currency}
                onCurrencyChange={handleCurrencyChange}
                exchangeRate={exchangeRate}
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav">
        <button
          className={`mobile-nav-item ${activeTab === 'form' ? 'active' : ''}`}
          onClick={() => setActiveTab('form')}
        >
          <PlusCircle size={20} />
          <span>Registrar</span>
        </button>
        <button
          className={`mobile-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </button>
        <button
          className={`mobile-nav-item ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          <ListFilter size={20} />
          <span>Historial</span>
        </button>
        <button
          className="mobile-nav-item"
          onClick={() => setIsCloudConfigOpen(true)}
          style={{ color: cloudEnabled ? 'var(--success)' : 'var(--text-muted)' }}
        >
          <Cloud size={20} />
          <span>Nube</span>
        </button>
      </nav>

      {/* Guided Tutorial Modal (Full guide) */}
      <GuidedTutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />

      {/* Interactive Tour (Coachmarks step by step inside demo/app) */}
      <InteractiveTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        activeTab={activeTab}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onSwitchDemoProfile={(key) => setDemoProfileKey(key)}
        currentDemoProfile={demoProfileKey}
      />

      {/* User Profile Modal (Nombre y Apellidos) */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        onSaveProfile={handleSaveProfile}
      />

      {/* Cloud Configuration Modal */}
      <CloudConfigModal
        isOpen={isCloudConfigOpen}
        onClose={() => setIsCloudConfigOpen(false)}
        onConfigSaved={loadData}
      />

      {/* Auth Modal (Preserved in standby) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          loadData();
        }}
      />

    </div>
  );
}
