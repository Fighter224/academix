import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, RefreshControl, Image, TextInput, Modal, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SchoolThread } from '../types/academic';
import { db } from '../services/database';
import { Theme } from '../constants/theme';
import { useTheme } from '../hooks/ThemeContext';

export default function FeedScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors);
  
  const [threads, setThreads] = useState<SchoolThread[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostMedia, setNewPostMedia] = useState('');

  const currentUser = db.currentUser;

  const fetchThreads = async () => {
    setRefreshing(true);
    const data = await db.getThreads();
    setThreads(data);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchThreads();
  }, []);

  const handleCreateThread = async () => {
    if (!newPostContent.trim()) return;
    const media = newPostMedia.trim() ? newPostMedia : undefined;
    await db.addThread(newPostContent, media);
    setNewPostContent('');
    setNewPostMedia('');
    setIsModalOpen(false);
    fetchThreads();
  };

  const renderThreadCard = ({ item }: { item: SchoolThread }) => {
    const timeFormatted = new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return (
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('ThreadDetail', { threadId: item.id })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{item.authorName.charAt(0)}</Text>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.authorName}>{item.authorName}</Text>
            <Text style={styles.timeText}>{timeFormatted}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Teacher</Text>
          </View>
        </View>

        <Text style={styles.contentText}>{item.content}</Text>

        {item.mediaUrl && (
          <Image source={{ uri: item.mediaUrl }} style={styles.cardMedia} resizeMode="cover" />
        )}

        <View style={styles.cardFooter}>
          <View style={styles.replyIconContainer}>
            <Ionicons name="chatbubble-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.replyCount}>{item.replyCount} replies</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={18} color={colors.textSecondary} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View style={styles.appHeader}>
        <View style={styles.headerRow}>
          <Image 
            source={isDark ? require('../assets/Academix_dark.png') : require('../assets/Academix_light.png')} 
            style={styles.headerLogo} 
          />
          <Text style={styles.headerSubtitle}>Campus Feed</Text>
        </View>

      </View>

      <FlatList
        data={threads}
        keyExtractor={(item) => item.id}
        renderItem={renderThreadCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchThreads}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="newspaper-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No threads posted yet.</Text>
          </View>
        }
      />

      {currentUser.role === 'teacher' && (
        <TouchableOpacity 
          style={styles.fab}
          activeOpacity={0.85}
          onPress={() => setIsModalOpen(true)}
        >
          <Ionicons name="add" size={28} color={colors.white} />
        </TouchableOpacity>
      )}

      {/* New Post Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Announcement</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.inputArea}
              placeholder="What announcement do you want to share with the campus?"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={5}
              value={newPostContent}
              onChangeText={setNewPostContent}
            />

            <TextInput
              style={styles.input}
              placeholder="Image URL (optional)"
              placeholderTextColor={colors.textSecondary}
              value={newPostMedia}
              onChangeText={setNewPostMedia}
            />

            <TouchableOpacity 
              style={styles.postButton}
              onPress={handleCreateThread}
            >
              <Text style={styles.postButtonText}>Post Announcement</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    backgroundColor: colors.background,
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
  listContent: {
    padding: Theme.spacing.md,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: Theme.roundness.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...Theme.shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  avatarContainer: {
    width: 38,
    height: 38,
    borderRadius: Theme.roundness.full,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontWeight: Theme.typography.weights.bold,
    fontSize: Theme.typography.sizes.base,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: Theme.spacing.sm,
  },
  authorName: {
    color: colors.textPrimary,
    fontWeight: Theme.typography.weights.semibold,
    fontSize: Theme.typography.sizes.base,
  },
  timeText: {
    color: colors.textSecondary,
    fontSize: Theme.typography.sizes.xs,
    marginTop: 1,
  },
  badge: {
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
    borderWidth: 1,
    borderColor: colors.roleTeacher,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: Theme.roundness.sm,
  },
  badgeText: {
    color: colors.roleTeacher,
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.semibold,
  },
  contentText: {
    color: colors.textPrimary,
    fontSize: Theme.typography.sizes.base,
    lineHeight: 20,
    marginBottom: Theme.spacing.sm,
  },
  cardMedia: {
    width: '100%',
    height: 180,
    borderRadius: Theme.roundness.sm,
    marginBottom: Theme.spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: Theme.spacing.sm,
    marginTop: Theme.spacing.xs,
  },
  replyIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyCount: {
    color: colors.textSecondary,
    fontSize: Theme.typography.sizes.sm,
    marginLeft: Theme.spacing.xs,
  },
  fab: {
    position: 'absolute',
    bottom: Theme.spacing.xl,
    right: Theme.spacing.xl,
    width: 56,
    height: 56,
    borderRadius: Theme.roundness.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadows.md,
  },
  emptyContainer: {
    padding: Theme.spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: Theme.typography.sizes.base,
    marginTop: Theme.spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: Theme.roundness.lg,
    borderTopRightRadius: Theme.roundness.lg,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.bold,
  },
  inputArea: {
    backgroundColor: colors.surfaceLight,
    color: colors.textPrimary,
    borderRadius: Theme.roundness.sm,
    padding: Theme.spacing.md,
    fontSize: Theme.typography.sizes.base,
    textAlignVertical: 'top',
    marginBottom: Theme.spacing.md,
  },
  input: {
    backgroundColor: colors.surfaceLight,
    color: colors.textPrimary,
    borderRadius: Theme.roundness.sm,
    padding: Theme.spacing.md,
    fontSize: Theme.typography.sizes.base,
    marginBottom: Theme.spacing.md,
  },
  postButton: {
    backgroundColor: colors.primary,
    borderRadius: Theme.roundness.sm,
    padding: Theme.spacing.md,
    alignItems: 'center',
    marginTop: Theme.spacing.xs,
  },
  postButtonText: {
    color: colors.white,
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.bold,
  }
});
