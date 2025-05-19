module.exports = (sequelize, DataTypes) => {
    const Pathway = sequelize.define('Pathway', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        level: {
            type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
            allowNull: false
        },
        duration_weeks: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        image_url: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        timestamps: true,
        underscored: true
    });

    Pathway.associate = (models) => {
        Pathway.hasMany(models.Module, {
            foreignKey: 'pathway_id',
            as: 'modules'
        });
    };

    return Pathway;
}; 