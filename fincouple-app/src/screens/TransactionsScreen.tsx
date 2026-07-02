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
import { transactionService, Transaction } from '../services/transactionService';
import { budgetService } from '../services/budgetService';

const CATEGORIES: Record<string, string> = {
  food: '🍔',
  transport: '🚗',
  health: '🏥',
  entertainment: '🎮',
  shopping: '🛍️',
  bills: '📄',
  salary: '💼',
  investment: '📈',
  other: '📌',
};

export default function TransactionsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  const loadData = useCallback(async () => {
    if (!user) return;
    const data = await transactionService.getAll(user.uid);
    setTransactions(data);
  }, [user]);

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
      const result = await transactionService.syncPending(user.uid);
      await budgetService.syncPending(user.uid);
      if (result.error) {
        Alert.alert(
          'Erro de Sincronização',
          `Não foi possível enviar dados ao Firebase.\n\nDetalhe do erro: ${result.error.message || result.error}`
        );
      } else if (result.syncedCount > 0) {
        Alert.alert('Sincronização OK', `${result.syncedCount} transações enviadas para o Firebase!`);
      }
    }
    await loadData();
    setRefreshing(false);
  }

  function handleDelete(id: string) {
    Alert.alert('Excluir', 'Deseja excluir esta transação?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await transactionService.remove(id);
          await loadData();
        },
      },
    ]);
  }

  const filtered = filter === 'all' ? transactions : transactions.filter((t) => t.type === filter);

  function formatCurrency(value: number) {
    return 'R$ ' + value.toFixed(2).replace('.', ',');
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }

  function renderItem({ item }: { item: Transaction }) {
    return (
      <View style={styles.item}>
        <View style={styles.itemIcon}>
          <Text style={styles.itemEmoji}>{CATEGORIES[item.category] || '📌'}</Text>
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.itemDescription} numberOfLines={1}>{item.description}</Text>
          <View style={styles.itemMeta}>
            <Text style={styles.itemDate}>{formatDate(item.date)}</Text>
            {!item.synced && (
              <View style={styles.syncBadge}>
                <Text style={styles.syncText}>offline</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.rightActionContainer}>
          <Text style={[styles.itemAmount, { color: item.type === 'income' ? colors.income : colors.expense }]}>
            {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
          </Text>
          <TouchableOpacity
            style={styles.deleteButtonInline}
            onPress={() => handleDelete(item.id)}
          >
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {}
      <View style={styles.header}>
        <Text style={styles.title}>Transações</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddTransaction')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {}
      <View style={styles.filters}>
        {(['all', 'income', 'expense'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'Todas' : f === 'income' ? 'Receitas' : 'Despesas'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>Nenhuma transação ainda</Text>
            <Text style={styles.emptySubtext}>Toque no + para adicionar</Text>
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
  filters: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  item: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  itemEmoji: {
    fontSize: 20,
  },
  itemContent: {
    flex: 1,
  },
  itemDescription: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: spacing.sm,
  },
  itemDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  syncBadge: {
    backgroundColor: colors.warning + '30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  syncText: {
    fontSize: 10,
    color: colors.warning,
    fontWeight: '600',
  },
  itemAmount: {
    fontSize: 15,
    fontWeight: '700',
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
