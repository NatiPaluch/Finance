import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../theme';
import { useAuth } from '../hooks/useAuth';
import { transactionService } from '../services/transactionService';
import { budgetService } from '../services/budgetService';
import { authService } from '../services/authService';

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0, count: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const loadSummary = useCallback(async () => {
    if (!user) return;
    const data = await transactionService.getSummary(user.uid);
    setSummary(data);
  }, [user]);

  React.useEffect(() => {
    if (user) {
      loadSummary();
    }
  }, [user, loadSummary]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadSummary();
      }
    }, [user, loadSummary])
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
      await loadSummary();
    }
    setRefreshing(false);
  }

  function formatCurrency(value: number) {
    return 'R$ ' + value.toFixed(2).replace('.', ',');
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
      }
    >
      {}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {user?.displayName || 'Casal'} 👋</Text>
          <Text style={styles.headerSubtitle}>Resumo do mês</Text>
        </View>
        <TouchableOpacity onPress={() => authService.logout()}>
          <Ionicons name="log-out-outline" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Saldo do Mês</Text>
        <Text style={[styles.balanceValue, { color: summary.balance >= 0 ? colors.income : colors.expense }]}>
          {formatCurrency(summary.balance)}
        </Text>
        <Text style={styles.transactionCount}>{summary.count} transações este mês</Text>
      </View>

      {}
      <View style={styles.row}>
        <View style={[styles.card, { flex: 1, marginRight: spacing.sm }]}>
          <View style={styles.cardIcon}>
            <Ionicons name="arrow-up-circle" size={28} color={colors.income} />
          </View>
          <Text style={styles.cardLabel}>Receitas</Text>
          <Text style={[styles.cardValue, { color: colors.income }]}>
            {formatCurrency(summary.income)}
          </Text>
        </View>

        <View style={[styles.card, { flex: 1, marginLeft: spacing.sm }]}>
          <View style={styles.cardIcon}>
            <Ionicons name="arrow-down-circle" size={28} color={colors.expense} />
          </View>
          <Text style={styles.cardLabel}>Despesas</Text>
          <Text style={[styles.cardValue, { color: colors.expense }]}>
            {formatCurrency(summary.expense)}
          </Text>
        </View>
      </View>

      {}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('TransactionsTab', { screen: 'AddTransaction' })}
        >
          <View style={[styles.actionIcon, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="add-circle" size={24} color={colors.primary} />
          </View>
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>Nova Transação</Text>
            <Text style={styles.actionSubtitle}>Adicionar receita ou despesa</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('TransactionsTab')}
        >
          <View style={[styles.actionIcon, { backgroundColor: colors.secondary + '20' }]}>
            <Ionicons name="list" size={24} color={colors.secondary} />
          </View>
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>Ver Transações</Text>
            <Text style={styles.actionSubtitle}>Histórico completo</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  balanceCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  transactionCount: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardIcon: {
    marginBottom: spacing.sm,
  },
  cardLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  actionButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  actionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
