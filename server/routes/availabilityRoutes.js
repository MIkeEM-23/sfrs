const router = require('express').Router();
const c = require('../controllers/availabilityController');
const protect = require('../middleware/authMiddleware');

router.use(protect);
router.get('/all', c.all);  // GET /api/availability/all?date=2026-10-15
router.get('/', c.one);     // GET /api/availability?facility=Gymnasium&date=2026-10-15
module.exports = router;
