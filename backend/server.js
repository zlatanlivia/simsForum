const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;
const DATA_FILE = path.join(__dirname, 'users.json');

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(bodyParser.json());

const loadUsers = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const content = fs.readFileSync(DATA_FILE, 'utf8');
    return content ? JSON.parse(content) : [];
  } catch (e) {
    console.error('Error reading users file', e);
    return [];
  }
};

const saveUsers = (users) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing users file', e);
  }
};

app.post('/api/register', (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ success: false, error: 'Toate câmpurile sunt obligatorii.' });
  }

  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

  if (!strongPasswordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      error:
        'Parola trebuie să aibă minim 8 caractere și să conțină litere mici, litere mari, cifre și un caracter special.',
    });
  }

  const users = loadUsers();
  const existing = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === username.toLowerCase()
  );

  if (existing) {
    return res
      .status(409)
      .json({ success: false, error: 'Există deja un cont cu acest email sau nume de utilizator.' });
  }

  const newUser = {
    id: Date.now(),
    email,
    username,
    password,
    role: 'User',
    joinedDate: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  const { password: _, ...safeUser } = newUser;
  return res.json({ success: true, user: safeUser });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email și parolă obligatorii.' });
  }

  const users = loadUsers();
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!user) {
    return res.status(401).json({ success: false, error: 'Credențiale incorecte.' });
  }

  const { password: _, ...safeUser } = user;
  return res.json({ success: true, user: safeUser });
});

app.listen(PORT, () => {
  console.log(`Backend auth server running on port ${PORT}`);
});


