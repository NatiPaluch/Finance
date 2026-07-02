import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../config/firebase';

export type Transaction = {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string; 
  userId: string;
  synced: boolean;
};

const STORAGE_KEY = '@fincouple_transactions';

async function getLocalTransactions(): Promise<Transaction[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = data ? JSON.parse(data) : [];
    console.log('[Storage] Loaded transactions, count:', parsed.length);
    return parsed;
  } catch (e) {
    console.error('[Storage] Error loading transactions:', e);
    return [];
  }
}

async function saveLocalTransactions(transactions: Transaction[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    console.log('[Storage] Saved transactions, count:', transactions.length);
  } catch (e) {
    console.error('[Storage] Error saving transactions:', e);
  }
}



export const transactionService = {
  async getAll(userId: string): Promise<Transaction[]> {
    const all = await getLocalTransactions();
    return all
      .filter((t) => t.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async add(transaction: Omit<Transaction, 'id' | 'synced'>): Promise<Transaction> {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      synced: false,
    };

    const all = await getLocalTransactions();
    all.push(newTransaction);
    await saveLocalTransactions(all);

    
    db.collection('transactions').doc(newTransaction.id).set({
      ...newTransaction,
      synced: true,
    }).then(async () => {
      const currentAll = await getLocalTransactions();
      const updated = currentAll.map((t) =>
        t.id === newTransaction.id ? { ...t, synced: true } : t
      );
      await saveLocalTransactions(updated);
      console.log('[Sync] Transaction synced successfully');
    }).catch((err) => {
      console.log('[Sync] Offline or pending Firestore configuration, transaction saved locally only:', err);
    });

    return newTransaction;
  },

  async update(id: string, data: Partial<Transaction>): Promise<void> {
    const all = await getLocalTransactions();
    const updated = all.map((t) =>
      t.id === id ? { ...t, ...data, synced: false } : t
    );
    await saveLocalTransactions(updated);

    
    db.collection('transactions').doc(id).update({ ...data, synced: true }).then(async () => {
      const currentAll = await getLocalTransactions();
      const synced = currentAll.map((t) =>
        t.id === id ? { ...t, synced: true } : t
      );
      await saveLocalTransactions(synced);
      console.log('[Sync] Update synced successfully');
    }).catch((err) => {
      console.log('[Sync] Offline or pending Firestore configuration, update saved locally only:', err);
    });
  },

  async remove(id: string): Promise<void> {
    const all = await getLocalTransactions();
    const filtered = all.filter((t) => t.id !== id);
    await saveLocalTransactions(filtered);

    
    db.collection('transactions').doc(id).delete().then(() => {
      console.log('[Sync] Delete synced successfully');
    }).catch((err) => {
      console.log('[Sync] Offline or pending Firestore configuration, delete saved locally only:', err);
    });
  },

  async syncPending(userId: string): Promise<{ syncedCount: number; error: any }> {
    const all = await getLocalTransactions();
    const pending = all.filter((t) => t.userId === userId && !t.synced);
    let synced = 0;
    let syncError: any = null;

    for (const t of pending) {
      try {
        await db.collection('transactions').doc(t.id).set({ ...t, synced: true });
        synced++;
      } catch (err: any) {
        console.error('[Sync] Error syncing transaction:', err);
        syncError = err;
        break; 
      }
    }

    if (synced > 0) {
      const updated = all.map((t) => {
        if (pending.slice(0, synced).find((p) => p.id === t.id)) {
          return { ...t, synced: true };
        }
        return t;
      });
      await saveLocalTransactions(updated);
    }

    return { syncedCount: synced, error: syncError };
  },

  async getSummary(userId: string) {
    const transactions = await this.getAll(userId);
    const now = new Date();
    const monthTransactions = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const income = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expense, balance: income - expense, count: monthTransactions.length };
  },
};
