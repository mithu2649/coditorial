const express = require('express');
const router = express.Router();
const Article = require('./../models/Article');

const authRoutes = require('./../routes/authRoutes');
const { requireAuth, checkUser } = require('./../middleware/authMiddleware');

router.get('*', checkUser);
router.use(authRoutes)


router.get('/new', requireAuth, (req, res) => {
    res.render('articles/new', { article: new Article() });
});

//read full article...
router.get('/:slug', async (req, res) => {

    // incase you want to render from views
    // const article = await Article.findOne({slug: req.params.slug}).populate('author', '_id username name email');
    // if(article == null) res.redirect('/');
    // res.json(article);
    // res.render('articles/show', {article: article});

    Article
        .findOne({ slug: req.params.slug })
        .sort({ createdAt: 'desc' })
        .populate('author', 'id email name username')
        .exec()
        .then(article => {
            res.status(200).json({
                    _id    : article.id,
                    title  : article.title,
                    slug   : article.slug,
                    date   : article.createdAt,
                    url    : `/articles/${article.slug}`,
                    
                    author : {
                        url   : `/users/${article.author.username}`,
                        info  : article.author
                    },

                    description     : article.description,
                    markdown        : article.markdown,
                    sanitized_html  : article.sanitizedHtml
            })
        }).catch(error => {
            console.error('error: ' + error.message);
        })
});

router.get('/edit/:slug', requireAuth, async (req, res) => {
    const article = await Article.findOne({ slug: req.params.slug });
    res.render('articles/edit', { article: article });
});


router.post('/', requireAuth, async (req, res, next) => {
    req.article = new Article();
    next();
}, saveArticleAndRedirect('new'));


router.put('/:id', requireAuth, async (req, res, next) => {
    req.article = await Article.findById(req.params.id);
    next();
}, saveArticleAndRedirect('edit'));


router.delete('/:id', requireAuth, async (req, res) => {
    await Article.findByIdAndDelete(req.params.id);
    res.redirect('/');
})


function saveArticleAndRedirect(path) {
    return async (req, res) => {
        let article = req.article;

        article.title       = req.body.title;
        article.description = req.body.description;
        article.markdown    = req.body.markdown;
        article.author      = req.body.author;

        try {
            article = await article.save();
            res.redirect(`/articles/${article.slug}`);
        } catch (e) {
            res.render(`articles/${path}`, { article: article });
        }
    }
}
module.exports = router;

