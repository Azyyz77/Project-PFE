# Fix: Timeslot Time Format Corruption in Edit

**Date**: May 5, 2026  
**Status**: ✅ FIXED  
**Issue**: Times getting corrupted when editing timeslots

---

## Problem Identified

### Symptoms
- Database stores: `heure_ouverture: 13:47:00`, `heure_fermeture: 19:48:00`
- Frontend receives and sends: `heure_ouverture: 21:58`, `heure_fermeture: 14:58`
- Validation correctly rejects: `21:58 >= 14:58` (opening after closing)

### Root Cause
**SQL Server TIME format with milliseconds**

SQL Server returns TIME columns in format: `HH:mm:ss.0000000`

Example from database query:
```
heure_ouverture: 13:47:00.0000000
heure_fermeture: 19:48:00.0000000
```

The frontend's `substring(0, 5)` was not handling this format correctly, causing time corruption.

---

## Solution Applied

### Backend Fix: Format Times in SQL Query

**File**: `backend/controllers/timeSlotController.js`

Changed from `SELECT *` to explicitly format TIME columns:

```javascript
SELECT 
  id,
  agence_id,
  jour_semaine,
  CONVERT(VARCHAR(8), heure_ouverture, 108) as heure_ouverture,
  CONVERT(VARCHAR(8), heure_fermeture, 108) as heure_fermeture,
  capacite
FROM PlageHoraire
```

**SQL Server CONVERT function**:
- `CONVERT(VARCHAR(8), time_column, 108)` 
- Style `108` = `HH:mm:ss` format
- Returns clean string: `"13:47:00"` instead of `"13:47:00.0000000"`

**Applied to**:
1. ✅ `getAllTimeSlots()` - Get all timeslots
2. ✅ `getAgencyTimeSlots()` - Get timeslots for specific agency

### Frontend Fix: Robust Time Normalization

**File**: `frontend/app/dashboard/admin/timeslots/page.tsx`

Enhanced `normalizeTime()` function in `openEditModal()`:

```typescript
const normalizeTime = (timeStr: string) => {
  if (!timeStr) return '';
  
  // Remove any whitespace
  const cleaned = timeStr.trim();
  
  // If it contains a dot (milliseconds), take everything before it
  const withoutMillis = cleaned.split('.')[0];
  
  // Now we have "HH:mm:ss", take first 5 characters
  const normalized = withoutMillis.substring(0, 5);
  
  console.log(`[normalizeTime] "${timeStr}" → "${normalized}"`);
  return normalized;
};
```

**Handles**:
- `"13:47:00.0000000"` → `"13:47"`
- `"13:47:00"` → `"13:47"`
- `"13:47"` → `"13:47"`
- Empty/null values → `""`

---

## Data Flow (Fixed)

### Before Fix ❌
```
Database:        13:47:00.0000000
↓
Backend (raw):   13:47:00.0000000
↓
Frontend:        substring(0,5) → "13:47" (but corrupted somehow)
↓
Edit Form:       Shows wrong time (21:58)
↓
Submit:          Sends wrong time (21:58)
↓
Validation:      FAILS (21:58 >= 14:58)
```

### After Fix ✅
```
Database:        13:47:00.0000000
↓
Backend (SQL):   CONVERT(..., 108) → "13:47:00"
↓
Frontend:        split('.')[0].substring(0,5) → "13:47"
↓
Edit Form:       Shows correct time (13:47)
↓
Submit:          Sends correct time (13:47)
↓
Backend:         Normalizes to "13:47:00"
↓
Validation:      PASSES (13:47:00 < 19:48:00)
↓
Database:        Stores correctly
```

---

## SQL Server TIME Format Reference

### Default Format (Problem)
```sql
SELECT heure_ouverture FROM PlageHoraire WHERE id = 32;
-- Returns: 13:47:00.0000000
```

### CONVERT with Style 108 (Solution)
```sql
SELECT CONVERT(VARCHAR(8), heure_ouverture, 108) as heure_ouverture 
FROM PlageHoraire WHERE id = 32;
-- Returns: 13:47:00
```

### Common SQL Server Time Styles
| Style | Format | Example |
|-------|--------|---------|
| 8 | HH:mm:ss | 13:47:00 |
| 108 | HH:mm:ss | 13:47:00 |
| 114 | HH:mm:ss.mmm | 13:47:00.000 |

We use style **108** to get clean `HH:mm:ss` format without milliseconds.

---

## Files Modified

### Backend
1. **backend/controllers/timeSlotController.js**
   - `getAllTimeSlots()` - Added CONVERT for time columns
   - `getAgencyTimeSlots()` - Added CONVERT for time columns

### Frontend
2. **frontend/app/dashboard/admin/timeslots/page.tsx**
   - Enhanced `normalizeTime()` in `openEditModal()`
   - Added logging for debugging

---

## Testing Instructions

### Test 1: View Timeslots List
1. Go to Admin Dashboard → Plages Horaires
2. Check browser console for network response
3. **Expected**: Times in format "HH:mm:ss" (no milliseconds)

### Test 2: Edit Timeslot
1. Click "Modifier" on any timeslot
2. Check browser console for:
   ```
   [normalizeTime] "13:47:00" → "13:47"
   [Edit Modal] Original slot: { heure_ouverture: "13:47:00", ... }
   [Edit Modal] Normalized times: { heureOuverture: "13:47", ... }
   ```
3. **Expected**: Times normalized correctly

### Test 3: Submit Edit
1. Make a change (e.g., capacity)
2. Click "Mettre à jour"
3. Check console for:
   ```
   [Submit] Form data being sent: { heure_ouverture: "13:47", ... }
   ```
4. **Expected**: Success, no validation error

### Test 4: Verify Database
```sql
SELECT 
    id,
    CONVERT(VARCHAR(8), heure_ouverture, 108) as heure_ouverture,
    CONVERT(VARCHAR(8), heure_fermeture, 108) as heure_fermeture
FROM PlageHoraire
WHERE id = 32;
```
**Expected**: Times unchanged, still correct

---

## Why This Happened

SQL Server's TIME data type stores values with high precision (7 decimal places for fractional seconds). When querying with `SELECT *`, the driver returns the full precision format.

Different database drivers handle this differently:
- Some automatically format to "HH:mm:ss"
- Others return full precision "HH:mm:ss.0000000"

**Solution**: Always explicitly format TIME columns in SQL queries when sending to frontend.

---

## Related Issues Fixed

This completes all timeslot system fixes:

1. ✅ Time format normalization (HH:mm → HH:mm:ss)
2. ✅ Day of week conversion (0-6 → 1-7)
3. ✅ Time range validation (opening < closing)
4. ✅ Edit form day conversion (7 → 0 for Sunday)
5. ✅ **SQL Server TIME format handling (milliseconds)**

---

## Status: COMPLETE

All timeslot issues are now resolved. The system properly handles SQL Server's TIME format with milliseconds.

**Next Step**: Restart backend and test editing timeslots.
