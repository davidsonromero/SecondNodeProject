const express = require('express')
const router = express.Router()
const Category = require('./Categories')
const slugify = require('slugify')
const adminAuth = require('../middlewares/adminAuth')

router.get('/admin/categories/new/:error?', adminAuth, (req, res) => {
    if (req.params.error === "error") {
        res.render('admin/categories/new', {
            error: true
        })
    } else {
        res.render('admin/categories/new', {
            error: false
        })
    }
})

router.post("/categories/save", adminAuth, (req, res) => {
    let title = req.body.title
    if (title != undefined && title != "") {
        Category.create({
            title: title,
            slug: slugify(title).toLowerCase()
        }).then(() => {
            res.redirect("/admin/categories")
        }).catch((err) => {
            console.log(err)
            res.redirect("/admin/categories/new/error")
        })
    } else {
        res.redirect("/admin/categories/new/error")
    }
})

router.get("/admin/categories", adminAuth, (req, res)=>{
    Category.findAll().then((categories)=>{
        res.render("admin/categories/index", {
            categories: categories
        })
    })
})

router.post("/categories/delete", adminAuth, (req, res) => {
    let id = parseInt(req.body.id)
    if (id != undefined && id != isNaN) {
        Category.destroy({
            where: {
                id: id
            }
        }).then(() => {
            res.redirect("/admin/categories")
        })
    } else {
        res.redirect("/admin/categories")
    }
})

router.get("/admin/categories/edit/:id/:error?", adminAuth, (req, res) => {
    let id = (req.params.id)
    if(req.params.error === "error" && id != undefined && id != isNaN){
        Category.findByPk(id).then((category)=>{
            res.render("admin/categories/edit", {
                category: category,
                error: true
            })
        })
    } else if (id != undefined && id != isNaN) {
        Category.findByPk(id).then((category) => {
            res.render("admin/categories/edit", {
                category: category,
                error: false
            })
        })
    } else {
        res.redirect("/admin/categories")
    }
    
})

router.post("/categories/update", adminAuth, (req, res) => {  
    let title = req.body.title
    let id = req.body.id
    Category.update({
        title: title,
        slug: slugify(title).toLowerCase()
    }, {
        where: {
            id: id
        }
    }).then(() => {
        res.redirect("/admin/categories")
    }).catch((err) => {
        console.log(err)
        res.redirect("/admin/categories/edit/" + req.body.id + "/error")
    })
})
module.exports = router