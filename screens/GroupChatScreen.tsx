import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../services/database';
import { Theme } from '../constants/theme';
import { UserRole } from '../types/academic';
import { useTheme } from '../hooks/ThemeContext';

export default function GroupChatScreen({ route, navigation }: any) {
  const { roomId, roomName } = route.params;
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList | null>(null);

  interface GroupMessage {
    id: string;
    senderId: string;
    senderName: string;
    senderRole: UserRole;
    body: string;
    createdAt: string;
  }

  useEffect(() => {
    const initialMessages: GroupMessage[] = [
      {
        id: 'gmsg_1',
        senderId: 'usr_teacher_01',
        senderName: 'Dr. Evelyn Carter',
        senderRole: 'teacher',
        body: `Welcome everyone to the ${roomName} channel! Please use this thread for group communications.`,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'gmsg_2',
        senderId: 'usr_parent_02',
        senderName: 'Marcus Reynolds',
        senderRole: 'parent',
        body: 'Thanks for setting this up. Happy to stay in sync here.',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
      }
    ];
    setMessages(initialMessages);
  }, [roomId, roomName]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMsg: GroupMessage = {
      id: `gmsg_${Date.now()}`,
      senderId: db.currentUser.id,
      senderName: db.currentUser.name,
      senderRole: db.currentUser.role,
      body: inputText.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'teacher': return colors.roleTeacher;
      case 'parent': return colors.roleParent;
      case 'student': return colors.roleStudent;
      default: return colors.textSecondary;
    }
  };

  const renderMessageItem = ({ item }: { item: GroupMessage }) => {
    const isMe = item.senderId === db.currentUser.id;
    const roleColor = getRoleColor(item.senderRole);
    const timeFormatted = new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={[styles.messageWrapper, isMe ? styles.myMessageWrapper : styles.otherMessageWrapper]}>
        {!isMe && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.senderName.charAt(0)}</Text>
          </View>
        )}
        <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.otherBubble]}>
          {!isMe && (
            <View style={styles.senderHeader}>
              <Text style={styles.senderName}>{item.senderName}</Text>
              <View style={[styles.roleBadge, { borderColor: roleColor, backgroundColor: `${roleColor}15` }]}>
                <Text style={[styles.roleBadgeText, { color: roleColor }]}>{item.senderRole.toUpperCase()}</Text>
              </View>
            </View>
          )}
          <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
            {item.body}
          </Text>
          <Text style={styles.messageTime}>{timeFormatted}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{roomName}</Text>
          <Text style={styles.headerSubtitle}>Group Chat</Text>
        </View>
        <TouchableOpacity style={styles.headerMenu}>
          <Ionicons name="information-circle-outline" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
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
  headerInfo: {
    flex: 1,
    marginLeft: Theme.spacing.md,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.bold,
  },
  headerSubtitle: {
    color: colors.primary,
    fontSize: Theme.typography.sizes.xs,
  },
  headerMenu: {
    padding: Theme.spacing.xs,
  },
  listContent: {
    padding: Theme.spacing.md,
    paddingBottom: Theme.spacing.lg,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.md,
    maxWidth: '80%',
  },
  myMessageWrapper: {
    alignSelf: 'flex-end',
  },
  otherMessageWrapper: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: Theme.roundness.full,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.sm,
    marginTop: 2,
  },
  avatarText: {
    color: colors.textPrimary,
    fontWeight: Theme.typography.weights.bold,
    fontSize: Theme.typography.sizes.sm,
  },
  messageBubble: {
    borderRadius: Theme.roundness.md,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    flexShrink: 1,
  },
  myBubble: {
    backgroundColor: colors.primaryDark,
    borderBottomRightRadius: 2,
  },
  otherBubble: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  senderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  senderName: {
    color: colors.textPrimary,
    fontWeight: Theme.typography.weights.bold,
    fontSize: Theme.typography.sizes.sm,
  },
  roleBadge: {
    borderWidth: 1,
    paddingHorizontal: Theme.spacing.xs,
    paddingVertical: 1,
    borderRadius: Theme.roundness.sm,
    marginLeft: Theme.spacing.sm,
  },
  roleBadgeText: {
    fontSize: 8,
    fontWeight: Theme.typography.weights.bold,
  },
  messageText: {
    fontSize: Theme.typography.sizes.base,
    lineHeight: 20,
  },
  myMessageText: {
    color: colors.white,
  },
  otherMessageText: {
    color: colors.textPrimary,
  },
  messageTime: {
    alignSelf: 'flex-end',
    fontSize: Theme.typography.sizes.xs - 2,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
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
  input: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    color: colors.textPrimary,
    borderRadius: Theme.roundness.full,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    marginRight: Theme.spacing.sm,
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
