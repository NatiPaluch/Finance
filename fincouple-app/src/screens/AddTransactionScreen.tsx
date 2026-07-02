import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../theme';
import { useAuth } from '../hooks/useAuth';
import { transactionService } from '../services/transactionService';

const CATEGORIES = [
  { key: 'food', label: 'Alimentação', emoji: '🍔' },
  { key: 'transport', label: 'Transporte', emoji: '🚗' },
  { key: 'health', label: 'Saúde', emoji: '🏥' },
  { key: 'entertainment', label: 'Lazer', emoji: '🎮' },
  { key: 'shopping', label: 'Compras', emoji: '🛍️' },
  { key: 'bills', label: 'Contas', emoji: '📄' },
  { key: 'salary', label: 'Salário', emoji: '💼' },
  { key: 'investment', label: 'Investimento', emoji: '📈' },
  { key: 'other', label: 'Outro', emoji: '📌' },
];

export default function AddTransactionScreen({ navigation }: any) {
  const { user } = useAuth();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('other');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!description.trim()) {
      Alert.alert('Erro', 'Informe uma descrição');
      return;
    }
    const numAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Erro', 'Informe um valor válido');
      return;
    }
    if (!user) {
      Alert.alert('Erro', 'Usuário não autenticado');
      return;
    }

    setLoading(true);
    try {
      await transactionService.add({
        description: description.trim(),
        amount: numAmount,
        type,
        category,
        date: new Date().toISOString(),
        userId: user.uid,
      });
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível salvar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      {}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Nova Transação</Text>
        <View style={{ width: 24 }} />
      </View>

      {}
      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[styles.typeButton, type === 'expense' && styles.typeExpenseActive]}
          onPress={() => setType('expense')}
        >
          <Ionicons
            name="arrow-down-circle"
            size={20}
            color={type === 'expense' ? '#fff' : colors.expense}
          />
          <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>Despesa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeButton, type === 'income' && styles.typeIncomeActive]}
          onPress={() => setType('income')}
        >
          <Ionicons
            name="arrow-up-circle"
            size={20}
            color={type === 'income' ? '#fff' : colors.income}
          />
          <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>Receita</Text>
        </TouchableOpacity>
      </View>

      {}
      <View style={styles.amountContainer}>
        <Text style={styles.currencySign}>R$</Text>
        <TextInput
          style={styles.amountInput}
          placeholder="0,00"
          placeholderTextColor={colors.textSecondary}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />
      </View>

      {}
      <View style={styles.field}>
        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Supermercado, Uber, etc."
          placeholderTextColor={colors.textSecondary}
          value={description}
          onChangeText={setDescription}
        />
      </View>

      {}
      <View style={styles.field}>
        <Text style={styles.label}>Categoria</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[styles.categoryItem, category === cat.key && styles.categoryActive]}
              onPress={() => setCategory(cat.key)}
            >
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text
                style={[styles.categoryLabel, category === cat.key && styles.categoryLabelActive]}
                numberOfLines={1}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {}
      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Salvar Transação</Text>
        )}
      </TouchableOpacity>
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
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  typeRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeExpenseActive: {
    backgroundColor: colors.expense,
    borderColor: colors.expense,
  },
  typeIncomeActive: {
    backgroundColor: colors.income,
    borderColor: colors.income,
  },
  typeText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  typeTextActive: {
    color: '#fff',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  currencySign: {
    fontSize: 24,
    color: colors.textSecondary,
    fontWeight: '600',
    marginRight: spacing.sm,
  },
  amountInput: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.text,
    minWidth: 120,
    textAlign: 'center',
  },
  field: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryItem: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryActive: {
    backgroundColor: colors.primary + '30',
    borderColor: colors.primary,
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  categoryLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
