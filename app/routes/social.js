import AuthMiddleware from '../middleware/authentication';
import SocialController from '../controllers/social_controller';

module.exports = (router, app) => {
    
    router.route('/users/:user_id/pictures/:picture_id/comment')
	.get(AuthMiddleware.isAuthenticated, SocialController.getComments)
	.post(AuthMiddleware.isAuthenticated, SocialController.postComment)
    
    router.route('/users/:user_id/pictures/:picture_id/comment/:comment_id')
	.put(AuthMiddleware.isAuthenticated, SocialController.updateComment)
	.delete(AuthMiddleware.isAuthenticated, SocialController.deleteComment);
    
    router.route('/users/:user_id/pictures/:picture_id/like')
	.get(AuthMiddleware.isAuthenticated, SocialController.getLikes)
	.post(AuthMiddleware.isAuthenticated, SocialController.postLike)
	.delete(AuthMiddleware.isAuthenticated, SocialController.deleteLike);

    app.use('/', router);
}
