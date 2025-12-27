# Calendar & Appointment System - Implementation Documentation

## Overview
Complete Calendar and Appointment Management System for Rejimde Pro module. This implementation provides a comprehensive solution for managing appointments, handling appointment requests, and configuring availability settings.

## Features Implemented

### 1. Calendar Main Page (`/dashboard/pro/calendar`)
- **Weekly Calendar View**: Grid-based layout with time slots and days
- **Appointment Display**: Color-coded appointments based on status
- **Navigation**: Previous/Next week, Today button
- **Week Range Display**: Shows current week date range
- **Appointment Actions**: Click to view details, update status
- **Create New Appointment**: Modal-based creation flow
- **Real-time Data**: Fetches appointments from API

### 2. Appointment Requests Page (`/dashboard/pro/calendar/requests`)
- **Request List**: Display all appointment requests with filtering
- **Status Filters**: Pending, Approved, Rejected, All
- **Statistics Dashboard**: Total, pending, and processed counts
- **Request Actions**: Approve or reject with modals
- **Approve Modal**: Select date, time, and appointment type
- **Reject Modal**: Provide reason for rejection
- **Quick Actions**: Suggested rejection reasons

### 3. Availability Settings Page (`/dashboard/pro/calendar/availability`)
- **Weekly Schedule Editor**: Configure working hours for each day
- **Multiple Time Slots**: Add multiple slots per day
- **Slot Duration**: Configure appointment slot intervals (15-90 min)
- **Buffer Time**: Set break time between appointments (0-30 min)
- **Day Toggle**: Enable/disable specific days
- **Validation**: Ensures valid time ranges
- **Persistence**: Saves settings to backend

## Components Architecture

### Core Components

#### 1. WeekView Component
- Displays 7-day calendar grid
- Time column (8:00 AM - 8:00 PM by default)
- Day columns with appointments
- Responsive layout

#### 2. DayColumn Component
- Individual day display
- Today indicator
- Time slot grid
- Appointment positioning based on time

#### 3. AppointmentCard Component
- Compact appointment display for calendar grid
- Status color coding
- Type icon indicator
- Client name and time display

#### 4. AppointmentModal Component
- Full appointment details
- Client information
- Meeting link for online appointments
- Location for in-person appointments
- Status actions (Complete, No Show, Cancel)
- Cancel with reason form

#### 5. NewAppointmentModal Component
- Client selection from existing clients
- Service selection (optional)
- Date and time picker
- Appointment type (Online, In-Person, Phone)
- Duration selection
- Meeting link/location based on type
- Notes field

#### 6. RequestCard Component
- Request details display
- Requester information
- Preferred and alternative dates
- Message from requester
- Approve/Reject actions

#### 7. ApproveModal Component
- Date and time selection
- Quick select preferred/alternative options
- Appointment type selection
- Meeting link for online appointments
- Validation

#### 8. RejectModal Component
- Reason text area
- Suggested rejection reasons
- Character limit validation

#### 9. MonthView Component
- Placeholder for future monthly calendar view
- Currently shows "Coming Soon" message

## API Functions (lib/api.ts)

### Interfaces
```typescript
interface Appointment
interface AppointmentRequest
interface BlockedTime
interface AvailabilitySlot
interface AvailabilitySettings
```

### Calendar Endpoints
- `getCalendarAppointments(startDate, endDate, status?)` - Fetch appointments for date range
- `createAppointment(data)` - Create new appointment
- `updateAppointment(appointmentId, data)` - Update appointment
- `cancelAppointment(appointmentId, reason?)` - Cancel appointment
- `completeAppointment(appointmentId)` - Mark as completed
- `markNoShow(appointmentId)` - Mark as no-show

### Request Endpoints
- `getAppointmentRequests(status?)` - Fetch requests
- `approveAppointmentRequest(requestId, data)` - Approve request
- `rejectAppointmentRequest(requestId, reason?)` - Reject request

### Availability Endpoints
- `getAvailabilitySettings()` - Get availability configuration
- `updateAvailabilitySettings(data)` - Update availability

### Time Blocking
- `blockTime(data)` - Block time slot
- `unblockTime(blockId)` - Remove blocked time

### Public Endpoints
- `getExpertAvailableSlots(expertId, date)` - Get available slots for a date
- `getExpertAvailableSlotsRange(expertId, startDate, endDate)` - Get slots for date range
- `requestAppointment(data)` - Submit appointment request (client/guest)

## Utility Functions (lib/calendar-utils.ts)

### Date Formatting
- `formatDate(date)` - Format to Turkish locale
- `formatTime(time)` - Format to HH:MM
- `formatDateRange(start, end)` - Format date range
- `toISODateString(date)` - Convert to YYYY-MM-DD
- `getRelativeTime(date)` - Get "X hours ago" format

### Week Calculations
- `getWeekDays(date)` - Get all days in week
- `getWeekStart(date)` - Get Monday of week
- `getWeekEnd(date)` - Get Sunday of week
- `getMonthStart(date)` - Get first day of month
- `getMonthEnd(date)` - Get last day of month

### Time Position Calculations
- `getTimePosition(time, startHour, hourHeight)` - Calculate top position for grid
- `getAppointmentHeight(startTime, endTime, hourHeight)` - Calculate height
- `calculateDuration(startTime, endTime)` - Get duration in minutes
- `addMinutesToTime(time, minutes)` - Add minutes to time string

### Status & Type Helpers
- `getStatusColor(status)` - Get Tailwind color class
- `getStatusTextColor(status)` - Get text color class
- `getStatusLabel(status)` - Get Turkish status label
- `getTypeIcon(type)` - Get Font Awesome icon
- `getTypeLabel(type)` - Get Turkish type label
- `getTypeColor(type)` - Get type color classes

### Validation Helpers
- `isTimeSlotAvailable(time, duration, bookedSlots)` - Check availability
- `generateTimeSlots(startHour, endHour, interval)` - Generate time options
- `getDayHours(startHour, endHour)` - Get hour array

## Styling & Design

### Color Coding
| Status | Color | Tailwind Class |
|--------|-------|----------------|
| Pending | Yellow | `bg-yellow-500` |
| Confirmed | Blue | `bg-blue-600` |
| Completed | Green | `bg-green-500` |
| Cancelled | Red | `bg-red-500` |
| No Show | Gray | `bg-slate-500` |
| Blocked | Striped Gray | `bg-slate-700` |

### Appointment Types
- **Online**: Purple with video icon
- **In-Person**: Orange with handshake icon
- **Phone**: Teal with phone icon

### Layout
- Dark theme (slate-800/900 backgrounds)
- Rounded corners (rounded-xl, rounded-2xl)
- Card-based design
- Responsive grid layouts
- Modal overlays with backdrop blur

## Dependencies

### Existing
- `next` - React framework
- `react` & `react-dom` - UI library
- `date-fns` - Date manipulation
- `tailwindcss` - Styling

### No New Dependencies Added
All functionality implemented using existing project dependencies.

## File Structure
```
app/dashboard/pro/calendar/
├── page.tsx                      # Main calendar page
├── requests/
│   └── page.tsx                  # Appointment requests page
├── availability/
│   └── page.tsx                  # Availability settings page
└── components/
    ├── WeekView.tsx              # Weekly calendar view
    ├── MonthView.tsx             # Monthly view (placeholder)
    ├── DayColumn.tsx             # Day column in week view
    ├── AppointmentCard.tsx       # Appointment card for grid
    ├── AppointmentModal.tsx      # Appointment details modal
    ├── NewAppointmentModal.tsx   # Create appointment modal
    ├── RequestCard.tsx           # Request card
    ├── ApproveModal.tsx          # Approve request modal
    └── RejectModal.tsx           # Reject request modal

lib/
├── api.ts                        # API functions (updated)
└── calendar-utils.ts             # Calendar utilities (new)
```

## Usage Examples

### Creating an Appointment
1. Navigate to `/dashboard/pro/calendar`
2. Click "Yeni Randevu" button
3. Select client from list
4. Choose date and time
5. Select appointment type
6. Add notes if needed
7. Click "Randevuyu Oluştur"

### Approving a Request
1. Navigate to `/dashboard/pro/calendar/requests`
2. Click "Onayla" on a pending request
3. Confirm or modify date/time
4. Select appointment type
5. Add meeting link for online appointments
6. Click "Onayla ve Oluştur"

### Configuring Availability
1. Navigate to `/dashboard/pro/calendar/availability`
2. Enable days you work
3. Add time slots for each day
4. Set slot duration and buffer time
5. Click "Kaydet"

## State Management

### Calendar Page State
- `viewType`: 'week' | 'month'
- `currentDate`: Date object for current view
- `appointments`: Array of appointments
- `blockedTimes`: Array of blocked time slots
- `loading`: Boolean for data loading
- `selectedAppointment`: Currently viewed appointment
- `showNewModal`: Boolean for new appointment modal

### Requests Page State
- `requests`: Array of appointment requests
- `loading`: Boolean for data loading
- `meta`: Statistics metadata
- `selectedRequest`: Currently selected request
- `showApproveModal`: Boolean for approve modal
- `showRejectModal`: Boolean for reject modal
- `filter`: 'all' | 'pending' | 'approved' | 'rejected'

### Availability Page State
- `loading`: Boolean for data loading
- `saving`: Boolean for save operation
- `slotDuration`: Number (minutes)
- `bufferTime`: Number (minutes)
- `schedule`: Array of day schedules

## Error Handling
- API errors return default/empty data structures
- User-friendly error messages via alerts
- Form validation with inline feedback
- Loading states for async operations
- Fallback UI for empty states

## Performance Considerations
- Only fetches data for current week
- Minimal re-renders with proper React hooks
- Memoized calculations for date/time operations
- Optimized grid rendering with absolute positioning

## Accessibility
- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus management in modals
- Color contrast compliance

## Future Enhancements (Not Implemented)
- Drag & drop appointment rescheduling
- Monthly calendar view (full implementation)
- Recurring appointments
- Email notifications
- Calendar sync (Google, Outlook)
- Print view
- Export to PDF/ICS
- Conflict detection and warnings
- Bulk operations
- Advanced filtering and search

## Testing Considerations
- API integration requires backend endpoints
- Mock data can be used for development
- Component testing with React Testing Library
- E2E testing with Playwright/Cypress
- Accessibility testing with axe-core

## Notes
- All components follow existing code patterns
- Uses existing design system (Tailwind classes)
- Maintains consistency with other Pro module pages
- Turkish language support throughout
- Mobile-responsive design
- Font Awesome icons for UI elements
