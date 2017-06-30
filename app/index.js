/** 
** InstaShab Server
**/

import express from'express';
import expressSession from'express-session';
import mongoose from'mongoose';
import bodyParser from'body-parser';
import helmet from'helmet';
import cors from'cors';
import passport from'passport';
import dotenv from'dotenv';
import path from'path';

dotenv.load();

import notificationService from"./services/socket/socket_service";
import cloudWatchLogs from'./services/logger/logger_messages';
import s3Service from'./services/s3_uploader/init_AWS';

let app = express();
let port = process.env.PORT || 8081;
let router = express.Router();

/*** CONFIG ***/

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URL)
    .then(() => {
	cloudWatchLogs.LogSuccessfullConnectionToDb();
    }).catch((err) => {
	cloudWatchLogs.LogMongoErrorConnection(err);
	process.exit();
    });


const corsOptions = {
    origin: 'http://team12.ugram.net',
    methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'UPDATE'],
    credentials: true
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname , './front-end')));
app.use(cors(corsOptions));
app.use(helmet());

notificationService.initNotificationService(app);
s3Service.initAWS();

/*** AUTH CONFIG ***/
app.use(passport.initialize());
require('./middleware/passport')(passport);

//*** AUTH ***//
require('./routes/authentication')(router, passport);

//*** API  ***//
require('./routes/notification')(router, app);
require('./routes/newsfeed')(router, app);
require('./routes/picture')(router, app);
require('./routes/search')(router, app);
require('./routes/social')(router, app);
require('./routes/user')(router, app);

//*** RUN  ***//
app.listen(port, () => {
    console.log('Server running on port : ' + port);
});

module.exports = app; 
