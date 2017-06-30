import AuthMiddleware from '../middleware/authentication';
import UserController from '../controllers/user_controller';
import upload from '../utils/image_processing';

module.exports = (router, app) => {
    
    router.route('/users')
	.get(AuthMiddleware.isAuthenticated, UserController.allUsers);

    router.route('/users/upload_avatar')
    	.post(upload.upload.single('file'), UserController.uploadAvatar);

    router.route('/users/:user_id')
	.put(AuthMiddleware.isAuthenticated, UserController.updateUser)
	.get(AuthMiddleware.isAuthenticated, UserController.findUserByUserId);

    app.use('/', router);
}
