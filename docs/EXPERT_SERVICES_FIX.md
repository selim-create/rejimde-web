# Expert Profile Services Loading Fix

## Problem Description

Expert profile pages (`/experts/[slug]`) were not displaying service packages because the frontend was using the wrong ID when fetching services.

### Root Cause

- **Frontend Issue**: `getExpertPublicServices(data.id)` was being called with Post ID
- **Backend Requirement**: Services API (`/rejimde/v1/experts/{expertId}/services`) expects User ID (expert_id)
- **Backend Change**: PR #45 added `user_id` field to `ProfessionalController.php` response

## Solution Implemented

### 1. Interface Update

Updated `ExpertDetail` interface in `app/experts/[slug]/page.tsx` to include user ID fields:

```typescript
interface ExpertDetail {
    id: number;
    name: string;
    slug: string;
    // ... other fields
    
    /** User ID fields returned from backend (related_user_id is preferred, user_id is fallback) */
    related_user_id?: number;   // User ID from backend (primary field)
    user_id?: number;           // User ID from backend (alternative field name)
    
    // ... more fields
}
```

### 2. Service Loading Logic Update

Modified the service loading code (lines 220-230) to use the user ID fields:

```typescript
// Load expert's services
// Use user_id instead of post ID (data.id)
// Try related_user_id first (primary field), then user_id (fallback)
const userId = data?.related_user_id ?? data?.user_id;
if (userId) {
    const servicesData = await getExpertPublicServices(userId);
    // Filter only active services
    setServices(servicesData.filter(s => s.is_active));
} else {
    console.warn('Expert user ID (related_user_id or user_id) not found in response. Services cannot be loaded. Post ID:', data.id);
}
```

### Key Implementation Details

1. **Nullish Coalescing (`??`)**: Uses `related_user_id` first, falls back to `user_id` if undefined
2. **Type Safety**: Both fields are optional in the interface, proper null checking
3. **Error Handling**: Console warning when user ID is not found, services array remains empty
4. **Active Filtering**: Only active services are displayed to users

## API Flow

```
Frontend Request Flow:
1. getExpertBySlug(slug) → /rejimde/v1/professionals/{slug}
   Response includes: { id, name, slug, related_user_id, user_id, ... }

2. getExpertPublicServices(userId) → /rejimde/v1/experts/{userId}/services
   Response includes: [{ id, name, price, is_active, ... }]
```

## Backend Requirements

The backend must return at least one of these fields in the professional endpoint response:
- `related_user_id` (preferred) - The User ID associated with the professional profile
- `user_id` (fallback) - Alternative field name for User ID

## Testing Scenarios

### Scenario 1: Expert with `related_user_id`
- **Given**: Backend returns expert data with `related_user_id: 123`
- **When**: Profile page loads
- **Then**: Services are fetched using user ID 123
- **Result**: ✅ Service packages display correctly

### Scenario 2: Expert with `user_id` only
- **Given**: Backend returns expert data with `user_id: 456` (no `related_user_id`)
- **When**: Profile page loads
- **Then**: Services are fetched using user ID 456
- **Result**: ✅ Service packages display correctly

### Scenario 3: Expert without user ID fields
- **Given**: Backend returns expert data without `related_user_id` or `user_id`
- **When**: Profile page loads
- **Then**: Warning logged to console, services array remains empty
- **Result**: ✅ Page loads without errors, no services shown

### Scenario 4: Expert with no active services
- **Given**: Expert has user ID but no active services
- **When**: Profile page loads
- **Then**: Services array is empty after filtering
- **Result**: ✅ Services section not shown (conditional rendering)

## Files Modified

- `app/experts/[slug]/page.tsx`
  - Lines 64-66: Added `related_user_id` and `user_id` to `ExpertDetail` interface
  - Lines 220-230: Updated service loading logic to use user ID fields

## Related PRs

- Backend PR #45: Added `user_id` field to ProfessionalController
- Frontend PR #58: Implemented this fix

## Verification Checklist

- [x] Interface includes `related_user_id` and `user_id` fields
- [x] Service loading uses user ID instead of post ID
- [x] Proper fallback logic implemented (`related_user_id` → `user_id`)
- [x] Error handling for missing user ID
- [x] Active services filtering maintained
- [x] TypeScript types are correct
- [x] No build errors
- [x] Documentation created

## Notes

- The fix maintains backward compatibility by trying both field names
- The implementation is defensive - handles cases where neither field exists
- Console warnings help with debugging if backend is not returning user ID fields
- Services are only shown if they are marked as active (`is_active: true`)
