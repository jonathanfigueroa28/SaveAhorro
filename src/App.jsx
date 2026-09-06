import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ExpenseForm from './components/ExpenseForm';
import Dashboard from './components/Dashboard';
import ExpenseList from './components/ExpenseList';
import LiquidityManager from './components/LiquidityManager';
import CloudConfigModal from './components/CloudConfigModal';
import AuthModal from './components/AuthModal';
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
import { PlusCircle, LayoutDashboard, ListFilter, Cloud, Wallet } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('form');
  const [expenses, setExpenses] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const [monthlyBudget, setMonthlyBudgetState] = useState(1500);
  const [currency, setCurrency] = useState(getPreferredCurrency());
  const [exchangeRate, setExchangeRate] = useState(3.75);
  const [exchangeUpdatedAt, setExchangeUpdatedAt] = useState('');
  const [isCloudConfigOpen, setIsCloudConfigOpen] = useState(false);
  const [cloudEnabled, setCloudEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

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

    // Subscribe to auth state changes (persists login across weeks/reloads)
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

  const handleAddExpense = async (expenseData) => {
    const result = await saveExpense(expenseData);
    const saved = result.expense || result;
    setExpenses(prev => [saved, ...prev.filter(e => e.id !== saved.id)]);
    return result;
  };

  const handleUpdateExpense = async (id, updatedFields) => {
    const result = await updateExpense(id, updatedFields);
    const updated = result.expense || { id, ...updatedFields };
    setExpenses(prev => prev.map(e => (e.id === id ? { ...e, ...updated } : e)));
    return result;
  };

  const handleDeleteExpense = async (id) => {
    await deleteExpense(id);
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const handleUpdateBudget = (newBudget) => {
    saveMonthlyBudget(newBudget);
    setMonthlyBudgetState(newBudget);
  };

  return (
    <div className="app-container">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cloudEnabled={cloudEnabled}
        onOpenCloudConfig={() => setIsCloudConfigOpen(true)}
        monthlyBudget={monthlyBudget}
        currentCurrency={currency}
        onCurrencyChange={handleCurrencyChange}
        exchangeRate={exchangeRate}
        onRefreshExchangeRate={() => loadExchangeRate(true)}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main style={{ marginTop: '1rem' }}>
        {loading ? (
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
                accounts={accounts}
              />
            )}

            {activeTab === 'dashboard' && (
              <Dashboard
                expenses={expenses}
                monthlyBudget={monthlyBudget}
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
                expenses={expenses}
                onDeleteExpense={handleDeleteExpense}
                onUpdateExpense={handleUpdateExpense}
                currentCurrency={currency}
                onCurrencyChange={handleCurrencyChange}
                exchangeRate={exchangeRate}
              />
            )}

            {activeTab === 'liquidity' && (
              <LiquidityManager
                expenses={expenses}
                accounts={accounts}
                onAccountsChange={setAccounts}
                incomes={incomes}
                onIncomesChange={setIncomes}
                fixedExpenses={fixedExpenses}
                onFixedExpensesChange={setFixedExpenses}
                exchangeRate={exchangeRate}
                currentCurrency={currency}
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
          className={`mobile-nav-item ${activeTab === 'liquidity' ? 'active' : ''}`}
          onClick={() => setActiveTab('liquidity')}
        >
          <Wallet size={20} />
          <span>Liquidez</span>
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

      {/* Cloud Configuration Modal */}
      <CloudConfigModal
        isOpen={isCloudConfigOpen}
        onClose={() => setIsCloudConfigOpen(false)}
        onConfigSaved={loadData}
      />

      {/* Auth Modal (Login & Registration) */}
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
