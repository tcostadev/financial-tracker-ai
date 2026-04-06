# FinPortal - Expense & Income Tracker

Um portal financeiro moderno para gerir as tuas despesas, rendimentos e orçamentos mensais.

## 🚀 Como fazer Deploy na Vercel

Este projeto foi construído com React, Vite e Firebase. Segue estes passos para o colocar online na Vercel.

### 1. Preparar o Código
1.  Faz o download do projeto ou faz o push para um repositório no **GitHub**.
2.  Certifica-te de que tens o ficheiro `package.json` na raiz.

### 2. Configurar o Firebase
Para que a aplicação funcione fora do AI Studio, precisas de garantir que o teu projeto Firebase permite o domínio da Vercel:
1.  Vai à [Consola do Firebase](https://console.firebase.google.com/).
2.  Seleciona o teu projeto.
3.  Vai a **Authentication** -> **Settings** -> **Authorized Domains**.
4.  Adiciona o domínio da tua aplicação Vercel (ex: `teu-projeto.vercel.app`).

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
