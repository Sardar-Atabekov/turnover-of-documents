const { Router } = require('express');
const FileController = require('../controllers/file-controller');
const verifyToken = require('../middlewares/verify-token');

const router = Router();

module.exports = router.post('/upload', verifyToken, FileController.uploadFile);
module.exports = router.get('/get-file/:id', verifyToken, FileController.getFilesOfUser);
module.exports = router.patch('/update-file/:id', verifyToken, FileController.updateFileOfUser);
module.exports = router.get('/get-all-files/:editOrRead/:id', FileController.getAllowDocumentsToMe);
module.exports = router.get('/download/:createdBy/:userId/:src', FileController.getOneFile);
module.exports = router.get('/get-my-files/:id', verifyToken, FileController.getMyFiles);