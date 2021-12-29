const express = require('express')
const router = express.Router()
const Category = require('../categories/Categories')
const Article = require('./Articles')
const slugify = require('slugify')
const adminAuth = require('../middlewares/adminAuth')

router.get('/admin/articles', adminAuth, (req, res) => {
    Article.findAll({
        include: [{
            model: Category
        }]
    }).then(articles => {
        res.render('admin/articles/index', { articles: articles })
    })
})

router.get('/admin/articles/new/:error?', adminAuth, (req, res) => {
    Category.findAll().then(categories => {
        let error
        req.params.error === "error" ? error = true : error = false
        res.render('admin/articles/new', {
            error: error,
            categories: categories
        })
    })
})

router.post("/articles/save", adminAuth, (req, res) => {
    let title = req.body.title
    let article = req.body.article
    let category = req.body.category
    if(category === 0){
        res.redirect("/admin/articles/new/error")
    } else if (title === "" || article === "") {
        res.redirect("/admin/articles/new/error")
    } else {
        Article.create({
            title: title,
            slug: slugify(title).toLowerCase(),
            body: article,
            categoryId: category
        }).then(() => {
            res.redirect("/admin/articles/")
        }).catch(err => {
            console.log(err)
            res.redirect("/admin/articles/new/error")
        })
    }
})

router.post("/articles/delete", adminAuth, (req, res) => {
    let id = parseInt(req.body.id)
    if (id != undefined && id != isNaN) {
        Article.destroy({
            where: {
                id: id
            }
        }).then(() => {
            res.redirect("/admin/articles")
        })
    } else {
        res.redirect("/admin/articles")
    }
})

router.get("/admin/articles/edit/:id/:error?", adminAuth, (req, res) => {
    let error
    req.params.error === "error" ? error = true : error = false
    let id = req.params.id
    if (id != undefined && id != isNaN) {
        Article.findByPk(id, {
            include: [{
                model: Category
            }]
        }).then(article => {
            Category.findAll().then(categories => {
                res.render("admin/articles/edit", {
                    article: article,
                    categories: categories,
                    error: error
                })
            })
        })
    } else {
        res.redirect("/admin/articles")
    }
})

router.post("/articles/update", adminAuth, (req, res) => {
    var id = parseInt(req.body.id)
    var title = req.body.title
    var article = req.body.article
    if(title !== "" || article !== ""){
        if (id != undefined && id != isNaN) {
            Article.update({
                title: title,
                slug: slugify(title).toLowerCase(),
                body: article,
            }, {
                where: {
                    id: id
                }
            }).then(() => {
                res.redirect("/admin/articles")
            })
        } else {
            res.redirect("/admin/articles/edit/" + id + "/error")
        }
    } else {
        res.redirect("/admin/articles/edit/" + id + "/error")
    }
})

router.get("/articles/page/:num", (req, res) => {
    var page = parseInt(req.params.num)
    var offset
    page === isNaN || page === 1 ? offset = 0 : offset = (page - 1) * 5
    Article.findAndCountAll({
        order: [['createdAt', 'DESC']],
        limit: 5,
        offset: offset
    }).then(articles => {
        var result={
            articles : articles,
            next: offset + 5 < articles.count ? true : false,
            previous: offset === 0 ? false : true,
            page: page
        }
        Category.findAll().then(categories => {
            res.render("admin/articles/page", {
                result: result,
                categories: categories
            })
        })

    })
})

module.exports = router