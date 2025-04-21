const { Sequelize } = require('sequelize');
const config = require('../config/database');

const sequelize = new Sequelize(config.database, config.user, config.password, {
    host: config.host,
    port: config.port,
    dialect: 'postgres',
    logging: false
});

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Model tanımlamaları
db.User = require('./User')(sequelize, Sequelize);
db.Pathway = require('./Pathway')(sequelize, Sequelize);
db.Course = require('./Course')(sequelize, Sequelize);
db.Module = require('./Module')(sequelize, Sequelize);
db.Lesson = require('./Lesson')(sequelize, Sequelize);
db.UserPathway = require('./UserPathway')(sequelize, Sequelize);
db.UserLesson = require('./UserLesson')(sequelize, Sequelize);
db.Certificate = require('./Certificate')(sequelize, Sequelize);
db.Review = require('./Review')(sequelize, Sequelize);
db.Badge = require('./Badge')(sequelize, Sequelize);
db.UserBadge = require('./UserBadge')(sequelize, Sequelize);

// İlişkileri tanımla
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

module.exports = db; 