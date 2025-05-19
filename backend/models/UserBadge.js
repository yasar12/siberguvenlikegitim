module.exports = (sequelize, DataTypes) => {
    const UserBadge = sequelize.define('UserBadge', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        earned_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        timestamps: true,
        underscored: true
    });

    return UserBadge;
}; 