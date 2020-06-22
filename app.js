const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport')
const bodyParser = require('body-parser');
const helmet = require('helmet');
const hpp = require('hpp');
const { createProxyMiddleware } = require('http-proxy-middleware');
const redis = require('redis');
const RedisStore = require('connect-redis')(session);
require('dotenv').config({});
const cors = require('cors');
const corsOptions = {
    origin: true,
    credentials: true
};

const clientApp = path.join(__dirname + './build');

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
const shopRouter = require('./routes/shop');
const adminRouter = require('./routes/admin');
const analyticsRouter = require('./routes/analytics')

const {sequelize} = require('./models');
const passportConfig = require('./passport');

const app = express();
app.use(express.static(__dirname + 'index.html'));
sequelize.sync();
passportConfig(passport);

app.set('port', process.env["PORT"] || 8001);

/**배포 환경일 경우, 보다 많은 사용자 정보를 로그로 남김 */
if(process.env["NODE_ENV"] === 'production') { 
    app.use(morgan('combined'));
} else {
    app.use(morgan('dev'));
}

app.use(cors(corsOptions));
app.use(bodyParser.json({ type: 'application/json'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser('process.env["COOKIE_SECRET"]'));
// app.use(session({
//     resave: false,
//     saveUninitialized: false,
//     secret: 'process.env["COOKIE_SECRET"]',
//     cookie: {
//         httpOnly: true,
//         secure: false,
//     },
// }));

// const client = redis.createClient({
//     host: 'localhost',
//     port: 6379,
// });

const client = redis.createClient({
    host: process.env["REDIS_HOST"],
    port: process.env["REDIS_PORT"],
    password: process.env["REDIS_PASSWORD"],
    logErrors: true
});

// const sessionOption = {
//     resave: false,
//     saveUninitialized: false,
//     secret: process.env["COOKIE_SECRET"],
//     cookie: {
//         httpOnly: true,
//         secure: false,
//     },
//     store: new RedisStore({ client }),
// };

app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env["COOKIE_SECRET"],
    cookie: {
        httpOnly: true,
        secure: false,
    },
    store: new RedisStore({ client }),
}))


app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.set('views', path.join(__dirname, 'build'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'build')));

app.use('/api/page', pageRouter);
app.use('/api/auth', authRouter);
app.use('/api/post', postsRouter);
app.use('/api/user', usersRouter);
app.use('/api/closet', closetsRouter);
app.use('/api/like', likesRouter);
app.use('/api/comment', commentRouter);
app.use('/api/design', designRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/message', messageRouter);
app.use('/api/order', orderRouter);
app.use('/api/review', reviewRouter);
app.use('/api/shop', shopRouter);
app.use('/api/admin', adminRouter);
app.use('/api/', analyticsRouter);
app.use(
    '/images',
    createProxyMiddleware({
      target: 'https://swcap02.s3.ap-northeast-2.amazonaws.com',
      changeOrigin: true,
      pathRewrite: (path, req) => { return path.replace('/images', '/')}
    })
  );

app.use('/*', express.static('build'));


app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    console.error(err);
    res.status(404).send('Error');
});

app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development ? err : {}';
    //res.status(err.status || 500);
    //res.render('error');
    console.error(err);
    res.status(500).send('Error');
});

app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기 중');
});

