require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // In development, you might want to sync the database.
    // Be careful with this in production as it can drop tables.
    if (process.env.NODE_ENV === 'development') {
        // await sequelize.sync({ alter: true }); // or { force: true } to drop and recreate
        console.log('DB synced in dev mode.');
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();
