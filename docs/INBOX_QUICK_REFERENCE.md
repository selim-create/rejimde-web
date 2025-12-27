# Inbox & Messaging Feature - Quick Reference

## File Structure

```
app/dashboard/pro/inbox/
├── page.tsx                           # Inbox list page (main)
├── [threadId]/
│   └── page.tsx                       # Thread detail/messaging page
└── components/
    ├── ThreadCard.tsx                 # Individual thread card
    ├── ThreadList.tsx                 # Thread list container
    ├── MessageBubble.tsx              # Message bubble component
    ├── MessageInput.tsx               # Message input area
    ├── TemplateSelector.tsx           # Template dropdown
    └── NewThreadModal.tsx             # New thread modal

lib/
└── api.ts                             # +13 API functions added

docs/
└── INBOX_IMPLEMENTATION.md            # Full documentation
```

## Component Hierarchy

```
Inbox Page (/dashboard/pro/inbox)
└── ThreadList
    └── ThreadCard (multiple)

Thread Detail Page (/dashboard/pro/inbox/[threadId])
├── MessageBubble (multiple)
└── MessageInput
    └── TemplateSelector (conditional)

Modals
└── NewThreadModal (triggered by button)
```

## Key Features by Page

### Inbox List Page
```
┌─────────────────────────────────────────┐
│  [Filter: All | Open | Closed | Archived]│
│  [Search: _______________] [+ New Message]│
│                                           │
│  ┌─────────────────────────────────────┐ │
│  │ 👤 Ayşe K.          10 dk önce      │ │
│  │ 🔵 Ara öğün değişimi hk.            │ │
│  │ Hocam merhaba, badem yerine...     │ │
│  └─────────────────────────────────────┘ │
│  ┌─────────────────────────────────────┐ │
│  │ 👤 Burak Yılmaz     2 saat önce    │ │
│  │ Antrenman sonrası ağrı             │ │
│  │ Tamamdır hocam, buz uygulayacağım  │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Thread Detail Page
```
┌─────────────────────────────────────────┐
│ ← Ara öğün değişimi hk.  [✓][📦]       │
│ 👤 Ayşe K. ile konuşuluyor  [Açık]     │
├─────────────────────────────────────────┤
│                                         │
│   ┌─────────────────────────┐          │
│   │ Hocam merhaba, listemde │          │
│   │ ara öğünde 10 adet...   │ 14:30    │
│   └─────────────────────────┘          │
│                                         │
│          ┌─────────────────────────┐   │
│          │ Evet değişim            │   │
│   14:35  │ yapabilirsiniz. 10...   │   │
│          └─────────────────────────┘   │
│                                         │
├─────────────────────────────────────────┤
│ [✨ AI Taslak] [📋 Şablon Seç]         │
│ ┌─────────────────────────────────────┐│
│ │ Cevabınızı yazın...                 ││
│ │                                  [➤]││
│ └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

## API Functions Summary

| Function | Method | Endpoint |
|----------|--------|----------|
| getInboxThreads | GET | /inbox |
| getInboxThread | GET | /inbox/{id} |
| sendInboxMessage | POST | /inbox/{id}/messages |
| createInboxThread | POST | /inbox/threads |
| markThreadAsRead | POST | /inbox/{id}/read |
| closeInboxThread | POST | /inbox/{id}/close |
| archiveInboxThread | POST | /inbox/{id}/archive |
| getMessageTemplates | GET | /message-templates |
| createMessageTemplate | POST | /message-templates |
| deleteMessageTemplate | DELETE | /message-templates/{id} |
| generateAIDraft | POST | /inbox/{id}/ai-draft |
| getUnreadInboxCount | GET | /inbox/unread-count |

## State Flow

```
Inbox List:
Load → getInboxThreads() → Display threads
Filter → Re-fetch with filter
Search → Debounce → Re-fetch
Click thread → Navigate to detail

Thread Detail:
Load → getInboxThread() → Display messages
Send → Optimistic update → sendInboxMessage() → Update
AI Draft → generateAIDraft() → Auto-send
Template → Insert into input
Close/Archive → Update status → Redirect
```

## Styling Guide

### Colors
- Expert messages: Blue (`bg-blue-600`)
- Client messages: Slate (`bg-slate-700`)
- Background: Dark slate (`bg-slate-900`)
- Borders: `border-slate-700`
- Unread badge: `bg-blue-500`

### Sizing
- Thread cards: `p-4`
- Message bubbles: `p-4`, `max-w-[80%]`
- Avatars: `w-8 h-8` (list), `w-10 h-10` (detail)
- Inputs: `min-h-[100px]`

### Responsive
- Mobile: Full-width, single column
- Tablet: Thread list + detail side-by-side
- Desktop: Sidebar + Thread list + Detail

## Integration Checklist

- [ ] Backend implements all 12 API endpoints
- [ ] Response format matches: `{ status: 'success', data: {...} }`
- [ ] Error format: `{ status: 'error', message: '...' }`
- [ ] Authentication headers included
- [ ] CORS configured for frontend domain
- [ ] WebSocket/polling for real-time (optional)
- [ ] File upload endpoints (future)
- [ ] Push notifications configured (future)

## Testing Commands

```bash
# Lint check
npm run lint

# Build check (will fail on Google Fonts issue, not related to inbox)
npm run build

# Start dev server
npm run dev
```

## URLs to Test

Once backend is ready:
- List: http://localhost:3000/dashboard/pro/inbox
- Detail: http://localhost:3000/dashboard/pro/inbox/[threadId]

## Common Issues & Solutions

**Issue**: Empty thread list
- Check if user is authenticated
- Verify backend returns data
- Check network tab for API errors

**Issue**: Messages not sending
- Check sendInboxMessage API
- Verify optimistic update logic
- Check toast notifications

**Issue**: Templates not showing
- Verify getMessageTemplates returns data
- Check template selector visibility

**Issue**: Navigation not working
- Ensure Next.js Link components used
- Check router.push() calls

## Performance Notes

- Debounce on search: 300ms
- Auto-scroll on new messages
- Optimistic updates for instant feedback
- Skeleton loaders during fetch
- Efficient re-renders with proper keys
