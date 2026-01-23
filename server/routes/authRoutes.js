const express = require('express');
const router = express.Router();
const { register, login, getMe, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authValidation, rateLimitValidation } = require('../middleware/validationMiddleware');

router.post('/register', authValidation.register, rateLimitValidation, register);
router.post('/login', authValidation.login, rateLimitValidation, login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
