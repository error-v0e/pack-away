const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const { User } = require('./models'); // Import User model
const sequelize = require('./connection');
const { Op } = require('sequelize'); // Import Sequelize operators

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', // URL vašeho frontendu
  credentials: true // Povolit cookies
}));
app.use(express.json());
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Nastavte na true, pokud používáte HTTPS
    httpOnly: true
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport strategie
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await User.findOne({ where: { username } });
      if (!user) {
        return done(null, false, { message: 'Účet neexistuje' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Špatné heslo' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id_user);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Middleware: ověření přihlášení
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

// Middleware: ověření nepřihlášení
const isNotAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};

// Endpoint pro ověření stavu přihlášení
app.get('/api/login-status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ authenticated: true, user: req.user });
  } else {
    res.json({ authenticated: false });
  }
});

// Přihlášení
app.post('/api/login', isNotAuthenticated, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(400).json({ message: info.message });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.json({ message: 'Přihlášení úspěšné', user, redirect: '/' });
    });
  })(req, res, next);
});

// Registrace
app.post('/api/register', isNotAuthenticated, async (req, res) => {
  const { username, email, password, picture } = req.body;
  const errors = {};

  // Validace vstupů
  if (!username || username.trim() === '') errors.username = 'Username is required';
  if (!email || email.trim() === '') {
    errors.email = 'Email is required';
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) errors.email = 'Invalid email format';
  }
  if (!password || password.trim() === '') {
    errors.password = 'Password is required';
  } else {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      errors.password = 'Password must include one uppercase, one lowercase, one number, and be 8+ characters';
    }
  }

  const existingUserByUsername = await User.findOne({ where: { username } });
  if (existingUserByUsername) errors.username = 'Účet s tímto jménem již existuje';

  const existingUserByEmail = await User.findOne({ where: { email } });
  if (existingUserByEmail) errors.email = 'Účet s tímto emailem již existuje';

  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, email, password: hashedPassword, picture });
    res.json({ message: 'Registrace úspěšná', user: newUser, redirect: '/' });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ form: 'Chyba při registraci' });
  }
});

// Odhlášení
app.post('/api/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Chyba při odhlašování' });
    }
    res.json({ message: 'Odhlášení úspěšné', redirect: '/login' });
  });
});

// Endpoint: Seznam uživatelů
app.get('/api/users', isAuthenticated, async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        id_user: {
          [Op.not]: req.user.id_user // Nezahrnujte aktuálního uživatele
        }
      }
    });
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Chyba při načítání uživatelů' });
  }
});

// Synchronizace a spuštění serveru
sequelize.sync({ force: false }).then(() => {
  app.listen(5000, () => {
    console.log('Server běží na http://localhost:5000');
  });
}).catch(err => {
  console.error('Nepodařilo se připojit k databázi:', err);
});
