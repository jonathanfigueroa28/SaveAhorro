import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ExpenseForm from './components/ExpenseForm';
import Dashboard from './components/Dashboard';
import ExpenseList from './components/ExpenseList';
import CloudConfigModal from './components/CloudConfigModal';
import {
  fetchExpenses,
  saveExpense,
  deleteExpense,
  getMonthlyBudget,
  setMonthlyBudget as saveMonthlyBudget,
  getCloudConfig
} from './lib/supabaseClient';
import { PlusCircle, LayoutDashboard, ListFilter, Cloud } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('form');
  const [expenses, setExpenses] = useState([]);
  const [monthlyBudget, setMonthlyBudgetState] = useState(500);
  const [isCloudConfigOpen, setIsCloudConfigOpen] = useState(false);
  const [cloudEnabled, setCloudEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load initial data
  const loadData = async () => {
    setLoading(true);
    const config = getCloudConfig();
    setCloudEnabled(config.isEnabled && Boolean(config.supabaseUrl));
    
    const budget = getMonthlyBudget();
    setMonthlyBudgetState(budget);

    const loadedExpenses = await fetchExpenses();
    setExpenses(loadedExpenses);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddExpense = async (expenseData) => {
    const result = await saveExpense(expenseData);
    const saved = result.expense || result;
    setExpenses(prev => [saved, ...prev.filter(e => e.id !== saved.id)]);
    return result;
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este gasto?')) {
      await deleteExpense(id);
      setExpenses(prev => prev.filter(e => e.id !== id));
    }
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
      />

      {/* Main Content Area */}
      <main style={{ marginTop: '1rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.1rem' }}>Cargando tus registros de gastos...</p>
          </div>
        ) : (
          <>
            {activeTab === 'form' && (
              <ExpenseForm onAddExpense={handleAddExpense} />
            )}

            {activeTab === 'dashboard' && (
              <Dashboard
                expenses={expenses}
                monthlyBudget={monthlyBudget}
                setMonthlyBudget={handleUpdateBudget}
              />
            )}

            {activeTab === 'list' && (
              <ExpenseList
                expenses={expenses}
                onDeleteExpense={handleDeleteExpense}
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

      {/* Cloud Configuration Modal */}
      <CloudConfigModal
        isOpen={isCloudConfigOpen}
        onClose={() => setIsCloudConfigOpen(false)}
        onConfigSaved={loadData}
      />

    </div>
  );
}
