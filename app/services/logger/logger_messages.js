import logger from './logger';

exports.LogSuccessfullConnectionToDb = () => {
    return logger.log('info', '[STARTUP] Connected to Database ', { tags : 'startup, mongo'});
}

exports.LogSuccessfullAuth = (type) => {
    return logger.log('info', '[AUTHENTICATION] Successfull connexion to ' + type + '.', { tags : 'authentication, successfull'});
}

exports.LogNewClient = (user) => {
    return logger.log('info', '[SOCKET] Successfull connexion of the user : [' + user + '].', { tags : 'connexion, socket.io, successfull'});
}

exports.LogSuccessfullS3Upload = (user) => {
    return logger.log('info', '[S3_UPLOAD] Successfull upload to s3 from user : [' + user + '].', { tags : 'upload, S3, successfull'});
}

exports.LogErrorS3Upload = (err) => {
    return logger.log('error', '[S3_UPLOAD] Error uploading picture on S3 : [' + err + '].', { tags : 'upload, S3, error'});
}

exports.LogStackSuccess = (err) => {
    return logger.log('warning', '[STACK] Successfull upload on  S3 : [', err , { tags : 'upload, S3,stack, error'});
}

exports.LogStackError = (err) => {
    return logger.log('error', '[STACK] Error uploadingon S3 : [', err , { tags : 'upload, S3,stack, error'});
}

exports.LogMongoErrorConnection = (err) => {
    return logger.log('error', '[START_UP_ERROR] Cannot connecting toDatabase : [' + err + ']', { tags : 'error, mongo'});
}

exports.LogMongoError = (err) => {
    return logger.log('error', '[ERROR] Mongo error : [' + err + ']', { tags : 'error, mongo'});
}

exports.LogSuccessfullGet = (type) => {
    return logger.log('info', '[GET] Succesfully fetch the ' + type + '.', { tags : 'get,  mongo'});
}

exports.LogSuccessfullPost = (type) => {
    return logger.log('info', '[POST] Succesfully create the ' + type + '.', { tags : 'post, mongo'});
}

exports.LogSuccessfullUpdate = (type) => {
    return logger.log('info', '[UPDATE] Succesfully update the ' + type + '.' , { tags : 'delete, mongo'});
}

exports.LogSuccessfullDelete = (type) => {
    return logger.log('info', '[DELETE] Successfully delete the ' + type + '.', { tags : 'delete, mongo' });
}

exports.LogNotificationSent = (recipient) => {
    return logger.log('info', '[NOTIFICATION] Notification succesfully sent to : ' + recipient + '.', { tags : 'notification, sent' });
}

exports.LogUnauthorizedError = (err) => {
    return logger.log('error', '[UNAUTHORIZED] Error accessing to an unauthorized ressource : [' + err + '].', { tags : 'unauthorized, connexion11' });
}

exports.LogForbiddenError = (err) => {
    return logger.log('error', '[FORBIDDEN] Error accessing to unauthorized ressource : [' + err + '].', { tags : 'forbidden, connexion' });
}

exports.LogNotFoundError = (err) => {
    return logger.log('error', '[NOT_FOUND] Error not found : [' + err + '].', { tags : 'not_found,' });
}

exports.LogConflictLog = (err) => {
    return logger.log('error', '[CONFLICT] Error conflict : [' + err + '].', { tags : 'conflict,' });
}
