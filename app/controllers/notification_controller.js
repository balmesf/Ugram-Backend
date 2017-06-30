import HttpStatus from 'http-status-codes';
import NotificationModel from '../models/notification';
import logger from '../services/logger/logger';
import cloudWatchLogs from '../services/logger/logger_messages';

const TYPE = 'notification';

// NOTIFICATIONS
exports.getNotifications = (req, res) => {
    NotificationModel.getNotifications((err, doc) => {
	if (err) {
	    cloudWatchLogs.LogMongoError(err);
	    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({message: err});
	}
	else  {
	    cloudWatchLogs.LogSuccessfullGet(TYPE);
	    res.status(HttpStatus.OK).send(doc);
	}
    });
}


exports.deleteNotifications = (req, res) => {
    NotificationModel.deleteNotifications((err, result) => {
	if (err) {
            cloudWatchLogs.LogMongoError(err);
	    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({message: err});
	}
	else  {
            cloudWatchLogs.LogSuccessfullDelete(TYPE);
	    res.status(HttpStatus.ACCEPTED).send(result);
	}
    });
}

// NOTIFICATION BY ID
exports.setNotificationToViewed = (req, res) => {
    NotificationModel.setNotificationToviewed(req.params.notification_id, (err, doc) => {
	if (err) {
            cloudWatchLogs.LogMongoError(err);
	    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({message: err});
	}
	else {
	    cloudWatchLogs.LogSuccessfullUpdate(TYPE);
	    res.status(HttpStatus.OK).send(doc);
	}
    });
}

exports.getNotificationById = (req, res) => {
    NotificationModel.getNotificationById(req.params.notification_id, (err, doc) => {
	if (err) {
	    cloudWatchLogs.LogMongoError(err);
	    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({message: err});
	}
	else  {
            cloudWatchLogs.LogSuccessfullGet(TYPE);
	    res.status(HttpStatus.OK).send(doc);
	}
     });
}


exports.deleteNotificationById = (req, res) => {
    NotificationModel.deleteNotificationById(req.params.notification_id, (err, doc) => {
	if (err) {
	    cloudWatchLogs.LogMongoError(err);
	    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({message: err});
	}
	else  {
            cloudWatchLogs.LogSuccessfullDelete(TYPE);
	    res.status(HttpStatus.ACCEPTED).send(doc);
	}
    });
}

// NOTIFICATIONS BY USERID
exports.getNotificationsByUserId = (req, res) => {
    NotificationModel.removeNotificationById (req.params.user_id, (err, doc) => {
	if (err) {
            cloudWatchLogs.LogMongoError(err);
	    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({message: err});
	}
	else  {
            cloudWatchLogs.LogSuccessfullGet(TYPE);
	    res.status(HttpStatus.OK).send({item : doc.reverse()});
	}
    });
}

exports.deleteNotificationsByUserId = (req, res) => {
    NotificationModel.removeNotificationById (req.params.user_id, (err, doc) => {
	if (err) {
	    cloudWatchLogs.LogMongoError(err);
	    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({message: err});
	}
	else  {
            cloudWatchLogs.LogSuccessfullDelete(TYPE);
	    res.status(HttpStatus.ACCEPTED).send({item : doc});
	}
    });
}
