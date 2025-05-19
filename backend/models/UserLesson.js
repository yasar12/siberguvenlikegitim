module.exports = (sequelize, DataTypes) => {
    const UserLesson = sequelize.define('UserLesson', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        completion_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('not_started', 'in_progress', 'completed'),
            defaultValue: 'not_started'
        },
        last_watched_position: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
        timestamps: true,
        underscored: true
    });

    return UserLesson;
}; 