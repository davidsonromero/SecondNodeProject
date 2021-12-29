const Sequelize = require('sequelize')
const connection = new Sequelize('blog_press', 'davi', '123456', {
    host: 'localhost',
    dialect: 'mysql',
    timezone: '-03:00'
})

module.exports = connection