const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'postgres', // nebo 'mysql', 'sqlite', 'mssql'
});

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
    allowNull: false,
  },
});

// Friends model
const Friend = sequelize.define('Friend', {}, { timestamps: false });

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
const TripMember = sequelize.define('TripMember', {}, { timestamps: false });
TripMember.belongsTo(User, { foreignKey: 'id_user' });
TripMember.belongsTo(Trip, { foreignKey: 'id_trip' });

// Trip Members Permission model
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

TripMemberPermission.belongsTo(TripMember, { foreignKey: 'id_user' });
TripMemberPermission.belongsTo(TripMember, { foreignKey: 'id_friend' });
TripMemberPermission.belongsTo(Trip, { foreignKey: 'id_trip' });

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
ListCategory.belongsTo(List, { foreignKey: 'id_list' });
ListCategory.belongsTo(Category, { foreignKey: 'id_category' });

// Category Items model
const CategoryItem = sequelize.define('CategoryItem', {}, { timestamps: false });
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

SavedItem.belongsTo(User, { foreignKey: 'id_user' });
SavedItem.belongsTo(Item, { foreignKey: 'id_item' });

// Saved Categories model
const SavedCategory = sequelize.define('SavedCategory', {}, { timestamps: false });
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
UsingListCategory.belongsTo(Trip, { foreignKey: 'id_trip' });
UsingListCategory.belongsTo(User, { foreignKey: 'id_user' });
UsingListCategory.belongsTo(Category, { foreignKey: 'id_category' });

// Using Category Items model
const UsingCategoryItem = sequelize.define('UsingCategoryItem', {}, { timestamps: false });
UsingCategoryItem.belongsTo(UsingCategory, { foreignKey: 'id_category' });
UsingCategoryItem.belongsTo(UsingItem, { foreignKey: 'id_item' });

module.exports = {
  sequelize,
  User,
  Friend,
  Trip,
  TripMember,
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
