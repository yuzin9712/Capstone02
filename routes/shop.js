const express = require('express');
const db = require('../models');

const { isLoggedIn } = require('./middlewares');
const { ShopAdmin, Product, ProductInfo } = require('../models');

const router = express.Router();

// router.get('/', async (req, res, next) => {

//     try {
//         const shop = await ShopAdmin.findOne({
//             where: { userId: 2 }
//         });

//         if(shop) {
           
//         } else {
//             throw(err);
//         }

//     } catch (err) {
//         console.error(err);
//         next(err);
//     }
    

// });

module.exports = router;