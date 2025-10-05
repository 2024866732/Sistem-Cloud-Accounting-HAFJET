// migrate-mongo config file
// This file is checked in and points to default ./migrations directory
module.exports = {
  mongodb: {
    url: process.env.MONGO_URI || 'mongodb://localhost:27017/hafjet-bukku',
    databaseName: undefined,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  migrationsDir: 'migrations',
  changelogCollectionName: 'changelog'
};
