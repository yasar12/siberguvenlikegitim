module.exports = (sequelize, DataTypes) => {
    const Lesson = sequelize.define('Lesson', {
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
        video_url: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        duration_minutes: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        order_number: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        timestamps: true,
        underscored: true,
        tableName: 'lessons'
    });

    Lesson.associate = (models) => {
        Lesson.belongsTo(models.Module, {
            foreignKey: 'module_id',
            as: 'module'
        });

        Lesson.hasMany(models.Content, {
            foreignKey: 'lesson_id',
            as: 'contents'
        });
    };

    return Lesson;
}; 