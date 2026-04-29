# 🔐 Worker CRUD Permissions - Complete Cycle

## Overview
This document defines the complete CRUD (Create, Read, Update, Delete) cycle for worker management with proper role-based access control.

## Role Permissions

### 👨‍💼 ADMIN Role
**Full CRUD Access** - Can manage all workers across all agencies

| Operation | Endpoint | Method | Description |
|-----------|----------|--------|-------------|
| **Create** | `/api/workers` | POST | Create new worker for any agency |
| **Read All** | `/api/workers` | GET | View all workers from all agencies |
| **Read Agency** | `/api/workers/agency/:agenceId` | GET | View workers from specific agency |
| **Update** | `/api/workers/:ouvrierId` | PUT | Update worker information |
| **Delete** | `/api/workers/:ouvrierId` | DELETE | Deactivate worker (soft delete) |
| **Statistics** | `/api/workers/agency/:agenceId/statistics` | GET | View worker statistics |
| **Assignments** | `/api/workers/assignments` | GET | View all assignments |

### 👨‍💻 AGENT SAV Role
**Read & Assign Only** - Can view and assign workers from their own agency

| Operation | Endpoint | Method | Description |
|-----------|----------|--------|-------------|
| **Read Agency** | `/api/workers/agency/:agenceId` | GET | View workers from their agency only |
| **Assign** | `/api/workers/assignments` | POST | Assign worker to appointment |
| **View Assignments** | `/api/workers/agency/:agenceId/assignments` | GET | View assignments from their agency |
| **Update Assignment** | `/api/workers/assignments/:assignmentId` | PUT | Update assignment status |
| **Statistics** | `/api/workers/agency/:agenceId/statistics` | GET | View worker statistics |
| **Available Workers** | `/api/workers/agency/:agenceId/available` | GET | View available workers |
| **Unassigned Appointments** | `/api/workers/agency/:agenceId/unassigned-appointments` | GET | View unassigned appointments |

**❌ AGENT CANNOT:**
- Create new workers
- Update worker information
- Delete/deactivate workers
- Access workers from other agencies

## API Endpoints

### 1. Create Worker (ADMIN Only)
```http
POST /api/workers
Authorization: Bearer <admin_token>

{
  "nom": "Doe",
  "prenom": "John",
  "telephone": "+21612345678",
  "email": "john.doe@example.com",
  "specialite": "Mécanique",
  "niveau_competence": "Expert",
  "agence_id": 1,
  "date_embauche": "2024-01-15",
  "notes": "Spécialiste moteur"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Ouvrier créé avec succès",
  "worker": {
    "id": 1,
    "nom": "Doe",
    "prenom": "John",
    "agence_id": 1,
    "actif": true,
    ...
  }
}
```

### 2. Update Worker (ADMIN Only)
```http
PUT /api/workers/:ouvrierId
Authorization: Bearer <admin_token>

{
  "telephone": "+21698765432",
  "specialite": "Électricité",
  "niveau_competence": "Expert",
  "actif": true
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Ouvrier mis à jour avec succès",
  "worker": { ... }
}
```

### 3. Delete Worker (ADMIN Only)
```http
DELETE /api/workers/:ouvrierId
Authorization: Bearer <admin_token>
```

**Response 200:**
```json
{
  "success": true,
  "message": "Ouvrier John Doe désactivé avec succès"
}
```

**Note:** This is a soft delete - the worker is deactivated (`actif = 0`) but not removed from database.

### 4. Get Workers by Agency (AGENT & ADMIN)
```http
GET /api/workers/agency/:agenceId?actif=true&specialite=Mécanique
Authorization: Bearer <token>
```

**Security:**
- AGENT: Can only access their own `agence_id`
- ADMIN: Can access any `agence_id`

**Response 200:**
```json
{
  "success": true,
  "workers": [
    {
      "id": 1,
      "nom": "Doe",
      "prenom": "John",
      "agence_nom": "STA Tunis Nord",
      "affectations_en_cours": 2,
      ...
    }
  ]
}
```

### 5. Assign Worker to Appointment (AGENT & ADMIN)
```http
POST /api/workers/assignments
Authorization: Bearer <token>

{
  "rendez_vous_id": 5,
  "ouvrier_id": 1,
  "priorite": "HAUTE",
  "temps_estime_minutes": 120,
  "notes_agent": "Problème moteur urgent"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Ouvrier affecté avec succès",
  "assignment": {
    "id": 1,
    "rendez_vous_id": 5,
    "ouvrier_id": 1,
    "statut": "EN_ATTENTE",
    ...
  }
}
```

## Security Implementation

### Backend Route Protection
```javascript
// backend/routes/workerRoutes.js

// ADMIN ONLY - CRUD Operations
router.post('/', hasRole('ADMIN'), workerController.createWorker);
router.put('/:ouvrierId', hasRole('ADMIN'), workerController.updateWorker);
router.delete('/:ouvrierId', hasRole('ADMIN'), workerController.deleteWorker);

// AGENT & ADMIN - Read & Assign
router.get('/agency/:agenceId', hasRole('AGENT', 'ADMIN'), workerController.getWorkersByAgency);
router.post('/assignments', hasRole('AGENT', 'ADMIN'), workerController.assignWorkerToAppointment);
```

### Multi-Agency Isolation
All AGENT endpoints include security checks:

```javascript
// Verify agent can only access their own agency
if (req.user.role === 'AGENT') {
  if (!req.user.agence_id) {
    return res.status(403).json({
      error: 'Accès refusé',
      message: 'Aucune agence associée à votre compte'
    });
  }
  
  // Type-safe comparison
  if (Number(req.user.agence_id) !== Number(agenceId)) {
    return res.status(403).json({
      error: 'Accès refusé',
      message: 'Vous ne pouvez accéder qu\'aux données de votre agence'
    });
  }
}
```

## Frontend Implementation

### Admin Dashboard
```typescript
// frontend/app/dashboard/admin/workers/page.tsx

// Admin can:
- View all workers from all agencies
- Create new workers
- Edit worker details
- Deactivate/activate workers
- Filter by agency
```

### Agent Dashboard
```typescript
// frontend/app/dashboard/agent/workers/page.tsx

// Agent can:
- View workers from their agency only
- Assign workers to appointments
- View worker statistics
- View assignments
- Update assignment status

// Agent CANNOT:
- Create workers (button hidden)
- Edit worker details
- Delete workers
```

## Database Schema

### Ouvrier Table
```sql
CREATE TABLE Ouvrier (
  id BIGINT PRIMARY KEY IDENTITY(1,1),
  nom NVARCHAR(100) NOT NULL,
  prenom NVARCHAR(100) NOT NULL,
  telephone NVARCHAR(20),
  email NVARCHAR(255),
  specialite NVARCHAR(100),
  niveau_competence NVARCHAR(50) DEFAULT 'Intermédiaire',
  agence_id BIGINT NOT NULL,
  actif BIT DEFAULT 1,
  date_embauche DATE,
  photo_url NVARCHAR(500),
  notes NVARCHAR(MAX),
  created_at DATETIME2 DEFAULT GETDATE(),
  updated_at DATETIME2 DEFAULT GETDATE(),
  FOREIGN KEY (agence_id) REFERENCES Agence(id)
);
```

## Testing

### Test CRUD Cycle (ADMIN)
```bash
# 1. Create worker
curl -X POST http://localhost:3000/api/workers \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"nom":"Test","prenom":"Worker","agence_id":1}'

# 2. Update worker
curl -X PUT http://localhost:3000/api/workers/1 \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"specialite":"Mécanique"}'

# 3. Delete worker
curl -X DELETE http://localhost:3000/api/workers/1 \
  -H "Authorization: Bearer <admin_token>"
```

### Test Agent Restrictions
```bash
# Agent tries to create worker (should fail with 403)
curl -X POST http://localhost:3000/api/workers \
  -H "Authorization: Bearer <agent_token>" \
  -H "Content-Type: application/json" \
  -d '{"nom":"Test","prenom":"Worker","agence_id":1}'

# Expected: 403 Forbidden
```

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad request (missing data) |
| 401 | Unauthorized (no token) |
| 403 | Forbidden (wrong role or agency) |
| 404 | Worker not found |
| 500 | Server error |

## Summary

✅ **ADMIN**: Full CRUD access to all workers
✅ **AGENT**: Read-only + assignment capabilities for their agency
✅ **Security**: Multi-agency isolation enforced
✅ **Soft Delete**: Workers are deactivated, not deleted
✅ **Type-Safe**: All comparisons use Number() conversion
✅ **Complete Cycle**: Create → Read → Update → Delete → Assign

## Files Modified
- `backend/routes/workerRoutes.js` - Added UPDATE and DELETE routes
- `backend/controllers/workerController.js` - Added updateWorker() and deleteWorker()
- `frontend/lib/api/workers.ts` - Already has UPDATE functions
- `docs/PERMISSIONS_MATRIX.md` - Updated with correct permissions
