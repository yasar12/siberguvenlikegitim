module.exports = (sequelize, DataTypes) => {
    const UserPathway = sequelize.define('UserPathway', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        start_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        completion_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        progress_percentage: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0.00
        },
        status: {
            type: DataTypes.ENUM('not_started', 'in_progress', 'completed', 'dropped'),
            defaultValue: 'in_progress'
        }
    }, {
        timestamps: true,
        underscored: true
    });

    return UserPathway;
}; 