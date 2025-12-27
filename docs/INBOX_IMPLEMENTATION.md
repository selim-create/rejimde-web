# Inbox & Messaging Feature - Implementation Documentation

## Overview

This document describes the implementation of the Inbox and Messaging feature for the Rejimde Pro panel. The feature allows experts (rejimde_pro users) to communicate with their clients through a threaded messaging system.

## Features Implemented

### 1. Inbox List Page (`/dashboard/pro/inbox`)

**Location:** `app/dashboard/pro/inbox/page.tsx`

**Features:**
- ✅ Thread list with search and filters
- ✅ Status filters: All, Open, Closed, Archived
- ✅ Search by client name or message content
- ✅ Unread message count display
- ✅ New thread/message button
- ✅ Loading states with skeleton loaders
- ✅ Empty states when no messages exist
- ✅ Responsive design (mobile & desktop)

**UI Components:**
- ThreadList component for displaying threads
- ThreadCard component for individual thread items
- NewThreadModal for starting new conversations
- Search input with debounce
- Filter tabs for status

### 2. Thread Detail Page (`/dashboard/pro/inbox/[threadId]`)

**Location:** `app/dashboard/pro/inbox/[threadId]/page.tsx`

**Features:**
- ✅ Message list in chat bubble style
- ✅ Expert messages on right (blue)
- ✅ Client messages on left (slate)
- ✅ Message input with template selector
- ✅ AI draft generation button
- ✅ Thread actions (Close, Archive)
- ✅ Auto-scroll to latest message
- ✅ Optimistic UI updates
- ✅ Read receipts
- ✅ Loading and empty states

**UI Components:**
- MessageBubble for individual messages
- MessageInput with textarea and send button
- TemplateSelector dropdown
- Thread status indicators

### 3. Reusable Components

**Location:** `app/dashboard/pro/inbox/components/`

**Components:**
1. **ThreadCard.tsx** - Individual thread list item
   - Shows client avatar, name, last message preview
   - Displays timestamp and unread indicator
   - Handles click to navigate to thread

2. **ThreadList.tsx** - Thread list container
   - Displays multiple threads
   - Loading skeleton states
   - Empty state when no threads

3. **MessageBubble.tsx** - Individual message display
   - Different styles for expert vs client
   - Timestamp and read status
   - AI-generated indicator

4. **MessageInput.tsx** - Message composition
   - Textarea with send button
   - Template selector integration
   - AI draft button
   - Enter to send, Shift+Enter for new line

5. **TemplateSelector.tsx** - Message template picker
   - Grouped by category
   - Shows usage count
   - Click to insert template

6. **NewThreadModal.tsx** - Start new conversation
   - Client selection dropdown
   - Subject field (optional)
   - Message textarea
   - Form validation

## API Functions

**Location:** `lib/api.ts`

### Interfaces

```typescript
interface InboxThread {
  id: number;
  relationship_id: number;
  client: {
    id: number;
    name: string;
    avatar: string;
  };
  subject: string | null;
  status: 'open' | 'closed' | 'archived';
  last_message: {
    content: string;
    sender_type: 'expert' | 'client';
    created_at: string;
    is_read: boolean;
  } | null;
  unread_count: number;
  created_at: string;
}

interface InboxMessage {
  id: number;
  sender_id: number;
  sender_type: 'expert' | 'client';
  sender_name: string;
  sender_avatar: string;
  content: string;
  content_type: 'text' | 'image' | 'file' | 'voice' | 'plan_link';
  attachments: any[] | null;
  is_read: boolean;
  is_ai_generated: boolean;
  created_at: string;
}

interface MessageTemplate {
  id: number;
  title: string;
  content: string;
  category: string;
  usage_count: number;
}
```

### API Endpoints

All endpoints use the format: `/rejimde/v1/pro/inbox/...`

1. **getInboxThreads** - `GET /rejimde/v1/pro/inbox`
   - Params: status, search, limit, offset
   - Returns: threads array and metadata

2. **getInboxThread** - `GET /rejimde/v1/pro/inbox/{threadId}`
   - Returns: thread details and messages

3. **sendInboxMessage** - `POST /rejimde/v1/pro/inbox/{threadId}/messages`
   - Body: content, content_type
   - Returns: created message

4. **createInboxThread** - `POST /rejimde/v1/pro/inbox/threads`
   - Body: client_id, subject, content
   - Returns: new thread_id

5. **markThreadAsRead** - `POST /rejimde/v1/pro/inbox/{threadId}/read`
   - Marks all messages in thread as read

6. **closeInboxThread** - `POST /rejimde/v1/pro/inbox/{threadId}/close`
   - Closes the thread

7. **archiveInboxThread** - `POST /rejimde/v1/pro/inbox/{threadId}/archive`
   - Archives the thread

8. **getMessageTemplates** - `GET /rejimde/v1/pro/message-templates`
   - Returns: array of templates

9. **createMessageTemplate** - `POST /rejimde/v1/pro/message-templates`
   - Body: title, content, category
   - Returns: created template

10. **deleteMessageTemplate** - `DELETE /rejimde/v1/pro/message-templates/{templateId}`
    - Deletes a template

11. **generateAIDraft** - `POST /rejimde/v1/pro/inbox/{threadId}/ai-draft`
    - Returns: AI-generated message draft

12. **getUnreadInboxCount** - `GET /rejimde/v1/pro/inbox/unread-count`
    - Returns: count of unread messages

## State Management

### Inbox List Page State
```typescript
const [threads, setThreads] = useState<InboxThread[]>([]);
const [meta, setMeta] = useState({ total: 0, unread_total: 0 });
const [loading, setLoading] = useState(true);
const [activeTab, setActiveTab] = useState<'all' | 'open' | 'closed' | 'archived'>('all');
const [searchTerm, setSearchTerm] = useState("");
```

### Thread Detail Page State
```typescript
const [thread, setThread] = useState<InboxThread | null>(null);
const [messages, setMessages] = useState<InboxMessage[]>([]);
const [templates, setTemplates] = useState<MessageTemplate[]>([]);
const [loading, setLoading] = useState(true);
const [sending, setSending] = useState(false);
```

## UX Features

1. **Auto-scroll** - Messages automatically scroll to bottom when new messages arrive
2. **Optimistic UI** - Messages appear immediately when sent, updated when confirmed
3. **Toast Notifications** - Success/error feedback using existing Toast component
4. **Responsive Design** - Mobile-first design with proper breakpoints
5. **Loading States** - Skeleton loaders for better perceived performance
6. **Empty States** - Friendly messages when no content exists
7. **Search Debounce** - 300ms delay to avoid excessive API calls

## Design System

### Colors
- Expert messages: `bg-blue-600` (blue background)
- Client messages: `bg-slate-700` (dark gray background)
- Unread indicator: `bg-blue-500` (blue dot)
- Borders: `border-slate-700`
- Background: `bg-slate-900` (dark background)

### Typography
- Font: Nunito (inherited from app)
- Sizes: text-xs, text-sm, text-base, text-lg
- Weights: font-medium, font-bold, font-extrabold, font-black

### Components Style
- Rounded corners: `rounded-xl`, `rounded-2xl`, `rounded-3xl`
- Shadows: `shadow-card`, `shadow-lg`
- Transitions: smooth hover effects
- Icons: Font Awesome

## Error Handling

- Network errors show toast notifications
- Failed messages are removed from optimistic UI
- Thread not found redirects to inbox list
- Empty states guide users when no data

## Testing Checklist

- [ ] Thread list loads correctly
- [ ] Filters work (all, open, closed, archived)
- [ ] Search finds threads
- [ ] Click thread navigates to detail
- [ ] Messages display correctly
- [ ] Send message works
- [ ] Template selector works
- [ ] AI draft generation works
- [ ] Close thread works
- [ ] Archive thread works
- [ ] New thread creation works
- [ ] Responsive on mobile
- [ ] Loading states appear
- [ ] Error handling works

## Backend Requirements

The backend must implement all the endpoints listed above with the following response format:

```json
{
  "status": "success",
  "data": {
    // response data here
  }
}
```

Or for errors:
```json
{
  "status": "error",
  "message": "Error message here"
}
```

## Future Enhancements

1. File attachments (images, documents)
2. Voice messages
3. Plan/content linking
4. Push notifications for new messages
5. Message reactions/emojis
6. Thread assignment to other experts
7. Bulk actions (mark all read, bulk archive)
8. Advanced search with filters
9. Message drafts auto-save
10. Typing indicators
11. Online/offline status for clients
12. Message scheduling

## Notes

- The implementation uses the existing Toast component from `@/components/ui/Toast`
- All API functions follow the existing pattern in `lib/api.ts`
- TypeScript interfaces ensure type safety
- Components are client components (`'use client'`) for interactivity
- Next.js Link components used for navigation (not `<a>` tags)
- ESLint rules followed for code quality
