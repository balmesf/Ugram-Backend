import mongoose from 'mongoose';

let NotificationSchema  = new mongoose.Schema({
    userId: String,
    pictureOwner : String,
    pictureUrl : String,
    message: String,
    viewed : {type : Boolean, default: false},
    createdDate : {type : Date, default: Date.now}
});


let Notification = mongoose.model('Notification', NotificationSchema);

exports.schema = NotificationSchema;
exports.model = Notification;

//*** QUERY ***//
let getAllNotifications = () => { return  Notification.find({}) };

//*** METHODS ***//
exports.postNotification = (data, done) => {
    let notification = new Notification();
    let userId = data.userId;

    notification.userId = userId;
    notification.pictureOwner = data.pictureOwner,
    notification.pictureUrl = data.pictureUrl,
    notification.message = data.message;
    notification.viewed = false;
    notification.createdDate = Date.now();
    notification.save((err) => {
	if (err)
	    done (err);
	else
	    done(null, notification);
    });
}

/** NOTIFICATIONS **/
exports.getNotifications = (done) => {
    Notification.find({}, (err, doc) => {
	if (err)
	    return done(err);
	else
	    return done(null, {item : doc});
    });
}


exports.deleteNotifications = (done) => {
    Notification.remove({}, (err, result) => {
	if (err)
	    return done(err);
	else
	    return done(null, result);
    });
}
	    

/** NOTIFICATION **/
exports.setNotificationToviewed = (notification_id, done) => {
    Notification.findOneAndUpdate({ '_id' : notification_id}, {$set: { viewed : true }}, (err, doc) => {
	if (err)
	    done(err);
	else {
	    doc.viewed = true;
	    return done(null, {item : doc});
	}
    });
}

exports.getNotificationById = (notification_id, done) => {
    Notification.findOne({ '_id' : notification_id}, (err, doc) => {
	if (err)
	    return done(err);
	else
	    return done(null, {item : doc});
    });
}


exports.deleteNotificationById = (notification_id, done) => {
    Notification.findOne({ '_id' : notification_id}, (err, doc) => {
	if (err)
	    return done(err);
	else  {
	    doc.remove();
	    return done(null, doc);
	}
    });
}


/** USERS NOTIFICATIONS **/

exports.getNotificationsByUserId = (user_id, done) => {
    Notification.find({ "pictureOwner" : user_id}, (err, doc) => {
	if (err)
	    done (err);
	else
	    done(null, {item : doc.reverse()})
    });
}


exports.removeNotificationById = (user_id, done) => {
    Notification.remove({ "userId" : user_id}, (err, doc) => {
	if (err)
	    return (err);
	else
	    return done(null, {item : doc});
    });
}


//*** EXPORTS ***//

exports.getAllNotifications = getAllNotifications;
