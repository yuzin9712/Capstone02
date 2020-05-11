const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport')
const bodyParser = require('body-parser');
const cors = require('cors');
const corsOptions = {
    origin: true,
    credentials: true
};
require('dotenv').config();

const pageRouter = require('./routes/page');
const authRouter = require('./routes/auth');
const postsRouter = require('./routes/post');
const usersRouter = require('./routes/user');
const closetsRouter = require('./routes/closet');
const likesRouter = require('./routes/like');
const commentRouter = require('./routes/comment');
const designRouter = require('./routes/design');
const productRouter = require('./routes/product');
const cartRouter = require('./routes/cart');
const messageRouter = require('./routes/message');
const orderRouter = require('./routes/order');
const reviewRouter = require('./routes/review');

const {sequelize} = require('./models');
const passportConfig = require('./passport');

const app = express();
sequelize.sync();
passportConfig(passport);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('port', process.env.PORT || 8001);

app.use(cors(corsOptions));
app.use(bodyParser.json({ type: 'application/json'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser('process.env.COOKIE_SECRET'));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'process.env.COOKIE_SECRET',
    cookie: {
        httpOnly: true,
        secure: false,
    },
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// app.all('/*', function(req, res, next) {
//     // res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "X-Requested-With");
//     next();
// });

// app.all('/*', function (req, res, next) {
//     res.header('Access-Control-Allow-Credentials', true);
//     res.header('Access-Control-Allow-Origin', req.headers.origin);
//     res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//     res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
//     if ('OPTIONS' == req.method) {
//          res.send(200);
//      } else {
//          next();
//      }
// })

// app.use(function (req, res, next) {
//     res.setHeader('Access-Control-Allow-Credentials', true);
//     res.setHeader('Access-Control-Allow-Origin', 'http://172.16.101.72:8080');
//     res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
//     if ('OPTIONS' == req.method) {
//        res.send(200);
//      } else {
//        next();
//      }
// });

app.use('/page', pageRouter); //바꿔라~
app.use('/auth', authRouter);
app.use('/post', postsRouter);
app.use('/user', usersRouter);
app.use('/closet', closetsRouter);
app.use('/like', likesRouter);
app.use('/comment', commentRouter);
app.use('/design', designRouter);
app.use('/product', productRouter);
app.use('/cart', cartRouter);
app.use('/message', messageRouter);
app.use('/order', orderRouter);
app.use('/review', reviewRouter);

app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development ? err : {}';
    res.status(err.status || 500);
    res.render('error');
});

app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기 중');
});

