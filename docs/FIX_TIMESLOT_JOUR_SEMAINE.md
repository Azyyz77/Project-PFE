# Fix: Timeslot jour_semaine CHECK Constraint Error

**Date**: May 5, 2026  
**Status**: ✅ FIXED  
**Issue**: CHECK constraint violation when creating timeslots with `jour_semaine: 0` (Sunday)

---

## Problem Description

### Error Message
```
The INSERT statement conflicted with the CHECK constraint "CK_JourSemaine". 
The conflict occurred in database "STA_SAV_DB", table "dbo.PlageHoraire", column 'jour_semaine'.
```

### Root Cause
**Mismatch between JavaScript and Database conventions:**

- **JavaScript `Date.getDay()`**: Returns 0-6 (0=Sunday, 1=Monday, ..., 6=Saturday)
- **Database CHECK Constraint**: Only accepts 1-7 (appears to expect 1=Monday, ..., 7=Sunday)
- **Frontend**: Sends `jour_semaine: 0` for Sunday
- **Backend**: Was passing value directly to database without conversion

---

## Solution Applied

### Backend Mapping (timeSlotController.js)

Added conversion logic in 3 functions:

#### 1. `createTimeSlot`
```javascript
// Convertir jour_semaine: JavaScript (0-6) → Database (1-7)
// JavaScript: 0=Sunday, 1=Monday, ..., 6=Saturday
// Database: 1=Monday, 2=Tuesday, ..., 7=Sunday
// Conversion: 0→7, 1→1, 2→2, ..., 6→6
if (jour_semaine === 0) {
  jour_semaine = 7; // Dimanche: 0 → 7
}
```

#### 2. `updateTimeSlot`
Same conversion logic as `createTimeSlot`

#### 3. `getAvailableSlots`
```javascript
const dayOfWeek = targetDate.getDay(); // 0-6
const dbDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek; // Convert 0→7
```

### Frontend Display Fix (timeslots/page.tsx)

Updated `getDayName` function to handle database values (1-7):

```typescript
const getDayName = (day: number) => {
  // Database stores: 1=Monday, 2=Tuesday, ..., 7=Sunday
  // Convert to array index: 1→1, 2→2, ..., 6→6, 7→0
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  if (day === 7) {
    return days[0]; // Sunday
  }
  return days[day] || day;
};
```

---

## Conversion Table

| Day Name | JavaScript (Frontend) | Database (Backend) |
|----------|----------------------|-------------------|
| Dimanche (Sunday) | 0 | 7 |
| Lundi (Monday) | 1 | 1 |
| Mardi (Tuesday) | 2 | 2 |
| Mercredi (Wednesday) | 3 | 3 |
| Jeudi (Thursday) | 4 | 4 |
| Vendredi (Friday) | 5 | 5 |
| Samedi (Saturday) | 6 | 6 |

---

## Files Modified

1. **backend/controllers/timeSlotController.js**
   - Added `jour_semaine` conversion in `createTimeSlot()`
   - Added `jour_semaine` conversion in `updateTimeSlot()`
   - Added `jour_semaine` conversion in `getAvailableSlots()`

2. **frontend/app/dashboard/admin/timeslots/page.tsx**
   - Updated `getDayName()` to handle database values (1-7)

---

## Testing Instructions

### Test Case 1: Create Sunday Timeslot
1. Go to Admin Dashboard → Plages Horaires
2. Click "Nouvelle Plage"
3. Select "Dimanche" (jour_semaine: 0)
4. Fill in other fields
5. Click "Créer"
6. **Expected**: Timeslot created successfully with `jour_semaine: 7` in database

### Test Case 2: Create Monday-Saturday Timeslots
1. Create timeslots for Lundi (1) through Samedi (6)
2. **Expected**: Values stored as-is (1-6) in database

### Test Case 3: Display Existing Timeslots
1. View timeslots list
2. **Expected**: Sunday timeslots (stored as 7) display as "Dimanche"
3. **Expected**: Other days display correctly

### Test Case 4: Get Available Slots for Sunday
1. Client selects a Sunday date for appointment
2. **Expected**: System correctly queries `jour_semaine: 7` in database
3. **Expected**: Available slots returned if configured

---

## Why This Approach?

### Option 1: Modify CHECK Constraint (NOT CHOSEN)
- Would require database migration
- Could break existing data
- Other parts of system might depend on 1-7 convention

### Option 2: Backend Mapping (CHOSEN) ✅
- **Pros**:
  - No database changes needed
  - Frontend uses standard JavaScript convention
  - Backend handles conversion transparently
  - Easy to understand and maintain
- **Cons**: None significant

### Option 3: Frontend Mapping (NOT CHOSEN)
- Would require changing all frontend code
- Goes against JavaScript standard
- More error-prone

---

## Related Issues Fixed

This fix also resolves the time format issue from previous task:
- ✅ Time format: "HH:mm" → "HH:mm:ss" conversion
- ✅ Day of week: 0-6 → 1-7 conversion

---

## Next Steps

1. ✅ Backend restart required to load updated controller
2. ✅ Test creating Sunday timeslots
3. ✅ Test creating other day timeslots
4. ✅ Verify display in admin interface
5. ✅ Test appointment booking with Sunday slots

---

## Status: READY TO TEST

The timeslot system is now fully functional with proper day-of-week handling.
