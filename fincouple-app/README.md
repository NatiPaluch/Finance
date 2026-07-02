# FinCouple 💰

Aplicativo mobile de **controle financeiro pessoal** construído com **React Native + Expo** no front-end e **Firebase** no back-end, com arquitetura **offline-first**.

## 📱 Funcionalidades

### Core
- ✅ **Autenticação** – Login e registro com Firebase Auth
- ✅ **Transações** – CRUD de receitas, despesas e gastos fixos com categoria e cartão
- ✅ **Orçamentos** – Limites de gastos mensais/semanais, com acompanhamento visual
- ✅ **Metas de Economia** – Metas com depósitos e barra de progresso
- ✅ **Cartões** – Cadastro de cartões para categorizar despesas
- ✅ **Relatórios** – Relatórios diários, semanais, mensais e anuais

### Relatórios Disponíveis
- Resumo de receitas vs. despesas por período
- Ranking de categorias mais gastas com percentual
- Gastos por cartão

### Offline-First
- ✅ **SQLite local** – Todos os dados são persistidos localmente com `expo-sqlite`
- ✅ **Fila de sincronização** – Toda mutação entra na `sync_queue`
- ✅ **Detecção de rede** – `@react-native-community/netinfo` monitora conexão
- ✅ **Sync automático** – Ao reconectar, push local → pull remoto
- ✅ **Resolução de conflitos** – Last-write-wins baseado em `updatedAt`
- ✅ **Banner offline** – UI indica quando o app está sem conexão

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────┐
│           React Native / Expo           │
│    (Telas, Navegação, Componentes)      │
├─────────────────────────────────────────┤
│     Context (Auth, Network, Data)       │
├──────────────────┬──────────────────────┤
│   SQLite Local   │  Sync Queue (FIFO)   │
│  (expo-sqlite)   │  push → Firestore    │
├──────────────────┴──────────────────────┤
│           Firebase (Cloud)              │
│   Auth  │  Firestore (user subcollections)
└─────────────────────────────────────────┘
```

## 📁 Estrutura de Pastas

```
fincouple-app/
├── App.tsx                        # Entry point com Providers
├── src/
│   ├── config/firebase.ts         # Config Firebase
│   ├── database/
│   │   ├── connection.ts          # Singleton SQLite
│   │   ├── schema.ts             # Schema + seed categorias
│   │   └── repositories/         # Repositórios CRUD por entidade
│   ├── services/
│   │   ├── firestoreService.ts   # Push/Pull Firestore
│   │   └── syncService.ts        # Lógica offline-first
│   ├── context/
│   │   ├── AuthContext.tsx        # Estado de autenticação
│   │   └── NetworkContext.tsx     # Estado de rede + auto-sync
│   ├── navigation/
│   │   └── AppNavigator.tsx      # Stack + Bottom Tabs
│   ├── screens/                   # Telas organizadas por feature
│   ├── components/                # Componentes reutilizáveis
│   ├── theme/index.ts            # Design system (cores, fontes)
│   ├── types/index.ts            # TypeScript definitions
│   └── utils/                    # Formatadores e validadores
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Expo CLI (`npx expo`)
- Expo Go no celular (para testar)

### Setup
```bash
cd fincouple-app
npm install
npx expo start
```

### Firebase
1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Ative **Authentication** (Email/Password)
3. Ative **Cloud Firestore**
4. Copie as credenciais para `src/config/firebase.ts`

## 🔧 Stack Técnica

| Camada | Tecnologia |
|---|---|
| **Framework** | React Native + Expo SDK 54 |
| **Linguagem** | TypeScript |
| **Navegação** | React Navigation (Stack + Bottom Tabs) |
| **Banco Local** | expo-sqlite (SQLite) |
| **Banco Remoto** | Cloud Firestore |
| **Autenticação** | Firebase Auth (email/senha) |
| **Rede** | @react-native-community/netinfo |
| **Persistência Auth** | @react-native-async-storage/async-storage |
| **Utilitários** | date-fns (datas), react-native-uuid (IDs) |

## 📊 Estratégia Offline-First

1. **Write local first** – Toda operação de CRUD grava imediatamente no SQLite
2. **Sync queue** – Cada mutação cria registro na tabela `sync_queue` (INSERT/UPDATE/DELETE)
3. **Network monitor** – `NetInfo` detecta mudanças de conectividade
4. **Auto-sync** – Ao reconectar: push pendentes → pull remotos
5. **Conflict resolution** – Last-write-wins via campo `updatedAt`

## 📋 Modelo de Dados

### Tabelas SQLite
- `categories` – Categorias de receita/despesa (com 16 padrões)
- `transactions` – Gastos, receitas e gastos fixos
- `budgets` – Orçamentos mensais/semanais por categoria
- `goals` – Metas de economia com depósitos
- `cards` – Cartões de crédito/débito
- `sync_queue` – Fila FIFO de sincronização

### Coleções Firestore
- `users/{userId}/categories`
- `users/{userId}/transactions`
- `users/{userId}/budgets`
- `users/{userId}/goals`
- `users/{userId}/cards`

## 👥 Público-Alvo

Jovens adultos e casais que buscam organização financeira pessoal, com necessidade de registrar gastos mesmo sem internet (transporte público, viagens, áreas rurais).

## 📄 Licença

Este projeto é de uso acadêmico.
