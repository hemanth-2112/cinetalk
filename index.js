import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import formatemessage from './utils/messages.js';
import { getcurrentuser, userjoin,getroomuser, userleave } from './utils/users.js';


dotenv.config();

const app = express();
const httpserver = http.createServer(app);
const io = new Server(httpserver);
const PORT = process.env.PORT;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));
const botname = 'pk'

io.on('connection', socket => {
    socket.on('joinroom', ({ username, room }) => {
        const user = userjoin(socket.id, username, room);
        socket.join(user.room);

        socket.emit('message', formatemessage(botname, `Welcome to the chat`));

        socket.broadcast.to(user.room)
            .emit('message', formatemessage(botname, `${user.username} user has joined the chat`));
            
            //send users and room info..
            io.to(user.room).emit("roomUsers",{
                room:user.room,
                users:getroomuser(user.room)
            });

    });

    socket.on('chatMessage', msg => {
        console.log(msg);
        const user = getcurrentuser(socket.id);
        io.to(user.room).emit('message', formatemessage(user.username, msg));
    });
    socket.on('disconnect', () => {
           const user=userleave(socket.id)
           if (user) {
            console.log(`${user.username}`);
            io.to(user.room).emit('message', formatemessage(botname, `${user.username}  has left the chat`));
            io.to(user.room).emit("roomUsers",{
                room:user.room,
                users:getroomuser(user.room)
            });
           }
        })
});

httpserver.listen(PORT, () => { console.log(`Server running on http://192.168.0.48:${PORT}`) });
