# Fix: Timeslot CK_Horaires CHECK Constraint Error

**Date**: May 5, 2026  
**Status**: ✅ FIXED  
**Issue**: CHECK constraint `CK_Horaires` violation when updating timeslots

---

## Problem Description

### Error Message
```
The UPDATE statement conflicted with the CHECK constraint "CK_Horaires". 
The conflict occurred in database "STA_SAV_DB", table "dbo.PlageHoraire".
```

### Root Causes

#### 1. Time Format Mismatch in Edit Form
- **Database returns**: "HH:mm:ss" (e.g., "08:00:00")
- **HTML input type="time" expects**: "HH:mm" (e.g., "08:00")
- **Problem**: When editing, form was populated with "08:00:00" which is invalid for `<input type="time">`
- **Result**: Browser may have corrupted or swapped the time values

#### 2. Missing Validation
- **Constraint**: `CK_Horaires` checks that `heure_ouverture < heure_fermeture`
- **Problem**: No frontend or backend validation before database insert
- **Result**: Invalid data reached database and triggered constraint error

#### 3. Day of Week Conversion Missing in Edit
- **Database stores**: 1-7 (7=Sunday)
- **Frontend form expects**: 0-6 (0=Sunday)
- **Problem**: When editing, `jour_semaine: 7` was displayed as "7" instead of "0" (Sunday)

---

## Solutions Applied

### 1. Frontend: Strip Seconds from Time Values

**File**: `frontend/app/dashboard/admin/timeslots/page.tsx`

```typescript
const openEditModal = (slot: TimeSlot) => {
  setEditingSlot(slot);
  
  // Convert jour_semaine: Database (1-7) → Frontend (0-6)
  const frontendDayOfWeek = slot.jour_semaine === 7 ? 0 : slot.jour_semaine;
  
  setFormData({
    agence_id: slot.agence_id,
    jour_semaine: frontendDayOfWeek,
    // Strip seconds from time format: "HH:mm:ss" → "HH:mm"
    heure_ouverture: slot.heure_ouverture.substring(0, 5),
    heure_fermeture: slot.heure_fermeture.substring(0, 5),
    capacite: slot.capacite,
  });
  setShowModal(true);
};
```

**Changes**:
- ✅ Strip seconds: `"08:00:00".substring(0, 5)` → `"08:00"`
- ✅ Convert day: `7 → 0` for Sunday

### 2. Backend: Add Time Range Validation

**File**: `backend/controllers/timeSlotController.js`

Added validation in both `createTimeSlot()` and `updateTimeSlot()`:

```javascript
// Valider que heure_ouverture < heure_fermeture
if (heure_ouverture >= heure_fermeture) {
  return res.status(400).json({ 
    message: 'L\'heure d\'ouverture doit être avant l\'heure de fermeture',
    error: 'INVALID_TIME_RANGE',
    details: { heure_ouverture, heure_fermeture }
  });
}
```

**Benefits**:
- ✅ Catches invalid time ranges before database
- ✅ Returns clear error message to user
- ✅ Prevents constraint violation errors

---

## Database Constraints

The `PlageHoraire` table has two CHECK constraints:

### 1. CK_JourSemaine
```sql
[jour_semaine] >= 1 AND [jour_semaine] <= 7
```
- Ensures day of week is between 1 (Monday) and 7 (Sunday)
- **Fixed in previous task** with 0→7 conversion

### 2. CK_Horaires
```sql
[heure_ouverture] < [heure_fermeture]
```
- Ensures opening time is before closing time
- **Fixed in this task** with validation and time format correction

---

## Complete Data Flow

### Creating a Timeslot

1. **Frontend Form**:
   - User selects: `jour_semaine: 0` (Sunday), `heure_ouverture: "08:00"`, `heure_fermeture: "18:00"`

2. **Backend Processing**:
   - Convert day: `0 → 7`
   - Normalize time: `"08:00" → "08:00:00"`
   - Validate: `"08:00:00" < "18:00:00"` ✅
   - Insert into database

3. **Database Storage**:
   - `jour_semaine: 7`, `heure_ouverture: 08:00:00`, `heure_fermeture: 18:00:00`

### Editing a Timeslot

1. **Load from Database**:
   - Database returns: `{ jour_semaine: 7, heure_ouverture: "08:00:00", heure_fermeture: "18:00:00" }`

2. **Frontend Form Population**:
   - Convert day: `7 → 0` (Sunday)
   - Strip seconds: `"08:00:00" → "08:00"`, `"18:00:00" → "18:00"`
   - Form displays: `jour_semaine: 0`, `heure_ouverture: "08:00"`, `heure_fermeture: "18:00"`

3. **User Edits and Submits**:
   - Same flow as creating (steps 1-3 above)

---

## Files Modified

### Backend
1. **backend/controllers/timeSlotController.js**
   - Added time range validation in `createTimeSlot()`
   - Added time range validation in `updateTimeSlot()`

### Frontend
2. **frontend/app/dashboard/admin/timeslots/page.tsx**
   - Strip seconds from time values in `openEditModal()`
   - Convert `jour_semaine` from database (1-7) to form (0-6)

---

## Testing Checklist

- [ ] **Create timeslot with valid times** (08:00 - 18:00) → Success
- [ ] **Create timeslot with invalid times** (18:00 - 08:00) → Error message
- [ ] **Create timeslot with equal times** (08:00 - 08:00) → Error message
- [ ] **Edit existing timeslot** → Form populated correctly
- [ ] **Edit Sunday timeslot** → Shows "Dimanche" (0) in dropdown
- [ ] **Edit and save timeslot** → Updates successfully
- [ ] **Display timeslots list** → Times show correctly (HH:mm:ss format)

---

## Error Messages

### User-Friendly Validation Error
```json
{
  "message": "L'heure d'ouverture doit être avant l'heure de fermeture",
  "error": "INVALID_TIME_RANGE",
  "details": {
    "heure_ouverture": "18:00:00",
    "heure_fermeture": "08:00:00"
  }
}
```

This error is now caught **before** reaching the database, providing a better user experience.

---

## Related Fixes

This completes the timeslot system fixes:

1. ✅ **Time format**: "HH:mm" → "HH:mm:ss" conversion
2. ✅ **Day of week**: 0-6 → 1-7 conversion (create/update)
3. ✅ **Day of week**: 1-7 → 0-6 conversion (edit form)
4. ✅ **Time range validation**: Opening < Closing
5. ✅ **Time format in edit**: Strip seconds for HTML input

---

## Status: COMPLETE

All timeslot constraints are now properly handled. The system is ready for testing.

**Next Step**: Restart backend to load updated controller.
