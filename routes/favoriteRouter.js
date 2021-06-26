const express = require('express');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorites');

const favoriteRouter = express.Router();

favoriteRouter.use(express.json());
favoriteRouter.use(express.urlencoded({ extended: true }));

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorites) => {
            res.StatusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorites);
        
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if (!favorites) {
            Favorites.create({user: req.user._id, dishes: new Array(0)});
        }
        for (let i = 0; i < req.body.length; i++) {
            if (favorites.dishes.indexOf(req.body[i]._id) < 0) { 
                favorites.dishes.unshift(req.body[i]._id);
            }
        }
        favorites.save();
        res.StatusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);

    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndRemove({user: req.user._id})
    .then((resp) => {
        res.StatusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites' + req.params.dishId);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        console.log(favorites)
        if (!favorites) {
            Favorites.create({user: req.user._id, dishes: new Array(0)});
        }
        if (favorites.dishes.indexOf(req.params.dishId) < 0) { 
            favorites.dishes.unshift(req.params.dishId);
            favorites.save();
            res.StatusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorites);
        }
        else {
            res.StatusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({"message": "already on favorites"});
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/' + req.params.dishId);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if (favorites.dishes.indexOf(req.params.dishId) > -1) {
            favorites.dishes.splice(favorites.dishes.indexOf(req.params.dishId), 1);
            favorites.save();
            res.StatusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorites);
        }
        else {
            var err = new Error('You are trying to delete a dish that are not a favorite!');
            err.status = 403;
            next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = favoriteRouter;
