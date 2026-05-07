# 🔧 Dépannage Sidebar - Guide de Résolution

## 🚨 Problèmes Potentiels et Solutions

### 1. Erreur: `Exception in HostFunction`

**Symptôme**:
```
ERROR [runtime not ready]: Error: Exception in HostFunction: <unknown>
```

**Causes Possibles**:
- Packages `react-native-reanimated` ou `react-native-gesture-handler` encore présents
- Cache Metro non nettoyé
- node_modules corrompus

**Solutions**:
```bash
# 1. Vérifier package.json
cat package.json | grep -E "(reanimated|gesture-handler|drawer)"
# Si trouvé, supprimer:
npm uninstall react-native-reanimated react-native-gesture-handler @react-navigation/drawer

# 2. Nettoyer complètement
rm -rf node_modules package-lock.json
rm -rf .expo
npm install

# 3. Redémarrer avec cache nettoyé
npx expo start --clear

# 4. Dans Expo Go, appuyer sur 'r' pour recharger
```

---

### 2. Erreur: `Cannot find module '@react-navigation/drawer'`

**Symptôme**:
```
Cannot find module '@react-navigation/drawer' or its corresponding type declarations
```

**Causes Possibles**:
- Fichier `CustomDrawer.tsx` encore présent
- Import du drawer quelque part dans le code

**Solutions**:
```bash
# 1. Vérifier si CustomDrawer existe
ls src/components/CustomDrawer.tsx
# Si existe, supprimer:
rm src/components/CustomDrawer.tsx

# 2. Chercher les imports du drawer
grep -r "@react-navigation/drawer" src/

# 3. Nettoyer et redémarrer
npx expo start --clear
```

---

### 3. Erreur: `Cannot find module 'babel-preset-expo'`

**Symptôme**:
```
Error: Cannot find module 'babel-preset-expo'
```

**Causes Possibles**:
- Dépendance manquante dans devDependencies
- node_modules corrompus

**Solutions**:
```bash
# 1. Vérifier babel.config.js
cat babel.config.js
# Doit contenir:
# presets: ['babel-preset-expo']

# 2. Réinstaller babel-preset-expo
npm install --save-dev babel-preset-expo@^55.0.21

# 3. Nettoyer et redémarrer
rm -rf node_modules package-lock.json
npm install
npx expo start --clear
```

---

### 4. Sidebar ne s'ouvre pas

**Symptôme**:
- Clic sur le bouton ☰ ne fait rien
- Aucune erreur dans la console

**Causes Possibles**:
- State `sidebarVisible` non mis à jour
- Composant SimpleSidebar non importé

**Solutions**:
```typescript
// 1. Vérifier l'import dans HomeScreen.tsx
import SimpleSidebar from '../components/SimpleSidebar';

// 2. Vérifier le state
const [sidebarVisible, setSidebarVisible] = useState(false);

// 3. Vérifier le bouton
<TouchableOpacity onPress={() => setSidebarVisible(true)}>
  <Text>☰</Text>
</TouchableOpacity>

// 4. Vérifier le composant
<SimpleSidebar
  visible={sidebarVisible}
  onClose={() => setSidebarVisible(false)}
  navigation={navigation}
/>
```

---

### 5. Badges ne s'affichent pas

**Symptôme**:
- Compteurs de véhicules, RDV, notifications sont vides ou à 0

**Causes Possibles**:
- DataContext non chargé
- API ne retourne pas de données

**Solutions**:
```typescript
// 1. Vérifier DataContext dans SimpleSidebar.tsx
const { vehicles, appointments, notifications } = useData();
console.log('Vehicles:', vehicles.length);
console.log('Appointments:', appointments.length);
console.log('Notifications:', notifications.length);

// 2. Vérifier le calcul des notifications non lues
const unreadNotifications = notifications.filter((n: any) => !n.lu).length;
console.log('Unread:', unreadNotifications);

// 3. Forcer le rechargement des données
// Dans HomeScreen, ajouter:
useEffect(() => {
  loadUserData();
}, []);
```

---

### 6. Navigation ne fonctionne pas

**Symptôme**:
- Clic sur un élément du menu ne navigue pas
- Erreur: `undefined is not an object (evaluating 'navigation.navigate')`

**Causes Possibles**:
- Prop `navigation` non passée
- Route non définie dans AppNavigator

**Solutions**:
```typescript
// 1. Vérifier la prop dans HomeScreen.tsx
<SimpleSidebar
  visible={sidebarVisible}
  onClose={() => setSidebarVisible(false)}
  navigation={navigation}  // ← Doit être présent
/>

// 2. Vérifier les routes dans AppNavigator.tsx
<Stack.Screen name="Vehicles" component={VehiclesScreen} />
<Stack.Screen name="Appointments" component={AppointmentsScreen} />
// etc.

// 3. Vérifier la fonction navigateToScreen dans SimpleSidebar.tsx
const navigateToScreen = (screen: string) => {
  onClose();  // Fermer d'abord
  navigation.navigate(screen);  // Puis naviguer
};
```

---

### 7. Overlay ne ferme pas la sidebar

**Symptôme**:
- Clic à l'extérieur de la sidebar ne la ferme pas

**Causes Possibles**:
- TouchableOpacity mal configuré
- onPress non appelé

**Solutions**:
```typescript
// Vérifier la structure dans SimpleSidebar.tsx
<Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
  <View style={styles.overlay}>
    {/* Overlay touchable */}
    <TouchableOpacity 
      style={styles.overlayTouchable} 
      activeOpacity={1}
      onPress={onClose}  // ← Doit appeler onClose
    />
    
    {/* Sidebar */}
    <View style={styles.sidebar}>
      {/* Contenu */}
    </View>
  </View>
</Modal>

// Styles
overlayTouchable: {
  flex: 1,  // ← Important pour couvrir tout l'espace
},
sidebar: {
  width: '85%',
  backgroundColor: colors.background,
},
```

---

### 8. Erreur TypeScript

**Symptôme**:
```
Property 'X' does not exist on type 'Y'
```

**Solutions**:
```bash
# 1. Vérifier les types dans src/types/index.ts
# 2. Redémarrer le serveur TypeScript
# 3. Si persistant, ajouter // @ts-ignore temporairement
```

---

## 🔍 Commandes de Diagnostic

### Vérifier les packages installés
```bash
npm list react-native-reanimated
npm list react-native-gesture-handler
npm list @react-navigation/drawer
# Tous doivent retourner: (empty)
```

### Vérifier les imports problématiques
```bash
grep -r "react-native-reanimated" src/
grep -r "react-native-gesture-handler" src/
grep -r "@react-navigation/drawer" src/
# Tous doivent retourner: (aucun résultat)
```

### Vérifier babel.config.js
```bash
cat babel.config.js
# Doit contenir uniquement:
# presets: ['babel-preset-expo']
# PAS de plugin reanimated
```

### Vérifier les fichiers critiques
```bash
ls src/components/SimpleSidebar.tsx  # Doit exister
ls src/components/CustomDrawer.tsx   # NE doit PAS exister
```

---

## 🚀 Procédure de Nettoyage Complet

Si tous les problèmes persistent, suivre cette procédure:

```bash
# 1. Arrêter Expo
# Ctrl+C dans le terminal

# 2. Supprimer tous les caches
rm -rf node_modules
rm -rf package-lock.json
rm -rf .expo
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/metro-*

# 3. Supprimer les fichiers problématiques
rm -f src/components/CustomDrawer.tsx

# 4. Vérifier package.json
cat package.json
# S'assurer qu'il n'y a PAS:
# - react-native-reanimated
# - react-native-gesture-handler
# - @react-navigation/drawer

# 5. Réinstaller
npm install

# 6. Redémarrer avec cache nettoyé
npx expo start --clear

# 7. Dans Expo Go
# - Appuyer sur 'r' pour recharger
# - Ou fermer et rouvrir l'app
```

---

## 📞 Support

Si le problème persiste après toutes ces étapes:

1. **Copier les logs d'erreur complets**
2. **Vérifier la version d'Expo**: `npx expo --version`
3. **Vérifier la version de Node**: `node --version`
4. **Partager le contenu de**:
   - `package.json`
   - `babel.config.js`
   - Les logs d'erreur complets

---

## ✅ Checklist de Vérification

Avant de demander de l'aide, vérifier:

- [ ] `npx expo start --clear` exécuté
- [ ] Cache Metro nettoyé
- [ ] node_modules réinstallés
- [ ] Aucun package problématique dans package.json
- [ ] CustomDrawer.tsx supprimé
- [ ] SimpleSidebar.tsx existe
- [ ] babel.config.js propre (pas de plugin reanimated)
- [ ] App rechargée dans Expo Go (touche 'r')
- [ ] Logs d'erreur complets copiés

---

**Dernière mise à jour**: 7 Mai 2026
