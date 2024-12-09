const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const { User, Friend, Trip, TripMember, TripMemberPermission} = require('./models'); // Import User model
const sequelize = require('./connection');
const { Op } = require('sequelize');

const app = express();

app.use(cors());
app.use(express.json());
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

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

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  console.log('--------a1');
  if (req.isAuthenticated()) {
    console.log('--------a2');
    return next();
  }
  console.log('--------a3');
  res.status(401).json({ message: 'Unauthorized' });
};

// Middleware to check if user is not authenticated
const isNotAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};

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
      console.log('--------User logged in:', user.username);
      return res.json({ message: 'Logged in successfully', id_user: user.id_user, user: user.username, redirect: '/' });
    });
  })(req, res, next);
});

app.post('/api/register', isNotAuthenticated, async (req, res) => {
  const { username, email, password } = req.body;
  const errors = {};

  if (!username || username.trim() === '') {
    errors.username = 'Username is required';
  }

  if (!email || email.trim() === '') {
    errors.email = 'Email is required';
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = 'Invalid email format';
    }
  }

  if (!password || password.trim() === '') {
    errors.password = 'Password is required';
  } else {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      errors.password = 'Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, and one number';
    }
  }

  const existingUserByUsername = await User.findOne({ where: { username } });
  if (existingUserByUsername) {
    errors.username = 'Účet s tímto jménem již existuje';
  }

  const existingUserByEmail = await User.findOne({ where: { email } });
  if (existingUserByEmail) {
    errors.email = 'Účet s tímto emailem již existuje';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, email, password: hashedPassword });
    res.json({ message: 'User registered successfully', id_user: newUser.id_user, user: newUser.username, redirect: '/' });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ form: 'Error registering user' });
  }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out' });
    }
    res.json({ message: 'Logged out successfully', redirect: '/login' });
  });
});

app.get('/api/users', async (req, res) => {
  const { id_user, search } = req.query;
  try {
    const friends = await Friend.findAll({
      attributes: ['id_user_two'],
      where: {
        id_user_one: id_user, // id aktuálně přihlášeného uživatele
      },
    });
    
    // Extrakce pouze id_user_two do pole
    const friendIds = friends.map(friend => friend.id_user_two);
    
    // Přesné shody
    const exactMatches = await User.findAll({
      where: {
        id_user: {
          [Op.ne]: id_user, // Vyloučí aktuálního uživatele
          [Op.notIn]: friendIds, // Vyloučí všechny přátele
        },
        username: search // Přesná shoda s vyhledávacím dotazem
      },
      attributes: { exclude: ['password'] }, // Vyloučí pole hesla
      limit: 7 // Omezení na prvních deset výsledků
    });

    // Výsledky začínající na vyhledávací dotaz
    const startsWithMatches = await User.findAll({
      where: {
        id_user: {
          [Op.ne]: id_user, // Vyloučí aktuálního uživatele
          [Op.notIn]: friendIds, // Vyloučí všechny přátele
        },
        username: {
          [Op.like]: `${search}%` // Filtrování podle vyhledávacího dotazu
        }
      },
      attributes: { exclude: ['password'] }, // Vyloučí pole hesla
      limit: 7 // Omezení na prvních deset výsledků
    });

    // Výsledky obsahující vyhledávací dotaz
    const containsMatches = await User.findAll({
      where: {
        id_user: {
          [Op.ne]: id_user, // Vyloučí aktuálního uživatele
          [Op.notIn]: friendIds, // Vyloučí všechny přátele
        },
        username: {
          [Op.like]: `%${search}%` // Filtrování podle vyhledávacího dotazu
        }
      },
      attributes: { exclude: ['password'] }, // Vyloučí pole hesla
      limit: 7 // Omezení na prvních deset výsledků
    });

    // Kombinace výsledků, odstranění duplicit a omezení na prvních deset výsledků
    const combinedResults = [
      ...exactMatches,
      ...startsWithMatches.filter(user => !exactMatches.some(exact => exact.id_user === user.id_user)),
      ...containsMatches.filter(user => !exactMatches.some(exact => exact.id_user === user.id_user) && !startsWithMatches.some(start => start.id_user === user.id_user))
    ].slice(0, 7);

    res.json(combinedResults);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

app.post('/api/add_follow', async (req, res) => {
  const { id_user_one, id_user_two } = req.body;
  try {
    await Friend.create({ id_user_one, id_user_two });
    res.json({ message: 'Follow added successfully' });
  } catch (err) {
    console.error('Error adding follow:', err);
    res.status(500).json({ message: 'Error adding follow' });
  }
});
app.get('/api/friends', async (req, res) => {
  const { id_user } = req.query;
  try {
    const friends = await Friend.findAll({
      where: {
        id_user_one: id_user
      },
      include: [{
        model: User,
        as: 'UserTwo',
        attributes: ['id_user', 'username', 'picture']
      }]
    });
    res.json(friends.map(friend => friend.UserTwo));
  } catch (err) {
    console.error('Error fetching friends:', err);
    res.status(500).json({ message: 'Error fetching friends' });
  }
});
app.delete('/api/remove_follow', async (req, res) => {
  const { id_user_one, id_user_two } = req.body;
  try {
    await Friend.destroy({
      where: {
        id_user_one,
        id_user_two
      }
    });
    res.json({ message: 'Follow removed successfully' });
  } catch (err) {
    console.error('Error removing follow:', err);
    res.status(500).json({ message: 'Error removing follow' });
  }
});

app.get('/api/trips', async (req, res) => {
  const { id_user } = req.query;

  try {
    const now = new Date();

    // Fetch all trips where the user is a member
    const tripMembers = await TripMember.findAll({
      where: { id_user },
      include: [
        {
          model: Trip,
          required: true,
        },
      ],
    });

    const trips = {
      upcoming: [],
      ongoing: [],
      past: [],
      invites: [],
    };

    tripMembers.forEach((tripMember) => {
      const trip = tripMember.Trip;
      const tripData = {
        id_trip: trip.id_trip,
        name: trip.name,
        icon: trip.icon,
        from_date: trip.from_date,
        to_date: trip.to_date,
        joined: tripMember.joined,
        owner: tripMember.owner,
        members_count: 0, // Placeholder, you can add logic to count members
        missing_items_count: 0, // Placeholder, you can add logic to count missing items
      };

      if (!tripMember.joined) {
        if (new Date(trip.to_date) >= now) {
          trips.invites.push(tripData);
        }
      } else {
        if (new Date(trip.from_date) > now) {
          trips.upcoming.push(tripData);
        } else if (new Date(trip.to_date) >= now) {
          trips.ongoing.push(tripData);
        } else {
          trips.past.push(tripData);
        }
      }
    });

    // Sort trips by date
    trips.upcoming.sort((a, b) => new Date(a.from_date) - new Date(b.from_date));
    trips.ongoing.sort((a, b) => new Date(a.from_date) - new Date(b.from_date));
    trips.past.sort((a, b) => new Date(b.from_date) - new Date(a.from_date));
    trips.invites.sort((a, b) => new Date(a.from_date) - new Date(b.from_date));

    res.json(trips);
  } catch (err) {
    console.error('Error fetching trips:', err);
    res.status(500).json({ message: 'Error fetching trips' });
  }
});
// Synchronize the models with the database
sequelize.sync({ force: false }).then(() => {
  app.listen(5000, () => {
    console.log('Server běží na http://localhost:5000');
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});