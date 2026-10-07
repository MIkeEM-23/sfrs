const router = require('express').Router();
const c = require('../controllers/adminController');
const protect = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

router.use(protect, admin);
router.get('/reservations', c.list);
router.put('/reservations/:id/approve', c.approve);
router.put('/reservations/:id/reject', c.reject);
router.put('/reservations/:id/cancel', c.cancel);
module.exports = router;
