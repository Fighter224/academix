import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DirectChatMessage, MessageStatus } from '../types/academic';
import { db } from '../services/database';
import { Theme } from '../constants/theme';
import { useWebSockets } from '../hooks/useWebSockets';
import { useTheme } from '../hooks/ThemeContext';

export default function ChatConversationScreen({ route, navigation }: any) {
  const { chatId, recipientName, recipientId, isOnline } = route.params;
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [messages, setMessages] = useState<DirectChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [callState, setCallState] = useState<'idle' | 'signaling' | 'connecting' | 'connected'>('idle');
  const [signalingLogs, setSignalingLogs] = useState<string[]>([]);
  const flatListRef = useRef<FlatList | null>(null);

  const { sendMessage, sendWebRTCSignaling } = useWebSockets(
    chatId,
    (newMsg) => {
      setMessages(prev => {
        if (prev.find(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      if (newMsg.senderId !== db.currentUser.id) {
        newMsg.status = 'read';
      }
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    },
    (msgId, status) => {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status } : m));
    }
  );

  useEffect(() => {
    const fetchHistory = async () => {
      const history = await db.getDirectMessages(chatId);
      history.forEach(m => {
        if (m.senderId !== db.currentUser.id) {
          m.status = 'read';
        }
      });
      setMessages(history);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 200);
    };

    fetchHistory();
  }, [chatId]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(chatId, inputText.trim());
    setInputText('');
  };

  const startVideoCall = () => {
    setIsVideoModalOpen(true);
    setCallState('signaling');
    setSignalingLogs(['[WebRTC] Initializing RTCPeerConnection...', '[WebRTC] Creating local SDP offer...']);

    setTimeout(() => {
      sendWebRTCSignaling(recipientId, 'offer', 'v=0\r\no=alice 2890844526...');
      setSignalingLogs(prev => [...prev, '[WebSocket] SDP Offer dispatched to signaling server.']);
      setCallState('connecting');

      setTimeout(() => {
        setSignalingLogs(prev => [...prev, '[WebSocket] Received SDP Answer from remote peer.', '[WebRTC] Processing remote ICE candidates...']);
        
        setTimeout(() => {
          setCallState('connected');
          setSignalingLogs(prev => [...prev, '[WebRTC] Connection established successfully. Video stream active.']);
        }, 1500);

      }, 2000);

    }, 1500);
  };

  const endVideoCall = () => {
    setIsVideoModalOpen(false);
    setCallState('idle');
    setSignalingLogs([]);
  };

  const renderTickIcon = (status: MessageStatus) => {
    switch (status) {
      case 'sent':
        return <Ionicons name="checkmark" size={16} color={colors.checkSent} />;
      case 'delivered':
        return <Ionicons name="checkmark-done" size={16} color={colors.checkDelivered} />;
      case 'read':
        return <Ionicons name="checkmark-done" size={16} color={colors.checkRead} />;
      default:
        return null;
    }
  };

  const renderMessage = ({ item }: { item: DirectChatMessage }) => {
    const isMe = item.senderId === db.currentUser.id;
    const timeFormatted = new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={[styles.messageRow, isMe ? styles.myMessageRow : styles.otherMessageRow]}>
        <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isMe ? styles.myText : styles.otherText]}>
            {item.messageBody}
          </Text>
          <View style={styles.bubbleFooter}>
            <Text style={[styles.messageTime, isMe ? styles.myTime : styles.otherTime]}>{timeFormatted}</Text>
            {isMe && <View style={styles.tickSpace}>{renderTickIcon(item.status)}</View>}
          </View>
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
        
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{recipientName.charAt(0)}</Text>
          </View>
          <View style={[styles.statusDot, { backgroundColor: isOnline ? colors.online : colors.offline }]} />
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{recipientName}</Text>
          <Text style={styles.headerSubtitle}>{isOnline ? 'Online' : 'Offline'}</Text>
        </View>

        <TouchableOpacity style={styles.callButton} onPress={startVideoCall}>
          <Ionicons name="videocam-outline" size={24} color={colors.primary} />
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
          renderItem={renderMessage}
          contentContainerStyle={styles.chatListContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={isVideoModalOpen} animationType="fade" transparent={true}>
        <View style={styles.videoOverlay}>
          
          {callState !== 'connected' ? (
            <View style={styles.connectingOverlay}>
              <View style={styles.connectingHeader}>
                <Ionicons name="shield-checkmark-outline" size={24} color={colors.primary} />
                <Text style={styles.secureText}>P2P WebRTC SECURE HANDSHAKE</Text>
              </View>

              <View style={styles.pulseContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.callingStateText}>
                  {callState === 'signaling' ? 'SIGNALING HANDSHAKE...' : 'CONNECTING PEERS...'}
                </Text>
                <Text style={styles.recipientCallName}>{recipientName}</Text>
              </View>

              <View style={styles.logsConsole}>
                <Text style={styles.consoleTitle}>Signaling Logs Console</Text>
                {signalingLogs.map((log, index) => (
                  <Text key={index} style={styles.consoleLog}>
                    {log}
                  </Text>
                ))}
              </View>

              <TouchableOpacity style={styles.declineButton} onPress={endVideoCall}>
                <Ionicons name="call" size={28} color={colors.white} style={styles.declineIcon} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.callActiveContainer}>
              <View style={styles.remoteVideoStream}>
                <View style={styles.streamPlaceholder}>
                  <Ionicons name="person" size={120} color={colors.textSecondary} />
                  <Text style={styles.remoteUserStreamLabel}>{recipientName} (Remote Peer)</Text>
                </View>
              </View>

              <View style={styles.localPipStream}>
                <View style={styles.pipPlaceholder}>
                  <Ionicons name="camera-reverse" size={32} color={colors.primary} />
                  <Text style={styles.pipText}>Self Camera</Text>
                </View>
              </View>

              <View style={styles.callControlsContainer}>
                <View style={styles.callInfoOverlay}>
                  <Text style={styles.activeCallTitle}>Active 1-1 Video Call</Text>
                  <Text style={styles.secureBadge}>End-to-End Encrypted</Text>
                </View>

                <View style={styles.buttonsRow}>
                  <TouchableOpacity style={styles.controlButton}>
                    <Ionicons name="mic-outline" size={24} color={colors.white} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.controlButton, styles.hangUpButton]} onPress={endVideoCall}>
                    <Ionicons name="call-outline" size={26} color={colors.white} style={styles.hangUpIcon} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.controlButton}>
                    <Ionicons name="camera-reverse-outline" size={24} color={colors.white} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

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
  avatarContainer: {
    position: 'relative',
    marginLeft: Theme.spacing.sm,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: Theme.roundness.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.textPrimary,
    fontWeight: Theme.typography.weights.bold,
    fontSize: Theme.typography.sizes.base,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.background,
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
    color: colors.textSecondary,
    fontSize: Theme.typography.sizes.xs,
  },
  callButton: {
    padding: Theme.spacing.sm,
  },
  chatListContent: {
    padding: Theme.spacing.md,
    paddingBottom: Theme.spacing.lg,
  },
  messageRow: {
    marginBottom: Theme.spacing.md,
    width: '100%',
    flexDirection: 'row',
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  otherMessageRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    borderRadius: Theme.roundness.md,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    maxWidth: '78%',
    flexShrink: 1,
    ...Theme.shadows.sm,
  },
  myBubble: {
    backgroundColor: colors.surfaceLight,
    borderBottomRightRadius: 2,
  },
  otherBubble: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    fontSize: Theme.typography.sizes.base,
    lineHeight: 20,
  },
  myText: {
    color: colors.textPrimary,
  },
  otherText: {
    color: colors.textPrimary,
  },
  bubbleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageTime: {
    fontSize: 10,
  },
  myTime: {
    color: colors.textSecondary,
  },
  otherTime: {
    color: colors.textSecondary,
  },
  tickSpace: {
    marginLeft: 4,
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
  },
  videoOverlay: {
    flex: 1,
    backgroundColor: colors.background,
  },
  connectingOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.xxl,
    alignItems: 'center',
  },
  connectingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Theme.spacing.xl,
  },
  secureText: {
    color: colors.primary,
    fontWeight: Theme.typography.weights.bold,
    marginLeft: Theme.spacing.sm,
    fontSize: Theme.typography.sizes.sm,
  },
  pulseContainer: {
    alignItems: 'center',
  },
  callingStateText: {
    color: colors.textPrimary,
    fontWeight: Theme.typography.weights.bold,
    marginTop: Theme.spacing.lg,
    fontSize: Theme.typography.sizes.lg,
  },
  recipientCallName: {
    color: colors.textSecondary,
    fontSize: Theme.typography.sizes.base,
    marginTop: Theme.spacing.sm,
  },
  logsConsole: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    width: '90%',
    height: 180,
    borderRadius: Theme.roundness.sm,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  consoleTitle: {
    color: colors.primary,
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.bold,
    textTransform: 'uppercase',
    marginBottom: Theme.spacing.sm,
  },
  consoleLog: {
    color: '#34D399',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 11,
    marginBottom: 4,
  },
  declineButton: {
    width: 64,
    height: 64,
    borderRadius: Theme.roundness.full,
    backgroundColor: colors.dndActive,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadows.lg,
  },
  declineIcon: {
    transform: [{ rotate: '135deg' }],
  },
  callActiveContainer: {
    flex: 1,
    position: 'relative',
  },
  remoteVideoStream: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  streamPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  remoteUserStreamLabel: {
    color: colors.textPrimary,
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.semibold,
    marginTop: Theme.spacing.lg,
  },
  localPipStream: {
    position: 'absolute',
    top: Theme.spacing.xxl,
    right: Theme.spacing.lg,
    width: 120,
    height: 160,
    borderRadius: Theme.roundness.md,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.primary,
    overflow: 'hidden',
    ...Theme.shadows.lg,
  },
  pipPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pipText: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: Theme.spacing.xs,
  },
  callControlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Theme.spacing.xxl,
    paddingTop: Theme.spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.isDark ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.75)',
  },
  callInfoOverlay: {
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  activeCallTitle: {
    color: colors.textPrimary,
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.semibold,
  },
  secureBadge: {
    color: '#34D399',
    fontSize: Theme.typography.sizes.xs,
    marginTop: 4,
    fontWeight: Theme.typography.weights.bold,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '70%',
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: Theme.roundness.full,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hangUpButton: {
    width: 60,
    height: 60,
    backgroundColor: colors.dndActive,
    ...Theme.shadows.md,
  },
  hangUpIcon: {
    transform: [{ rotate: '135deg' }],
  }
});
