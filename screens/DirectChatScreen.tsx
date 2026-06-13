import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChatNode, MessageStatus } from '../types/academic';
import { db } from '../services/database';
import { Theme } from '../constants/theme';
import { useIsFocused } from '@react-navigation/native';
import { useTheme } from '../hooks/ThemeContext';

export default function DirectChatScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors);

  const [chatNodes, setChatNodes] = useState<ChatNode[]>([]);
  const isFocused = useIsFocused();

  const fetchChatNodes = async () => {
    const data = await db.getChatNodes();
    setChatNodes(data);
  };

  useEffect(() => {
    if (isFocused) {
      fetchChatNodes();
    }
  }, [isFocused]);

  const renderTickIcon = (status: MessageStatus) => {
    switch (status) {
      case 'sent':
        return <Ionicons name="checkmark" size={14} color={colors.checkSent} />;
      case 'delivered':
        return <Ionicons name="checkmark-done" size={14} color={colors.checkDelivered} />;
      case 'read':
        return <Ionicons name="checkmark-done" size={14} color={colors.checkRead} />;
      default:
        return null;
    }
  };

  const renderChatNode = ({ item }: { item: ChatNode }) => {
    const isOnline = item.recipient.isOnline;
    const lastMsg = item.lastMessage;
    const timeFormatted = lastMsg 
      ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';

    const isMe = lastMsg ? lastMsg.senderId === db.currentUser.id : false;

    return (
      <TouchableOpacity
        style={styles.chatNodeCard}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('ChatConversation', { 
          chatId: item.id, 
          recipientName: item.recipient.name,
          recipientId: item.recipient.id,
          isOnline: item.recipient.isOnline
        })}
      >
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.recipient.name.charAt(0)}</Text>
          </View>
          <View style={[styles.onlineIndicator, { backgroundColor: isOnline ? colors.online : colors.offline }]} />
        </View>

        <View style={styles.chatInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.recipientName}>{item.recipient.name}</Text>
            {timeFormatted ? <Text style={styles.timeText}>{timeFormatted}</Text> : null}
          </View>

          <View style={styles.messageRow}>
            {lastMsg ? (
              <View style={styles.lastMsgContainer}>
                {isMe && <View style={styles.tickContainer}>{renderTickIcon(lastMsg.status)}</View>}
                <Text style={styles.lastMsgText} numberOfLines={1}>
                  {lastMsg.messageBody}
                </Text>
              </View>
            ) : (
              <Text style={styles.noMsgText}>No messages yet</Text>
            )}

            {item.unreadCount > 0 ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unreadCount}</Text>
              </View>
            ) : null}
          </View>
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
          <Text style={styles.headerSubtitle}>Direct Conversations</Text>
        </View>
      </View>


      <FlatList
        data={chatNodes}
        keyExtractor={(item) => item.id}
        renderItem={renderChatNode}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No contacts active.</Text>
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
    height: 28,
    width: 110,
    resizeMode: 'contain',
  },
  headerSubtitle: {
    fontSize: Theme.typography.sizes.sm,
    color: colors.primary,
    fontWeight: Theme.typography.weights.semibold,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: Theme.spacing.md,
  },
  chatNodeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: Theme.spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: Theme.roundness.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.textPrimary,
    fontWeight: Theme.typography.weights.bold,
    fontSize: Theme.typography.sizes.lg,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.background,
  },
  chatInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recipientName: {
    color: colors.textPrimary,
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.bold,
  },
  timeText: {
    color: colors.textSecondary,
    fontSize: Theme.typography.sizes.xs,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMsgContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Theme.spacing.md,
  },
  tickContainer: {
    marginRight: 4,
  },
  lastMsgText: {
    color: colors.textSecondary,
    fontSize: Theme.typography.sizes.sm,
    flex: 1,
  },
  noMsgText: {
    color: colors.textSecondary,
    fontSize: Theme.typography.sizes.sm,
    fontStyle: 'italic',
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: Theme.roundness.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: Theme.typography.weights.bold,
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
