"use strict";

const MessageModel = require('./models/messages.model');

module.exports = function (io) {
    io.on('connection', function (socket) {
        socket.emit('connected', 'You are connected!');
        socket.join('all');

        socket.on('msg', function (content) {
            const obj = {
                date: new Date(),
                content: content,
                username: socket.id
            };
            MessageModel.create(obj, function (err) {
                if(err) return console.error("MessageError", err);
                socket.emit("message", obj);
                socket.to('all').emit('message', obj);
            });
        });

        socket.on('receiveHistory', function () {
            MessageModel
                .find({})
                .sort({date:-1})
                .limit(50)
                .sort({date:1})
                .lean()
                .exec(function (err, messages) {
                    if(!err){
                        socket.emit('history',messages);
                        // socket.to('all').emit('history',messages);
                    }
                })
        });

    });
};
