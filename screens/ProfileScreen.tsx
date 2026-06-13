import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Switch, TouchableOpacity, SafeAreaView, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db, usersTable } from '../services/database';
import { Theme } from '../constants/theme';
import { UserRole } from '../types/academic';
import { useTheme } from '../hooks/ThemeContext';

export default function ProfileScreen({ navigation }: any) {
  const { colors, themeMode, setThemeMode, isDark } = useTheme();
  const styles = createStyles(colors);

  const [dndEnabled, setDndEnabled] = useState(db.currentUser.dndEnabled);
  const [currentUser, setCurrentUser] = useState(db.currentUser);

  useEffect(() => {
    setCurrentUser(db.currentUser);
    setDndEnabled(db.currentUser.dndEnabled);
  }, [db.currentUser]);

  const handleToggleDnd = async (value: boolean) => {
    setDndEnabled(value);
    await db.updateDnd(value);
    console.log(`[WebSocket] DND state changed. Server updated: drop incoming alerts = ${value}`);
  };

  const handleSwitchUser = (userId: string) => {
    db.setCurrentUser(userId);
    setCurrentUser(db.currentUser);
    setDndEnabled(db.currentUser.dndEnabled);
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'teacher':
        return { borderColor: colors.roleTeacher, color: colors.roleTeacher, bg: `${colors.roleTeacher}15` };
      case 'parent':
        return { borderColor: colors.roleParent, color: colors.roleParent, bg: `${colors.roleParent}15` };
      case 'student':
        return { borderColor: colors.roleStudent, color: colors.roleStudent, bg: `${colors.roleStudent}15` };
    }
  };

  const badge = getRoleBadgeStyle(currentUser.role);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.appHeader}>
          <View style={styles.headerRow}>
            <Image 
              source={isDark ? require('../assets/Academix_dark.png') : require('../assets/Academix_light.png')} 
              style={styles.headerLogo} 
            />
            <Text style={styles.headerSubtitle}>User Settings</Text>
          </View>
        </View>


        {/* User Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarBig}>
            <Text style={styles.avatarBigText}>{currentUser.name.charAt(0)}</Text>
          </View>
          <Text style={styles.userName}>{currentUser.name}</Text>
          <View style={[styles.roleBadge, { borderColor: badge.borderColor, backgroundColor: badge.bg }]}>
            <Text style={[styles.roleBadgeText, { color: badge.color }]}>{currentUser.role.toUpperCase()}</Text>
          </View>
          <Text style={styles.userId}>User ID: {currentUser.id}</Text>
        </View>

        {/* Settings Block */}
        <Text style={styles.sectionTitle}>App Preferences</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons 
              name="notifications-off-outline" 
              size={22} 
              color={dndEnabled ? colors.dndActive : colors.textPrimary} 
            />
            <View style={styles.settingTexts}>
              <Text style={styles.settingLabel}>Do Not Disturb (DND)</Text>
              <Text style={styles.settingDesc}>Instructs WebSocket server to drop background incoming alerts.</Text>
            </View>
          </View>
          <Switch
            trackColor={{ false: colors.border, true: colors.primaryDark }}
            thumbColor={dndEnabled ? colors.dndActive : colors.textSecondary}
            ios_backgroundColor={colors.border}
            onValueChange={handleToggleDnd}
            value={dndEnabled}
          />
        </View>

        {/* Theme Settings Block */}
        <View style={styles.themeRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="color-palette-outline" size={22} color={colors.textPrimary} />
            <View style={styles.settingTexts}>
              <Text style={styles.settingLabel}>Theme Mode</Text>
              <Text style={styles.settingDesc}>Switch client interface visual values.</Text>
            </View>
          </View>
          <View style={styles.themeButtons}>
            {(['light', 'dark', 'system'] as const).map((mode) => {
              const isActive = themeMode === mode;
              return (
                <TouchableOpacity
                  key={mode}
                  style={[styles.themeBtn, isActive && styles.themeBtnActive]}
                  onPress={() => setThemeMode(mode)}
                >
                  <Text style={[styles.themeBtnText, isActive && styles.themeBtnTextActive]}>
                    {mode.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Dynamic Multi-role Simulator */}
        <Text style={styles.sectionTitle}>Role Testing Console</Text>
        <Text style={styles.simulatorDesc}>
          Tap any identity to swap active user roles in real-time. Notice how the Feed floating action button (FAB) and Group channels update.
        </Text>

        <View style={styles.usersList}>
          {usersTable.map((user) => {
            const isSelected = user.id === currentUser.id;
            const uBadge = getRoleBadgeStyle(user.role);

            return (
              <TouchableOpacity
                key={user.id}
                style={[styles.userSelectionCard, isSelected && styles.userSelected]}
                onPress={() => handleSwitchUser(user.id)}
              >
                <View style={styles.userSelectionLeft}>
                  <View style={[styles.avatarSmall, { backgroundColor: isSelected ? colors.primaryDark : colors.surfaceLight }]}>
                    <Text style={styles.avatarSmallText}>{user.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.userSelectionDetails}>
                    <Text style={[styles.userNameSmall, isSelected && styles.textPrimarySelected]}>{user.name}</Text>
                    <View style={[styles.roleBadgeSmall, { borderColor: uBadge.borderColor, backgroundColor: uBadge.bg }]}>
                      <Text style={[styles.roleBadgeSmallText, { color: uBadge.color }]}>{user.role.toUpperCase()}</Text>
                    </View>
                  </View>
                </View>
                {isSelected && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  appHeader: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLogo: {
    height: 44,
    width: 140,
    resizeMode: 'contain',
    marginVertical: -6,
  },
  headerSubtitle: {
    fontSize: Theme.typography.sizes.sm,
    color: colors.primary,
    fontWeight: Theme.typography.weights.semibold,
    marginTop: 2,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: Theme.roundness.lg,
    padding: Theme.spacing.xl,
    alignItems: 'center',
    marginHorizontal: Theme.spacing.lg,
    marginVertical: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...Theme.shadows.md,
  },
  avatarBig: {
    width: 80,
    height: 80,
    borderRadius: Theme.roundness.full,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.md,
  },
  avatarBigText: {
    color: colors.white,
    fontWeight: Theme.typography.weights.bold,
    fontSize: Theme.typography.sizes.xxl,
  },
  userName: {
    color: colors.textPrimary,
    fontSize: Theme.typography.sizes.xl,
    fontWeight: Theme.typography.weights.bold,
    marginBottom: Theme.spacing.sm,
  },
  roleBadge: {
    borderWidth: 1,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.roundness.md,
    marginBottom: Theme.spacing.sm,
  },
  roleBadgeText: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
  },
  userId: {
    color: colors.textSecondary,
    fontSize: Theme.typography.sizes.xs,
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.bold,
    textTransform: 'uppercase',
    marginHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: Theme.spacing.xs,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: Theme.spacing.md,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Theme.spacing.md,
  },
  settingTexts: {
    marginLeft: Theme.spacing.md,
    flex: 1,
  },
  settingLabel: {
    color: colors.textPrimary,
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.semibold,
  },
  settingDesc: {
    color: colors.textSecondary,
    fontSize: Theme.typography.sizes.xs,
    marginTop: 2,
  },
  themeButtons: {
    flexDirection: 'row',
  },
  themeBtn: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.roundness.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginLeft: Theme.spacing.xs,
  },
  themeBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  themeBtnText: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: Theme.typography.weights.bold,
  },
  themeBtnTextActive: {
    color: colors.white,
  },
  simulatorDesc: {
    color: colors.textSecondary,
    fontSize: Theme.typography.sizes.sm,
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    lineHeight: 18,
  },
  usersList: {
    marginHorizontal: Theme.spacing.lg,
  },
  userSelectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: Theme.spacing.md,
    borderRadius: Theme.roundness.md,
    marginBottom: Theme.spacing.sm,
  },
  userSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
  },
  userSelectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: Theme.roundness.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.md,
  },
  avatarSmallText: {
    color: colors.textPrimary,
    fontWeight: Theme.typography.weights.bold,
    fontSize: Theme.typography.sizes.base,
  },
  userSelectionDetails: {
    justifyContent: 'center',
  },
  userNameSmall: {
    color: colors.textSecondary,
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.semibold,
    marginBottom: 2,
  },
  textPrimarySelected: {
    color: colors.textPrimary,
  },
  roleBadgeSmall: {
    borderWidth: 1,
    paddingHorizontal: Theme.spacing.xs,
    paddingVertical: 1,
    borderRadius: Theme.roundness.sm,
    alignSelf: 'flex-start',
  },
  roleBadgeSmallText: {
    fontSize: 8,
    fontWeight: Theme.typography.weights.bold,
  }
});
