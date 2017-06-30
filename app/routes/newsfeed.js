import AuthMiddleware from '../middleware/authentication';
import NewsfeedController from '../controllers/newsfeed_controller';

module.exports = (router, app) => {
    
    router.route('/newsfeed/hashtags/top')
	.get(AuthMiddleware.isAuthenticated, NewsfeedController.getTopHashTags);
    
    router.route('/newsfeed/popular_users')
	.get(AuthMiddleware.isAuthenticated, NewsfeedController.getPopularUsersAccounts);
    
    router.route('/newsfeed/recommended_accounts')
	.get(AuthMiddleware.isAuthenticated, NewsfeedController.getRecommandedUsersAccounts);
    
    app.use('/', router);
}
