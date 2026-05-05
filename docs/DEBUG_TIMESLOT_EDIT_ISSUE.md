# Debug: Timeslot Edit Invalid Time Range

**Date**: May 5, 2026  
**Status**: 🔍 DEBUGGING  
**Issue**: Getting `INVALID_TIME_RANGE` error when editing timeslots

---

## Problem

When trying to edit an existing timeslot, the validation is rejecting it with:
```
INVALID_TIME_RANGE
L'heure d'ouverture doit être avant l'heure de fermeture
```

This suggests the time values are being corrupted or swapped during the edit process.

---

## Debugging Steps

### Step 1: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Click "Modifier" on any timeslot
4. Look for these log messages:
   ```
   [Edit Modal] Original slot: { ... }
   [Edit Modal] Normalized times: { heureOuverture: "...", heureFermeture: "..." }
   ```

**What to check**:
- Are the times in the correct format?
- Are they in the correct order (opening < closing)?
- Are there any unexpected characters or formats?

### Step 2: Check Form Submission

1. After opening edit modal, make a small change (e.g., capacity)
2. Click "Mettre à jour"
3. Look for this log message:
   ```
   [Submit] Form data being sent: { ... }
   ```

**What to check**:
- `heure_ouverture` value
- `heure_fermeture` value
- Are they still in correct order?

### Step 3: Check Backend Logs

Look at the backend console for:
```
[TimeSlot] Updating with: { id, jour_semaine, heure_ouverture, heure_fermeture, capacite }
```

**What to check**:
- Are the times in "HH:mm:ss" format after normalization?
- Is `heure_ouverture < heure_fermeture`?

### Step 4: Check Database Values

Run this query to see the actual stored values:
```sql
SELECT 
    id,
    agence_id,
    jour_semaine,
    CAST(heure_ouverture AS VARCHAR(20)) as heure_ouverture,
    CAST(heure_fermeture AS VARCHAR(20)) as heure_fermeture,
    capacite
FROM PlageHoraire
ORDER BY id;
```

**What to check**:
- Are times stored correctly in database?
- Any unusual formats or values?

---

## Possible Causes

### 1. Database Returns Unexpected Format
**Symptom**: Times come back as "HH:mm:ss.0000000" or with timezone info  
**Solution**: Update `normalizeTime()` function to handle more formats

### 2. Time Values Are Swapped
**Symptom**: Opening time is actually greater than closing time in database  
**Solution**: Fix the data in database

### 3. String Comparison Issue
**Symptom**: Validation compares strings incorrectly  
**Solution**: Convert to Date objects for comparison

### 4. Empty or Null Values
**Symptom**: One of the time values is empty/null  
**Solution**: Add null checks in validation

---

## Quick Fixes to Try

### Fix 1: More Robust Time Normalization

Already implemented in `openEditModal()`:
```typescript
const normalizeTime = (timeStr: string) => {
  if (!timeStr) return '';
  if (timeStr.length === 5 && timeStr.includes(':')) return timeStr;
  if (timeStr.length >= 8) return timeStr.substring(0, 5);
  return timeStr;
};
```

### Fix 2: Better Error Display

Already implemented in `handleSubmit()`:
```typescript
if (errorDetails) {
  alert(`${errorMessage}\n\nDétails:\nOuverture: ${errorDetails.heure_ouverture}\nFermeture: ${errorDetails.heure_fermeture}`);
}
```

This will show you the actual time values that failed validation.

---

## Testing Instructions

### Test 1: View Existing Timeslot Data
1. Open browser console
2. Go to timeslots page
3. Look at the network tab
4. Check the response from `GET /api/timeslots`
5. Note the format of `heure_ouverture` and `heure_fermeture`

### Test 2: Edit Without Changes
1. Click "Modifier" on a timeslot
2. Don't change anything
3. Click "Mettre à jour"
4. If this fails, the issue is in data loading/normalization

### Test 3: Edit With Changes
1. Click "Modifier" on a timeslot
2. Change only the capacity
3. Click "Mettre à jour"
4. If this fails, check the console logs for the actual values being sent

---

## Expected Behavior

### Correct Flow
1. **Database**: `heure_ouverture: 08:00:00`, `heure_fermeture: 18:00:00`
2. **Frontend Load**: Normalize to `"08:00"` and `"18:00"`
3. **Form Display**: Show in `<input type="time">` as `"08:00"` and `"18:00"`
4. **Form Submit**: Send as `"08:00"` and `"18:00"`
5. **Backend Normalize**: Convert to `"08:00:00"` and `"18:00:00"`
6. **Backend Validate**: `"08:00:00" < "18:00:00"` ✓
7. **Database Update**: Store as `08:00:00` and `18:00:00`

### Where It Might Break
- **Step 2**: If database returns unexpected format (e.g., with milliseconds)
- **Step 3**: If `<input type="time">` corrupts the value
- **Step 5**: If normalization adds `:00` incorrectly
- **Step 6**: If string comparison fails

---

## Workaround

If you need to edit timeslots immediately, you can:

1. **Delete and recreate** instead of editing
2. **Edit directly in database**:
   ```sql
   UPDATE PlageHoraire
   SET capacite = 10
   WHERE id = 1;
   ```

---

## Next Steps

1. ✅ Added console.log debugging
2. ✅ Added better error messages
3. ✅ Added robust time normalization
4. ⏳ **YOU**: Check browser console logs
5. ⏳ **YOU**: Report what you see in the logs
6. ⏳ **ME**: Fix based on actual data format

---

## Status: WAITING FOR DEBUG INFO

Please try to edit a timeslot again and share:
1. Browser console logs (especially the `[Edit Modal]` and `[Submit]` messages)
2. The error alert message (should now show the actual time values)
3. Backend console logs (the `[TimeSlot] Updating with:` message)

This will help identify the exact issue.
