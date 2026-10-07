const router = require('express').Router();
const c = require('../controllers/reservationController');
const protect = require('../middleware/authMiddleware');

router.use(protect);
router.post('/', c.create);
router.get('/my', c.mine); // must be before '/:id'
router.get('/:id', c.getOne);
router.put('/:id', c.update);
router.delete('/:id', c.cancel);
module.exports = router;
