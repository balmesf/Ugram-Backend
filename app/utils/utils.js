/** UTILS **/

let findPicture  = (obj, sizeImage) => {
    let pictureUrl = undefined;
    
    obj.url.forEach((x) => {
	if (x.type === sizeImage)
	    pictureUrl = x.url;
    });
    return pictureUrl !== undefined ? pictureUrl : '';
}


exports.formatUser = (obj, sizeImage) => {

    if (sizeImage === undefined)
	sizeImage = 'medium';

    if (obj !== undefined) {
	var item = {
	    id : obj.local.user_id || obj.facebook.user_id,
	    email : obj.local.email || obj.facebook.email,
	    firstName : obj.local.firstname || obj.facebook.firstname,
	    lastName : obj.local.lastname || obj.facebook.lastname || '',
	    phoneNumber: obj.local.phoneNumber || obj.facebook.phoneNumber || '0',
	    pictureUrl: findPicture(obj, sizeImage),
	    registrationDate: obj.registrationDate
	}
	return item;
    }
    return obj;
}

exports.formatUserForAuthentication = (obj, sizeImage) => {

    if (sizeImage === undefined)
	sizeImage = 'medium';
    console.log(obj);
    
    if (obj !== undefined) {
	var item = {
	    id : obj.local.user_id || obj.facebook.user_id,
	    email : obj.local.email || obj.facebook.email || '',
	    access_token : obj.local.access_token || obj.facebook.access_token,
	    firstName : obj.local.firstname || obj.facebook.firstname || '',
	    lastName : obj.local.lastname || obj.facebook.lastname || '',
	    phoneNumber: obj.local.phoneNumber || obj.facebook.phoneNumber || '0',
	    pictureUrl: findPicture(obj, sizeImage),
	    registrationDate: obj.registrationDate
	}
	return item;
    }
    return obj;
}

exports.formatPictureByImageSize = (sizeImage, obj) => {

    if (sizeImage === undefined)
	sizeImage = 'medium';

    if (obj !== undefined) {	
	var item = {
	    id : obj._id,
	    userId : obj.userId,
	    description : obj.description,
	    createdDate : obj.createdDate,
	    comments : obj.comments,
	    likes :  obj.likes,
	    url : findPicture(obj, sizeImage),
	    tags : obj.tags,
	    mentions : obj.mentions
	}
	return item;
    }
    return obj;
}
