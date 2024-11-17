const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./connection');

// Users model
const User = sequelize.define('User', {
  id_user: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  picture: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

// Friends model
const Friend = sequelize.define('Friend', {}, { timestamps: false });
Friend.removeAttribute('id'); // Odstranění automatického id
Friend.primaryKey = ['id_user_one', 'id_user_two']; // Složený primární klíč

Friend.belongsTo(User, { as: 'UserOne', foreignKey: 'id_user_one' });
Friend.belongsTo(User, { as: 'UserTwo', foreignKey: 'id_user_two' });

// Trips model
const Trip = sequelize.define('Trip', {
  id_trip: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: DataTypes.STRING,
  icon: DataTypes.STRING,
});

// Trip Members model
const TripMemberPermission = sequelize.define(
  'TripMemberPermission',
  {
    view: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    edit: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { timestamps: false }
);

TripMemberPermission.removeAttribute('id'); // Odstranění automatického id
TripMemberPermission.primaryKey = ['id_user', 'id_friend', 'id_trip']; // Složený primární klíč

TripMemberPermission.belongsTo(User, { 
  foreignKey: 'id_user',
  targetKey: 'id_user',  // Explicitně definujeme targetKey
});
TripMemberPermission.belongsTo(User, { 
  foreignKey: 'id_friend',
  targetKey: 'id_user',  // Explicitně definujeme targetKey
});
TripMemberPermission.belongsTo(Trip, { 
  foreignKey: 'id_trip',
  targetKey: 'id_trip',  // Explicitně definujeme targetKey
});

// Items model
const Item = sequelize.define('Item', {
  id_item: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    unique: true,
  },
});

// Categories model
const Category = sequelize.define('Category', {
  id_category: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: DataTypes.STRING,
});

// Lists model
const List = sequelize.define('List', {
  id_list: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: DataTypes.STRING,
});

List.belongsTo(User, { foreignKey: 'id_user' });

// List Categories model
const ListCategory = sequelize.define('ListCategory', {}, { timestamps: false });
ListCategory.removeAttribute('id'); // Odstranění automatického id
ListCategory.primaryKey = ['id_list', 'id_category']; // Složený primární klíč

ListCategory.belongsTo(List, { foreignKey: 'id_list' });
ListCategory.belongsTo(Category, { foreignKey: 'id_category' });

// Category Items model
const CategoryItem = sequelize.define('CategoryItem', {}, { timestamps: false });
CategoryItem.removeAttribute('id'); // Odstranění automatického id
CategoryItem.primaryKey = ['id_item', 'id_category']; // Složený primární klíč

CategoryItem.belongsTo(Category, { foreignKey: 'id_category' });
CategoryItem.belongsTo(Item, { foreignKey: 'id_item' });

// Saved Items model
const SavedItem = sequelize.define(
  'SavedItem',
  {
    by_day: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    count: DataTypes.INTEGER,
  },
  { timestamps: false }
);

SavedItem.removeAttribute('id'); // Odstranění automatického id
SavedItem.primaryKey = ['id_user', 'id_item']; // Složený primární klíč

SavedItem.belongsTo(User, { foreignKey: 'id_user' });
SavedItem.belongsTo(Item, { foreignKey: 'id_item' });

// Saved Categories model
const SavedCategory = sequelize.define('SavedCategory', {}, { timestamps: false });
SavedCategory.removeAttribute('id'); // Odstranění automatického id
SavedCategory.primaryKey = ['id_user', 'id_category']; // Složený primární klíč

SavedCategory.belongsTo(User, { foreignKey: 'id_user' });
SavedCategory.belongsTo(Category, { foreignKey: 'id_category' });

// Using Items model
const UsingItem = sequelize.define('UsingItem', {
  id_item: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: DataTypes.STRING,
  count: DataTypes.INTEGER,
  check: DataTypes.BOOLEAN,
  dissent: DataTypes.BOOLEAN,
});

// Using Categories model
const UsingCategory = sequelize.define('UsingCategory', {
  id_category: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: DataTypes.STRING,
});

// Using List Categories model
const UsingListCategory = sequelize.define('UsingListCategory', {}, { timestamps: false });
UsingListCategory.removeAttribute('id'); // Odstranění automatického id
UsingListCategory.primaryKey = ['id_trip', 'id_user', 'id_category']; // Složený primární klíč

UsingListCategory.belongsTo(Trip, { foreignKey: 'id_trip' });
UsingListCategory.belongsTo(User, { foreignKey: 'id_user' });
UsingListCategory.belongsTo(Category, { foreignKey: 'id_category' });

// Using Category Items model
const UsingCategoryItem = sequelize.define('UsingCategoryItem', {}, { timestamps: false });
UsingCategoryItem.removeAttribute('id'); // Odstranění automatického id
UsingCategoryItem.primaryKey = ['id_item', 'id_category']; // Složený primární klíč

UsingCategoryItem.belongsTo(UsingCategory, { foreignKey: 'id_category' });
UsingCategoryItem.belongsTo(UsingItem, { foreignKey: 'id_item' });

module.exports = {
  sequelize,
  User,
  Friend,
  Trip,
  TripMemberPermission,
  Item,
  Category,
  List,
  ListCategory,
  CategoryItem,
  SavedItem,
  SavedCategory,
  UsingItem,
  UsingCategory,
  UsingListCategory,
  UsingCategoryItem,
};
