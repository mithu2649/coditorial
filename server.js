const express = require('express');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');

const methodOverride = require('method-override');
const Article = require('./models/article');

const app = express();
const articleRouter = require('./routes/articles.js');


require('dotenv').config();
const HOST = process.env.HOST;
const PORT = process.env.PORT || 3500;

// database connection

const dbURI = encodeURI(process.env.MONGO_LOCAL_URI);
mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})
    .then((result) => { 
        app.listen(PORT);
        console.log(`>> listening on: http://${HOST}:${PORT}`);
    })
    .catch((err) => console.log(err));


//view engine
app.set('view engine', 'ejs');

//middlewares
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));


//routes
app.get('*', checkUser);
app.use('/articles', articleRouter);
app.get('/', async (req, res) => {
    const articles = await Article.find().sort({
        createdAt: 'desc'
    });
    res.render('articles/index', { articles: articles });
    
});


app.use(authRoutes);
