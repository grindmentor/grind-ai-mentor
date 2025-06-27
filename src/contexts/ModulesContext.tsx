import React, { createContext, useState, useContext } from 'react';
import { Activity, BarChart3, BookOpen, Calendar, CheckCircle, Cloud, Code, CreditCard, Flame, LayoutDashboard, ListChecks, LucideIcon, Mailbox, MessageSquare, Monitor, Settings, Shield, ShoppingCart, Star, User, Users, Wallet, Weight, Brain } from 'lucide-react';

export interface Module {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  component: React.ComponentType<any>;
  gradient: string;
  isPremium?: boolean;
  category: string;
  isNew?: boolean;
}

interface ModulesContextType {
  modules: Module[];
}

const ModulesContext = createContext<ModulesContextType | undefined>(undefined);

export const ModulesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modules] = useState<Module[]>([
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Central hub for all your fitness metrics and insights',
      icon: LayoutDashboard,
      component: () => <div>Dashboard Content</div>,
      gradient: 'from-blue-500/30 to-purple-600/40',
      category: 'core'
    },
    {
      id: 'workout-library',
      title: 'Workout Library',
      description: 'Explore a vast collection of exercises and routines',
      icon: ListChecks,
      component: () => <div>Workout Library Content</div>,
      gradient: 'from-green-500/30 to-teal-600/40',
      category: 'training'
    },
    {
      id: 'nutrition-tracker',
      title: 'Nutrition Tracker',
      description: 'Log your meals and track your macronutrient intake',
      icon: Flame,
      component: () => <div>Nutrition Tracker Content</div>,
      gradient: 'from-orange-500/30 to-red-600/40',
      category: 'tracking'
    },
    {
      id: 'progress-hub',
      title: 'Progress Hub',
      description: 'Visualize your fitness journey with detailed analytics',
      icon: BarChart3,
      component: () => <div>Progress Hub Content</div>,
      gradient: 'from-purple-500/30 to-pink-600/40',
      category: 'tracking'
    },
    {
      id: 'ai-coach',
      title: 'AI Fitness Coach',
      description: 'Get personalized workout and nutrition recommendations',
      icon: Brain,
      component: () => <div>AI Coach Content</div>,
      gradient: 'from-yellow-500/30 to-lime-600/40',
      category: 'ai',
      isNew: true
    },
    {
      id: 'meal-planner',
      title: 'AI Meal Planner',
      description: 'Generate custom meal plans based on your dietary needs',
      icon: Mailbox,
      component: () => <div>Meal Planner Content</div>,
      gradient: 'from-teal-500/30 to-cyan-600/40',
      category: 'ai'
    },
    {
      id: 'community-forum',
      title: 'Community Forum',
      description: 'Connect with fellow fitness enthusiasts and share tips',
      icon: MessageSquare,
      component: () => <div>Community Forum Content</div>,
      gradient: 'from-indigo-500/30 to-violet-600/40',
      category: 'social'
    },
    {
      id: 'settings-panel',
      title: 'Settings Panel',
      description: 'Customize your app preferences and manage your account',
      icon: Settings,
      component: () => <div>Settings Panel Content</div>,
      gradient: 'from-gray-500/30 to-stone-600/40',
      category: 'core'
    },
    {
      id: 'module-builder',
      title: 'Custom Module Builder',
      description: 'Design your own fitness modules with custom code',
      icon: Code,
      component: () => <div>Module Builder Content</div>,
      gradient: 'from-orange-600/30 to-yellow-700/40',
      category: 'development'
    },
    {
      id: 'ecommerce-store',
      title: 'eCommerce Store',
      description: 'Purchase premium workout programs and fitness gear',
      icon: ShoppingCart,
      component: () => <div>eCommerce Store Content</div>,
      gradient: 'from-red-600/30 to-pink-700/40',
      category: 'commerce'
    },
    {
      id: 'subscription-manager',
      title: 'Subscription Manager',
      description: 'Manage your premium subscription and billing details',
      icon: CreditCard,
      component: () => <div>Subscription Manager Content</div>,
      gradient: 'from-lime-600/30 to-green-700/40',
      category: 'commerce'
    },
    {
      id: 'data-sync',
      title: 'Data Sync & Backup',
      description: 'Securely sync and backup your fitness data to the cloud',
      icon: Cloud,
      component: () => <div>Data Sync Content</div>,
      gradient: 'from-cyan-600/30 to-blue-700/40',
      category: 'utility'
    },
    {
      id: 'security-center',
      title: 'Security Center',
      description: 'Manage your account security settings and privacy options',
      icon: Shield,
      component: () => <div>Security Center Content</div>,
      gradient: 'from-teal-600/30 to-emerald-700/40',
      category: 'utility'
    },
    {
      id: 'user-management',
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      icon: Users,
      component: () => <div>User Management Content</div>,
      gradient: 'from-fuchsia-600/30 to-pink-700/40',
      category: 'admin'
    },
    {
      id: 'activity-monitor',
      title: 'Real-time Activity Monitor',
      description: 'Track user activity and engagement metrics in real-time',
      icon: Monitor,
      component: () => <div>Activity Monitor Content</div>,
      gradient: 'from-purple-600/30 to-indigo-700/40',
      category: 'admin'
    },
    {
      id: 'rewards-program',
      title: 'Rewards Program',
      description: 'Earn rewards and unlock exclusive content',
      icon: Wallet,
      component: () => <div>Rewards Program Content</div>,
      gradient: 'from-rose-600/30 to-red-700/40',
      category: 'engagement'
    },
    {
      id: 'goal-setting',
      title: 'Goal Setting',
      description: 'Set personalized fitness goals and track your progress',
      icon: CheckCircle,
      component: () => <div>Goal Setting Content</div>,
      gradient: 'from-amber-600/30 to-orange-700/40',
      category: 'tracking'
    },
    {
      id: 'body-metrics',
      title: 'Body Metrics Tracker',
      description: 'Track key body measurements and visualize changes over time',
      icon: Weight,
      component: () => <div>Body Metrics Tracker Content</div>,
      gradient: 'from-emerald-600/30 to-green-700/40',
      category: 'tracking'
    },
    {
      id: 'scientific-research',
      title: 'Scientific Research Database',
      description: 'Access a curated database of fitness and nutrition studies',
      icon: BookOpen,
      component: () => <div>Scientific Research Content</div>,
      gradient: 'from-sky-600/30 to-blue-700/40',
      category: 'education'
    },
    {
      id: 'physique-ai',
      title: 'Physique AI',
      description: 'Advanced body composition analysis and physique optimization recommendations',
      icon: User,
      component: () => <div>Workout Library Content</div>,
      gradient: 'from-pink-500/30 to-purple-600/40',
      isPremium: true, // Make this premium-only
      category: 'analysis'
    },
  ]);

  return (
    <ModulesContext.Provider value={{ modules }}>
      {children}
    </ModulesContext.Provider>
  );
};

export const useModules = () => {
  const context = useContext(ModulesContext);
  if (!context) {
    throw new Error('useModules must be used within a ModulesProvider');
  }
  return context;
};

// Default export for backward compatibility
export default ModulesProvider;
