import AuthMiddleware from '../middleware/authentication';
import PictureController from '../controllers/picture_controller';
import upload from '../utils/image_processing';

module.exports = (router, app) => {

    router.route('/pictures')
        .get(AuthMiddleware.isAuthenticated, PictureController.allPictures);

    router.route('/users/:user_id/pictures')
        .get(AuthMiddleware.isAuthenticated, PictureController.allPicturesByUserId)
        .post(upload.upload.single('file'), PictureController.addPost);
 
    router.route('/users/:user_id/pictures/:picture_id')
        .get(AuthMiddleware.isAuthenticated, PictureController.findPictureById)
        .delete(AuthMiddleware.isAuthenticated, PictureController.deletePost)
        .put(AuthMiddleware.isAuthenticated, PictureController.updatePost);

    app.use('/', router);
}
