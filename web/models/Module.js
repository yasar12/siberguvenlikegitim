module.exports = (sequelize, DataTypes) => {
    const Module = sequelize.define('Module', {
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
        order: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        timestamps: true,
        underscored: true
    });

    Module.associate = (models) => {
        Module.belongsTo(models.Pathway, {
            foreignKey: 'pathway_id',
            as: 'pathway'
        });
        Module.hasMany(models.Lesson, {
            foreignKey: 'module_id',
            as: 'lessons'
        });
    };

    return Module;
}; 