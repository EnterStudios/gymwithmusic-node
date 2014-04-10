'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Video = mongoose.model('Video'),
    CurrentVideo = mongoose.model('CurrentVideo');


/**
 * All videos
 */
exports.list = function(req, res) {
    Video.find().populate('added_by').sort('-vote_count').exec(function(err, videos)
    {
        return res.send({
            status: 'success',
            videos: videos
        });
    });
};

/**
 * Create video
 */
exports.add = function(req, res) {
    var video = new Video(req.body);
    var message = '';
    video.save(function(err) {
        if (err) {
            switch (err.code) {
                case 11000:
                case 11001:
                    message = 'Video is al toegevoegd';
                    break;
                default:
                    message = 'Oeps! Er is iets misgelopen met de databank.';
            }

            return res.send({
                status: 'error',
                message: message
            });
        }
        Video.find().populate('added_by').sort('-vote_count').exec(function(err, videos)
        {
            return res.send({
                status: 'success',
                message: videos
            });
        });
    });

};

exports.addCurrent = function(req, res) {
    var video = new CurrentVideo(req.body);
    Video.findOne({_id: req.body._id}, function(err,obj) { obj.remove(); });
    CurrentVideo.collection.remove(function(err){
        video.save(function(err) {
            Video.find().populate('added_by').sort('-vote_count').exec(function(err, videos)
            {
                return res.send({
                    status: 'success',
                    message: videos
                });
            });
        });
    });
};

/**
 * All videos
 */
exports.getCurrent = function(req, res) {
    CurrentVideo.find().populate('added_by').limit(1).exec(function(err, video)
    {
        return res.send({
            status: 'success',
            video: video
        });
    });
};

exports.vote = function(req, res) {
    var id = req.params.id;
    var userId = req.body.userId;
    var userName = req.body.userName;
    var userEmail = req.body.userEmail;

    Video.findOneAndUpdate(
        {_id: id},
        {$push: {voterIds: userId, voterNames: userName, voterEmails: userEmail}, $inc: {vote_count: 1}},
        {safe: true, upsert: true},
        function() {
            Video.find().populate('added_by').sort('-vote_count').exec(function(err, videos)
            {
                return res.send({
                    status: 'success',
                    videos: videos
                });
            });
        }
    );
};
