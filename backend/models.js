const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./connection');


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
}, { timestamps: false });

const Friend = sequelize.define('Friend', {}, { timestamps: false });
Friend.removeAttribute('id');
Friend.primaryKey = ['id_user_one', 'id_user_two']; 

Friend.belongsTo(User, { as: 'UserOne', foreignKey: 'id_user_one' });
Friend.belongsTo(User, { as: 'UserTwo', foreignKey: 'id_user_two' });

const Trip = sequelize.define('Trip', {
  id_trip: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: DataTypes.STRING,
  icon: DataTypes.STRING,
  from_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  to_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, { timestamps: false });

const TripMember = sequelize.define('TripMember', {
  joined: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  owner: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, { timestamps: false });

TripMember.belongsTo(User, { foreignKey: 'id_user' });
TripMember.belongsTo(Trip, { foreignKey: 'id_trip' });
TripMember.removeAttribute('id'); 
TripMember.primaryKey = ['id_user', 'id_trip']; 


const TripMemberPermission = sequelize.define('TripMemberPermission', {
  view: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  edit: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, { timestamps: false });

TripMemberPermission.belongsTo(User, { foreignKey: 'id_user' });
TripMemberPermission.belongsTo(User, { foreignKey: 'id_friend' });
TripMemberPermission.belongsTo(Trip, { foreignKey: 'id_trip' });
TripMemberPermission.removeAttribute('id'); 
TripMemberPermission.primaryKey = ['id_user', 'id_friend', 'id_trip'];

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
}, { timestamps: false });

const Category = sequelize.define('Category', {
  id_category: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    unique: true,
  },
}, { timestamps: false });

const List = sequelize.define('List', {
  id_list: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: DataTypes.STRING,
}, { timestamps: false });

List.belongsTo(User, { foreignKey: 'id_user' });

const ListCategory = sequelize.define('ListCategory', {}, { timestamps: false });
ListCategory.removeAttribute('id'); 
ListCategory.primaryKey = ['id_list', 'id_category', 'id_user']; 

ListCategory.belongsTo(List, { foreignKey: 'id_list' });
ListCategory.belongsTo(Category, { foreignKey: 'id_category' });
ListCategory.belongsTo(User, { foreignKey: 'id_user' }); 
const CategoryItem = sequelize.define(
  'CategoryItem',
  {},
  {
    timestamps: false,
    uniqueKeys: {
      unique_category_item_user_list: {
        fields: ['id_item', 'id_category', 'id_user', 'id_list'],
      },
    },
  }
);

CategoryItem.removeAttribute('id'); 
CategoryItem.belongsTo(Category, { foreignKey: 'id_category' });
CategoryItem.belongsTo(Item, { foreignKey: 'id_item' });
CategoryItem.belongsTo(User, { foreignKey: 'id_user' }); 
CategoryItem.belongsTo(List, { foreignKey: 'id_list' });

const SavedItem = sequelize.define('SavedItem', {
  by_day: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  count: DataTypes.INTEGER,
}, { timestamps: false });

SavedItem.removeAttribute('id'); 
SavedItem.primaryKey = ['id_user', 'id_item']; 

SavedItem.belongsTo(User, { foreignKey: 'id_user' });
SavedItem.belongsTo(Item, { foreignKey: 'id_item' });

const SavedCategory = sequelize.define('SavedCategory', {}, { timestamps: false });
SavedCategory.removeAttribute('id'); 
SavedCategory.primaryKey = ['id_user', 'id_category']; 

SavedCategory.belongsTo(User, { foreignKey: 'id_user' });
SavedCategory.belongsTo(Category, { foreignKey: 'id_category' });

const UsingItem = sequelize.define('UsingItem', {
  id_item: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  by_day: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  name: DataTypes.STRING,
  count: DataTypes.INTEGER,
  check: DataTypes.BOOLEAN,
  dissent: DataTypes.BOOLEAN,
}, { timestamps: false });

const UsingCategory = sequelize.define('UsingCategory', {
  id_category: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: DataTypes.STRING,
}, { timestamps: false });

const UsingListCategory = sequelize.define('UsingListCategory', {}, { timestamps: false });
UsingListCategory.removeAttribute('id'); 
UsingListCategory.primaryKey = ['id_trip', 'id_user', 'id_category']; 

UsingListCategory.belongsTo(Trip, { foreignKey: 'id_trip' });
UsingListCategory.belongsTo(User, { foreignKey: 'id_user' });
UsingListCategory.belongsTo(Category, { foreignKey: 'id_category' });


const UsingCategoryItem = sequelize.define('UsingCategoryItem', {}, { timestamps: false });
UsingCategoryItem.removeAttribute('id'); 
UsingCategoryItem.primaryKey = ['id_item', 'id_category']; 

UsingCategoryItem.belongsTo(UsingCategory, { foreignKey: 'id_category' });
UsingCategoryItem.belongsTo(UsingItem, { foreignKey: 'id_item' });

Item.belongsToMany(Category, { through: CategoryItem, foreignKey: 'id_item' });
Category.belongsToMany(Item, { through: CategoryItem, foreignKey: 'id_category' });

Item.hasMany(CategoryItem, { foreignKey: 'id_item' });
Category.hasMany(CategoryItem, { foreignKey: 'id_category' });

Category.hasMany(SavedCategory, { foreignKey: 'id_category' });
SavedCategory.belongsTo(Category, { foreignKey: 'id_category' });

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