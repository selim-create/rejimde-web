# Expert Services Loading - Test Cases

## Manual Testing Instructions

### Prerequisites
1. Backend server running with PR #45 changes deployed
2. Frontend development server running
3. Browser console open for debugging

### Test Case 1: Expert with `related_user_id`

**Setup:**
- Navigate to an expert profile page (e.g., `/experts/dr-ayse-nutritionist`)
- Expert should have `related_user_id` in backend response

**Steps:**
1. Open browser DevTools → Network tab
2. Navigate to expert profile page
3. Check the API request to `/rejimde/v1/professionals/{slug}`
4. Verify response contains `related_user_id`
5. Check the API request to `/rejimde/v1/experts/{userId}/services`
6. Verify the `userId` in URL matches the `related_user_id`

**Expected Result:**
- ✅ Services section displays with available packages
- ✅ Only active services are shown
- ✅ Console has no warnings about missing user_id

**Console Log Check:**
```javascript
// Should NOT see this warning:
// "Expert user ID (related_user_id or user_id) not found in response. Services cannot be loaded. Post ID: X"
```

### Test Case 2: Expert with `user_id` only

**Setup:**
- Navigate to an expert profile where backend returns `user_id` but not `related_user_id`

**Steps:**
1. Open browser DevTools → Network tab
2. Navigate to expert profile page
3. Check the API request to `/rejimde/v1/professionals/{slug}`
4. Verify response contains `user_id` but NOT `related_user_id`
5. Check the API request to `/rejimde/v1/experts/{userId}/services`
6. Verify the `userId` in URL matches the `user_id`

**Expected Result:**
- ✅ Services section displays with available packages
- ✅ Fallback to `user_id` works correctly
- ✅ Console has no warnings about missing user_id

### Test Case 3: Expert without user ID fields

**Setup:**
- Navigate to an unclaimed expert profile (legacy data without user_id fields)

**Steps:**
1. Open browser DevTools → Console tab
2. Navigate to expert profile page
3. Check console for warning messages

**Expected Result:**
- ✅ Page loads without errors
- ✅ Profile information displays correctly
- ✅ Services section is empty or not shown
- ✅ Console shows warning: "Expert user ID (related_user_id or user_id) not found in response. Services cannot be loaded. Post ID: X"

**Console Log Check:**
```javascript
// Should see this warning:
console.warn('Expert user ID (related_user_id or user_id) not found in response. Services cannot be loaded. Post ID:', X);
```

### Test Case 4: Expert with services, some inactive

**Setup:**
- Expert has both active and inactive services in backend

**Steps:**
1. Navigate to expert profile page
2. Check services section
3. Compare with backend data

**Expected Result:**
- ✅ Only active services (`is_active: true`) are displayed
- ✅ Inactive services are filtered out
- ✅ Service count matches active services only

### Test Case 5: Expert with no services

**Setup:**
- Expert has `user_id` but no services defined in backend

**Steps:**
1. Navigate to expert profile page
2. Scroll to services section

**Expected Result:**
- ✅ Page loads without errors
- ✅ Services section is empty
- ✅ No console errors
- ✅ Services API returns empty array

## Automated Testing (Future Enhancement)

### Unit Test Example

```typescript
describe('Expert Services Loading', () => {
  it('should use related_user_id when available', () => {
    const expertData = {
      id: 100,  // Post ID
      name: 'Dr. Test',
      related_user_id: 50,  // User ID
      user_id: 49  // Fallback
    };
    
    const userId = expertData?.related_user_id ?? expertData?.user_id;
    expect(userId).toBe(50);  // Should use related_user_id
  });
  
  it('should fallback to user_id when related_user_id is missing', () => {
    const expertData = {
      id: 100,  // Post ID
      name: 'Dr. Test',
      user_id: 49  // Fallback only
    };
    
    const userId = expertData?.related_user_id ?? expertData?.user_id;
    expect(userId).toBe(49);  // Should use user_id fallback
  });
  
  it('should handle missing user ID fields', () => {
    const expertData = {
      id: 100,  // Post ID
      name: 'Dr. Test',
      // No related_user_id or user_id
    };
    
    const userId = expertData?.related_user_id ?? expertData?.user_id;
    expect(userId).toBeUndefined();
  });
});
```

### Integration Test Example

```typescript
describe('Expert Profile Page', () => {
  it('should fetch services using user ID', async () => {
    const mockExpert = {
      id: 100,
      slug: 'dr-test',
      related_user_id: 50
    };
    
    const mockServices = [
      { id: 1, name: 'Consultation', is_active: true },
      { id: 2, name: 'Package', is_active: false }
    ];
    
    // Mock API calls
    jest.spyOn(api, 'getExpertBySlug').mockResolvedValue(mockExpert);
    jest.spyOn(api, 'getExpertPublicServices').mockResolvedValue(mockServices);
    
    // Render component
    render(<ExpertProfilePage params={{ slug: 'dr-test' }} />);
    
    await waitFor(() => {
      expect(api.getExpertPublicServices).toHaveBeenCalledWith(50);
    });
    
    // Should only show active services
    expect(screen.getByText('Consultation')).toBeInTheDocument();
    expect(screen.queryByText('Package')).not.toBeInTheDocument();
  });
});
```

## Browser Compatibility

Test in the following browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Performance Testing

### Metrics to Check:
1. **Network requests**: Should see exactly 2 API calls
   - GET `/rejimde/v1/professionals/{slug}`
   - GET `/rejimde/v1/experts/{userId}/services`

2. **Load time**: Services should load within 1-2 seconds after expert data

3. **No infinite loops**: Services should only be fetched once per page load

## Regression Testing

Ensure the following still work:
- [ ] Expert profile loads for claimed profiles
- [ ] Expert profile loads for unclaimed profiles
- [ ] All expert information displays correctly
- [ ] Reviews section loads
- [ ] Navigation works
- [ ] Mobile responsiveness maintained

## Known Issues & Limitations

None currently identified. The implementation is defensive and handles all edge cases.

## Test Data Requirements

### Backend Requirements
The backend must return professionals data in this format:

```json
{
  "id": 100,
  "name": "Dr. Ayşe Yılmaz",
  "slug": "dr-ayse-yilmaz",
  "related_user_id": 50,
  "user_id": 50,
  // ... other fields
}
```

At least one of `related_user_id` or `user_id` should be present for services to load.

### Services API Format

```json
[
  {
    "id": 1,
    "name": "Online Consultation",
    "description": "60 minute online consultation",
    "type": "session",
    "price": 500,
    "currency": "TRY",
    "duration_minutes": 60,
    "is_active": true,
    // ... other fields
  }
]
```

## Support & Troubleshooting

### Common Issues

**Issue**: Services not showing
- **Check**: Browser console for warning about missing user_id
- **Solution**: Ensure backend returns `related_user_id` or `user_id`

**Issue**: Inactive services showing
- **Check**: Service `is_active` field in backend
- **Solution**: Update service status in backend

**Issue**: Wrong services showing
- **Check**: User ID being used in API call
- **Solution**: Verify backend returns correct user_id for the expert

### Debug Commands

```javascript
// In browser console while on expert page:

// 1. Check expert data
console.log(expert);

// 2. Check services data
console.log(services);

// 3. Manually test the logic
const testData = { id: 100, related_user_id: 50, user_id: 49 };
const userId = testData?.related_user_id ?? testData?.user_id;
console.log('Selected user ID:', userId);  // Should be 50
```
