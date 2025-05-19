module.exports = (sequelize, DataTypes) => {
    const Content = sequelize.define('Content', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        lesson_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'lessons',
                key: 'id'
            }
        },
        content_text: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        order_number: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        timestamps: true,
        underscored: true,
        tableName: 'contents'
    });

    Content.associate = (models) => {
        Content.belongsTo(models.Lesson, {
            foreignKey: 'lesson_id',
            as: 'lesson'
        });
    };

    return Content;
}; 