import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  PieChart as PieChartIcon, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Wallet 
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { motion } from 'motion/react';
import { cn } from './lib/utils';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User
} from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  orderBy
} from 'firebase/firestore';

// Types & Constants
import { Expense, Category, Income, TabType } from './types';
import { AVAILABLE_ICONS, AVAILABLE_COLORS } from './constants';

// UI Components
import { Card } from './components/ui/Card';
import { Button } from './components/ui/Button';

// Feature Components
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ExpenseTab } from './components/ExpenseTab';
import { CategoryTab } from './components/CategoryTab';
import { IncomeTab } from './components/IncomeTab';
import { ReportsTab } from './components/ReportsTab';

// Modals
import { ExpenseModal } from './components/modals/ExpenseModal';
import { CategoryModal } from './components/modals/CategoryModal';
import { IncomeModal } from './components/modals/IncomeModal';
import { ConfirmModal } from './components/modals/ConfirmModal';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  
  // Modals
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddIncomeModalOpen, setIsAddIncomeModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Form States
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    description: '',
    categoryId: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    icon: AVAILABLE_ICONS[0],
    color: AVAILABLE_COLORS[0],
    budget: ''
  });

  const [incomeForm, setIncomeForm] = useState({
    amount: '',
    description: '',
    source: 'Salary',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  // Auth Effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Data Sync Effect
  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setCategories([]);
      setIncomes([]);
      return;
    }

    const qExpenses = query(
      collection(db, 'expenses'),
      where('uid', '==', user.uid),
      orderBy('date', 'desc')
    );

    const qCategories = query(
      collection(db, 'categories'),
      where('uid', '==', user.uid)
    );

    const qIncomes = query(
      collection(db, 'incomes'),
      where('uid', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubExpenses = onSnapshot(qExpenses, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
      setExpenses(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'expenses');
    });

    const unsubCategories = onSnapshot(qCategories, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'categories');
    });

    const unsubIncomes = onSnapshot(qIncomes, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Income));
      setIncomes(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'incomes');
    });

    return () => {
      unsubExpenses();
      unsubCategories();
      unsubIncomes();
    };
  }, [user]);

  // Set default category for expense form when categories load
  useEffect(() => {
    if (categories.length > 0 && !expenseForm.categoryId) {
      setExpenseForm(prev => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [categories]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => signOut(auth);

  // Expense CRUD
  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !expenseForm.amount || !expenseForm.categoryId) return;

    const data = {
      amount: parseFloat(expenseForm.amount),
      description: expenseForm.description || '',
      date: expenseForm.date,
      categoryId: expenseForm.categoryId,
      uid: user.uid
    };

    setIsSaving(true);
    try {
      if (editingExpense) {
        await updateDoc(doc(db, 'expenses', editingExpense.id), data);
      } else {
        await addDoc(collection(db, 'expenses'), data);
      }
      setIsAddExpenseModalOpen(false);
      setEditingExpense(null);
      setExpenseForm({
        amount: '',
        description: '',
        categoryId: categories[0]?.id || '',
        date: format(new Date(), 'yyyy-MM-dd')
      });
    } catch (error) {
      handleFirestoreError(error, editingExpense ? OperationType.UPDATE : OperationType.CREATE, 'expenses');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Expense',
      message: 'Are you sure you want to delete this expense? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'expenses', id));
        } catch (error) {
          console.error("Error deleting expense", error);
        }
      }
    });
  };

  const openEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      amount: expense.amount.toString(),
      description: expense.description,
      categoryId: expense.categoryId,
      date: expense.date
    });
    setIsAddExpenseModalOpen(true);
  };

  // Category CRUD
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !categoryForm.name) return;

    const data = {
      name: categoryForm.name,
      icon: categoryForm.icon,
      color: categoryForm.color,
      budget: categoryForm.budget ? parseFloat(categoryForm.budget) : 0,
      uid: user.uid
    };

    setIsSaving(true);
    try {
      if (editingCategory) {
        await updateDoc(doc(db, 'categories', editingCategory.id), data);
      } else {
        await addDoc(collection(db, 'categories'), data);
      }
      setIsAddCategoryModalOpen(false);
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        icon: AVAILABLE_ICONS[0],
        color: AVAILABLE_COLORS[0],
        budget: ''
      });
    } catch (error) {
      handleFirestoreError(error, editingCategory ? OperationType.UPDATE : OperationType.CREATE, 'categories');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const hasExpenses = expenses.some(e => e.categoryId === id);
    if (hasExpenses) {
      setConfirmModal({
        isOpen: true,
        title: 'Cannot Delete Category',
        message: 'Cannot delete category that has expenses. Please reassign or delete the expenses first.',
        onConfirm: () => {},
        variant: 'warning'
      });
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Delete Category',
      message: 'Are you sure you want to delete this category? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'categories', id));
        } catch (error) {
          console.error("Error deleting category", error);
        }
      }
    });
  };

  const openEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      icon: category.icon,
      color: category.color,
      budget: category.budget?.toString() || ''
    });
    setIsAddCategoryModalOpen(true);
  };

  // Income CRUD
  const handleSaveIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !incomeForm.amount || !incomeForm.description || !incomeForm.source) return;

    const data = {
      amount: parseFloat(incomeForm.amount),
      description: incomeForm.description,
      date: incomeForm.date,
      source: incomeForm.source,
      uid: user.uid
    };

    setIsSaving(true);
    try {
      if (editingIncome) {
        await updateDoc(doc(db, 'incomes', editingIncome.id), data);
      } else {
        await addDoc(collection(db, 'incomes'), data);
      }
      setIsAddIncomeModalOpen(false);
      setEditingIncome(null);
      setIncomeForm({
        amount: '',
        description: '',
        source: 'Salary',
        date: format(new Date(), 'yyyy-MM-dd')
      });
    } catch (error) {
      handleFirestoreError(error, editingIncome ? OperationType.UPDATE : OperationType.CREATE, 'incomes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteIncome = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Income Record',
      message: 'Are you sure you want to delete this income record? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'incomes', id));
        } catch (error) {
          console.error("Error deleting income", error);
        }
      }
    });
  };

  const openEditIncome = (income: Income) => {
    setEditingIncome(income);
    setIncomeForm({
      amount: income.amount.toString(),
      description: income.description,
      source: income.source,
      date: income.date
    });
    setIsAddIncomeModalOpen(true);
  };

  // Calculations
  const currentMonthExpenses = useMemo(() => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    return expenses.filter(e => isWithinInterval(parseISO(e.date), { start, end }));
  }, [expenses]);

  const currentMonthIncomes = useMemo(() => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    return incomes.filter(i => isWithinInterval(parseISO(i.date), { start, end }));
  }, [incomes]);

  const totalSpentThisMonth = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncomeThisMonth = currentMonthIncomes.reduce((sum, i) => sum + i.amount, 0);
  const totalBalance = incomes.reduce((sum, i) => sum + i.amount, 0) - expenses.reduce((sum, e) => sum + e.amount, 0);
  
  const monthlyBudget = categories.reduce((sum, c) => sum + (c.budget || 0), 0) || 2500;
  const budgetProgress = (totalSpentThisMonth / monthlyBudget) * 100;

  const categoryData = useMemo(() => {
    return categories.map(cat => ({
      name: cat.name,
      value: expenses.filter(e => e.categoryId === cat.id).reduce((sum, e) => sum + e.amount, 0),
      color: cat.color
    })).filter(d => d.value > 0);
  }, [expenses, categories]);

  const trendData = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => {
      const date = subMonths(new Date(), 5 - i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      const spent = expenses
        .filter(e => isWithinInterval(parseISO(e.date), { start, end }))
        .reduce((sum, e) => sum + e.amount, 0);
      return {
        month: format(date, 'MMM'),
        spent: spent
      };
    });
  }, [expenses]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-premium" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex flex-col lg:flex-row bg-slate-50 overflow-hidden">
        {/* Left Side: Marketing/Info */}
        <div className="hidden lg:flex flex-1 bg-zinc-950 p-16 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full -mr-40 -mt-40 blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full -ml-40 -mb-40 blur-[100px]" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-16">
              <div className="w-14 h-14 bg-white/5 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl">
                <Wallet className="text-white w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Financial <span className="text-indigo-500">Tracker</span></h1>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-xl"
            >
              <h2 className="text-6xl font-bold text-white leading-[1.1] mb-8 tracking-tight">
                Master your money with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">precision.</span>
              </h2>
              <p className="text-zinc-400 text-xl leading-relaxed mb-16 font-medium">
                The ultimate financial companion for modern professionals. Track, analyze, and grow your wealth with beautiful, data-driven insights.
              </p>

              <div className="grid grid-cols-2 gap-10">
                {[
                  { icon: TrendingUp, title: 'Income Tracking', desc: 'Monitor every revenue stream with ease.' },
                  { icon: Receipt, title: 'Expense Control', desc: 'Smarter categorization for better saving.' },
                  { icon: PieChartIcon, title: 'Budget Planning', desc: 'Set goals and watch your progress.' },
                  { icon: LayoutDashboard, title: 'Smart Insights', desc: 'AI-powered financial health reports.' },
                ].map((feature, idx) => (
                  <motion.div 
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (idx * 0.1) }}
                    className="flex gap-5"
                  >
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 shadow-lg">
                      <feature.icon className="text-indigo-400 w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg mb-1">{feature.title}</h3>
                      <p className="text-zinc-500 text-sm leading-relaxed">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="relative z-10 text-zinc-600 text-sm font-medium">
            © 2026 Financial Tracker. Built for the future of finance.
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-24 bg-white relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -ml-32 -mb-32" />

          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full relative z-10"
          >
            <div className="lg:hidden flex items-center justify-center gap-4 mb-16">
              <div className="w-14 h-14 bg-zinc-950 rounded-2xl flex items-center justify-center shadow-xl">
                <Wallet className="text-white w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold text-zinc-950 tracking-tight">Financial Tracker</h1>
            </div>

            <div className="text-center mb-12">
              <h3 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Welcome back</h3>
              <p className="text-slate-500 text-lg">Sign in to your account to continue managing your financial journey.</p>
            </div>

            <Button 
              onClick={handleLogin} 
              className="w-full py-4 text-lg font-bold flex items-center justify-center gap-4 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 shadow-premium transition-all active:scale-[0.98] rounded-2xl"
            >
              <img 
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                alt="Google" 
                className="w-6 h-6"
              />
              Continue with Google
            </Button>

            <div className="mt-16 pt-12 border-t border-slate-100">
              <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-8 justify-center">
                <div className="h-px bg-slate-100 flex-1" />
                <span>Trusted by modern teams</span>
                <div className="h-px bg-slate-100 flex-1" />
              </div>
              <div className="flex justify-center gap-10 opacity-30 grayscale contrast-125">
                <div className="font-black text-xl tracking-tighter">FINANCE</div>
                <div className="font-black text-xl tracking-tighter">SECURE</div>
                <div className="font-black text-xl tracking-tighter">TRUST</div>
              </div>
            </div>
            
            <p className="text-center mt-12 text-slate-400 text-xs font-medium leading-relaxed">
              By signing in, you agree to our <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a> and <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        handleLogout={handleLogout} 
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        <header className="h-16 lg:h-24 border-b border-slate-100 bg-white/70 backdrop-blur-xl sticky top-0 z-30 px-6 lg:px-12 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 capitalize tracking-tight">{activeTab}</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden lg:block">
              {format(new Date(), 'EEEE, MMMM do')}
            </p>
          </div>
          <div className="flex items-center gap-3 lg:gap-6">
            {activeTab === 'income' && (
              <Button onClick={() => { setEditingIncome(null); setIncomeForm({ amount: '', description: '', source: 'Salary', date: format(new Date(), 'yyyy-MM-dd') }); setIsAddIncomeModalOpen(true); }} className="px-4 lg:px-6 py-2 lg:py-3 text-sm font-bold rounded-2xl shadow-premium">
                <Plus className="w-4 h-4 lg:w-5 h-5" />
                <span className="hidden sm:inline">Add Income</span>
              </Button>
            )}
            {activeTab === 'expenses' && (
              <Button onClick={() => { setEditingExpense(null); setExpenseForm({ amount: '', description: '', categoryId: categories[0]?.id || '', date: format(new Date(), 'yyyy-MM-dd') }); setIsAddExpenseModalOpen(true); }} className="px-4 lg:px-6 py-2 lg:py-3 text-sm font-bold rounded-2xl shadow-premium">
                <Plus className="w-4 h-4 lg:w-5 h-5" />
                <span className="hidden sm:inline">Add Expense</span>
              </Button>
            )}
            {activeTab === 'categories' && (
              <Button onClick={() => { setEditingCategory(null); setCategoryForm({ name: '', icon: AVAILABLE_ICONS[0], color: AVAILABLE_COLORS[0], budget: '' }); setIsAddCategoryModalOpen(true); }} className="px-4 lg:px-6 py-2 lg:py-3 text-sm font-bold rounded-2xl shadow-premium">
                <Plus className="w-4 h-4 lg:w-5 h-5" />
                <span className="hidden sm:inline">Add Category</span>
              </Button>
            )}
            <div className="lg:hidden w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shadow-sm">
              <img src={user.photoURL || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-12 max-w-7xl mx-auto space-y-8 lg:space-y-12">
          {activeTab === 'dashboard' && (
            <Dashboard 
              expenses={expenses}
              categories={categories}
              totalSpentThisMonth={totalSpentThisMonth}
              totalIncomeThisMonth={totalIncomeThisMonth}
              totalBalance={totalBalance}
              budgetProgress={budgetProgress}
              monthlyBudget={monthlyBudget}
              trendData={trendData}
              categoryData={categoryData}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpenseTab 
              expenses={expenses}
              categories={categories}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              openEditExpense={openEditExpense}
              handleDeleteExpense={handleDeleteExpense}
            />
          )}

          {activeTab === 'categories' && (
            <CategoryTab 
              categories={categories}
              expenses={expenses}
              openEditCategory={openEditCategory}
              handleDeleteCategory={handleDeleteCategory}
              setIsAddCategoryModalOpen={setIsAddCategoryModalOpen}
              setEditingCategory={setEditingCategory}
              setCategoryForm={setCategoryForm}
            />
          )}

          {activeTab === 'income' && (
            <IncomeTab 
              incomes={incomes}
              openEditIncome={openEditIncome}
              handleDeleteIncome={handleDeleteIncome}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsTab 
              setActiveTab={setActiveTab} 
              expenses={expenses}
              categories={categories}
            />
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 px-6 py-3 flex items-center justify-between z-40">
        {[
          { id: 'dashboard', icon: LayoutDashboard },
          { id: 'income', icon: TrendingUp },
          { id: 'expenses', icon: Receipt },
          { id: 'categories', icon: PieChartIcon },
          { id: 'reports', icon: TrendingDown },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as TabType)}
            className={cn(
              "p-2 rounded-xl transition-all",
              activeTab === item.id 
                ? "bg-indigo-50 text-indigo-600" 
                : "text-zinc-400"
            )}
          >
            <item.icon className="w-6 h-6" />
          </button>
        ))}
      </nav>

      <ExpenseModal 
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
        editingExpense={editingExpense}
        expenseForm={expenseForm}
        setExpenseForm={setExpenseForm}
        handleSaveExpense={handleSaveExpense}
        categories={categories}
        isSaving={isSaving}
      />

      <CategoryModal 
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        editingCategory={editingCategory}
        categoryForm={categoryForm}
        setCategoryForm={setCategoryForm}
        handleSaveCategory={handleSaveCategory}
        isSaving={isSaving}
      />

      <IncomeModal 
        isOpen={isAddIncomeModalOpen}
        onClose={() => setIsAddIncomeModalOpen(false)}
        editingIncome={editingIncome}
        incomeForm={incomeForm}
        setIncomeForm={setIncomeForm}
        handleSaveIncome={handleSaveIncome}
        isSaving={isSaving}
      />

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        confirmText={confirmModal.variant === 'warning' ? 'OK' : 'Delete'}
        cancelText={confirmModal.variant === 'warning' ? '' : 'Cancel'}
      />
    </div>
  );
}
