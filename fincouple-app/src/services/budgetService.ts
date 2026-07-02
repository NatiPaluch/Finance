import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../config/firebase';

export type Budget = {
  id: string;
  category: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  userId: string;
  synced: boolean;
};

const STORAGE_KEY = '@fincouple_budgets';

async function getLocalBudgets(): Promise<Budget[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = data ? JSON.parse(data) : [];
    console.log('[Storage] Loaded budgets, count:', parsed.length);
    return parsed;
  } catch (e) {
    console.error('[Storage] Error loading budgets:', e);
    return [];
  }
}

async function saveLocalBudgets(budgets: Budget[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
    console.log('[Storage] Saved budgets, count:', budgets.length);
  } catch (e) {
    console.error('[Storage] Error saving budgets:', e);
  }
}

export const budgetService = {
  async getAll(userId: string): Promise<Budget[]> {
    const all = await getLocalBudgets();
    return all.filter((b) => b.userId === userId);
  },

  async add(budget: Omit<Budget, 'id' | 'synced'>): Promise<Budget> {
    const newBudget: Budget = {
      ...budget,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      synced: false,
    };

    const all = await getLocalBudgets();
    all.push(newBudget);
    await saveLocalBudgets(all);

    
    db.collection('budgets').doc(newBudget.id).set({
      ...newBudget,
      synced: true,
    }).then(async () => {
      const currentAll = await getLocalBudgets();
      const updated = currentAll.map((b) =>
        b.id === newBudget.id ? { ...b, synced: true } : b
      );
      await saveLocalBudgets(updated);
      console.log('[Sync] Budget synced successfully');
    }).catch((err) => {
      console.log('[Sync] Offline, budget saved locally only:', err);
    });

    return newBudget;
  },

  async remove(id: string): Promise<void> {
    const all = await getLocalBudgets();
    const filtered = all.filter((b) => b.id !== id);
    await saveLocalBudgets(filtered);

    db.collection('budgets').doc(id).delete().then(() => {
      console.log('[Sync] Budget deletion synced successfully');
    }).catch((err) => {
      console.log('[Sync] Offline, budget deletion saved locally:', err);
    });
  },

  async syncPending(userId: string): Promise<{ syncedCount: number; error: any }> {
    const all = await getLocalBudgets();
    const pending = all.filter((b) => b.userId === userId && !b.synced);
    let synced = 0;
    let syncError: any = null;

    for (const b of pending) {
      try {
        await db.collection('budgets').doc(b.id).set({ ...b, synced: true });
        synced++;
      } catch (err: any) {
        console.error('[Sync] Error syncing budget:', err);
        syncError = err;
        break;
      }
    }

    if (synced > 0) {
      const updated = all.map((b) => {
        if (pending.slice(0, synced).find((p) => p.id === b.id)) {
          return { ...b, synced: true };
        }
        return b;
      });
      await saveLocalBudgets(updated);
    }
    return { syncedCount: synced, error: syncError };
  },
};
