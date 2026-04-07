# FinPortal - Expense & Income Tracker

Um portal financeiro moderno para gerir as tuas despesas, rendimentos e orçamentos mensais.

## 🚀 Como fazer Deploy na Vercel

Este projeto foi construído com React, Vite e Firebase. Segue estes passos para o colocar online na Vercel.

### 1. Preparar o Código
1.  Faz o download do projeto ou faz o push para um repositório no **GitHub**.
2.  Certifica-te de que tens o ficheiro `package.json` na raiz.

### 2. Configurar o Firebase (Passo a Passo)

Para que a aplicação funcione com a tua própria base de dados, segue estes passos na [Consola do Firebase](https://console.firebase.google.com/):

#### A. Criar o Projeto
1.  Clica em **"Adicionar projeto"** e dá-lhe um nome (ex: `FinPortal`).
2.  Podes ativar ou desativar o Google Analytics conforme preferires.

#### B. Ativar Autenticação (Login)
1.  No menu lateral, vai a **Build** -> **Authentication**.
2.  Clica em **"Get Started"**.
3.  No separador **"Sign-in method"**, clica em **"Add new provider"** e seleciona **Google**.
4.  Ativa o provider, escolhe um e-mail de suporte e clica em **"Save"**.

#### C. Criar a Base de Dados (Firestore)
1.  No menu lateral, vai a **Build** -> **Firestore Database**.
2.  Clica em **"Create database"**.
3.  Escolhe a localização do servidor mais próxima de ti (ex: `europe-west`).
4.  Seleciona **"Start in test mode"** (vamos aplicar as regras reais no passo seguinte) e clica em **"Create"**.

#### D. Aplicar Regras de Segurança
1.  No Firestore, vai ao separador **"Rules"**.
2.  Copia o conteúdo do ficheiro `firestore.rules` deste projeto e cola-o lá.
3.  Clica em **"Publish"**. Isto garante que apenas tu podes ver os teus dados.

#### E. Obter as Credenciais
1.  Clica no ícone da **Roda Dentada** (Project Settings) ao lado de "Project Overview".
2.  Na secção **"Your apps"**, clica no ícone `</>` (Web) para registar a aplicação.
3.  Dá um nome à App (ex: `FinPortal Web`) e clica em **"Register app"**.
4.  Vais ver um objeto `firebaseConfig`. Guarda estes valores, pois vais precisar deles para as variáveis de ambiente na Vercel (ou no teu ficheiro local).

#### F. Domínios Autorizados
1.  Vai a **Authentication** -> **Settings** -> **Authorized Domains**.
2.  Adiciona o domínio onde a tua app vai estar (ex: `localhost` para testes locais e `teu-projeto.vercel.app` para produção).

### 3. Deploy na Vercel
1.  Cria uma conta na [Vercel](https://vercel.com).
2.  Clica em **"Add New"** -> **"Project"**.
3.  Importa o teu repositório do GitHub.
4.  Na secção **"Environment Variables"**, adiciona as seguintes variáveis (podes encontrar estes valores no teu ficheiro `firebase-applet-config.json` local):

| Variável | Valor (Exemplo) |
| :--- | :--- |
| `VITE_FIREBASE_API_KEY` | `AIzaSy...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `teu-projeto.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `teu-projeto-id` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `teu-projeto.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `123456789` |
| `VITE_FIREBASE_APP_ID` | `1:123456...` |
| `VITE_FIREBASE_FIRESTORE_DATABASE_ID` | `(default)` ou o ID no ficheiro config |

5.  Clica em **"Deploy"**.

---

## 🛠️ Desenvolvimento Local

Se quiseres correr o projeto na tua máquina:

1.  Instala as dependências:
    ```bash
    npm install
    ```
2.  Inicia o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```
3.  Abre `http://localhost:3000` no teu browser.

## 📄 Estrutura do Projeto

*   `/src/components`: Componentes modulares (Sidebar, Dashboard, etc).
*   `/src/firebase.ts`: Configuração e inicialização do Firebase.
*   `/src/types.ts`: Definições de tipos TypeScript.
*   `/src/constants.tsx`: Constantes globais (ícones, cores).

## 🔒 Segurança (Firestore Rules)

Não te esqueças de aplicar as regras de segurança no teu Firestore para proteger os dados dos utilizadores. Podes encontrar as regras sugeridas no ficheiro `firestore.rules`.

---
Desenvolvido com ❤️ no AI Studio.
