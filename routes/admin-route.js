const {Router} = require('express');
const AdminController = require('../controllers/admin-controller');
const verifyToken = require('../middlewares/verify-token');

const router = Router();

module.exports = router.post('/login',AdminController.AdminLogin);
module.exports = router.post('/create-user',verifyToken,AdminController.createAdmin);
module.exports = router.get('/get-all-users',verifyToken,AdminController.getAllAdmins);
module.exports = router.patch('/update-user',verifyToken,AdminController.updateAdmin);
module.exports = router.delete('/delete-user',verifyToken,AdminController.deleteAdmin);