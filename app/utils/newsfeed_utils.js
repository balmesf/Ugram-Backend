
const sortCountTags = (obj) => {
    var arr = [];

    for (var prop in obj)
	if (obj.hasOwnProperty(prop))
	    arr.push({
		'key': prop,
		'value': obj[prop]
	    });
    return arr.sort((a, b) => { return b.value - a.value; }).slice(0, 10);
}

exports.findTopHashtags = (arr) => {
    if (arr !== undefined) {
	const tags = [];
	const count = {};

	Object.keys(arr).forEach((key) => {
	    arr[key].tags.forEach((e) => {
		tags.push(e);
	    });
	});
	tags.forEach((i) => { count[i] = (count[i] || 0) + 1 });

	var a = sortCountTags(count);
	var result = {tags : []};
	for (var prop in a)
	    result.tags.push(a[prop].key);

	return result;
    }
}

exports.findTopUserAccounts = (arr) => {
    if (arr !== undefined) {
	const popular = [];

	Object.keys(arr).forEach((key) => {
	    var n = popular.findIndex(x => x.userId === arr[key].userId);

	    if (n === -1)
		popular.push({userId : arr[key].userId, likes : arr[key].likes.length});
	    else
		popular[n].likes += arr[key].likes.length;
	});
	var result = [];
	for (var p in popular.sort((a, b) => { return b.likes - a.likes; }).slice(0, 10))
	    result.push(popular[p].userId);
    }
    return result;
}

exports.findRecommendedAccounts = (userId, arr) => {
    if (arr !== undefined) {
	const user_tags = [];
	const tags = [];

	for (var i = 0; i !== arr.length; i++) {
	    if (arr[i].userId === userId) {
		arr[i].tags.map((e) => {
		    if (user_tags.indexOf(e) === -1)
			user_tags.push(e)
		});
	    }

	    else {
		var pos = tags.map((x) => { return x.userId }).indexOf(arr[i].userId);

		if (pos === -1)
		    tags.push({
			userId : arr[i].userId,
			tags : arr[i].tags,
			commonTags : 0
		    });
		else
		    arr[i].tags.map((e) => {
			if (tags[pos].tags.indexOf(e) === -1)
			    tags[pos].tags.push(e);
		    });
	    }
	}
	for (var prop in tags) {
	    for (var t in user_tags) {
		if (tags[prop].tags.indexOf(user_tags[t]) !== -1)
		    tags[prop].commonTags += 1;
	    }
	}
	const tmp = [];
	tags.forEach((x) => {
	    if (x.commonTags !== 0) 
		tmp.push(x);
	});
	return tmp.sort((a, b) => { return b.commonTags - a.commonTags }).slice(0, 10)
    }
    return arr;
}
