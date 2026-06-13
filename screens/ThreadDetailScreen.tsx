import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SchoolThread, ThreadReply } from '../types/academic';
import { db } from '../services/database';
import { Theme } from '../constants/theme';
import { useTheme } from '../hooks/ThemeContext';

export default function ThreadDetailScreen({ route, navigation }: any) {
  const { threadId } = route.params;
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [thread, setThread] = useState<SchoolThread | null>(null);
  const [replies, setReplies] = useState<ThreadReply[]>([]);
  const [newReplyContent, setNewReplyContent] = useState('');

  const fetchThreadAndReplies = async () => {
    const threads = await db.getThreads();
    const foundThread = threads.find(t => t.id === threadId);
    if (foundThread) {
      setThread(foundThread);
      const replyData = await db.getReplies(threadId);
      setReplies(replyData);
    }
  };

  useEffect(() => {
    fetchThreadAndReplies();
  }, [threadId]);

  const handlePostReply = async () => {
    if (!newReplyContent.trim()) return;
    await db.addReply(threadId, newReplyContent);
    setNewReplyContent('');
    fetchThreadAndReplies();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'teacher': return colors.roleTeacher;
      case 'parent': return colors.roleParent;
      case 'student': return colors.roleStudent;
      default: return colors.textSecondary;
    }
  };

  const renderReplyItem = ({ item }: { item: ThreadReply }) => {
    const timeFormatted = new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const badgeColor = getRoleBadgeColor(item.authorRole);

    return (
      <View style={styles.replyCard}>
        <View style={styles.replyHeader}>
          <View style={styles.replyAvatar}>
            <Text style={styles.replyAvatarText}>{item.authorName.charAt(0)}</Text>
          </View>
          <View style={styles.replyInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.replyAuthorName}>{item.authorName}</Text>
              <View style={[styles.roleBadge, { borderColor: badgeColor, backgroundColor: `${badgeColor}15` }]}>
                <Text style={[styles.roleBadgeText, { color: badgeColor }]}>
                  {item.authorRole.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.replyTimeText}>{timeFormatted}</Text>
          </View>
        </View>
        <Text style={styles.replyContent}>{item.content}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thread Discussion</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          data={replies}
          keyExtractor={(item) => item.id}
          renderItem={renderReplyItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            thread ? (
              <View style={styles.threadDetails}>
                <View style={styles.threadHeader}>
                  <View style={styles.threadAvatar}>
                    <Text style={styles.threadAvatarText}>{thread.authorName.charAt(0)}</Text>
                  </View>
                  <View style={styles.threadAuthorInfo}>
                    <Text style={styles.threadAuthor}>{thread.authorName}</Text>
                    <Text style={styles.threadTime}>{new Date(thread.createdAt).toLocaleString()}</Text>
                  </View>
                </View>
                <Text style={styles.threadContent}>{thread.content}</Text>
                <View style={styles.divider} />
                <Text style={styles.repliesTitle}>Replies ({replies.length})</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyRepliesContainer}>
              <Ionicons name="chatbubbles-outline" size={36} color={colors.textSecondary} />
              <Text style={styles.emptyRepliesText}>No replies yet. Be the first to start the discussion!</Text>
            </View>
          }
        />

        {/* Reply Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.replyInput}
            placeholder="Write a reply..."
            placeholderTextColor={colors.textSecondary}
            value={newReplyContent}
            onChangeText={setNewReplyContent}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, !newReplyContent.trim() && styles.sendButtonDisabled]} 
            onPress={handlePostReply}
            disabled={!newReplyContent.trim()}
          >
            <Ionicons name="send" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: Theme.spacing.xs,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.semibold,
  },
  listContent: {
    padding: Theme.spacing.md,
  },
  threadDetails: {
    marginBottom: Theme.spacing.md,
  },
  threadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  threadAvatar: {
    width: 44,
    height: 44,
    borderRadius: Theme.roundness.full,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  threadAvatarText: {
    color: colors.white,
    fontWeight: Theme.typography.weights.bold,
    fontSize: Theme.typography.sizes.lg,
  },
  threadAuthorInfo: {
    marginLeft: Theme.spacing.md,
  },
  threadAuthor: {
    color: colors.textPrimary,
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.bold,
  },
  threadTime: {
    color: colors.textSecondary,
    fontSize: Theme.typography.sizes.xs,
    marginTop: 2,
  },
  threadContent: {
    color: colors.textPrimary,
    fontSize: Theme.typography.sizes.lg,
    lineHeight: 24,
    marginBottom: Theme.spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: Theme.spacing.md,
  },
  repliesTitle: {
    color: colors.textPrimary,
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.bold,
  },
  replyCard: {
    backgroundColor: colors.surface,
    borderRadius: Theme.roundness.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  replyAvatar: {
    width: 32,
    height: 32,
    borderRadius: Theme.roundness.full,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replyAvatarText: {
    color: colors.textPrimary,
    fontWeight: Theme.typography.weights.semibold,
    fontSize: Theme.typography.sizes.sm,
  },
  replyInfo: {
    flex: 1,
    marginLeft: Theme.spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyAuthorName: {
    color: colors.textPrimary,
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.semibold,
  },
  roleBadge: {
    borderWidth: 1,
    paddingHorizontal: Theme.spacing.xs,
    paddingVertical: 1,
    borderRadius: Theme.roundness.sm,
    marginLeft: Theme.spacing.sm,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: Theme.typography.weights.bold,
  },
  replyTimeText: {
    color: colors.textSecondary,
    fontSize: Theme.typography.sizes.xs,
    marginTop: 1,
  },
  replyContent: {
    color: colors.textPrimary,
    fontSize: Theme.typography.sizes.base,
    lineHeight: 20,
    paddingLeft: 40,
  },
  emptyRepliesContainer: {
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  emptyRepliesText: {
    color: colors.textSecondary,
    fontSize: Theme.typography.sizes.sm,
    textAlign: 'center',
    marginTop: Theme.spacing.md,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  replyInput: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    color: colors.textPrimary,
    borderRadius: Theme.roundness.full,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    marginRight: Theme.spacing.sm,
    maxHeight: 100,
    fontSize: Theme.typography.sizes.base,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: Theme.roundness.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.surfaceLight,
    opacity: 0.5,
  }
});
