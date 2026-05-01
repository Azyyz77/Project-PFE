# 🧪 Information System - Testing Guide

## Quick Start

### 1. Database Setup ✅
La migration a été exécutée avec succès. Pour corriger l'erreur des documents, exécutez :

```sql
-- Exécuter ce script pour insérer les documents manquants
-- Fichier: backend/migrations/fix_information_documents.sql
```

### 2. Backend Setup ✅
Le serveur doit être redémarré pour charger les nouvelles routes :

```bash
cd backend
# Arrêter le serveur (Ctrl+C)
node server.js
# Ou
npm start
```

### 3. Frontend Setup ✅
Le frontend Next.js se recharge automatiquement (hot reload).

---

## Testing Checklist

### Database Tests

#### Vérifier les tables
```sql
-- Vérifier que les tables existent
SELECT * FROM SectionInformation;
SELECT * FROM ContenuInformation;
SELECT * FROM DocumentTelecharge;
SELECT * FROM VueSectionsInformation;
```

#### Vérifier les données
```sql
-- Compter les enregistrements
SELECT 'Sections' as Type, COUNT(*) as Count FROM SectionInformation
UNION ALL
SELECT 'Contenus', COUNT(*) FROM ContenuInformation
UNION ALL
SELECT 'Documents', COUNT(*) FROM DocumentTelecharge;

-- Voir les sections avec leurs compteurs
SELECT * FROM VueSectionsInformation ORDER BY ordre;
```

---

### Backend API Tests

#### Test avec curl ou Postman

**1. Get Active Sections (Public)**
```bash
curl http://localhost:3000/api/information/public/sections
```

**Expected Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "titre": "Garantie",
      "slug": "garantie",
      "icone": "Shield",
      "ordre": 1,
      "actif": true,
      ...
    }
  ]
}
```

**2. Get Section by Slug (Public)**
```bash
curl http://localhost:3000/api/information/public/sections/garantie
```

**3. Get Contents for Section (Public)**
```bash
curl http://localhost:3000/api/information/public/sections/1/contents
```

**4. Get All Documents (Public)**
```bash
curl http://localhost:3000/api/information/public/documents
```

**5. Get Admin Sections (Requires Auth)**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/information/admin/sections
```

---

### Frontend Client Tests

#### Access the Information Page
1. **Login as Client**
   - URL: `http://localhost:3001/login`
   - Use any client credentials

2. **Navigate to Informations**
   - Click "Informations" in the sidebar (AUTRES section)
   - Or go directly to: `http://localhost:3001/client/informations`

#### What to Test

**Sidebar Navigation**:
- [ ] All 5 sections appear
- [ ] Icons display correctly
- [ ] Click changes active section
- [ ] Active section is highlighted

**Content Display**:
- [ ] Section title shows
- [ ] Content count shows
- [ ] Document count shows
- [ ] HTML content renders correctly
- [ ] Multiple content cards display

**Documents**:
- [ ] Document list appears
- [ ] File name shows
- [ ] File size shows
- [ ] Download count shows
- [ ] Download button works (shows toast)

**Responsive Design**:
- [ ] Works on desktop
- [ ] Works on tablet
- [ ] Works on mobile
- [ ] Sidebar collapses on mobile

**Dark Mode**:
- [ ] Toggle dark mode
- [ ] All elements visible
- [ ] Proper contrast

---

### Frontend Admin Tests

#### Access the Admin Page
1. **Login as Admin**
   - URL: `http://localhost:3001/login`
   - Use admin credentials

2. **Navigate to Information Management**
   - Click "Informations" in the admin menu
   - Or go directly to: `http://localhost:3001/dashboard/admin/information`

#### What to Test

**Sections Tab**:
- [ ] All sections listed
- [ ] Order number shows
- [ ] Content/document counts show
- [ ] Active/Inactive badge shows
- [ ] Toggle active/inactive works
- [ ] Delete button works (with confirmation)

**Contents Tab**:
- [ ] All contents listed
- [ ] Section name shows
- [ ] Content preview shows
- [ ] Toggle active/inactive works
- [ ] Delete button works

**Documents Tab**:
- [ ] Placeholder message shows
- [ ] "Coming soon" text displays

**General**:
- [ ] Tabs switch correctly
- [ ] Loading states show
- [ ] Error messages display
- [ ] Success toasts appear

---

## Common Issues & Solutions

### Issue 1: Routes Not Found (404)
**Symptom**: API calls return 404  
**Solution**: Restart backend server
```bash
cd backend
# Stop server (Ctrl+C)
node server.js
```

### Issue 2: No Data Showing
**Symptom**: Empty lists on frontend  
**Solution**: Check database has data
```sql
SELECT COUNT(*) FROM SectionInformation;
-- Should return 5
```

### Issue 3: Documents Not Inserted
**Symptom**: Document count is 0  
**Solution**: Run fix script
```sql
-- Execute: backend/migrations/fix_information_documents.sql
```

### Issue 4: Authentication Error
**Symptom**: "Unauthorized" on admin routes  
**Solution**: 
1. Login as admin
2. Check token in localStorage
3. Verify token not expired

### Issue 5: Dark Mode Issues
**Symptom**: Elements not visible in dark mode  
**Solution**: Check Tailwind dark: classes are applied

---

## Sample Test Scenarios

### Scenario 1: Client Views Warranty Info
1. Login as client
2. Go to Informations page
3. Click "Garantie" section
4. Read warranty content
5. Download warranty certificate
6. Verify download count increments

**Expected**: Content displays, download works, counter updates

### Scenario 2: Admin Deactivates Section
1. Login as admin
2. Go to Information management
3. Click "Désactiver" on a section
4. Logout
5. Login as client
6. Go to Informations page

**Expected**: Deactivated section doesn't appear for clients

### Scenario 3: Admin Adds New Content
1. Login as admin
2. Go to Information management
3. Click "Contents" tab
4. Click "Nouveau Contenu" (placeholder)
5. Fill form (when implemented)
6. Save

**Expected**: New content appears in list

---

## Performance Tests

### Load Time
- [ ] Page loads in < 2 seconds
- [ ] Charts render smoothly
- [ ] No lag when switching sections

### API Response Time
- [ ] Sections API < 500ms
- [ ] Contents API < 500ms
- [ ] Documents API < 500ms

### Browser Compatibility
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers

---

## Security Tests

### Public Routes (Should Work Without Auth)
- [ ] GET /api/information/public/sections
- [ ] GET /api/information/public/sections/:slug
- [ ] GET /api/information/public/sections/:id/contents
- [ ] GET /api/information/public/documents

### Admin Routes (Should Require Auth)
- [ ] GET /api/information/admin/sections (401 without token)
- [ ] POST /api/information/admin/sections (401 without token)
- [ ] PUT /api/information/admin/sections/:id (401 without token)
- [ ] DELETE /api/information/admin/sections/:id (401 without token)

### Role-Based Access
- [ ] Client cannot access admin routes
- [ ] Agent cannot access admin routes
- [ ] Admin can access all routes

---

## Data Validation Tests

### Section Creation
- [ ] Title required
- [ ] Slug required
- [ ] Slug must be unique
- [ ] Order must be number
- [ ] Icon is optional

### Content Creation
- [ ] Section ID required
- [ ] Title required
- [ ] Content required
- [ ] Order must be number

### Document Creation
- [ ] Title required
- [ ] File name required
- [ ] File path required
- [ ] Section ID optional

---

## Accessibility Tests

### Keyboard Navigation
- [ ] Tab through sections
- [ ] Enter to select section
- [ ] Tab through documents
- [ ] Enter to download

### Screen Reader
- [ ] Section titles announced
- [ ] Content readable
- [ ] Buttons labeled
- [ ] Links descriptive

### Color Contrast
- [ ] Text readable in light mode
- [ ] Text readable in dark mode
- [ ] Links distinguishable
- [ ] Buttons clear

---

## Regression Tests

After any changes, verify:
- [ ] Existing sections still work
- [ ] Existing contents still display
- [ ] Existing documents still listed
- [ ] Navigation still works
- [ ] Admin functions still work

---

## Bug Reporting Template

If you find a bug, report it with:

```markdown
**Bug Title**: [Short description]

**Steps to Reproduce**:
1. Go to...
2. Click on...
3. See error...

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happens]

**Screenshots**:
[If applicable]

**Environment**:
- Browser: [e.g., Chrome 120]
- OS: [e.g., Windows 11]
- User Role: [Client/Admin]

**Console Errors**:
[Any errors in browser console]
```

---

## Success Criteria

The Information System is working correctly if:

✅ All 5 sections display for clients  
✅ Content renders with proper HTML formatting  
✅ Documents list with download buttons  
✅ Admin can view all sections and contents  
✅ Admin can toggle active/inactive  
✅ Admin can delete items  
✅ No console errors  
✅ Responsive on all devices  
✅ Dark mode works  
✅ Fast load times  

---

## Next Steps After Testing

1. **If All Tests Pass**:
   - Mark task as complete ✅
   - Move to next priority task
   - Update project status

2. **If Issues Found**:
   - Document bugs
   - Prioritize fixes
   - Implement fixes
   - Re-test

3. **Enhancements**:
   - Add rich text editor
   - Implement file upload
   - Add search functionality
   - Add analytics

---

**Testing Status**: Ready for Testing  
**Last Updated**: May 1, 2026  
**Tester**: [Your Name]  
**Date Tested**: [Date]  
