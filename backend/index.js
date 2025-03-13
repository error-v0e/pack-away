const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const {sequelize, User, Friend, Trip, TripMember, TripMemberPermission, Item, Category, CategoryItem, SavedItem, SavedCategory, UsingListCategory, UsingCategory, UsingItem, UsingCategoryItem, List, ListCategory } = require('./models');
const { Sequelize, DataTypes, Op } = require('sequelize');
const { format } = require('date-fns');


const app = express();

const allowedOrigins = ['http://192.168.50.100:5173', 'http://localhost:5173', 'http://10.20.9.35:5173'];

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
      const user = await User.findOne({
        where: {
          [Op.or]: [
            { username: username },
            { email: username }
          ]
        }
      });
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

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

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
      return res.json({ message: 'Logged in successfully', id_user: user.id_user, user: user.username, redirect: '/' });
    });
  })(req, res, next);
});

app.post('/api/register', isNotAuthenticated, async (req, res) => {
  const { username, email, password } = req.body;
  const errors = {};

  if (!username || username.trim() === '') {
    errors.username = 'Jmeno je povinné';
  }

  if (!email || email.trim() === '') {
    errors.email = 'Email je povinný';
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = 'Špatný format emailu';
    }
  }

  if (!password || password.trim() === '') {
    errors.password = 'Heslo je povinné';
  } else {
    const passwordErrors = [];
    if (password.length < 8) {
      passwordErrors.push('alespoň 8 znaků dlouhé');
    }
    if (!/[A-Z]/.test(password)) {
      passwordErrors.push('jedno velké písmeno');
    }
    if (!/[a-z]/.test(password)) {
      passwordErrors.push('jedno malé písmeno');
    }
    if (!/\d/.test(password)) {
      passwordErrors.push('jedno číslo');
    }
    if (passwordErrors.length > 0) {
      errors.password = `Heslo musí obsahovat ${passwordErrors.join(', ')}`;
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

    req.login(newUser, (err) => {
      if (err) {
        console.error('Error logging in after registration:', err);
        return res.status(500).json({ form: 'Error logging in after registration' });
      }
      res.json({ message: 'User registered successfully', id_user: newUser.id_user, user: newUser.username, redirect: '/' });
    });
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
          [Op.ne]: id_user, 
          [Op.notIn]: friendIds, 
        },
        username: {
          [Op.like]: `${search}%` 
        }
      },
      attributes: { exclude: ['password'] }, 
      limit: 7 
    });

    const containsMatches = await User.findAll({
      where: {
        id_user: {
          [Op.ne]: id_user, 
          [Op.notIn]: friendIds, 
        },
        username: {
          [Op.like]: `%${search}%` 
        }
      },
      attributes: { exclude: ['password'] }, 
      limit: 7 
    });

    
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
    const newTrip = await Trip.create({ name, icon, from_date, to_date });
    await TripMember.create({ id_user, id_trip: newTrip.id_trip, joined: true, owner: true });

    for (const friend of invitedFriends) {
      await TripMember.create({ id_user: friend.id_user, id_trip: newTrip.id_trip, joined: false, owner: false });

      // Create TripMemberPermission for each invited friend with the trip creator
      await TripMemberPermission.create({ id_user, id_friend: friend.id_user, id_trip: newTrip.id_trip, view: true, edit: false });
      await TripMemberPermission.create({ id_user: friend.id_user, id_friend: id_user, id_trip: newTrip.id_trip, view: true, edit: false });

      // Create TripMemberPermission for each invited friend with other invited friends
      for (const otherFriend of invitedFriends) {
        if (friend.id_user !== otherFriend.id_user) {
          await TripMemberPermission.create({ id_user: friend.id_user, id_friend: otherFriend.id_user, id_trip: newTrip.id_trip, view: true, edit: false });
        }
      }
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

    const invites = await TripMember.findAll({
      where: { id_user, joined: false },
      include: [{
        model: Trip,
        required: true,
        where: {
          to_date: { [Op.gte]: now }, 
        },
      }],
      limit: 20,
      order: [[Trip, 'from_date', 'DESC']],
    });

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
      members_count: 0, 
      missing_items_count: 0, 
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

    const savedCategoryIds = savedCategories.map(sc => sc.id_category);

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
    let item = await Item.findOne({ where: { name: itemName } });
    if (!item) {
      item = await Item.create({ name: itemName });
    }

    let category = await Category.findOne({ where: { name: categoryName } });
    if (!category) {
      category = await Category.create({ name: categoryName });
    }

    let categoryItem = await CategoryItem.findOne({ where: { id_item: item.id_item, id_category: category.id_category, id_user: userId } });
    if (!categoryItem) {
      categoryItem = await CategoryItem.create({ id_item: item.id_item, id_category: category.id_category, id_user: userId });
    }

    let savedItem = await SavedItem.findOne({ where: { id_user: userId, id_item: item.id_item } });
    if (!savedItem) {
      savedItem = await SavedItem.create({ id_user: userId, id_item: item.id_item, count, by_day });
    } else {
      savedItem.count = count;
      savedItem.by_day = by_day;
      await savedItem.save();
    }

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
    let category;
    if (categoryN) {
      category = await Category.findOne({ where: { name: categoryN } });
      if (!category) {
        category = await Category.create({ name: categoryN });
      }
    }
    if (category) {
      await CategoryItem.destroy({ where: { id_item: item.id_item, id_user: userId, id_list: null } });
      await CategoryItem.create({ id_item: item.id_item, id_category: category.id_category, id_user: userId, id_list: null });
    }
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
    const savedItems = await SavedItem.findAll({ where: { id_item } });
    const categoryItems = await CategoryItem.findAll({ where: { id_item } });

    if (savedItems.length === 1) {
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
app.post('/api/create-list', isAuthenticated, async (req, res) => {
  const { id_user, id_trip, items } = req.body;

  try {

    for (const category of items) {

      const usingCategory = await UsingCategory.create({ name: category.name });

      await UsingListCategory.create({
        id_trip,
        id_user,
        id_category: usingCategory.id_category
      });

      for (const item of category.items) {
        const usingItem = await UsingItem.create({ name: item.name, count: item.count,by_day: item.by_day, check: false, dissent: false });
        console.log('usingItem:', usingItem);
        await UsingCategoryItem.create({
          id_item: usingItem.id_item,
          id_category: usingCategory.id_category 
        });
      }
    }

    res.json({ message: 'List created successfully' });
  } catch (error) {
    console.error('Error creating list:', error);
    res.status(500).json({ message: 'Error creating list' });
  }
});
app.get('/api/view-using-list-items', isAuthenticated, async (req, res) => {
  const { asking_IDuser, IDuser, IDtrip } = req.query;
  try {

    if (asking_IDuser !== IDuser) {
      const permission = await TripMemberPermission.findOne({
        where: {
          id_user: asking_IDuser,
          id_friend: IDuser,
          id_trip: IDtrip,
        }
      });
      console.log('permission:', permission);
      if (permission.view !== true) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
    }

    const query = `
      SELECT
        "UsingItems".id_item,
        "UsingItems".name AS item_name,
        "UsingItems".count AS count,
        "UsingItems".check AS check,
        "UsingItems".by_day,
        "UsingItems".dissent AS dissent,
        "UsingCategories".id_category,
        "UsingCategories".name AS category_name,
        "UsingListCategories".id_user,
        "UsingListCategories".id_trip
      FROM "UsingItems"
      INNER JOIN "UsingCategoryItems" ON "UsingItems".id_item = "UsingCategoryItems".id_item
      INNER JOIN "UsingCategories" ON "UsingCategoryItems".id_category = "UsingCategories".id_category
      INNER JOIN "UsingListCategories" ON "UsingCategories".id_category = "UsingListCategories".id_category
      WHERE "UsingListCategories".id_user = :IDuser AND "UsingListCategories".id_trip = :IDtrip;
    `;

    const usingListItems = await sequelize.query(query, {
      replacements: { IDuser, IDtrip },
      type: sequelize.QueryTypes.SELECT,
    });

    const categorizedItems = {};

    usingListItems.forEach(item => {
      const category = item.category_name;
      if (!categorizedItems[category]) {
        categorizedItems[category] = {
          id_category: item.id_category,
          name: category,
          items: [],
        };
      }
      categorizedItems[category].items.push({
        id_item: item.id_item,
        name: item.item_name,
        by_day: item.by_day,
        count: item.count,
        check: item.check,
        dissent: item.dissent,
      });
    });

    const result = Object.values(categorizedItems);

    res.json(result);
  } catch (err) {
    console.error('Error fetching using list items:', err);
    res.status(500).json({ message: 'Error fetching using list items' });
  }
});
app.get('/api/using-list-items', isAuthenticated, async (req, res) => {
  const { asking_IDuser, IDuser, IDtrip } = req.query;
  try {
    if (asking_IDuser !== IDuser) {
      const permission = await TripMemberPermission.findOne({
        where: {
          id_user: asking_IDuser,
          id_friend: IDuser,
          id_trip: IDtrip,
        }
      });
      if (permission.edit !== true) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
    }

    const query = `
      SELECT
        "UsingItems".id_item,
        "UsingItems".name AS item_name,
        "UsingItems".count AS count,
        "UsingItems".check AS check,
        "UsingItems".by_day,
        "UsingItems".dissent AS dissent,
        "UsingCategories".id_category,
        "UsingCategories".name AS category_name,
        "UsingListCategories".id_user,
        "UsingListCategories".id_trip
      FROM "UsingItems"
      INNER JOIN "UsingCategoryItems" ON "UsingItems".id_item = "UsingCategoryItems".id_item
      INNER JOIN "UsingCategories" ON "UsingCategoryItems".id_category = "UsingCategories".id_category
      INNER JOIN "UsingListCategories" ON "UsingCategories".id_category = "UsingListCategories".id_category
      WHERE "UsingListCategories".id_user = :IDuser AND "UsingListCategories".id_trip = :IDtrip;
    `;

    const usingListItems = await sequelize.query(query, {
      replacements: { IDuser, IDtrip },
      type: sequelize.QueryTypes.SELECT,
    });

    const categorizedItems = {};

    usingListItems.forEach(item => {
      const category = item.category_name;
      if (!categorizedItems[category]) {
        categorizedItems[category] = {
          id_category: item.id_category,
          name: category,
          items: [],
        };
      }
      categorizedItems[category].items.push({
        id_item: item.id_item,
        name: item.item_name,
        by_day: item.by_day,
        count: item.count,
        check: item.check,
        dissent: item.dissent,
      });
    });

    const result = Object.values(categorizedItems);

    res.json(result);
  } catch (err) {
    console.error('Error fetching using list items:', err);
    res.status(500).json({ message: 'Error fetching using list items' });
  }
});
app.get('/api/trip-details/', isAuthenticated, async (req, res) => {
  const { id_trip } = req.query;

  try {
    const trip = await Trip.findOne({ where: { id_trip } });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const fromDate = new Date(trip.from_date);
    const toDate = new Date(trip.to_date);
    const tripDays = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;

    res.json({ days: tripDays });
  } catch (error) {
    console.error('Error fetching trip details:', error);
    res.status(500).json({ message: 'Error fetching trip details' });
  }
});
app.post('/api/update-item-status', isAuthenticated, async (req, res) => {
  const { id_item, status } = req.body;

  try {
    let check = false;
    let dissent = false;

    if (status === 'check') {
      check = true;
      dissent = false;
    } else if (status === 'dash') {
      check = false;
      dissent = true;
    }

    await UsingItem.update({ check, dissent }, { where: { id_item } });

    res.json({ message: 'Item status updated successfully' });
  } catch (error) {
    console.error('Error updating item status:', error);
    res.status(500).json({ message: 'Error updating item status' });
  }
});
app.get('/api/items-l', isAuthenticated, async (req, res) => {
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

    const savedItems = await SavedItem.findAll({
      where: {
        id_user: req.user.id_user
      },
      include: [{
        model: Item,
        where: {
          name: {
            [Op.iLike]: `%${search}%`
          }
        }
      }]
    });
    const savedItemIds = savedItems.map(savedItem => savedItem.id_item);

    const unsavedItems = items.filter(item => !savedItemIds.includes(item.id_item));

    res.json({ savedItems, unsavedItems });
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(500).json({ message: 'Error fetching items' });
  }
});
app.get('/api/item-details', isAuthenticated, async (req, res) => {
  const { id_item, id_user } = req.query;

  try {
    const itemDetails = await SavedItem.findOne({
      where: { id_item, id_user },
      include: [
        {
          model: Item,
          attributes: ['name'],
          include: [
            {
              model: CategoryItem,
              where: { id_user, id_list: null },
              include: [
                {
                  model: Category,
                  attributes: ['name']
                }
              ]
            }
          ]
        }
      ]
    });

    if (!itemDetails) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const { name } = itemDetails.Item;
    const { count, by_day } = itemDetails;
    const category = itemDetails.Item.CategoryItems[0]?.Category.name || '';

    res.json({ name, count, by_day, category });
  } catch (err) {
    console.error('Error fetching item details:', err);
    res.status(500).json({ message: 'Error fetching item details' });
  }
});
app.post('/api/edit-save-list', isAuthenticated, async (req, res) => {
  const { id_user, items, listName, id_list } = req.body;

  try {
    await CategoryItem.destroy({
      where: {
        id_user,
        id_list
      }
    });

    if (!id_list || !listName) {
      return res.status(400).json({ message: 'List ID and new name are required' });
    }

    const list = await List.findOne({ where: { id_list } });

    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    list.name = listName;
    await list.save();

    for (const category of items) {
      // Check if the category exists, if not, create it
      let savedCategory = await Category.findOne({ where: { name: category.name } });
      if (!savedCategory) {
        savedCategory = await Category.create({ name: category.name });
      }

      // Save the category for the user
      await SavedCategory.findOrCreate({
        where: { id_user, id_category: savedCategory.id_category }
      });

      for (const item of category.items) {
        // Check if the item exists, if not, create it
        let savedItem = await Item.findOne({ where: { name: item.name } });
        if (!savedItem) {
          savedItem = await Item.create({ name: item.name });
        }

        // Save the item for the user
        await SavedItem.findOrCreate({
          where: { id_user, id_item: savedItem.id_item },
          defaults: { count: item.count, by_day: item.by_day }
        });

        // Create the relationship between the category and the item
        await CategoryItem.create({
          id_item: savedItem.id_item,
          id_category: savedCategory.id_category,
          id_user,
          count: item.count,
          by_day: item.by_day,
          id_list: id_list
        });
      }
    }

    res.json({ message: 'List updated successfully' });
  } catch (error) {
    console.error('Error updating list:', error);
    res.status(500).json({ message: 'Error updating list' });
  }
});
app.get('/api/get-lists', isAuthenticated, async (req, res) => {
  const { id_user } = req.query;

  try {
    const lists = await List.findAll({
      where: { id_user },
      include: [{
        model: CategoryItem,
        attributes: [],
        required: true
      }],
      attributes: [
        'id_list',
        'name',
        [sequelize.fn('COUNT', sequelize.col('CategoryItems.id_item')), 'itemCount']
      ],
      group: ['List.id_list']
    });

    res.json(lists);
  } catch (error) {
    console.error('Error fetching lists:', error);
    res.status(500).json({ message: 'Error fetching lists' });
  }
});
app.get('/api/saved-list-items', isAuthenticated, async (req, res) => {
  const { userId, listId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const savedItems = await CategoryItem.findAll({
      where: {
        id_user: userId,
        id_list: listId
      },
      include: [{
        model: Item,
        attributes: ['id_item','name']
      },
        {model: Category,
        attributes: ['id_category','name']
      }]
    });

    const categorizedItems = {};

    savedItems.forEach(savedItem => {
      const category = savedItem.Category.name;
      if (!categorizedItems[category]) {
        categorizedItems[category] = {
          id_category: savedItem.Category.id_category,
          name: category,
          items: [],
        };
      }

      categorizedItems[category].items.push({
        id_item: savedItem.Item.id_item,
        name: savedItem.Item.name,
        count: savedItem.count,
        by_day: savedItem.by_day,
      });
    });
    const result = Object.values(categorizedItems);

    res.json(result);
  } catch (err) {
    console.error('Error fetching saved items:', err);
    res.status(500).json({ message: 'Error fetching saved items' });
  }
});
app.get('/api/get-list-name', isAuthenticated, async (req, res) => {
  const { listId } = req.query;

  if (!listId) {
    return res.status(400).json({ message: 'List ID is required' });
  }

  try {
    const list = await List.findOne({
      where: { id_list: listId },
      attributes: ['name']
    });

    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    res.json({ name: list.name });
  } catch (error) {
    console.error('Error fetching list name:', error);
    res.status(500).json({ message: 'Error fetching list name' });
  }
});
app.post('/api/create-save-list', isAuthenticated, async (req, res) => {
  const { id_user, items, listName } = req.body;

  try {
    // Create the list
    const newList = await List.create({ name: listName, id_user });

    for (const category of items) {
      // Check if the category exists, if not, create it
      let savedCategory = await Category.findOne({ where: { name: category.name } });
      if (!savedCategory) {
        savedCategory = await Category.create({ name: category.name });
      }

      // Save the category for the user
      await SavedCategory.findOrCreate({
        where: { id_user, id_category: savedCategory.id_category }
      });

      for (const item of category.items) {
        // Check if the item exists, if not, create it
        let savedItem = await Item.findOne({ where: { name: item.name } });
        if (!savedItem) {
          savedItem = await Item.create({ name: item.name });
        }

        // Save the item for the user
        await SavedItem.findOrCreate({
          where: { id_user, id_item: savedItem.id_item },
          defaults: { count: item.count, by_day: item.by_day }
        });

        // Create the relationship between the category and the item
        await CategoryItem.create({
          id_item: savedItem.id_item,
          id_category: savedCategory.id_category,
          id_user,
          count: item.count,
          by_day: item.by_day,
          id_list: newList.id_list
        });
      }
    }

    res.json({ message: 'List created successfully' });
  } catch (error) {
    console.error('Error creating list:', error);
    res.status(500).json({ message: 'Error creating list' });
  }
});
app.get('/api/check-user-presence', isAuthenticated, async (req, res) => {
  const { id_user, id_trip } = req.query;

  if (!id_user || !id_trip) {
    return res.status(400).json({ message: 'User ID and Trip ID are required' });
  }

  try {
    const tripMember = await TripMember.findOne({
      where: {
        id_user,
        id_trip
      }
    });

    if (tripMember) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error('Error checking user presence:', error);
    res.status(500).json({ message: 'Error checking user presence' });
  }
});
app.get('/api/item-name', isAuthenticated, async (req, res) => {
  const { id_item } = req.query;

  if (!id_item) {
    return res.status(400).json({ message: 'Item ID is required' });
  }

  try {
    const item = await Item.findOne({
      where: { id_item },
      attributes: ['name']
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ name: item.name });
  } catch (error) {
    console.error('Error fetching item name:', error);
    res.status(500).json({ message: 'Error fetching item name' });
  }
});
app.get('/api/trip-members', isAuthenticated, async (req, res) => {
  const { id_user, id_trip } = req.query;

  if (!id_user || !id_trip) {
    return res.status(400).json({ message: 'User ID and Trip ID are required' });
  }

  try {
    const tripMembers = await sequelize.query(
        `SELECT 
          tm.id_user, 
          tm.joined, 
          u.username, 
          u.picture, 
          tmp.view
        FROM "TripMembers" tm  -- Opraveno
        LEFT JOIN "Users" u ON tm.id_user = u.id_user
        LEFT JOIN "TripMemberPermissions" tmp 
            ON tmp.id_friend = tm.id_user 
            AND tmp.id_trip = tm.id_trip 
            AND tmp.id_user = :id_user
        WHERE tm.id_trip = :id_trip 
        AND tm.id_user != :id_user;`,
      {
        replacements: { id_trip, id_user },
        type: Sequelize.QueryTypes.SELECT
      }
    );

    const members = tripMembers.map(member => ({
      id_user: member.id_user,
      username: member.username,
      picture: member.picture,
      joined: member.joined,
      view: member.view
    }));

    res.json(members);
  } catch (error) {
    console.error('Error fetching trip members:', error);
    res.status(500).json({ message: 'Error fetching trip members' });
  }
});
app.get('/api/user-permissions', isAuthenticated, async (req, res) => {
  const { id_user, id_friend, id_trip } = req.query;

  if (!id_user || !id_friend || !id_trip) {
    return res.status(400).json({ message: 'User ID, Friend ID, and Trip ID are required' });
  }

  try {
    const permission = await TripMemberPermission.findOne({
      where: {
        id_user,
        id_friend,
        id_trip
      },
      attributes: ['view', 'edit']
    });

    if (!permission) {
      return res.status(404).json({ message: 'Permissions not found' });
    }

    res.json({ view: permission.view, edit: permission.edit });
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    res.status(500).json({ message: 'Error fetching user permissions' });
  }
});
sequelize.sync({ alter: true }).then(() => {
  app.listen(5000, () => {
    console.log('Server běží na http://localhost:5000');
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});