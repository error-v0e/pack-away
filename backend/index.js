const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const { User } = require('./models'); // Import User model
const sequelize = require('./connection');

const app = express();

app.use(cors());
app.use(express.json());
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await User.findOne({ where: { username } });
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
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

app.post('/api/login', passport.authenticate('local'), (req, res) => {
  res.json({ message: 'Logged in successfully' });
});

app.post('/api/register', async (req, res) => {
  const { username, email, password, picture } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, email, password: hashedPassword, picture });
    res.json({ message: 'User registered successfully', user: newUser });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ message: 'Error registering user', error: err });
  }
});

app.get('/api/number', (req, res) => {
  res.json({ number: 32 });
});

app.post('/api/send-text', (req, res) => {
  const text = req.body.text;
  const number = req.body.number;
  res.json({ message: `Přijatý text: ${text} s číslem ${number}` });
});

// Synchronize the models with the database
sequelize.sync({ force: false }).then(() => {
  app.listen(5000, () => {
    console.log('Server běží na http://localhost:5000');
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});