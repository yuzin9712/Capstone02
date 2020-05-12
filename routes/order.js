const express = require('express');

const { isLoggedIn } = require('./middlewares');
const { Order, OrderDetail, Delivery, Product } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

//배송정보, 주문자정보 등록(????) / 주문 등록/ 주문내역조회

/**주문, 배송지정보 등록하기 */
router.post('/', isLoggedIn, async (req, res, next) => {
    //원래는 받아온 아이디값으로 아임포트에서 결제내역 조회 후 데이터를 order 테이블에 넣는다!!!!
    //1. order 테이블에 넣고 2. orderdetail에 넣음
    //어떤 정보를 줄 것인지 .. 제품아이디값-number, 사이즈, 색깔, 수량-number, 가격??이 담긴 객체 배열!!!
    //사이즈, 색깔 이렇게 줄것인지 아니면 productinfo 아이디 값으로 줄 것인지??
    //재고도 삭제....!!!!
    try {
        console.log(typeof req.body.products[0].id);

        const orderProducts = req.body.products;
        const deliveryInfo = req.body.delivery;
        
        console.log('주문한제품은????', orderProducts);
        var total = orderProducts.map(r=>r.price);
        console.log('합은?',total.reduce((a,b) => a + b));
        
        /**가격이 들어온다는 가정하에.. */
        const newOrder = await Order.create({
            total: total.reduce((a,b) => a + b),
            userId: 2
        });

        console.log(newOrder.id);
        
    
        await Promise.all(orderProducts.map(order => OrderDetail.create({
            price: order.price,
            cnt: order.cnt,
            size: order.size,
            color: order.color,
            orderId: newOrder.id,
            productId: order.id
        })));

        await Delivery.create({
            email: deliveryInfo.email,
            name: deliveryInfo.name,
            phone: deliveryInfo.phone,
            addr1: deliveryInfo.addr1,
            addr2: deliveryInfo.addr2,
            zipCode: deliveryInfo.zipCode,
            message: deliveryInfo.message,
            orderId: newOrder.id
        });
    
        res.send('success');
    
    } catch (err) {
        console.error(err);
        next(err);
    }

});

/**사용자별 주문정보 전체 조회 */
router.get('/', isLoggedIn, async (req, res, next) => {
    try {
        await Order.findAll({
            include: [{
                model: OrderDetail,
                include: [{
                    model: Product,
                    attributes: ['img', 'pname', 'price']
                }]
            }],
            where: { userId: 2 }
        })
        .then((orders) => {
            res.send(orders);
        })
        .catch((err) => {
            console.error(err);
            next(err);
        })
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;