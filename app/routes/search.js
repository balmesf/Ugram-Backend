import AuthMiddleware from '../middleware/authentication';
import SearchController from '../controllers/search_controller';

module.exports = (router, app) => {

    router.route('/search/pictures/:key')
    .get(AuthMiddleware.isAuthenticated, SearchController.searchByKeyword);

    router.route('/search/tag/:tag')
	.get(AuthMiddleware.isAuthenticated, SearchController.searchByTag);
    
    router.route('/search/users/:users')
	.get(AuthMiddleware.isAuthenticated, SearchController.searchByUserId);

    app.use('/', router);
}
