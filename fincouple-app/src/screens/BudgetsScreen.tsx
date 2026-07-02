import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../theme';
import { useAuth } from '../hooks/useAuth';
import { budgetService, Budget } from '../services/budgetService';
import { transactionService, Transaction } from '../services/transactionService';

const CATEGORIES: Record<string, { label: string; emoji: string }> = {
  food: { label: 'Alimentação', emoji: '🍔' },
  transport: { label: 'Transporte', emoji: '🚗' },
  health: { label: 'Saúde', emoji: '🏥' },
  entertainment: { label: 'Lazer', emoji: '🎮' },
  shopping: { label: 'Compras', emoji: '🛍️' },
  bills: { label: 'Contas', emoji: '📄' },
  salary: { label: 'Salário', emoji: '💼' },
  investment: { label: 'Investimento', emoji: '📈' },
  other: { label: 'Outro', emoji: '📌' },
};

interface BudgetWithSpent extends Budget {
  spent: number;
}

export default function BudgetsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<BudgetWithSpent[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');

  const loadData = useCallback(async () => {
    if (!user) return;
    const allBudgets = await budgetService.getAll(user.uid);
    const allTransactions = await transactionService.getAll(user.uid);

    const now = new Date();

    const budgetsWithSpent = allBudgets
      .filter((b) => b.period === period)
      .map((b) => {
        
        const spent = allTransactions
          .filter((t) => t.type === 'expense' && t.category === b.category)
          .filter((t) => {
            const tDate = new Date(t.date);
            if (period === 'weekly') {
              
              const oneWeekAgo = new Date();
              oneWeekAgo.setDate(now.getDate() - 7);
              return tDate >= oneWeekAgo;
            } else if (period === 'monthly') {
              
              return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
            } else {
              
              return tDate.getFullYear() === now.getFullYear();
            }
          })
          .reduce((sum, t) => sum + t.amount, 0);

        return { ...b, spent };
      });

    setBudgets(budgetsWithSpent);
  }, [user, period]);

  React.useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadData();
      }
    }, [user, loadData])
  );

  async function handleRefresh() {
    setRefreshing(true);
    if (user) {
      await budgetService.syncPending(user.uid);
    }
    await loadData();
    setRefreshing(false);
  }

  function handleDelete(id: string) {
    Alert.alert('Excluir Limite', 'Deseja excluir este orçamento de categoria?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await budgetService.remove(id);
          await loadData();
        },
      },
    ]);
  }

  function formatCurrency(value: number) {
    return 'R$ ' + value.toFixed(2).replace('.', ',');
  }

  function renderItem({ item }: { item: BudgetWithSpent }) {
    const percent = item.amount > 0 ? (item.spent / item.amount) * 100 : 0;
    const progressColor =
      percent >= 100 ? colors.danger : percent >= 75 ? colors.warning : colors.success;

    const catInfo = CATEGORIES[item.category] || { label: 'Outro', emoji: '📌' };

    return (
      <View style={styles.item}>
        <View style={styles.itemHeader}>
          <View style={styles.catRow}>
            <View style={styles.emojiContainer}>
              <Text style={styles.emoji}>{catInfo.emoji}</Text>
            </View>
            <View>
              <Text style={styles.catLabel}>{catInfo.label}</Text>
              <Text style={styles.periodText}>
                {item.period === 'weekly' ? 'Semanal' : item.period === 'monthly' ? 'Mensal' : 'Anual'}
              </Text>
            </View>
          </View>
          <View style={styles.rightActionContainer}>
            <View style={styles.amountContainer}>
              <Text style={styles.spentAmount}>{formatCurrency(item.spent)}</Text>
              <Text style={styles.limitAmount}>de {formatCurrency(item.amount)}</Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButtonInline}
              onPress={() => handleDelete(item.id)}
            >
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        {}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(percent, 100)}%`, backgroundColor: progressColor },
              ]}
            />
          </View>
          <Text style={[styles.percentText, { color: progressColor }]}>
            {percent.toFixed(0)}% utilizado
          </Text>
        </View>
      </View>
    );
  }

  const totalLimit = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalPercent = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;
  const totalColor =
    totalPercent >= 100 ? colors.danger : totalPercent >= 75 ? colors.warning : colors.success;

  return (
    <View style={styles.container}>
      {}
      <View style={styles.header}>
        <Text style={styles.title}>Orçamentos</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddBudget')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {}
      <View style={styles.tabs}>
        {(['weekly', 'monthly', 'yearly'] as const).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.tab, period === p && styles.tabActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.tabText, period === p && styles.tabTextActive]}>
              {p === 'weekly' ? 'Semanal' : p === 'monthly' ? 'Mensal' : 'Anual'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {}
      {totalLimit > 0 && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total do Período</Text>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryValue}>{formatCurrency(totalSpent)}</Text>
              <Text style={styles.summarySub}>Gasto total</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.summaryValue}>{formatCurrency(totalLimit)}</Text>
              <Text style={styles.summarySub}>Limite total</Text>
            </View>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(totalPercent, 100)}%`, backgroundColor: totalColor },
              ]}
            />
          </View>
          <Text style={[styles.summaryPercent, { color: totalColor }]}>
            {totalPercent.toFixed(0)}% do orçamento consumido
          </Text>
        </View>
      )}

      {}
      <FlatList
        data={budgets}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>Nenhum limite definido</Text>
            <Text style={styles.emptySubtext}>Defina limites para controlar seus gastos</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  summaryCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  summarySub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  summaryPercent: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: spacing.sm,
    textAlign: 'right',
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  item: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emojiContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 18,
  },
  catLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  periodText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  spentAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  limitAmount: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  progressContainer: {
    marginTop: spacing.md,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  percentText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'right',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  rightActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  deleteButtonInline: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
});
