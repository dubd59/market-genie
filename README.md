# 🧞‍♂️ Market Genie - AI-Powered Marketing Automation SaaS

<div align="center">
  <img src="public/genie-lamp.svg" width="120" height="120" alt="Market Genie Logo" />
  
  **Transform your marketing with AI-powered automation, lead scoring, and campaign optimization.**
  
  [![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-5.4.19-646CFF.svg)](https://vitejs.dev/)
  [![Supabase](https://img.shields.io/badge/Supabase-Ready-3ECF8E.svg)](https://supabase.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.6-38B2AC.svg)](https://tailwindcss.com/)
  [![Three.js](https://img.shields.io/badge/Three.js-3D%20Analytics-000000.svg)](https://threejs.org/)
</div>

---

## 🚀 **Competitive Differentiators**

### 🧠 **1. AI-First Experience**
- **Natural Language Interface**: Ask the AI genie to create campaigns, analyze data, or optimize performance
- **Voice Commands**: Speech-to-text integration for hands-free operation
- **Smart Suggestions**: Context-aware recommendations throughout the platform

### 📊 **2. 3D Analytics Visualization** 
- **Interactive Funnel**: Three.js powered 3D funnel visualization
- **Immersive Data Exploration**: Click and explore conversion stages in 3D space
- **Real-time Metrics**: Live updating analytics with stunning visual presentation

### 🔧 **3. Self-Healing Campaigns**
- **Automatic Health Monitoring**: AI continuously monitors campaign performance
- **Auto-Optimization**: Campaigns automatically improve themselves
- **Predictive Alerts**: Get notified before problems impact performance

### 🎨 **4. Visual Workflow Builder**
- **Drag-and-Drop Interface**: Build complex automation workflows visually
- **Block-Based Design**: Modular components for emails, SMS, social media, and more
- **Real-time Preview**: See your campaigns come to life as you build

### ✨ **5. Advanced UX Features**
- **Voice Control**: Hands-free interaction throughout the platform
- **Responsive Design**: Perfect experience on desktop, tablet, and mobile
- **Custom Animations**: Smooth transitions and delightful micro-interactions
- **Genie Theme**: Unique magical branding that stands out from competitors

---

## 🛠️ **Tech Stack**

### **Frontend**
- **React 18.2.0** - Modern React with hooks and context
- **Vite 5.4.19** - Lightning-fast build tool and dev server
- **Tailwind CSS 3.3.6** - Utility-first CSS framework
- **Framer Motion 10.16.16** - Smooth animations and transitions
- **Three.js 0.158.0** - 3D graphics and visualization

### **UI Components**
- **@heroicons/react** - Beautiful SVG icons
- **Lucide React** - Additional icon library
- **react-beautiful-dnd** - Drag and drop functionality
- **react-hot-toast** - Elegant notifications

### **Backend & Data**
**Firebase** - Campaign management and authentication
**Appwrite** - Analytics, self-healing, and serverless functions
**PostgreSQL** - Analytics data storage

### **AI & Voice**
- **Web Speech API** - Voice recognition and synthesis
- **Custom AI Integration** - Ready for OpenAI/Claude integration
- **Natural Language Processing** - Smart command interpretation

---

## 🏗️ **Architecture**

```
src/
├── components/
│   ├── ai/              # AI-related components (GenieConsole, GenieLamp)
│   ├── layout/          # Layout components (Sidebar, TopNav, Layout)
│   └── ui/              # Reusable UI components (Funnel3D)
├── contexts/            # React contexts for state management
├── features/            # Feature-specific components
│   ├── self-healing/    # Campaign health monitoring
│   └── voice-control/   # Voice command functionality
├── hooks/               # Custom React hooks
├── pages/               # Main application pages
├── services/            # API and external service integrations
└── assets/              # Static assets and styles
```

---

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Git

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/market-genie.git
   cd market-genie
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your backend credentials:
   ```env
   APPWRITE_ENDPOINT=https://appwrite.genielabs.com
   POSTGRES_PRIVATE_KEY=${DB_PASSWORD}
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

---

## 📱 **Features**

### **Dashboard**
- 3D funnel visualization with interactive stages
- Real-time campaign health monitoring
- AI-powered insights and recommendations
- Voice-activated commands and queries

### **Campaign Builder**
- Visual drag-and-drop workflow creation
- Pre-built automation blocks (Email, SMS, Social, Wait, Conditions)
- Real-time campaign health scoring
- Self-healing suggestions and auto-optimization

### **Contact Management**
- AI-powered lead scoring and segmentation
- Smart filtering and bulk operations
- Engagement tracking and behavioral analysis
- Automatic list hygiene and optimization

### **AI Genie Console**
- Natural language campaign creation
- Voice-to-text command interface
- Smart suggestions based on context
- Historical wish/command tracking

### **Settings & Administration**
- User profile and team management
- Billing and subscription management
- Integration settings and API keys
- Notification preferences and alerts

---

## 🔧 **Development**

### **Available Scripts**

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage
```

### **Code Quality**
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** support ready
- **Testing** with Vitest and React Testing Library

---

## 🌐 **Deployment**

### **Production Build**
```bash
npm run build
```

### **Deployment Options**
- **Vercel** (recommended for frontend)
- **Netlify** 
- **AWS S3 + CloudFront**
- **Docker** containers

### **Backend Setup (Firebase, Appwrite, PostgreSQL)**
1. Set up Firebase project and configure Firestore rules
2. Set up Appwrite server and PostgreSQL database
3. Run migrations in `backend/appwrite/products/marketgenie/analytics/migrations/`
4. Update environment variables

---

## 🤝 **Contributing**

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

- **React Team** for the amazing framework
- **Three.js** for 3D visualization capabilities
- **Tailwind CSS** for the utility-first approach
- **Framer Motion** for smooth animations

---

## 📞 **Support**

- **AI Support Portal (24/7)**: [Support Genie Help Center](https://supportgenie.help/customer?tenant=supportgenie-tenant)
- **Email Support**: Help@dubdproducts.com
- **Issues**: [GitHub Issues](https://github.com/yourusername/market-genie/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/market-genie/discussions)

---

<div align="center">
  <p><strong>Built with ❤️ by the Market Genie Team</strong></p>
  <p>🧞‍♂️ <em>Your wish is our command!</em> 🧞‍♂️</p>
</div>
