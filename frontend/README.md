# Sims Forum - Frontend React

Forum web dedicat jocului Sims, dezvoltat cu React. Acest proiect reprezintă partea de frontend pentru un forum de gaming unde utilizatorii pot comunica, avea profiluri personalizate, roluri și achievements.

## 🎮 Funcționalități

### Autentificare și Utilizatori
- ✅ Înregistrare utilizatori (email/nume utilizator + parolă)
- ✅ Autentificare/deautentificare
- ✅ Profil utilizator cu:
  - Nickname, avatar (link)
  - Data înregistrării
  - Descriere "despre mine"
  - Statistici (subiecte, mesaje, achievements)
  - Listă de subiecte și mesaje

### Forum
- ✅ Secțiuni (categories) și subiecte (topics)
- ✅ Mesaje (posts) în interiorul subiectelor
- ✅ Creare subiect în secțiune
- ✅ Răspuns la subiect
- ✅ Editare/ștergere proprii subiecte/mesaje
- ✅ Paginare (structură pregătită)

### Roluri și Drepturi (RBAC)
- ✅ User - utilizator standard
- ✅ Moderator - poate șterge mesajele/subiectele altora, poate închide subiecte
- ✅ Admin - gestionează secțiuni, atribuie roluri
- ✅ Implementat în UI cu verificări de rol

### Achievements (Realizări)
Sistem de realizări atribuite automat conform unor reguli. Achievements tematică Sims:

1. **Primul mesaj** 💬 - creează 1 mesaj
2. **Primul subiect** 📝 - creează 1 subiect
3. **Sims Veteran** 🏆 - participă la 10 discuții
4. **Constructor Expert** 🏗️ - creează 5 subiecte în secțiunea Building
5. **Sims Master** ⭐ - atinge 50 mesaje în forum

- ✅ Afișarea achievements în profil
- ✅ Dată de obținere salvate
- ✅ Achievements blocate și deblocate

### Panou Admin
- ✅ Vizualizare statistici forum
- ✅ Gestionare utilizatori (UI pregătit)
- ✅ Gestionare secțiuni (UI pregătit)

## 🚀 Instalare și Lansare

### Cerințe
- Node.js (versiunea 14 sau mai recentă)
- npm sau yarn

### Pași de instalare

1. **Instalează dependențele:**
   ```bash
   cd frontend
   npm install
   ```

2. **Pornește aplicația în modul de dezvoltare:**
   ```bash
   npm start
   ```

   Aplicația se va deschide automat în browser la adresa [http://localhost:3000](http://localhost:3000)

3. **Construiește pentru producție:**
   ```bash
   npm run build
   ```

   Fișierele optimizate pentru producție vor fi create în directorul `build/`.

## 📁 Structura Proiectului

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── Header/
│   │       ├── Header.js
│   │       └── Header.css
│   ├── context/
│   │   └── AuthContext.js
│   ├── pages/
│   │   ├── Home/
│   │   ├── Auth/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   └── Auth.css
│   │   ├── Forum/
│   │   │   ├── Forum.js
│   │   │   ├── Category.js
│   │   │   ├── Topic.js
│   │   │   └── *.css
│   │   ├── Profile/
│   │   │   ├── Profile.js
│   │   │   └── Profile.css
│   │   └── Admin/
│   │       ├── AdminPanel.js
│   │       └── AdminPanel.css
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## 🎨 Tematică Sims

Interfața este proiectată cu tematică Sims, folosind:
- Culori inspirate din jocul Sims (mov, portocaliu, verde)
- Icoane și emoji-uri relevante
- Design modern și responsive

### Culori principale:
- `--sims-purple`: #9C27B0
- `--sims-orange`: #FF9800
- `--sims-blue`: #4CAFDE
- `--sims-green`: #8BC34A

## 📝 Note importante

### MVP (Produs Minim Viabil)
Acest frontend este configurat ca MVP cu:
- Date simulate pentru demonstrație
- Funcționalități UI complete
- Structură pregătită pentru integrare backend

### Integrare Backend
Pentru funcționalitate completă, frontend-ul trebuie conectat la un backend care oferă:
- API REST pentru autentificare
- Endpoints pentru forum (secțiuni, subiecte, mesaje)
- Sistem de achievements automat
- Validare și autorizare bazată pe roluri

### Mock Data
În versiunea actuală, datele sunt simulate în componentele React. În producție, acestea vor fi înlocuite cu apeluri API către backend.

## 🔧 Scripts Disponibile

- `npm start` - Pornește serverul de dezvoltare
- `npm run build` - Construiește aplicația pentru producție
- `npm test` - Rulează testele
- `npm run eject` - Elimină tooling-ul CRA (ireversibil)

## 📚 Tehnologii Utilizate

- **React** 18.2.0 - Biblioteca UI
- **React Router DOM** 6.20.0 - Rutare
- **CSS3** - Stilizare (fără librării externe pentru MVP)

## 🎯 Următorii Pași

Pentru un MVP complet funcțional:
1. Integrare backend API
2. Implementare autentificare reală (JWT tokens)
3. Conectare la baza de date
4. Implementare sistem achievements automat în backend
5. Testare și optimizare

## 👥 Dezvoltat pentru

Practica de dezvoltare web - Forum dedicat jocului Sims

---

**Notă:** Acest proiect este un MVP (produs minim viabil) dezvoltat pentru scopuri educaționale.

