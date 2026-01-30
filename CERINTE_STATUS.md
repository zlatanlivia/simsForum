# Status cerințe practică – Sims Forum

Lista de ce este implementat și ce mai trebuie adăugat pentru a îndeplini cerințele.

---

## ✅ Ce ai deja (parțial sau complet)

| Cerință | Status | Detalii |
|--------|--------|---------|
| Înregistrare (email/username + parolă) | ✅ | Backend `POST /api/register`, frontend Register |
| Autentificare / Deautentificare | ✅ | Backend `POST /api/login`, frontend Login + logout |
| Profil: nickname, avatar, „despre mine” | ✅ | Pagina Profile cu editare (date încă doar în frontend/mock) |
| Profil: listă subiecte/mesaje | ⚠️ Parțial | Afișare în Profile, dar din date mock |
| Structură forum: categorii, subiecte, mesaje | ✅ | Doar în frontend, cu date mock (Forum.js, Category.js, Topic.js) |
| Creare subiect într-o secțiune | ✅ | Doar în frontend (state local, nu se salvează în backend) |
| Răspuns la subiect | ✅ | Doar în frontend (state local) |
| Editare/ștergere mesaje proprii | ✅ | În Topic.js, cu verificare autor + Moderator |
| Roluri User / Moderator / Admin | ✅ | În obiectul user și în AuthContext (`isAdmin`, `isModerator`) |
| Achievements în profil | ✅ | Afișare în Profile, dar date mock (nu se obțin din backend) |
| Panou admin | ⚠️ Parțial | Componentă AdminPanel există, dar **nu există ruta în App.js** |
| README cu instrucțiuni | ✅ | README la root și în frontend |
| Validare date (backend) | ✅ | La înregistrare (câmpuri, parolă, duplicat email/username) |
| Forum dedicat unei tematici (joc) | ✅ | Tematică Sims |

---

## ❌ Ce trebuie adăugat sau corectat

### 1. Securitate (obligatoriu)

| Ce lipsește | Ce trebuie făcut |
|------------|------------------|
| **Parole stocate în clar** | Parolele sunt salvate plain text în `users.json`. Trebuie folosit **bcrypt** (sau similar): la înregistrare hash la parolă, la login `bcrypt.compare()`. Nu salva niciodată parola în clar. |
| **Protecție endpoint-uri cu token/sesiune** | Backend-ul nu verifică niciun token. Trebuie: JWT (sau sesiune) la login, trimis de frontend la fiecare request; middleware care verifică token-ul pe rutele protejate (profil, creare subiect, mesaje, admin). |

### 2. Backend – Forum (obligatoriu)

| Ce lipsește | Ce trebuie făcut |
|------------|------------------|
| **API pentru forum** | Acum categoriile, subiectele și mesajele sunt doar mock în frontend. Trebuie: |
| | • **Categorii**: GET (listă), eventual POST (creare) doar pentru Admin |
| | • **Subiecte**: GET pe categorie (cu **paginare** sau limită), POST (creare) pentru utilizator autentificat |
| | • **Mesaje (posts)**: GET pe subiect (cu **paginare** sau limită), POST (răspuns), PATCH (editare), DELETE (ștergere) cu verificare drepturi |
| **Persistență** | Datele forumului (categorii, subiecte, mesaje) trebuie stocate undeva: fișiere JSON (ca `users.json`), SQLite sau alt DB. Acum nu există. |

### 3. Roluri și drepturi (RBAC) la nivel de API

| Ce lipsește | Ce trebuie făcut |
|------------|------------------|
| **Drepturi în backend** | Rolurile există doar în frontend. Trebuie implementat în backend: |
| | • **User**: poate crea subiecte/mesaje, edita/șterge doar propriile (în limita de timp dacă ceri asta) |
| | • **Moderator**: poate șterge mesaje/subiecte ale altora, poate închide subiecte (câmp `closed` pe topic) |
| | • **Admin**: poate gestiona secțiuni (CRUD categorii), poate atribui roluri (endpoint tip PATCH user role) |
| | Fiecare endpoint protejat trebuie să verifice rolul (din token) și să refuze acțiunile nepermise. |

### 4. Achievements (obligatoriu)

| Ce lipsește | Ce trebuie făcut |
|------------|------------------|
| **Reguli de atribuire** | Achievements sunt doar mock. Trebuie: |
| | • Definiție clară a realizărilor (minim 5, ex: „Primul mesaj”, „Primul subiect”, plus altele în tematica Sims). |
| | • Logică în **backend** care la acțiuni (creare mesaj, creare subiect etc.) verifică regulile și acordă achievement-ul dacă e cazul. |
| **Salvare + dată** | Pentru fiecare achievement acordat: salvare în backend (ex: `user.achievements[]` cu `{ name, earnedAt }`). |
| **Transparență** | Regulile să fie vizibile în cod sau în documentație (ex: „Primul mesaj = primul post creat de user”). |

### 5. Paginare sau limită pe listă (obligatoriu)

| Ce lipsește | Ce trebuie făcut |
|------------|------------------|
| **Limită la listări** | Cerința: „lista de subiecte/mesaje nu trebuie să se încarce complet fără limitări”. |
| | • Backend: GET subiecte (pe categorie) și GET mesaje (pe subiect) cu **query params** (ex: `?page=1&limit=20`). |
| | • Frontend: fie **paginare** (butoane pagină / numere), fie **scroll infinit**; cerința acceptă oricare variantă. |

### 6. Recuperare parolă (opțional)

| Ce lipsește | Ce trebuie făcut |
|------------|------------------|
| Recuperare parolă | Cerința spune „opțional, dar binevenit”. Poți adăuga: „uitat parola” → trimitere email cu link de reset (necesită email configurat) sau flow simplu cu cod de reset. |

### 7. Alte ajustări importante

| Ce lipsește | Ce trebuie făcut |
|------------|------------------|
| **Rută Admin** | Există `AdminPanel.js`, dar în `App.js` **nu există** ruta `/admin`. Trebuie adăugat: `<Route path="/admin" element={<AdminPanel />} />` și link în Header pentru Admin. |
| **Profil legat de backend** | Profilul (nickname, avatar, about, achievements, listă subiecte/mesaje) trebuie alimentat din **API** (GET profil by id, GET subiecte/mesaje ale userului), nu doar din mock. |
| **Gestionare erori API** | Un format comun pentru erori (ex: `{ success: false, error: "mesaj", code?: "..." }`) și frontend să afișeze acest mesaj în toate cazurile de eroare. |
| **Editare/ștergere subiecte** | Cerința vorbește și de „editarea/ștergerea propriilor subiecte” (opțional cu limită de timp). Dacă o implementezi, trebuie și în backend cu verificare autor/rol. |

### 8. Git și README

| Ce lipsește | Ce trebuie făcut |
|------------|------------------|
| Repository Git + commit-uri regulate | Proiectul trebuie pus într-un repo Git cu commit-uri făcute pe parcurs (nu un singur commit la final). |
| README | Ai deja instrucțiuni. După ce adaugi backend-ul (forum, auth cu hash), actualizează README: cum se pornește backend + frontend, ce porturi, eventual variabile de mediu. |

---

## Rezumat prioritate

1. **Critic (fără de care nu îndeplinești cerințele de securitate și funcționale)**  
   - Parole hash (bcrypt)  
   - Token (JWT) și protecție rute backend  
   - API forum (categorii, subiecte, mesaje) cu persistență  
   - RBAC în backend (User / Moderator / Admin)  
   - Achievements acordate automat în backend + salvare dată  
   - Paginare (sau limită) pe listări subiecte/mesaje  
   - Rută `/admin` în App.js + link în Header  

2. **Important**  
   - Profil alimentat din API (inclusiv achievements și listă subiecte/mesaje)  
   - Format unificat erori API + afișare în frontend  

3. **Opțional**  
   - Recuperare parolă  
   - Limită de timp la editare/ștergere  

Dacă vrei, putem lua punct cu punct (de ex. „începe cu hash parole + JWT”) și îți pot scrie pașii concreți și eventual cod pentru backend/frontend.
