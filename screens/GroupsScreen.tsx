import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GroupRoom } from '../types/academic';
import { db } from '../services/database';
import { Theme } from '../constants/theme';
import { useTheme } from '../hooks/ThemeContext';

export default function GroupsScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors);

  const [activeSegment, setActiveSegment] = useState<'class' | 'pibg'>('class');
  const [rooms, setRooms] = useState<GroupRoom[]>([]);

  useEffect(() => {
    const fetchRooms = async () => {
      const allRooms = await db.getRooms(db.currentUser.role);
      const filtered = allRooms.filter(r => {
        if (activeSegment === 'class') {
          return r.type === 'class';
        } else {
          return r.type === 'pibg' || r.type === 'faculty';
        }
      });
      setRooms(filtered);
    };

    fetchRooms();
  }, [activeSegment, db.currentUser.role]);

  const renderRoomItem = ({ item }: { item: GroupRoom }) => {
    const getRoomIcon = (type: string) => {
      switch (type) {
        case 'class': return 'school-outline';
        case 'pibg': return 'people-outline';
        case 'faculty': return 'briefcase-outline';
        default: return 'chatbubble-ellipses-outline';
      }
    };

    const getRoomBadgeText = (type: string) => {
      switch (type) {
        case 'class': return 'Academic Class';
        case 'pibg': return 'Association / PIBG';
        case 'faculty': return 'Staff Lounge Only';
        default: return 'Room';
      }
    };

    return (
      <TouchableOpacity 
        style={styles.roomCard}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('GroupChat', { roomId: item.id, roomName: item.name })}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={getRoomIcon(item.type)} size={24} color={colors.primary} />
        </View>
        <View style={styles.roomInfo}>
          <Text style={styles.roomName}>{item.name}</Text>
          <Text style={styles.roomType}>{getRoomBadgeText(item.type)}</Text>
        </View>
        <View style={styles.enterContainer}>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appHeader}>
        <View style={styles.headerRow}>
          <Image 
            source={isDark ? require('../assets/Academix_dark.png') : require('../assets/Academix_light.png')} 
            style={styles.headerLogo} 
          />
          <Text style={styles.headerSubtitle}>Classrooms & Associations</Text>
        </View>
      </View>


      {/* Segmented Control */}
      <View style={styles.segmentedControl}>
        <TouchableOpacity 
          style={[styles.segmentButton, activeSegment === 'class' && styles.segmentButtonActive]}
          onPress={() => setActiveSegment('class')}
        >
          <Text style={[styles.segmentText, activeSegment === 'class' && styles.segmentTextActive]}>
            Class Rooms
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.segmentButton, activeSegment === 'pibg' && styles.segmentButtonActive]}
          onPress={() => setActiveSegment('pibg')}
        >
          <Text style={[styles.segmentText, activeSegment === 'pibg' && styles.segmentTextActive]}>
            Associations / Faculty
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        renderItem={renderRoomItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="lock-closed-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No channels available for your role.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: Theme.roundness.md,
    marginHorizontal: Theme.spacing.md,
    marginVertical: Theme.spacing.md,
    padding: Theme.spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: Theme.spacing.sm,
    alignItems: 'center',
    borderRadius: Theme.roundness.sm,
  },
  segmentButtonActive: {
    backgroundColor: colors.surfaceLight,
  },
  segmentText: {
    color: colors.textSecondary,
    fontWeight: Theme.typography.weights.semibold,
    fontSize: Theme.typography.sizes.base,
  },
  segmentTextActive: {
    color: colors.textPrimary,
  },
  listContent: {
    paddingHorizontal: Theme.spacing.md,
  },
  roomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: Theme.spacing.md,
    borderRadius: Theme.roundness.md,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: Theme.roundness.sm,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.md,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    color: colors.textPrimary,
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.bold,
  },
  roomType: {
    color: colors.textSecondary,
    fontSize: Theme.typography.sizes.xs,
    marginTop: 4,
  },
  enterContainer: {
    paddingLeft: Theme.spacing.sm,
  },
  emptyContainer: {
    padding: Theme.spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: Theme.typography.sizes.base,
    marginTop: Theme.spacing.md,
  }
});
