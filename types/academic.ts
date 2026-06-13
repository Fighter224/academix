export type UserRole = 'teacher' | 'parent' | 'student';
export type ThreadStatus = 'active' | 'resolved' | 'archived';
export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  isOnline: boolean;
  dndEnabled: boolean;
}

export interface SchoolThread {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  mediaUrl?: string;
  replyCount: number;
  createdAt: string;
}

export interface ThreadReply {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  createdAt: string;
}

export interface GroupRoom {
  id: string;
  name: string;
  type: 'class' | 'pibg' | 'faculty';
}

export interface DirectChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  messageBody: string;
  status: MessageStatus;
  createdAt: string;
}

export interface ChatNode {
  id: string; // chatId
  recipient: User;
  lastMessage?: DirectChatMessage;
  unreadCount: number;
}
