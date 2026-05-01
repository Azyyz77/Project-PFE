# Quick Restart and Test Guide 🚀

## Current Situation
✅ All code fixes are complete  
⏳ Server needs restart to load new code  
⏳ API tests pending  

---

## Step-by-Step Instructions

### 1️⃣ Stop the Current Server
In the terminal where the backend is running, press:
```
Ctrl + C
```

### 2️⃣ Restart the Server
```bash
cd backend
npm run dev
```

**Expected Output**:
```
[nodemon] starting `node server.js`
[AI Assistant] Initialized with: { provider: 'Groq', model: 'llama-3.3-70b-versatile' }
🚀 Serveur monolithique démarré sur le port 3000
📍 http://localhost:3000
✅ Base de données connectée avec succès!
```

**✅ If you see this, the server started successfully!**

---

### 3️⃣ Run API Tests
Open a NEW terminal and run:
```bash
node backend/scripts/testInformationAPI.js
```

**Expected Output**:
```
================================================================================
TEST DES API DU SYSTÈME D'INFORMATION
================================================================================

1️⃣  TEST: GET /public/sections
✅ SUCCÈS - 5 sections récupérées
   - Garantie (garantie)
   - Assurance (assurance)
   - Documents Requis (documents-requis)
   - Entretien (entretien)
   - Contact (contact)

2️⃣  TEST: GET /public/sections/garantie
✅ SUCCÈS - Section récupérée

3️⃣  TEST: GET /public/sections/1/contents
✅ SUCCÈS - 2 contenus récupérés

4️⃣  TEST: GET /public/documents
✅ SUCCÈS - 4 documents récupérés

5️⃣  TEST: GET /public/sections/1/documents
✅ SUCCÈS - 2 documents récupérés

6️⃣  TEST: POST /public/documents/1/download
✅ SUCCÈS - Compteur de téléchargement incrémenté

================================================================================
📋 RÉSUMÉ DES TESTS
================================================================================
✅ Tests réussis: 6/6
❌ Tests échoués: 0/6

🎉 TOUS LES TESTS SONT PASSÉS!
✅ Le système d'information est opérationnel
```

---

### 4️⃣ Test Frontend (Client Page)
Open your browser and go to:
```
http://localhost:3001/client/informations
```

**What to Check**:
- ✅ Sidebar shows 5 sections
- ✅ Clicking a section loads its content
- ✅ HTML content renders properly
- ✅ Document list appears
- ✅ Download buttons work

---

### 5️⃣ Test Frontend (Admin Page)
Open your browser and go to:
```
http://localhost:3001/dashboard/admin/information
```

**Login as Admin**:
- Email: `admin@sta-chery.tn`
- Password: (your admin password)

**What to Check**:
- ✅ 3 tabs visible (Sections, Contents, Documents)
- ✅ Can toggle active/inactive
- ✅ Can delete items
- ✅ Can create new items
- ✅ Can edit existing items

---

## 🐛 Troubleshooting

### Problem: Server won't start
**Error**: `authorizeRoles is not a function`

**Solution**: Make sure you saved all files. Check:
```bash
git status
```

If you see modified files, the changes are saved. Try restarting again.

---

### Problem: API tests still fail
**Error**: `Request failed with status code 500`

**Check**:
1. Is the server running? Check terminal for errors
2. Is the database connected? Look for `✅ Base de données connectée`
3. Check server logs for specific errors

**Debug**:
```bash
# Test a single endpoint manually
curl http://localhost:3000/api/information/public/sections
```

---

### Problem: Frontend pages don't load
**Error**: 404 or blank page

**Check**:
1. Is frontend running on port 3001?
2. Is backend running on port 3000?
3. Check browser console for errors (F12)

**Restart Frontend**:
```bash
cd frontend
npm run dev
```

---

## 📋 Quick Checklist

- [ ] Backend server stopped (Ctrl+C)
- [ ] Backend server restarted (`npm run dev`)
- [ ] Server shows "✅ Base de données connectée"
- [ ] API tests run (`node backend/scripts/testInformationAPI.js`)
- [ ] All 6 API tests pass ✅
- [ ] Client page loads (`http://localhost:3001/client/informations`)
- [ ] Admin page loads (`http://localhost:3001/dashboard/admin/information`)
- [ ] Can view sections, contents, and documents
- [ ] Can toggle active/inactive (admin)
- [ ] Can delete items (admin)

---

## ✅ Success Criteria

When everything works, you should see:

1. **API Tests**: 6/6 passed ✅
2. **Client Page**: Sections load with content and documents ✅
3. **Admin Page**: Can manage sections, contents, and documents ✅

---

## 🎉 What's Next?

Once all tests pass:

1. **Optional**: Clean up duplicate contents in database
   ```bash
   sqlcmd -S localhost -d STA_SAV_DB -U dali -P Daligh2004 -i backend/migrations/clean_duplicate_contents.sql
   ```

2. **Test thoroughly**: Try all CRUD operations in admin panel

3. **Move to next feature**: Information System is COMPLETE! ✅

---

## 📞 Need Help?

If you encounter any issues:

1. Check `docs/INFORMATION_SYSTEM_FIXES_COMPLETE.md` for detailed fix information
2. Check `docs/DEMARRAGE_RAPIDE_INFORMATION.md` for system overview
3. Check `docs/RESUME_FINAL_INFORMATION.md` for complete documentation

---

**Last Updated**: May 1, 2026  
**Status**: Ready for testing after server restart
