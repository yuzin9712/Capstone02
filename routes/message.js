const express = require('express');

const { isLoggedIn } = require('./middlewares');
const { Room, ChatLine, User } = require('../models');
const db = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

/**쪽지함 메인화면 - 정렬 안됨..*/
router.get('/', async (req, res, next) => {
    try {
        await Room.findAll({
            include: {
                model: ChatLine,
                // limit: 1, 하나만 보내지 말라고 ..?
                attributes: ['id','lines','createdAt'],
                include: {
                    model: User,
                    attributes: ['id', 'name']
                },
                order: [['createdAt', 'DESC']],
            },
            order: [[ChatLine, 'createdAt', 'DESC']], //메세지 온 거 최신순
            where: { 
                [Op.or]: [
                    { user1Id: 12 },
                    { user2Id: 12 }
                ]
             },
        })
        .then((rooms) => {
            res.send(rooms);
        })

    } catch (err) {
        console.error(err);
        res.status(403).send('Error');
    }
});

/**쪽지 보내기 - 보내고자 하는 상대의 아이디 값이 파라미터로 옴 */
router.post('/:id', async (req, res, next) => {

    console.log('----시작----');
    const newLine = req.body.line; //쪽지내용

    console.log('이거내용??',req.body.line)

    try {
        const [ room, created ] = await Room.findOrCreate({
            where: { 
                [Op.or]: [
                    { user1Id: 12, user2Id: parseInt(req.params.id, 10) },
                    { user1Id: parseInt(req.params.id, 10), user2Id: 12 }
                ]
             },
             defaults: {
                 user1Id: 12,
                 user2Id: parseInt(req.params.id, 10)
             }
        });

        // console.log('이게뭐야', room.id, room.user1Id, room.user2Id);

        await ChatLine.create({
            lines: newLine,
            userId: 12,
            roomId: room.id
        });

        res.send('쪽지보내기 성공!');
    } catch (err) {
        console.error(err);
        res.status(403).send('Error');
    }
});

// router.get('/:id', async (req, res, next) => {
//     try {
//         const room = Room.findOne({
//             where: { id: parseInt(req.params.id, 10)}
//         });

//         room.destroy({});
//     } catch (err) {
//         console.error(err);
//         res.status(403).send('Error');
//     }
// })

/**특정 대화방에 들어감 - 방 아이디값이 파라미터로 온다. */
// router.get('/:id', async (req, res, next) => {
//     try {
//         const room = await Room.findOne({
//             where: { id: parseInt(req.params.id, 10)}
//         });

//         if(room == undefined) {
//             res.send('없는 대화방입니다!!');
//         } else {
//             await ChatLine.findAll({
//                 include: [{
//                     model: User,
//                     attributes: ['id', 'name']
//                 }],
//                 where: { roomId: room.id },
//                 order: [['createdAt', 'DESC']],
//             })
//             .then((chatlines) => {
//                 res.send(chatlines);
//             })
//             .catch((err) => {
//                 console.error(err);
//                 next(err);
//             })
//         }
//     } catch (err) {
//         console.error(err);
//         next(err);
//     }
// })

module.exports = router;