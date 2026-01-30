const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'sims-forum-secret-change-in-production';
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(__dirname, 'users.json');
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');
const TOPICS_FILE = path.join(DATA_DIR, 'topics.json');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(bodyParser.json());

// --- Helpers JSON ---
const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};

const loadUsers = () => {
  try {
    if (!fs.existsSync(USERS_FILE)) return [];
    const content = fs.readFileSync(USERS_FILE, 'utf8');
    return content ? JSON.parse(content) : [];
  } catch (e) {
    console.error('Error reading users file', e);
    return [];
  }
};

const saveUsers = (users) => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing users file', e);
  }
};

const loadJson = (file, defaultVal = []) => {
  try {
    if (!fs.existsSync(file)) return defaultVal;
    const content = fs.readFileSync(file, 'utf8');
    return content ? JSON.parse(content) : defaultVal;
  } catch (e) {
    console.error('Error reading', file, e);
    return defaultVal;
  }
};

const saveJson = (file, data) => {
  try {
    ensureDataDir();
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing', file, e);
  }
};

const loadCategories = () => loadJson(CATEGORIES_FILE, []);
const loadTopics = () => loadJson(TOPICS_FILE, []);
const loadPosts = () => loadJson(POSTS_FILE, []);

// Reguli achievements (numele trebuie să coincidă cu frontend allAchievements)
const ACHIEVEMENT_RULES = [
  { name: 'Primul mesaj', check: (stats) => stats.postsCreated >= 1 },
  { name: 'Primul subiect', check: (stats) => stats.topicsCreated >= 1 },
  { name: 'Sims Veteran', check: (stats) => stats.topicsCreated + stats.postsCreated >= 10 },
  { name: 'Constructor Expert', check: (stats) => stats.topicsInBuilding >= 5 },
  { name: 'Sims Master', check: (stats) => stats.postsCreated >= 50 },
];

function grantAchievements(userId) {
  const userIdStr = String(userId);
  const users = loadUsers();
  const user = users.find((u) => String(u.id) === userIdStr);
  if (!user) return;
  if (!Array.isArray(user.achievements)) user.achievements = [];
  const topics = loadTopics();
  const posts = loadPosts();
  const topicsCreated = topics.filter((t) => String(t.authorId) === userIdStr).length;
  const postsCreated = posts.filter((p) => String(p.authorId) === userIdStr).length;
  const topicsInBuilding = topics.filter((t) => String(t.authorId) === userIdStr && t.categoryId === 3).length;
  const stats = { topicsCreated, postsCreated, topicsInBuilding };
  const earnedNames = new Set((user.achievements || []).map((a) => a.name));
  const now = new Date().toISOString();
  let changed = false;
  for (const rule of ACHIEVEMENT_RULES) {
    if (earnedNames.has(rule.name)) continue;
    if (rule.check(stats)) {
      user.achievements.push({ name: rule.name, earnedAt: now });
      earnedNames.add(rule.name);
      changed = true;
    }
  }
  if (changed) saveUsers(users);
}

// User fără parolă pentru răspunsuri API
const toSafeUser = (user) => {
  if (!user) return null;
  const { password, ...safe } = user;
  return { ...safe, nickname: user.nickname || user.username, role: user.role || 'User' };
};

// --- JWT middleware ---
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Token lipsă sau invalid.' });
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = loadUsers();
    const user = users.find((u) => u.id === decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Utilizator inexistent.' });
    }
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, error: 'Token invalid sau expirat.' });
  }
};

// Opțional: atașează user dacă token valid, altfel req.user = null
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = loadUsers();
    const user = users.find((u) => u.id === decoded.userId);
    req.user = user || null;
  } catch (e) {
    req.user = null;
  }
  next();
};

// --- Auth ---
app.post('/api/register', async (req, res) => {
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
    (u) =>
      u.email.toLowerCase() === email.toLowerCase() ||
      u.username.toLowerCase() === username.toLowerCase()
  );
  if (existing) {
    return res
      .status(409)
      .json({ success: false, error: 'Există deja un cont cu acest email sau nume de utilizator.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: Date.now(),
    email,
    username,
    password: hashedPassword,
    nickname: username,
    role: 'User',
    joinedDate: new Date().toISOString(),
    avatar: null,
    about: '',
    achievements: [],
  };

  users.push(newUser);
  saveUsers(users);

  const safeUser = toSafeUser(newUser);
  const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({ success: true, user: safeUser, token });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email și parolă obligatorii.' });
  }

  const users = loadUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(401).json({ success: false, error: 'Credențiale incorecte.' });
  }

  let match = false;
  if (user.password.startsWith('$2')) {
    match = await bcrypt.compare(password, user.password);
  } else {
    match = user.password === password;
    if (match) {
      user.password = await bcrypt.hash(password, 10);
      saveUsers(users);
    }
  }
  if (!match) {
    return res.status(401).json({ success: false, error: 'Credențiale incorecte.' });
  }

  const safeUser = toSafeUser(user);
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({ success: true, user: safeUser, token });
});

// Verificare token (pentru frontend la reîncărcare)
app.get('/api/me', authMiddleware, (req, res) => {
  return res.json({ success: true, user: toSafeUser(req.user) });
});

// Profil utilizator (public – pentru vizualizare când apeși pe un utilizator)
app.get('/api/profile/:userId', (req, res) => {
  const userIdParam = String(req.params.userId).trim();
  if (!userIdParam) {
    return res.status(400).json({ success: false, error: 'ID utilizator lipsă.' });
  }
  const users = loadUsers();
  const user = users.find((u) => String(u.id) === userIdParam);
  if (!user) {
    return res.status(404).json({ success: false, error: 'Utilizatorul nu a fost găsit.' });
  }
  const categories = loadCategories();
  const topics = loadTopics();
  const posts = loadPosts();
  const matchUserId = (id) => id != null && (String(id) === userIdParam || id === Number(userIdParam));

  const topicsCreated = topics.filter((t) => matchUserId(t.authorId)).length;
  const postsCreated = posts.filter((p) => matchUserId(p.authorId)).length;

  const userTopics = topics.filter((t) => matchUserId(t.authorId));
  const userPosts = posts.filter((p) => matchUserId(p.authorId));
  const recentTopics = [...userTopics]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10)
    .map((t) => {
      const category = categories.find((c) => c.id == t.categoryId);
      return {
        id: t.id,
        title: t.title,
        categoryId: t.categoryId,
        categoryName: category ? category.name : '',
        createdAt: t.createdAt,
      };
    });
  const recentPosts = [...userPosts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10)
    .map((p) => {
      const topic = topics.find((t) => t.id == p.topicId);
      const contentSnippet = (p.content && p.content.length > 60) ? p.content.slice(0, 60) + '…' : (p.content || '');
      return {
        id: p.id,
        topicId: p.topicId,
        topicTitle: topic ? topic.title : '',
        contentSnippet,
        createdAt: p.createdAt,
      };
    });

  grantAchievements(userIdParam);
  const usersAfter = loadUsers();
  const userUpdated = usersAfter.find((u) => String(u.id) === userIdParam);
  const achievements = (userUpdated && Array.isArray(userUpdated.achievements)) ? userUpdated.achievements : (user.achievements || []);

  const profile = {
    id: user.id,
    nickname: user.nickname || user.username,
    username: user.username,
    email: user.email,
    avatar: user.avatar || null,
    joinedDate: user.joinedDate,
    about: user.about || '',
    role: user.role || 'User',
    achievements,
    stats: {
      topicsCreated,
      postsCreated,
      totalActivity: topicsCreated + postsCreated,
    },
    recentTopics,
    recentPosts,
  };
  return res.json({ success: true, profile });
});

// --- Statistici publice (pentru pagina principală) ---
app.get('/api/stats', (req, res) => {
  const users = loadUsers();
  const topics = loadTopics();
  const posts = loadPosts();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const postsToday = posts.filter((p) => new Date(p.createdAt) >= todayStart).length;
  return res.json({
    success: true,
    stats: {
      totalUsers: users.length,
      totalTopics: topics.length,
      totalPosts: posts.length,
      postsToday,
      onlineNow: 0,
    },
  });
});

// --- Admin: doar Admin ---
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ success: false, error: 'Acces interzis. Doar administratorii pot accesa.' });
  }
  next();
};

// Statistici admin (același calcul, pentru panou)
app.get('/api/admin/stats', authMiddleware, adminOnly, (req, res) => {
  const users = loadUsers();
  const topics = loadTopics();
  const posts = loadPosts();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const postsToday = posts.filter((p) => new Date(p.createdAt) >= todayStart).length;
  return res.json({
    success: true,
    stats: {
      totalUsers: users.length,
      totalTopics: topics.length,
      totalPosts: posts.length,
      activeToday: postsToday,
    },
  });
});

// Lista utilizatori (admin)
app.get('/api/admin/users', authMiddleware, adminOnly, (req, res) => {
  const users = loadUsers();
  const list = users
    .map((u) => ({
      id: u.id,
      nickname: u.nickname || u.username,
      username: u.username,
      email: u.email,
      role: u.role || 'User',
      joined: u.joinedDate ? new Date(u.joinedDate).toISOString().slice(0, 10) : null,
    }))
    .sort((a, b) => (b.joined || '').localeCompare(a.joined || ''));
  return res.json({ success: true, users: list });
});

// Subiecte și mesaje recente (admin) – scrise de utilizatori
app.get('/api/admin/recent', authMiddleware, adminOnly, (req, res) => {
  const users = loadUsers();
  const categories = loadCategories();
  const topics = loadTopics();
  const posts = loadPosts();

  const recentTopics = [...topics]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 15)
    .map((t) => {
      const author = users.find((u) => u.id === t.authorId);
      const category = categories.find((c) => c.id === t.categoryId);
      return {
        id: t.id,
        title: t.title,
        authorNickname: author ? (author.nickname || author.username) : 'Utilizator',
        authorId: t.authorId,
        categoryId: t.categoryId,
        categoryName: category ? category.name : '',
        createdAt: t.createdAt,
      };
    });

  const recentPosts = [...posts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 15)
    .map((p) => {
      const author = users.find((u) => u.id === p.authorId);
      const topic = topics.find((t) => t.id === p.topicId);
      const contentSnippet = p.content.length > 80 ? p.content.slice(0, 80) + '…' : p.content;
      return {
        id: p.id,
        topicId: p.topicId,
        topicTitle: topic ? topic.title : '',
        contentSnippet,
        authorNickname: author ? (author.nickname || author.username) : 'Utilizator',
        authorId: p.authorId,
        createdAt: p.createdAt,
      };
    });

  return res.json({ success: true, recentTopics, recentPosts });
});

// --- Forum: Categorii ---
app.get('/api/categories', (req, res) => {
  const categories = loadCategories();
  const topics = loadTopics();
  const posts = loadPosts();

  const list = categories.map((cat) => {
    const catTopics = topics.filter((t) => t.categoryId === cat.id);
    const topicIds = catTopics.map((t) => t.id);
    const postCount = posts.filter((p) => topicIds.includes(p.topicId)).length;
    const lastTopic = catTopics.sort(
      (a, b) => new Date(b.lastActivity || b.createdAt) - new Date(a.lastActivity || a.createdAt)
    )[0];
    return {
      ...cat,
      topicCount: catTopics.length,
      postCount,
      lastActivity: lastTopic ? (lastTopic.lastActivity || lastTopic.createdAt) : null,
    };
  });
  return res.json({ success: true, categories: list });
});

// --- Forum: Subiecte pe categorie (cu paginare) ---
app.get('/api/categories/:categoryId/topics', (req, res) => {
  const { categoryId } = req.params;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(5, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const categories = loadCategories();
  const cat = categories.find((c) => c.id === parseInt(categoryId, 10));
  if (!cat) {
    return res.status(404).json({ success: false, error: 'Categoria nu există.' });
  }

  const topics = loadTopics().filter((t) => t.categoryId === parseInt(categoryId, 10));
  const total = topics.length;
  const sorted = [...topics].sort((a, b) => {
    const dateA = new Date(a.lastActivity || a.createdAt);
    const dateB = new Date(b.lastActivity || b.createdAt);
    return dateB - dateA;
  });
  const pinned = sorted.filter((t) => t.pinned);
  const normal = sorted.filter((t) => !t.pinned);
  const combined = [...pinned, ...normal];
  const pageItems = combined.slice(skip, skip + limit);

  const users = loadUsers();
  const posts = loadPosts();
  const list = pageItems.map((t) => {
    const author = users.find((u) => u.id === t.authorId);
    const replyCount = posts.filter((p) => p.topicId === t.id).length;
    return {
      id: t.id,
      title: t.title,
      author: author ? toSafeUser(author) : { id: t.authorId, nickname: 'Utilizator', avatar: null },
      replies: replyCount,
      views: t.views || 0,
      lastActivity: t.lastActivity || t.createdAt,
      pinned: !!t.pinned,
      closed: !!t.closed,
    };
  });

  return res.json({
    success: true,
    category: cat,
    topics: list,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// Creare subiect (autentificat)
app.post('/api/categories/:categoryId/topics', authMiddleware, (req, res) => {
  const { categoryId } = req.params;
  const { title, content } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, error: 'Titlul este obligatoriu.' });
  }
  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, error: 'Conținutul mesajului inițial este obligatoriu.' });
  }

  const categories = loadCategories();
  const cat = categories.find((c) => c.id === parseInt(categoryId, 10));
  if (!cat) {
    return res.status(404).json({ success: false, error: 'Categoria nu există.' });
  }

  const topics = loadTopics();
  const posts = loadPosts();
  const now = new Date().toISOString();
  const newTopic = {
    id: Date.now(),
    categoryId: parseInt(categoryId, 10),
    title: title.trim(),
    authorId: req.user.id,
    createdAt: now,
    lastActivity: now,
    pinned: false,
    closed: false,
    views: 0,
  };
  const newPost = {
    id: Date.now() + 1,
    topicId: newTopic.id,
    content: content.trim(),
    authorId: req.user.id,
    createdAt: now,
    editedAt: null,
  };

  topics.push(newTopic);
  posts.push(newPost);
  saveJson(TOPICS_FILE, topics);
  saveJson(POSTS_FILE, posts);
  grantAchievements(req.user.id);

  const safeUser = toSafeUser(req.user);
  return res.status(201).json({
    success: true,
    topic: {
      id: newTopic.id,
      title: newTopic.title,
      author: safeUser,
      replies: 1,
      views: 0,
      lastActivity: now,
      pinned: false,
      closed: false,
    },
    postId: newPost.id,
  });
});

// --- Forum: Mesaje (posts) pe subiect (cu paginare) ---
app.get('/api/topics/:topicId', optionalAuth, (req, res) => {
  const { topicId } = req.params;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(5, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const topics = loadTopics();
  const topic = topics.find((t) => t.id === parseInt(topicId, 10));
  if (!topic) {
    return res.status(404).json({ success: false, error: 'Subiectul nu există.' });
  }

  const categories = loadCategories();
  const category = categories.find((c) => c.id === topic.categoryId);
  const posts = loadPosts().filter((p) => p.topicId === topic.id);
  const total = posts.length;
  const sortedPosts = [...posts].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const pagePosts = sortedPosts.slice(skip, skip + limit);

  const users = loadUsers();
  const author = users.find((u) => u.id === topic.authorId);
  const postsWithAuthor = pagePosts.map((p) => {
    const postAuthor = users.find((u) => u.id === p.authorId);
    return {
      id: p.id,
      content: p.content,
      author: postAuthor ? toSafeUser(postAuthor) : { id: p.authorId, nickname: 'Utilizator', avatar: null, role: 'User' },
      createdAt: p.createdAt,
      editedAt: p.editedAt,
    };
  });

  // Increment views (simplu, fără lock)
  topic.views = (topic.views || 0) + 1;
  saveJson(TOPICS_FILE, topics);

  return res.json({
    success: true,
    topic: {
      id: topic.id,
      title: topic.title,
      category: category ? { id: category.id, name: category.name } : null,
      author: author ? toSafeUser(author) : null,
      createdAt: topic.createdAt,
      closed: !!topic.closed,
      views: topic.views || 0,
    },
    posts: postsWithAuthor,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// Răspuns la subiect (autentificat)
app.post('/api/topics/:topicId/posts', authMiddleware, (req, res) => {
  const { topicId } = req.params;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, error: 'Conținutul mesajului este obligatoriu.' });
  }

  const topics = loadTopics();
  const topic = topics.find((t) => t.id === parseInt(topicId, 10));
  if (!topic) {
    return res.status(404).json({ success: false, error: 'Subiectul nu există.' });
  }
  if (topic.closed) {
    return res.status(400).json({ success: false, error: 'Subiectul este închis.' });
  }

  const posts = loadPosts();
  const now = new Date().toISOString();
  const newPost = {
    id: Date.now(),
    topicId: topic.id,
    content: content.trim(),
    authorId: req.user.id,
    createdAt: now,
    editedAt: null,
  };
  posts.push(newPost);
  topic.lastActivity = now;
  saveJson(POSTS_FILE, posts);
  saveJson(TOPICS_FILE, topics);
  grantAchievements(req.user.id);

  const safeUser = toSafeUser(req.user);
  return res.status(201).json({
    success: true,
    post: {
      id: newPost.id,
      content: newPost.content,
      author: safeUser,
      createdAt: newPost.createdAt,
      editedAt: null,
    },
  });
});

// Editare mesaj (autor sau Moderator/Admin)
app.patch('/api/topics/:topicId/posts/:postId', authMiddleware, (req, res) => {
  const { topicId, postId } = req.params;
  const { content } = req.body;
  const user = req.user;
  const isModerator = user.role === 'Moderator' || user.role === 'Admin';

  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, error: 'Conținutul nu poate fi gol.' });
  }

  const posts = loadPosts();
  const post = posts.find((p) => p.topicId === parseInt(topicId, 10) && p.id === parseInt(postId, 10));
  if (!post) {
    return res.status(404).json({ success: false, error: 'Mesajul nu există.' });
  }
  if (post.authorId !== user.id && !isModerator) {
    return res.status(403).json({ success: false, error: 'Nu ai dreptul să editezi acest mesaj.' });
  }

  post.content = content.trim();
  post.editedAt = new Date().toISOString();
  saveJson(POSTS_FILE, posts);

  const safeUser = toSafeUser(user);
  return res.json({
    success: true,
    post: {
      id: post.id,
      content: post.content,
      author: safeUser,
      createdAt: post.createdAt,
      editedAt: post.editedAt,
    },
  });
});

// Ștergere mesaj (autor sau Moderator/Admin)
app.delete('/api/topics/:topicId/posts/:postId', authMiddleware, (req, res) => {
  const { topicId, postId } = req.params;
  const user = req.user;
  const isModerator = user.role === 'Moderator' || user.role === 'Admin';

  const posts = loadPosts();
  const index = posts.findIndex((p) => p.topicId === parseInt(topicId, 10) && p.id === parseInt(postId, 10));
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Mesajul nu există.' });
  }
  const post = posts[index];
  if (post.authorId !== user.id && !isModerator) {
    return res.status(403).json({ success: false, error: 'Nu ai dreptul să ștergi acest mesaj.' });
  }

  posts.splice(index, 1);
  saveJson(POSTS_FILE, posts);
  return res.json({ success: true });
});

// --- Inițializare date forum dacă lipsesc ---
const seedCategories = () => {
  const categories = loadCategories();
  if (categories.length > 0) return;

  const defaultCategories = [
    { id: 1, name: 'Sims 4 - Discuții generale', description: 'Discuții generale despre Sims 4', icon: '🏠' },
    { id: 2, name: 'Sims 4 - DLC și Pachete', description: 'Discutăm despre expansion packs, game packs și stuff packs', icon: '📦' },
    { id: 3, name: 'Sims 4 - Building & Design', description: 'Împărtășește-ți casele și obiectele personalizate', icon: '🏗️' },
    { id: 4, name: 'Sims 4 - Gameplay & Challenges', description: 'Sfaturi, trucuri și challenge-uri', icon: '🎮' },
    { id: 5, name: 'Moduri și Custom Content', description: 'Discuții despre mods și CC pentru Sims 4', icon: '✨' },
    { id: 6, name: 'Sims clasic (Sims 1, 2, 3)', description: 'Nostalgie pentru versiunile vechi ale jocului', icon: '💾' },
  ];
  saveJson(CATEGORIES_FILE, defaultCategories);
  console.log('Seed: categorii create.');
};

ensureDataDir();
seedCategories();

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
