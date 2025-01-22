const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const {sequelize, User, Friend, Trip, TripMember, TripMemberPermission, Item, Category, CategoryItem, SavedItem, SavedCategory, UsingListCategory } = require('./models');
const { Op } = require('sequelize');
const { format } = require('date-fns');


const app = express();

const allowedOrigins = ['http://192.168.50.100:5173', 'http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: 'your_secret_key',
  resave: false, 
  saveUninitialized: false,  
  cookie: { secure: false, httpOnly: true, sameSite: 'lax', path: '/' , maxAge: 1000 * 60 * 60 * 24 * 7 } 
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
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

// Middleware to check if user is not authenticated
const isNotAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};
app.get('/api/check-session', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ isAuthenticated: true });
  } else {
    res.json({ isAuthenticated: false });
  }
});
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

app.post('/api/logout', isAuthenticated, (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out' });
    }
    res.clearCookie('connect.sid'); 
    res.json({ message: 'Logged out successfully', redirect: '/login' });
  });
});

app.get('/api/users', isAuthenticated, async (req, res) => {
  const { id_user, search } = req.query;
  try {
    const friends = await Friend.findAll({
      attributes: ['id_user_two'],
      where: {
        id_user_one: id_user,
      },
    });
    
    const friendIds = friends.map(friend => friend.id_user_two);
    
    const exactMatches = await User.findAll({
      where: {
        id_user: {
          [Op.ne]: id_user, 
          [Op.notIn]: friendIds, 
        },
        username: search 
      },
      attributes: { exclude: ['password'] },
      limit: 7 
    });

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

app.post('/api/add_follow', isAuthenticated, async (req, res) => {
  const { id_user_one, id_user_two } = req.body;
  try {
    await Friend.create({ id_user_one, id_user_two });
    res.json({ message: 'Follow added successfully' });
  } catch (err) {
    console.error('Error adding follow:', err);
    res.status(500).json({ message: 'Error adding follow' });
  }
});
app.get('/api/friends', isAuthenticated, async (req, res) => {
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
app.delete('/api/remove_follow', isAuthenticated, async (req, res) => {
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
app.post('/api/create_trip', isAuthenticated, async (req, res) => {
  const { id_user, name, icon, from_date, to_date, invitedFriends } = req.body;
  console.log('--------id_user:', id_user);

  try {
    // Create the trip
    const newTrip = await Trip.create({ name, icon, from_date, to_date });

    // Add the creator as a trip member with both booleans set to true
    await TripMember.create({ id_user, id_trip: newTrip.id_trip, joined: true, owner: true });

    // Add trip member permissions for the creator
    await TripMemberPermission.create({ id_user, id_friend: id_user, id_trip: newTrip.id_trip, view: true, edit: true });

    // Add invited friends as trip members with default boolean values
    for (const friend of invitedFriends) {
      await TripMember.create({ id_user: friend.id_user, id_trip: newTrip.id_trip, joined: false, owner: false });
    }

    res.json({ message: 'Trip created successfully', trip: newTrip });
  } catch (err) {
    console.error('Error creating trip:', err);
    res.status(500).json({ message: 'Error creating trip' });
  }
});
app.get('/api/trips', isAuthenticated, async (req, res) => {
  const { id_user } = req.query;

  try {
    const now = new Date();

    // Fetch trips where the user is invited but hasn't joined yet (limit 20)
    const invites = await TripMember.findAll({
      where: { id_user, joined: false },
      include: [{
        model: Trip,
        required: true,
        where: {
          to_date: { [Op.gte]: now }, // Only include trips that are ongoing or upcoming
        },
      }],
      limit: 20,
      order: [[Trip, 'from_date', 'DESC']],
    });

    // Fetch upcoming trips (limit 20)
    const upcoming = await TripMember.findAll({
      where: {
        id_user,
        joined: true,
      },
      include: [{
        model: Trip,
        required: true,
        where: {
          from_date: { [Op.gt]: now },
        },
      }],
      limit: 20,
      order: [[Trip, 'from_date', 'DESC']],
    });

    // Fetch ongoing trips (limit 20)
    const ongoing = await TripMember.findAll({
      where: {
        id_user,
        joined: true,
      },
      include: [{
        model: Trip,
        required: true,
        where: {
          from_date: { [Op.lte]: now },
          to_date: { [Op.gte]: now },
        },
      }],
      limit: 20,
      order: [[Trip, 'from_date', 'DESC']],
    });

    // Fetch past trips (limit 10)
    const past = await TripMember.findAll({
      where: {
        id_user,
        joined: true,
      },
      include: [{
        model: Trip,
        required: true,
        where: {
          to_date: { [Op.lt]: now },
        },
      }],
      limit: 10,
      order: [[Trip, 'from_date', 'DESC']],
    });

    const formatDate = (date) => format(new Date(date), 'dd.MM.yyyy');

    const trips = {
      upcoming: upcoming.map(tripMember => ({
        id_trip: tripMember.Trip.id_trip,
        name: tripMember.Trip.name,
        icon: tripMember.Trip.icon,
        from_date: formatDate(tripMember.Trip.from_date),
        to_date: formatDate(tripMember.Trip.to_date),
        joined: tripMember.joined,
        owner: tripMember.owner,
        members_count: 0, 
        missing_items_count: 0, 
      })),
      ongoing: ongoing.map(tripMember => ({
        id_trip: tripMember.Trip.id_trip,
        name: tripMember.Trip.name,
        icon: tripMember.Trip.icon,
        from_date: formatDate(tripMember.Trip.from_date),
        to_date: formatDate(tripMember.Trip.to_date),
        joined: tripMember.joined,
        owner: tripMember.owner,
        members_count: 0, 
        missing_items_count: 0, 
      })),
      past: past.map(tripMember => ({
        id_trip: tripMember.Trip.id_trip,
        name: tripMember.Trip.name,
        icon: tripMember.Trip.icon,
        from_date: formatDate(tripMember.Trip.from_date),
        to_date: formatDate(tripMember.Trip.to_date),
        joined: tripMember.joined,
        owner: tripMember.owner,
        members_count: 0, 
        missing_items_count: 0, 
      })),
      invites: invites.map(tripMember => ({
        id_trip: tripMember.Trip.id_trip,
        name: tripMember.Trip.name,
        icon: tripMember.Trip.icon,
        from_date: formatDate(tripMember.Trip.from_date),
        to_date: formatDate(tripMember.Trip.to_date),
        joined: tripMember.joined,
        owner: tripMember.owner,
        members_count: 0, 
        missing_items_count: 0, 
      })),
      allPastTripsLoaded: past.length < 10
    };

    res.json(trips);
  } catch (err) {
    console.error('Error fetching trips:', err);
    res.status(500).json({ message: 'Error fetching trips' });
  }
});
app.post('/api/join_trip', isAuthenticated, async (req, res) => {
  const { id_user, id_trip } = req.body;
  try {
    await TripMember.update(
      { joined: true },
      { where: { id_user, id_trip } }
    );
    res.json({ message: 'Successfully joined the trip' });
  } catch (err) {
    console.error('Error joining trip:', err);
    res.status(500).json({ message: 'Error joining trip' });
  }
});

app.post('/api/decline_trip', isAuthenticated, async (req, res) => {
  const { id_user, id_trip } = req.body;
  try {
    await TripMember.destroy({
      where: { id_user, id_trip }
    });
    res.json({ message: 'Successfully declined the trip' });
  } catch (err) {
    console.error('Error declining trip:', err);
    res.status(500).json({ message: 'Error declining trip' });
  }
});

app.get('/api/more_past_trips', isAuthenticated, async (req, res) => {
  const { id_user, offset } = req.query;

  try {
    const now = new Date();

    // Fetch additional past trips with offset
    const past = await TripMember.findAll({
      where: {
        id_user,
        joined: true,
      },
      include: [{
        model: Trip,
        required: true,
        where: {
          to_date: { [Op.lt]: now },
        },
      }],
      limit: 10,
      offset: parseInt(offset, 10),
      order: [[Trip, 'from_date', 'DESC']],
    });

    // Count total past trips
    const totalPastTrips = await sequelize.query(
      `SELECT COUNT(*) AS count
       FROM "TripMembers" AS "TripMember"
       INNER JOIN "Trips" AS "Trip" ON "TripMember"."id_trip" = "Trip"."id_trip"
       WHERE "TripMember"."id_user" = :id_user
       AND "TripMember"."joined" = true
       AND "Trip"."to_date" < :now`,
      {
        replacements: { id_user, now },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const formatDate = (date) => format(new Date(date), 'dd.MM.yyyy');

    const pastTrips = past.map(tripMember => ({
      id_trip: tripMember.Trip.id_trip,
      name: tripMember.Trip.name,
      icon: tripMember.Trip.icon,
      from_date: formatDate(tripMember.Trip.from_date),
      to_date: formatDate(tripMember.Trip.to_date),
      joined: tripMember.joined,
      owner: tripMember.owner,
      members_count: 0, // Placeholder, you can add logic to count members
      missing_items_count: 0, // Placeholder, you can add logic to count missing items
    }));

    res.json({
      past: pastTrips,
      allPastTripsLoaded: totalPastTrips[0].count <= parseInt(offset, 10) + 10
    });
  } catch (err) {
    console.error('Error fetching more past trips:', err);
    res.status(500).json({ message: 'Error fetching more past trips' });
  }
});
app.get('/api/items', isAuthenticated, async (req, res) => {
  const { search } = req.query;

  try {
    const items = await Item.findAll({
      where: {
        name: {
          [Op.iLike]: `%${search}%`
        }
      },
      limit: 5
    });

    res.json(items);
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(500).json({ message: 'Error fetching items' });
  }
});
app.get('/api/search-categories', isAuthenticated, async (req, res) => {
  const { search, userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    // Načíst kategorie, které má uživatel uložené
    const savedCategories = await Category.findAll({
      include: [{
        model: SavedCategory,
        where: { id_user: userId },
        required: true
      }],
      where: {
        name: {
          [Op.iLike]: `%${search}%`
        }
      },
      limit: 7
    });

    // Načíst kategorie, které uživatel nemá uložené
    const savedCategoryIds = savedCategories.map(sc => sc.id_category);

    // Get categories excluding the saved ones
    const unsavedCategories = await Category.findAll({
      where: {
        id_category: {
          [Op.notIn]: savedCategoryIds
        },
        name: {
          [Op.iLike]: `%${search}%`
        }
      },
      limit: 5
    });
    res.json({
      savedCategories,
      unsavedCategories
    });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ message: 'Error fetching categories' });
  }
});
app.post('/api/add-item-category', isAuthenticated, async (req, res) => {
  const { itemName, categoryName, userId, count, by_day } = req.body;

  try {
    // Find or create item
    let item = await Item.findOne({ where: { name: itemName } });
    if (!item) {
      item = await Item.create({ name: itemName });
    }

    // Find or create category
    let category = await Category.findOne({ where: { name: categoryName } });
    if (!category) {
      category = await Category.create({ name: categoryName });
    }

    // Create or update CategoryItem association
    let categoryItem = await CategoryItem.findOne({ where: { id_item: item.id_item, id_category: category.id_category, id_user: userId } });
    if (!categoryItem) {
      categoryItem = await CategoryItem.create({ id_item: item.id_item, id_category: category.id_category, id_user: userId });
    }

    // Create or update SavedItem association
    let savedItem = await SavedItem.findOne({ where: { id_user: userId, id_item: item.id_item } });
    if (!savedItem) {
      savedItem = await SavedItem.create({ id_user: userId, id_item: item.id_item, count, by_day });
    } else {
      savedItem.count = count;
      savedItem.by_day = by_day;
      await savedItem.save();
    }

    // Create or update SavedCategory association
    let savedCategory = await SavedCategory.findOne({ where: { id_user: userId, id_category: category.id_category } });
    if (!savedCategory) {
      savedCategory = await SavedCategory.create({ id_user: userId, id_category: category.id_category });
    }

    res.json({ item, category, categoryItem, savedItem, savedCategory });
  } catch (err) {
    console.error('Error adding item and category:', err);
    res.status(500).json({ message: 'Error adding item and category' });
  }
});

app.get('/api/saved-items', isAuthenticated, async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const query = `
      SELECT
        "SavedItems".id_item, -- Pokud existuje sloupec id_saved_item
        "Items".id_item,
        "Items".name AS item_name,
        "SavedItems".count AS count,
        "SavedItems".by_day AS by_day,
        "CategoryItems".id_category AS category_item_id,
        "Categories".id_category AS category_id,
        "Categories".name AS category_name
      FROM "SavedItems"
      INNER JOIN "Items" ON "SavedItems".id_item = "Items".id_item
      INNER JOIN "CategoryItems" ON "Items".id_item = "CategoryItems".id_item
        AND "CategoryItems".id_user = :userId AND "CategoryItems".id_list IS NULL
      INNER JOIN "Categories" ON "CategoryItems".id_category = "Categories".id_category
      WHERE "SavedItems".id_user = :userId;
    `;  

    const savedItems = await sequelize.query(query, {
      replacements: { userId },
      type: sequelize.QueryTypes.SELECT,
    });

    // Připravit strukturu pro vrácení dat
    const categorizedItems = {};

    savedItems.forEach(savedItem => {
      const category = savedItem.category_name;
      if (!categorizedItems[category]) {
        categorizedItems[category] = {
          id_category: savedItem.category_id,
          name: category,
          items: [],
        };
      }

      categorizedItems[category].items.push({
        id_item: savedItem.id_item,
        name: savedItem.item_name,
        count: savedItem.count,
        by_day: savedItem.by_day,
      });
    });
    // Převést objekt na pole
    const result = Object.values(categorizedItems);

    res.json(result);
  } catch (err) {
    console.error('Error fetching saved items:', err);
    res.status(500).json({ message: 'Error fetching saved items' });
  }
});

app.put('/api/update-item', isAuthenticated, async (req, res) => {
  const { id_item, itemName, categoryName, userId, count, by_day } = req.body;

  categoryN = categoryName;
  if (!categoryN) {
    let categoryItemOld = await CategoryItem.findOne({ where: { id_item } });
    categoryOld = await Category.findOne({ where: { id_category: categoryItemOld.id_category } });
    categoryN = categoryOld.name;
    }

  
  try {
    // Find or create item
    let item = await Item.findByPk(id_item);
    if (item && item.name !== itemName) {
      let existingItem = await Item.findOne({ where: { name: itemName } });
      if (!existingItem) {
        existingItem = await Item.create({ name: itemName });
      }
      const oldItem = await CategoryItem.findAll({ where: { id_item } })
      if (oldItem.length === 1) {
        await Item.destroy({ where: { id_item } });
      }
      item = existingItem;
    } else if (!item) {
      item = await Item.create({ name: itemName });
    }
    // Find or create category
    let category;
    if (categoryN) {
      category = await Category.findOne({ where: { name: categoryN } });
      if (!category) {
        category = await Category.create({ name: categoryN });
      }
    }
    // Remove old CategoryItem associations if category has changed
    if (category) {
      await CategoryItem.destroy({ where: { id_item: item.id_item, id_user: userId, id_list: null } });
      await CategoryItem.create({ id_item: item.id_item, id_category: category.id_category, id_user: userId, id_list: null });
    }
    // Create or update SavedItem association
    let savedItem = await SavedItem.findOne({ where: { id_user: userId, id_item: item.id_item } });
    if (!savedItem) {
      savedItem = await SavedItem.create({ id_user: userId, id_item: item.id_item, count, by_day });
    } else {
      if (savedItem.count !== count || savedItem.by_day !== by_day) {
        savedItem.id_item = item.id_item;
        savedItem.count = count;
        savedItem.by_day = by_day;
        await savedItem.save();
      }
    }
    // Create or update SavedCategory association
    if (category) {
      let savedCategory = await SavedCategory.findOne({ where: { id_user: userId, id_category: category.id_category } });
      if (!savedCategory) {
        savedCategory = await SavedCategory.create({ id_user: userId, id_category: category.id_category });
      }
    }

    res.json({ item, category, savedItem });
  } catch (err) {
    console.error('Error updating item:', err);
    res.status(500).json({ message: 'Error updating item' });
  }
});

app.delete('/api/delete-item', isAuthenticated, async (req, res) => {
  const { userId, id_item } = req.body;

  try {
    // Find all saved items for the given item
    const savedItems = await SavedItem.findAll({ where: { id_item } });
    const categoryItems = await CategoryItem.findAll({ where: { id_item } });

    if (savedItems.length === 1) {
      // If there is only one saved item, delete the item itself
      await Item.destroy({ where: { id_item } });
    }

    
    await CategoryItem.destroy({ where: { id_item, id_user: userId, id_list: null } });

    await SavedItem.destroy({ where: { id_user: userId, id_item } });
    if (categoryItems.length === 0) {
      await Category.destroy({ where: { id_category: categoryItems.id_category } });
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Error deleting item:', err);
    res.status(500).json({ message: 'Error deleting item' });
  }
});

app.post('/api/check_trip', isAuthenticated, async (req, res) => {
  const { id_trip, id_user } = req.body;

  try {
    const trip = await Trip.findOne({
      where: { id: id_trip },
      include: [{
        model: TripMember,
        where: { id_user, joined: true },
        required: true,
      }],
    });

    if (!trip) {
      return res.status(404).json({ message: 'Výlet nenalezen nebo nemáte oprávnění k přístupu' });
    }

    res.json(trip);
  } catch (error) {
    console.error('Chyba při načítání detailů výletu:', error);
    res.status(500).json({ message: 'Chyba při načítání detailů výletu' });
  }
});
app.get('/api/check-using-list-category', isAuthenticated, async (req, res) => {
  const { id_user, id_trip } = req.query;

  try {
    const usingListCategory = await UsingListCategory.findOne({
      where: { id_user, id_trip }
    });

    if (usingListCategory) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  } catch (error) {
    console.error('Error checking using list category:', error);
    res.status(500).json({ message: 'Error checking using list category' });
  }
});
sequelize.sync({ alter: true }).then(() => {
  app.listen(5000, () => {
    console.log('Server běží na http://localhost:5000');
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});