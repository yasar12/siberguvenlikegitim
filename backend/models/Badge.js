module.exports = (sequelize, DataTypes) => {
    const Badge = sequelize.define('Badge', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        image_url: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        criteria: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
        timestamps: true,
        underscored: true
    });

    return Badge;
}; 