const express = require('express')
const app = express()
const session = require('express-session')
//const bodyParser = require('body-parser') --> Deprecated
const connection = require('./database/database')
const Article = require('./articles/Articles.js')
const Category = require('./categories/Categories.js')
const Users = require('./users/Users')
const adminAuth = require('./middlewares/adminAuth')

//Sessions
app.use(session({ secret: 'rgregtrgtruytuth', resave: false, saveUninitialized: true, cookie: { maxAge: 60000 * 60 * 24 * 2 } }))

//EJS
app.set('view engine', 'ejs')


//BodyParser
/*app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
--Deprecated--
*/

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

//Static Files
app.use(express.static('public'))

//Database
connection.authenticate().then(() => {
    console.log('Connected to the database!')
}).catch((error) => {
    console.log("Error: ", error)
})

//Routes
app.get('/', (req, res) => {
    Article.findAll({
        order:[['createdAt', 'DESC']],
        limit: 3
    }).then(article => {
        Category.findAll({
        }).then(
            categories => {
                res.render('index', { article: article, categories: categories })
            }
        )
    })
})

app.get("/article/:slug", (req, res) => {
    var slug = req.params.slug
    Article.findOne({
        where: {
            slug: slug
        },
        include: [{
            model: Category
        }]
    }).then(article => {
        if (article != undefined) {
            Category.findAll().then(categories => {
                res.render('article', { article: article, categories: categories })
            })
        } else {
            res.redirect('/')
        }
    }).catch(error => {
        res.redirect('/')
        console.log(error)
    }
    )
})

app.get('/category/:slug', (req, res) => {
    var slug = req.params.slug
    Category.findOne({
        where: {
            slug: slug
        }
    }).then(category => {
        if (category != undefined) {
            Article.findAll({
                where: {
                    categoryId: category.id
                },
                order:[['title', 'ASC']]
            }).then(article => {
                Category.findAll().then(categories => {
                    res.render('category', { article: article, category: category, categories: categories })
                })
            })
        } else {
            res.redirect('/')
        }
    }).catch(error => {
        res.redirect('/')
        console.log(error)
    })
})

//External Routes
const categoriesController = require('./categories/CategoriesController')
app.use('/', categoriesController)

const articlesController = require('./articles/ArticlesController')
app.use('/', articlesController)

const usersController = require('./users/UsersController')
app.use('/', usersController)

//Port
app.listen(80, () => {
    console.log('Server running on port 80')
})