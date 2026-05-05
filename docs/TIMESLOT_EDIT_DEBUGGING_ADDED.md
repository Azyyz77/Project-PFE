# Timeslot Edit - Debugging Added

**Date**: May 5, 2026  
**Status**: 🔍 DEBUGGING ENABLED  
**Issue**: `INVALID_TIME_RANGE` error when editing timeslots

---

## What Was Added

### Frontend Debugging (`frontend/app/dashboard/admin/timeslots/page.tsx`)

#### 1. Enhanced Time Normalization
```typescript
const normalizeTime = (timeStr: string) => {
  if (!timeStr) return '';
  // If it's already in HH:mm format, return as-is
  if (timeStr.length === 5 && timeStr.includes(':')) return timeStr;
  // If it has seconds, strip them
  if (timeStr.length >= 8) return timeStr.substring(0, 5);
  return timeStr;
};
```

**Handles**:
- "HH:mm" format (already correct)
- "HH:mm:ss" format (strips seconds)
- "HH:mm:ss.0000000" format (strips everything after mm)
- Empty/null values

#### 2. Console Logging in `openEditModal()`
```typescript
console.log('[Edit Modal] Original slot:', slot);
console.log('[Edit Modal] Normalized times:', { heureOuverture, heureFermeture });
```

**Shows**:
- Raw data from database
- Normalized time values before populating form

#### 3. Console Logging in `handleSubmit()`
```typescript
console.log('[Submit] Form data being sent:', formData);
```

**Shows**:
- Exact data being sent to backend

#### 4. Better Error Display
```typescript
if (errorDetails) {
  alert(`${errorMessage}\n\nDétails:\nOuverture: ${errorDetails.heure_ouverture}\nFermeture: ${errorDetails.heure_fermeture}`);
} else {
  alert(errorMessage);
}
```

**Shows**:
- Validation error message
- Actual time values that failed validation

### Backend Debugging (`backend/controllers/timeSlotController.js`)

#### 1. Log Received Data
```javascript
console.log('[TimeSlot] Update received:', { id, jour_semaine, heure_ouverture, heure_fermeture, capacite });
```

**Shows**:
- Raw data received from frontend before any processing

#### 2. Existing Log After Processing
```javascript
console.log('[TimeSlot] Updating with:', { id, jour_semaine, heure_ouverture, heure_fermeture, capacite });
```

**Shows**:
- Data after normalization and conversion

---

## How to Debug

### Step 1: Open Browser Console
1. Press F12 to open DevTools
2. Go to Console tab
3. Clear console (optional)

### Step 2: Try to Edit a Timeslot
1. Go to Admin Dashboard → Plages Horaires
2. Click "Modifier" on any timeslot
3. **Check console** for:
   ```
   [Edit Modal] Original slot: { ... }
   [Edit Modal] Normalized times: { ... }
   ```

### Step 3: Submit the Edit
1. Make any change (or no change)
2. Click "Mettre à jour"
3. **Check console** for:
   ```
   [Submit] Form data being sent: { ... }
   ```

### Step 4: Check Backend Console
Look at your backend terminal for:
```
[TimeSlot] Update received: { ... }
[TimeSlot] Updating with: { ... }
```

### Step 5: Note the Error Alert
The error alert will now show:
```
L'heure d'ouverture doit être avant l'heure de fermeture

Détails:
Ouverture: 18:00:00
Fermeture: 08:00:00
```

---

## What to Look For

### Scenario 1: Times Are Swapped
**Console shows**:
```
[Edit Modal] Original slot: { heure_ouverture: "18:00:00", heure_fermeture: "08:00:00" }
```

**Problem**: Data in database is wrong  
**Solution**: Fix database data or investigate why it was stored incorrectly

### Scenario 2: Times Have Unexpected Format
**Console shows**:
```
[Edit Modal] Original slot: { heure_ouverture: "08:00:00.0000000", ... }
[Edit Modal] Normalized times: { heureOuverture: "08:00:00.000", ... }
```

**Problem**: Normalization not handling SQL Server format  
**Solution**: Update `normalizeTime()` function

### Scenario 3: Times Are Correct But Validation Fails
**Console shows**:
```
[Submit] Form data being sent: { heure_ouverture: "08:00", heure_fermeture: "18:00" }
[TimeSlot] Update received: { heure_ouverture: "08:00", heure_fermeture: "18:00" }
[TimeSlot] Updating with: { heure_ouverture: "08:00:00", heure_fermeture: "18:00:00" }
```
**But still fails validation**

**Problem**: String comparison issue or normalization bug  
**Solution**: Check validation logic

### Scenario 4: Empty or Undefined Values
**Console shows**:
```
[Edit Modal] Normalized times: { heureOuverture: "", heureFermeture: "18:00" }
```

**Problem**: Database returning null or frontend not reading correctly  
**Solution**: Add null checks

---

## Quick Test

Run this in browser console on the timeslots page:
```javascript
// Get first timeslot from the list
const firstSlot = document.querySelector('tbody tr');
if (firstSlot) {
  console.log('First timeslot HTML:', firstSlot.innerHTML);
}
```

This will show you how the times are being displayed in the table.

---

## Files Modified

1. ✅ `frontend/app/dashboard/admin/timeslots/page.tsx`
   - Enhanced `normalizeTime()` function
   - Added console.log in `openEditModal()`
   - Added console.log in `handleSubmit()`
   - Improved error display with details

2. ✅ `backend/controllers/timeSlotController.js`
   - Added console.log at start of `updateTimeSlot()`

---

## Next Actions

1. ✅ Code changes complete
2. ⏳ **Restart backend** to load updated controller
3. ⏳ **Refresh frontend** to load updated page
4. ⏳ **Try editing a timeslot** and collect console logs
5. ⏳ **Share the console output** so we can identify the issue

---

## Status: READY TO DEBUG

All debugging tools are in place. Please try editing a timeslot and share the console output from both browser and backend.
