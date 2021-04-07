const express = require('express');
const router = express.Router();
const User = require('./../models/User');
const Article = require('./../models/Article');

const authRoutes = require('./../routes/authRoutes');
const { requireAuth, checkUser } = require('./../middleware/authMiddleware');

router.get('*', checkUser);
router.use(authRoutes)

router.get('/:username', (req, res) => {
    User.findOne({ username: req.params.username })
        .select('_id username name email')
        .exec()
        .then(user => {
            if (user == null) res.status(404).json({error: 'no such user'});
            res.status(200).json(user);
        })
        .catch(err => {
            console.log(err);
        })
});

router.get('/:username/articles', async (req, res) => {

    const user = await User.findOne({ username: req.params.username });
    if (!user) res.status(404).json({ error: 'No such user' })

    const articles = await Article.find({ author: user._id })
        .sort({ createdAt: 'desc' })
        .populate('author', 'id email name username');

    if (!articles) res.status(204).json({ error: 'No articles' });

    res.status(200).json(articles);
});

router.get('/:username/articles/:slug', async (req, res) => {
    res.redirect(`/articles/${req.params.slug}`);
});

module.exports = router;