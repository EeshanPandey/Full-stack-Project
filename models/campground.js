var mongoose = require("mongoose");
var Comment = require("./comment");

var campgroundSchema = new mongoose.Schema({
	name: String,
	price: Number,
	image: String,
	description: String,
	location: String,
	lat: String,
	lng: String,
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
	comments: [
	{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Comment"
	}
	]
});


module.exports = mongoose.model("Campground", campgroundSchema);