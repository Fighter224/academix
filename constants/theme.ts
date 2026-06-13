export const Theme = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  roundness: {
    sm: 6,
    md: 10,
    lg: 16,
    full: 9999,
  },
  typography: {
    fontFamily: 'System',
    sizes: {
      xs: 11,
      sm: 13,
      base: 15,
      lg: 18,
      xl: 22,
      xxl: 28,
    },
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    }
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 1.41,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3.84,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 4.65,
      elevation: 6,
    }
  },
  colors: {
    light: {
      // User specifications
      background: '#F8FAFC',      // Ice White
      surface: '#FFFFFF',         // Pure White
      textPrimary: '#0F172A',     // Near Black
      textSecondary: '#64748B',   // Slate Gray
      border: '#E2E8F0',          // Light Gray
      
      // Accents & Support
      surfaceLight: '#F1F5F9',    // Soft Gray input backgrounds
      primary: '#0284C7',         // Bright Navy Accent
      primaryDark: '#0369A1',     // Deep Navy
      accent: '#4F46E5',          // Indigo accent
      roleTeacher: '#D97706',     // Amber for Teacher
      roleParent: '#059669',      // Emerald for Parent
      roleStudent: '#2563EB',     // Blue for Student
      online: '#10B981',
      offline: '#64748B',
      dndActive: '#EF4444',
      checkSent: '#64748B',
      checkDelivered: '#64748B',
      checkRead: '#0284C7',
      white: '#FFFFFF',
      transparent: 'transparent',
      overlay: 'rgba(15, 23, 42, 0.4)',
    },
    dark: {
      // User specifications
      background: '#0F172A',      // Midnight
      surface: '#1E293B',         // Dark Slate
      textPrimary: '#F8FAFC',     // Ice White
      textSecondary: '#94A3B8',   // Cool Gray
      border: '#334155',          // Border Slate
      
      // Accents & Support
      surfaceLight: '#334155',    // Slate Gray input backgrounds
      primary: '#38BDF8',         // Sky Blue
      primaryDark: '#0284C7',     // Deep Blue
      accent: '#6366F1',          // Indigo accent
      roleTeacher: '#F59E0B',     // Amber for Teacher
      roleParent: '#10B981',      // Emerald for Parent
      roleStudent: '#3B82F6',     // Blue for Student
      online: '#10B981',
      offline: '#64748B',
      dndActive: '#EF4444',
      checkSent: '#94A3B8',
      checkDelivered: '#94A3B8',
      checkRead: '#38BDF8',
      white: '#FFFFFF',
      transparent: 'transparent',
      overlay: 'rgba(15, 23, 42, 0.85)',
    }
  }
};
