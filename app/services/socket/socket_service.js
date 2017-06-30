import socketIO from 'socket.io';
import notificationLogic from'../../models/notification';
import cloudWatchLogs from '../logger/logger_messages';

let IOPort = process.env.IO_PORT || 8082;

exports.initNotificationService = (app) => {
    let server = app.listen(IOPort);
    let socket = socketIO.listen(server);

    global.Clients = [];
    global.IO = socket;

    socket.on('connection', (client) => {

	client.on('newUser', (data) => {
	    Clients.push({id : client.id, userId : data.userId});
	    cloudWatchLogs.LogNewClient(data.userId);
	});

	client.on('disconnect', () => {
	    for (var c in Clients) {
		if (Clients[c].id === client.id)
		    Clients.splice(c, 1);
	    }
	});
	
    });
}

exports.sendNotification = (data, cb) => {
    let socket = global.IO;

    notificationLogic.postNotification(data, (err, res) => {
    	if (err) {
    	    cloudWatchLogs.LogMongoError(err);
    	    return cb(err);
    	}
    	else {
    	    global.Clients.map((entry) => {
    		if (entry.userId === data.pictureOwner) {
    		    socket.sockets.connected[entry.id].emit('notification', {_id : res._id, userId : data.userId, type : data.type, pictureOwner : data.pictureOwner , pictureUrl : data.pictureUrl, message : data.message });
    		    cloudWatchLogs.LogNotificationSent(data.pictureOwner);
    	 	    return cb(null, res);
    		}
    	    });
    	    return cb(null, res);
    	}
    });
}
