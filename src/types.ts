export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  budget?: number;
  uid: string;
};

export type Expense = {
  id: string;
  amount: number;
  description?: string;
  date: string;
  categoryId: string;
  uid: string;
};

export type Income = {
  id: string;
  amount: number;
  description: string;
  date: string;
  source: string;
  uid: string;
};

export type TabType = 'dashboard' | 'expenses' | 'categories' | 'income' | 'reports';
