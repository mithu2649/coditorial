const express = require('express');
const router = express.Router();
const Article = require('./../models/Article');

const authRoutes = require('./../routes/authRoutes');
const { requireAuth, checkUser } = require('./../middleware/authMiddleware');


router.get('*', checkUser);
router.use(authRoutes)


router.get('/new', requireAuth, (req, res)=>{
    res.render('articles/new', {article: new Article()});
});

//read full article...
router.get('/:slug', async (req, res) => {
    const article = await Article.findOne({slug: req.params.slug}).populate('author', '_id username name email');
    if(article == null) res.redirect('/');
    res.render('articles/show', {article: article});
});

router.get('/edit/:slug', requireAuth, async (req, res) => {
    const article = await Article.findOne({ slug: req.params.slug });
    res.render('articles/edit', {article: article});
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


function saveArticleAndRedirect(path){
    return async (req, res) => {
        let article = req.article;
            article.title       = req.body.title;
            article.description = req.body.description;
            article.markdown    = req.body.markdown;
            article.author      = req.body.author;
        try{
            article = await article.save();
            res.redirect(`/articles/${article.slug}`);
        } catch (e) {
            res.render(`articles/${path}`, {article: article});
        }
    }
}
module.exports  = router;

