import AuthMiddleware from '../middleware/authentication';
import NotificationController from '../controllers/notification_controller';

module.exports = (router, app) => {

    router.route('/notifications')
	.get(AuthMiddleware.isAuthenticated, NotificationController.getNotifications)
        .delete(AuthMiddleware.isAuthenticated, NotificationController.deleteNotifications);
    
    router.route('/notification/:notification_id')
	.get(AuthMiddleware.isAuthenticated, NotificationController.getNotificationById)
	.put(AuthMiddleware.isAuthenticated, NotificationController.setNotificationToViewed)
        .delete(AuthMiddleware.isAuthenticated, NotificationController.deleteNotificationById)

    router.route('/notifications/:user_id')
        .get(AuthMiddleware.isAuthenticated, NotificationController.getNotificationsByUserId)
        .delete(AuthMiddleware.isAuthenticated, NotificationController.deleteNotificationsByUserId)
    
    app.use('/', router);
}
