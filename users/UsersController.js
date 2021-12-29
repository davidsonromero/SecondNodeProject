const express = require('express')
const router = express.Router()
const Users = require('./Users')
const Category = require('../categories/Categories')
const bcyrpt = require('bcryptjs')
const adminAuth = require('../middlewares/adminAuth')

router.get('/admin/users/create/:error?', adminAuth, (req, res) => {
    let error = false
    let email = false
    req.params.error === 'error' ? error = true : error = false
    req.params.error === 'email' ? email = true : email = false
    res.render('admin/users/create', {
        error: error,
        email: email
    })
})

router.post("/users/save", adminAuth, (req, res) => {
    let email = req.body.email
    let password = req.body.password
    Users.findOne({where: { email: email }}).then( user =>{
        console.log(user)
        if(user === null || user === undefined){
            let salt = bcyrpt.genSaltSync(12)
            let passwordHash = bcyrpt.hashSync(password, salt)
            Users.create({
                email: email,
                password: passwordHash
            }).then(() => {
                res.redirect('/admin/users')
            }).catch((err) => {
                res.redirect('/admin/users/create/error')
            })
        } else {
            res.redirect('/admin/users/create/email')
        }
    })
})

router.get('/admin/users', adminAuth, (req, res) => {
    Users.findAll().then(users => {
        res.render('admin/users/index', { users: users })
    })
})

router.post('/users/delete', adminAuth, (req, res) => {
    let id = req.body.id
    Users.destroy({
        where: {
            id: id
        }
    })
    res.redirect('/admin/users')
})

router.get("/admin/users/edit/:id/:error?", adminAuth, (req, res) => {
    let error = false
    let email = false
    let id = req.params.id
    req.params.error === 'error' ? error = true : error = false
    req.params.error === 'email' ? email = true : email = false
    Users.findByPk(id).then(user => {
        res.render('admin/users/edit', {
            error: error,
            email: email,
            user: user
        })
    })
})

router.post("/users/edit", adminAuth, (req, res) => {
    let id = req.body.id
    let email = req.body.email
    let password = req.body.password
    if(password === "" && email === ""){
        res.redirect('/admin/users/edit/' + id + '/error')
    } else if (email === "") {
        let salt = bcyrpt.genSaltSync(12)
        let passwordHash = bcyrpt.hashSync(password, salt)
        Users.update({
            password: passwordHash
        }, {
            where: {
                id: id
            }
        }).then(() => {
            res.redirect('/admin/users')
        }).catch((err) => {
            res.redirect('/admin/users/edit/' + id + '/error')
        })
    } else if (password === "") {
        Users.findOne({where: { email: email }}).then( user =>{
            if(user === null || user === undefined){
                Users.update({
                    email: email
                }, {
                    where: {
                        id: id
                    }
                }).then(() => {
                    res.redirect('/admin/users')
                }).catch((err) => {
                    res.redirect('/admin/users/edit/' + id + '/error')
                })
            } else {
                res.redirect('/admin/users/edit/' + id + '/email')
            }
        })
            
    } else {
        let salt = bcyrpt.genSaltSync(12)
        let passwordHash = bcyrpt.hashSync(password, salt)
        Users.findOne({where: { email: email }}).then( user =>{
            if(user === null || user === undefined){
                Users.update({
                    email: email,
                    password: passwordHash
                }, {
                    where: {
                        id: id
                    }
                }).then(() => {
                    res.redirect('/admin/users')
                }).catch((err) => {
                    res.redirect('/admin/users/edit/' + id + '/error')
                })
            } else {
                res.redirect('/admin/users/edit/' + id + '/email')
            }
        })
    }
})

router.get("/login/:error?", (req, res) => {
    let error = false
    let password = false
    let admin = false
    req.params.error === 'error' ? error = true : error = false
    req.params.error === 'password' ? password = true : password = false
    req.params.error === 'notAdmin' ? admin = true : admin = false
    Category.findAll().then(categories => {
        res.render('admin/users/login', {
            error: error,
            password: password,
            categories: categories,
            admin: admin
        })
    })
})

router.post("/users/login", (req, res) => {
    let email = req.body.email
    let password = req.body.password
    Users.findOne({where: { email: email }}).then(user => {
        if(user === null || user === undefined){
            res.redirect('/login/password')
        } else {
            if(bcyrpt.compareSync(password, user.password)){
                req.session.user = {
                    id: user.id,
                    email: user.email
                }
                res.redirect('/admin/articles')
            } else {
                res.redirect('/login/password')
            }
        }
    }).catch(() => {
        res.redirect('/login/error')
    })
})

router.get("/users/logout", adminAuth, (req, res) => {
    req.session.user = undefined
    res.redirect('/')
})

module.exports = router