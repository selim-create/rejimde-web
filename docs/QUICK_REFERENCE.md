# Quick Reference - API Integration

## Frontend Quick Usage

### Import API Functions
```typescript
import { 
  getPlans, 
  getPlanBySlug, 
  createPlan, 
  updatePlan, 
  getPlan 
} from '@/lib/api';
```

### List All Plans
```typescript
const plans = await getPlans();
```

### List Plans with Filters
```typescript
const ketoplans = await getPlans('keto', 'medium');
```

### Get Single Plan
```typescript
const plan = await getPlanBySlug('7-gunluk-keto-diyeti');
if (plan) {
  console.log(plan.title);
  console.log(plan.plan_data); // Array of days
  console.log(plan.shopping_list); // Array of items
}
```

### Create Plan
```typescript
const result = await createPlan({
  title: "My Diet Plan",
  content: "Description...",
  plan_data: [
    {
      dayNumber: 1,
      meals: [
        {
          id: "meal-1-1",
          type: "breakfast",
          title: "Breakfast",
          content: "2 eggs, cheese...",
          calories: "350"
        }
      ]
    }
  ],
  shopping_list: ["Eggs", "Cheese"],
  meta: {
    difficulty: "medium",
    duration: "7",
    calories: "1500-1800"
  }
});

if (result.success) {
  console.log('Created:', result.data.id);
} else {
  console.error('Error:', result.message);
}
```

### Update Plan
```typescript
const result = await updatePlan(123, {
  title: "Updated Title",
  // ... other fields
});
```

### Get Plan for Editing
```typescript
const result = await getPlan(123);
if (result.success) {
  const planData = result.data;
  // Use planData.title, planData.plan_data, etc.
}
```

## Type Definitions

```typescript
import type { 
  PlanListItem, 
  PlanDetail, 
  PlanEditData,
  PlanMeal,
  PlanDay,
  PlanMeta 
} from '@/types';
```

## Error Handling Pattern

```typescript
try {
  const plan = await getPlanBySlug(slug);
  
  if (!plan) {
    // Not found
    router.push('/404');
    return;
  }
  
  // Success
  setPlan(plan);
  
} catch (error) {
  console.error('Error:', error);
  showError('Sunucu hatası');
}
```

## Backend Quick Reference

### Required Response Format
```json
{
  "status": "success",
  "data": { ... }
}
```

### Error Response Format
```json
{
  "status": "error",
  "code": "error_code",
  "message": "Error message"
}
```

### Required Endpoints
- `GET /rejimde/v1/plans`
- `GET /rejimde/v1/plans/{slug}`
- `POST /rejimde/v1/plans/create` (Auth required)
- `POST /rejimde/v1/plans/update/{id}` (Auth required)
- `GET /wp/v2/rejimde_plan/{id}` (Auth required)

### Meta Fields to Store
- `difficulty` (string)
- `duration` (string)
- `calories` (string)
- `score_reward` (string)
- `diet_category` (string)
- `is_verified` (boolean)
- `plan_data` (JSON string)
- `shopping_list` (JSON string)

## Common Tasks

### Add New Plan from Frontend
1. User fills form
2. Call `createPlan(formData)`
3. Check `result.success`
4. Redirect to plan detail page

### Display Plan List
1. Call `getPlans()` or `getPlans(category, difficulty)`
2. Map results to UI components
3. Handle loading and error states

### Display Plan Detail
1. Get slug from URL params
2. Call `getPlanBySlug(slug)`
3. Check if plan exists
4. Render plan details

### Edit Existing Plan
1. Get ID from URL params
2. Call `getPlan(id)` to load data
3. Pre-fill form with `result.data`
4. On submit, call `updatePlan(id, formData)`

## Testing

### Frontend Test
```bash
npm run dev
# Visit http://localhost:3000/diets
```

### Backend Test (cURL)
```bash
# Test list
curl "http://api.rejimde.com/wp-json/rejimde/v1/plans"

# Test get by slug
curl "http://api.rejimde.com/wp-json/rejimde/v1/plans/test-plan"
```

## Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_WP_API_URL=http://api.rejimde.com/wp-json
```

## Troubleshooting

### Issue: Plans not loading
**Check:**
1. API URL correct?
2. Backend endpoint working?
3. Network tab in browser for errors

### Issue: Create/Update not working
**Check:**
1. JWT token present?
2. User has correct role?
3. Request format correct?

### Issue: Meta fields not saving
**Check:**
1. Meta fields registered in backend?
2. `show_in_rest` enabled?
3. JSON encoding correct?

## Documentation

- Full API Guide: `docs/API_INTEGRATION.md`
- Backend Checklist: `docs/BACKEND_CHECKLIST.md`
- Type Definitions: `types/index.ts`
