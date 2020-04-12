var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware/index.js");//can just also leave it as ../middleware since index.js is a special name and doesnt need mentioning
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
  
var geocoder = NodeGeocoder(options);


router.get("/", function(req, res){
	Campground.find({}, function(err, allCampgrounds){
		if(err){
			console.log(err)
		}
		else{
			
			res.render("campgrounds/index", {campgrounds: allCampgrounds});
		}
	})
});

router.get("/new", middleware.isLoggedIn, function(req,res){
	res.render("campgrounds/new");
});


router.get("/:id", function(req, res){
	//find the campground using provided ID
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err){
			console.log(err)
		}
		else{
			//console.log(foundCampground)
			//var daysago = "days ago";
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
})

router.post("/", middleware.isLoggedIn, function(req,res){
	//opens after we post a new campground
	
	var name = req.body.name;
	var image = req.body.image;
	var price = req.body.price
	var description = req.body.description;
	var author = {
		id: req.user._id, 
		username: req.user.username
	}

  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
		console.log(err.message)
      	req.flash('error', 'Invalid address');
      	return res.redirect('back');
    }
	console.log(data[0]);
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newCampground = {name: name, image: image, description: description, author:author, location: location, lat: lat, lng: lng};
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
    });
  });
});


//EDIT CAMPGROUND
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
	
		Campground.findById(req.params.id, function(err, foundCampground){
		res.render("campgrounds/edit", {campground: foundCampground});
			
	
	});
});

//UPDATE CAMPGROUND
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
	//find and update the correct campgrounds
	// UPDATE CAMPGROUND ROUTE

  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;

    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
  });
});
	
	
	
 
// DESTROY CAMPGROUND

router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, campground) {
		Comment.deleteMany({
			"_id": {
				$in: campground.comments
			}
		}, function(err){
			if(err){
				res.redirect("/campgrounds")
			}
			campground.remove();
			res.redirect("/campgrounds")
		})
		
		
	});
});


//middleware




module.exports = router;