Trabalho de Lucas e Nathália
# FinCouple 

Aplicativo mobile simples e intuitivo de **controle financeiro pessoal**, construído com **React Native (Expo)** e **Firebase**, com arquitetura **offline-first**.

---

##  Como Funciona

1. **Offline-First:** Todas as receitas, despesas e limites de orçamento são salvos instantaneamente no armazenamento local do celular. Você pode registrar gastos mesmo sem conexão de internet (no metrô, viagens, etc.).
2. **Sincronização:** Quando a internet retorna, basta puxar para atualizar (pull-to-refresh) na tela inicial ou de transações para enviar seus dados locais de forma segura para o banco de dados remoto (Firebase).
3. **Controle por Categorias:** Permite definir limites de gastos por categoria (Alimentação, Transporte, Lazer, etc.) com barras de progresso que ajudam a visualizar o consumo do orçamento.

---

##  Tecnologias Utilizadas

*   **Front-end:** React Native com Expo (SDK 54) e React Navigation.
*   **Banco Local:** AsyncStorage (armazenamento rápido e offline).
*   **Back-end & Nuvem:** Cloud Firestore (banco de dados) e Firebase Auth (autenticação de usuários).

---

##  Como Executar o Projeto

### 1. Pré-requisitos
*   Node.js (versão 18 ou superior) instalado.
*   Expo Go instalado no seu celular (caso queira testar diretamente no aparelho).

### 2. Configurar Credenciais
Crie um arquivo `.env` dentro da pasta `fincouple-app/` e adicione as suas chaves do Firebase:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=sua_api_key_aqui
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_auth_domain_aqui
EXPO_PUBLIC_FIREBASE_DATABASE_URL=sua_database_url_aqui
EXPO_PUBLIC_FIREBASE_PROJECT_ID=seu_project_id_aqui
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_storage_bucket_aqui
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id_aqui
EXPO_PUBLIC_FIREBASE_APP_ID=seu_app_id_aqui
```

### 3. Rodar o App
Abra o seu terminal na raiz do projeto e execute:

```bash
# Entrar na pasta do aplicativo
cd fincouple-app

# Instalar as dependências
npm install

# Iniciar o Expo
npx expo start
```

Use o aplicativo Expo Go no celular para escanear o QR Code gerado no terminal e testar o app em tempo real.
