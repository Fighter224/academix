import { User, SchoolThread, ThreadReply, GroupRoom, DirectChatMessage, ChatNode, UserRole } from '../types/academic';

// Simulated DB tables
export let usersTable: User[] = [
  { id: 'usr_teacher_01', name: 'Dr. Evelyn Carter', role: 'teacher', isOnline: true, dndEnabled: false },
  { id: 'usr_parent_02', name: 'Marcus Reynolds', role: 'parent', isOnline: true, dndEnabled: false },
  { id: 'usr_student_03', name: 'Chloe Reynolds', role: 'student', isOnline: false, dndEnabled: false },
  { id: 'usr_teacher_04', name: 'Coach Marcus Miller', role: 'teacher', isOnline: true, dndEnabled: false },
  { id: 'usr_parent_05', name: 'Sarah Jenkins', role: 'parent', isOnline: false, dndEnabled: true },
];

export let threadsTable: SchoolThread[] = [
  {
    id: 'thread_01',
    authorId: 'usr_teacher_01',
    authorName: 'Dr. Evelyn Carter',
    content: 'Welcome to the Science Fair 2026! Parents, please note that project submissions must be logged by next Friday. Feel free to reply below if you have any questions about the guidelines.',
    mediaUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
    replyCount: 3,
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(), // 4 hours ago
  },
  {
    id: 'thread_02',
    authorId: 'usr_teacher_04',
    authorName: 'Coach Marcus Miller',
    content: 'Track and field qualifiers start tomorrow morning at 07:30 AM. Ensure all participating students have their hydration packs and sign-off slips.',
    replyCount: 0,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(), // 1 day ago
  }
];

export let repliesTable: ThreadReply[] = [
  {
    id: 'rep_01',
    threadId: 'thread_01',
    authorId: 'usr_parent_02',
    authorName: 'Marcus Reynolds',
    authorRole: 'parent',
    content: 'Are digital presentations allowed, or does it have to be a physical board?',
    createdAt: new Date(Date.now() - 3.5 * 3600000).toISOString(),
  },
  {
    id: 'rep_02',
    threadId: 'thread_01',
    authorId: 'usr_teacher_01',
    authorName: 'Dr. Evelyn Carter',
    authorRole: 'teacher',
    content: 'Hi Marcus, digital presentations are highly encouraged! We will have dual HDMI screens setup in the hall.',
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: 'rep_03',
    threadId: 'thread_01',
    authorId: 'usr_student_03',
    authorName: 'Chloe Reynolds',
    authorRole: 'student',
    content: 'Awesome, I will prepare my slide deck!',
    createdAt: new Date(Date.now() - 2.5 * 3600000).toISOString(),
  }
];

export let groupRoomsTable: GroupRoom[] = [
  { id: 'room_class_01', name: 'AP Physics 1 - Grade 11', type: 'class' },
  { id: 'room_class_02', name: 'Geometry Honors - Sec B', type: 'class' },
  { id: 'room_pibg_01', name: 'Parent-Teacher Council (PIBG)', type: 'pibg' },
  { id: 'room_faculty_01', name: 'Science & Math Faculty Lounge', type: 'faculty' },
];

export let directMessagesTable: DirectChatMessage[] = [
  {
    id: 'msg_01',
    chatId: 'chat_teacher01_parent02',
    senderId: 'usr_teacher_01',
    messageBody: 'Hello Marcus, Chloe has shown incredible progress in physics. Her latest lab report was phenomenal!',
    status: 'read',
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: 'msg_02',
    chatId: 'chat_teacher01_parent02',
    senderId: 'usr_parent_02',
    messageBody: 'That is wonderful to hear, Dr. Carter! Thank you for the update. Is there any area she needs to double down on for the final?',
    status: 'read',
    createdAt: new Date(Date.now() - 4.8 * 3600000).toISOString(),
  },
  {
    id: 'msg_03',
    chatId: 'chat_teacher01_parent02',
    senderId: 'usr_teacher_01',
    messageBody: 'Just thermodynamic cycles - she has the theory down, just needs a bit of speed-solving practice.',
    status: 'delivered',
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(), // 10 mins ago
  }
];

// Helper database functions
export const db = {
  // Active User session simulation
  currentUser: usersTable[0], // Logged in as Dr. Evelyn Carter (Teacher) by default
  
  setCurrentUser: (userId: string) => {
    const found = usersTable.find(u => u.id === userId);
    if (found) {
      db.currentUser = found;
    }
  },

  getThreads: async (): Promise<SchoolThread[]> => {
    await new Promise(r => setTimeout(r, 600));
    return [...threadsTable].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  getReplies: async (threadId: string): Promise<ThreadReply[]> => {
    return repliesTable.filter(r => r.threadId === threadId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  addThread: async (content: string, mediaUrl?: string): Promise<SchoolThread> => {
    const newThread: SchoolThread = {
      id: `thread_${Date.now()}`,
      authorId: db.currentUser.id,
      authorName: db.currentUser.name,
      content,
      mediaUrl,
      replyCount: 0,
      createdAt: new Date().toISOString(),
    };
    threadsTable.unshift(newThread);
    return newThread;
  },

  addReply: async (threadId: string, content: string): Promise<ThreadReply> => {
    const newReply: ThreadReply = {
      id: `rep_${Date.now()}`,
      threadId,
      authorId: db.currentUser.id,
      authorName: db.currentUser.name,
      authorRole: db.currentUser.role,
      content,
      createdAt: new Date().toISOString(),
    };
    repliesTable.push(newReply);
    
    // Increment replyCount
    const thread = threadsTable.find(t => t.id === threadId);
    if (thread) thread.replyCount++;

    return newReply;
  },

  getRooms: async (role: UserRole): Promise<GroupRoom[]> => {
    // Parents and Students should see Class and PIBG rooms, but NOT Faculty rooms.
    // Teachers should see all rooms.
    if (role === 'teacher') {
      return groupRoomsTable;
    } else if (role === 'parent') {
      return groupRoomsTable.filter(r => r.type === 'class' || r.type === 'pibg');
    } else {
      return groupRoomsTable.filter(r => r.type === 'class');
    }
  },

  getChatNodes: async (): Promise<ChatNode[]> => {
    const currUser = db.currentUser;
    // Get all other users to build contact lists
    const otherUsers = usersTable.filter(u => u.id !== currUser.id);
    
    return otherUsers.map(user => {
      // Find chat messages
      const chatId = [currUser.id, user.id].sort().join('_');
      const messages = directMessagesTable.filter(m => m.chatId === chatId);
      const lastMessage = messages[messages.length - 1];
      const unreadCount = messages.filter(m => m.senderId === user.id && m.status !== 'read').length;

      return {
        id: chatId,
        recipient: user,
        lastMessage,
        unreadCount
      };
    });
  },

  getDirectMessages: async (chatId: string): Promise<DirectChatMessage[]> => {
    return directMessagesTable.filter(m => m.chatId === chatId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  sendDirectMessage: async (chatId: string, messageBody: string): Promise<DirectChatMessage> => {
    const newMsg: DirectChatMessage = {
      id: `msg_${Date.now()}`,
      chatId,
      senderId: db.currentUser.id,
      messageBody,
      status: 'sent',
      createdAt: new Date().toISOString(),
    };
    directMessagesTable.push(newMsg);
    return newMsg;
  },

  updateDnd: async (enabled: boolean) => {
    db.currentUser.dndEnabled = enabled;
    const userInTable = usersTable.find(u => u.id === db.currentUser.id);
    if (userInTable) userInTable.dndEnabled = enabled;
  }
};
