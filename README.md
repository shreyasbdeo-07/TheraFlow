# 🌿 TheraFlow — AI Mental Wellness Companion

A calm, private, and emotionally supportive AI therapy web app built with **Next.js 14**, **Firebase**, and your choice of LLM provider.

---

## ✨ Features

| Feature | Description |
|---|---|
| 💬 AI Chat | Compassionate conversations powered by an LLM (ChatGPT, Claude, or Gemini) |
| 🌤️ Daily Mood Check-In | Log how you feel with emoji moods |
| 📊 Mood Tracker | 14-day visual chart of your emotional history |
| 📓 Personal Journal | Private reflection journal stored securely |
| 💾 Chat History | All conversations saved, browsable, and deletable |
| 🔒 Auth | Firebase email/password authentication |
| 🛡️ Security | Firestore row-level security rules; API key never exposed to browser |

---

## 🗂️ Project Structure

```
theraflow/
├── app/
│   ├── page.js                  # Home / landing page
│   ├── about/page.js            # About page
│   ├── privacy/page.js          # Privacy policy
│   ├── login/page.js            # Login
│   ├── signup/page.js           # Sign up
│   ├── dashboard/
│   │   ├── layout.js            # Auth-guarded dashboard shell + sidebar
│   │   ├── page.js              # Main chat interface
│   │   ├── mood/page.js         # Daily check-in + mood tracker
│   │   ├── journal/page.js      # Personal journal
│   │   ├── history/page.js      # Chat history list
│   │   └── settings/page.js     # Profile & account settings
│   ├── api/
│   │   └── chat/route.js        # 🔐 Secure LLM backend API route
│   └── globals.css              # Tailwind + custom styles
├── components/
│   ├── Navbar.js                # Public navbar
│   ├── Sidebar.js               # Dashboard sidebar
│   ├── MessageBubble.js         # Chat message bubble
│   └── TypingIndicator.js       # Animated typing dots
├── lib/
│   ├── firebase.js              # Firebase app init
│   └── firestore.js             # All Firestore read/write helpers
├── firestore.rules              # Firestore security rules
├── .env.local.example           # Environment variable template
├── .gitignore
├── jsconfig.json
├── tailwind.config.js
├── next.config.js
└── package.json
```

---

## 🚀 Setup Instructions

### Step 1 — Install dependencies

```bash
npm install
# or
yarn install
```

---

### Step 2 — Set up Firebase

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"** → give it a name (e.g. `theraflow`) → Continue
3. Disable Google Analytics if you don't need it → **Create project**

#### Enable Authentication
4. In the left sidebar → **Build → Authentication**
5. Click **"Get started"**
6. Under **Sign-in method** → Enable **Email/Password** → Save

#### Create Firestore Database
7. In the left sidebar → **Build → Firestore Database**
8. Click **"Create database"**
9. Choose **"Start in production mode"** → select your region → Done

#### Deploy Security Rules
10. Copy `firestore.rules` into the **Firestore → Rules** tab in the Firebase Console and click **Publish**

*Alternatively, install the Firebase CLI and run:*
```bash
npm install -g firebase-tools
firebase login
firebase init firestore
firebase deploy --only firestore:rules
```

#### Get your Firebase config
11. In Firebase Console → **Project Settings** (gear icon) → **Your apps**
12. Click **"</> Web"** → register app → copy the config object

---

### Step 3 — Configure environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in:

```env
# Firebase (from Step 2)
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# LLM Provider — choose ONE and set your key
LLM_PROVIDER=openai          # or: anthropic / gemini
LLM_API_KEY=sk-...           # Your API key
```

> **Note:** Without an LLM key the app runs in **placeholder mode** — it returns simulated empathetic responses so you can test the full UI without any API costs.

---

### Step 4 — Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

### Step 5 — Production build

```bash
npm run build
npm start
```

---

## 🔐 API Key Security

The `LLM_API_KEY` is stored in `.env.local` and accessed **only inside `app/api/chat/route.js`** — a Next.js Server Route that runs on the server. It is **never sent to the browser**. The frontend only calls `/api/chat` via `fetch()`.

---

## 🤖 Switching LLM Providers

Open `app/api/chat/route.js` and set `LLM_PROVIDER` in your `.env.local`:

| Provider | `LLM_PROVIDER` value | Model used |
|---|---|---|
| OpenAI | `openai` | `gpt-4o` |
| Anthropic | `anthropic` | `claude-opus-4-6` |
| Google Gemini | `gemini` | `gemini-1.5-flash` |
| Demo/Test | `placeholder` (default) | Built-in simulated responses |

---

## 🎨 Customization

- **Colors**: Edit `tailwind.config.js` → `theme.extend.colors`
- **Fonts**: Edit `app/globals.css` → `@import` + `tailwind.config.js` → `fontFamily`
- **AI personality**: Edit the `SYSTEM_PROMPT` in `app/api/chat/route.js`
- **Mood options**: Edit the `MOODS` array in `app/dashboard/mood/page.js`
- **Suggestion chips**: Edit the `SUGGESTIONS` array in `app/dashboard/page.js`

---

## ⚠️ Disclaimer

TheraFlow is a **wellness tool, not a licensed therapy service**. It does not provide clinical diagnoses, medical advice, or crisis intervention. Always encourage users to seek professional mental health support when needed.

---

## 📄 License

MIT — free to use, modify, and deploy for personal or commercial projects.
