module.exports = (sequelize, DataTypes) => {
    const Certificate = sequelize.define('Certificate', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        issue_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        certificate_url: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        certificate_number: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        }
    }, {
        timestamps: true,
        underscored: true
    });

    return Certificate;
}; 