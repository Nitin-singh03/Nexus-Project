if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();

}

const express = require("express");
const path = require("path");
const session = require('express-session');
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./model/user.js");
const flash = require("connect-flash");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const adminRouter = require("./routes/admin.js");
const contractRouter = require("./routes/contract.js");
const contractorRouter = require("./routes/contractor.js");
const productRouter = require("./routes/product.js");
const sellerRouter = require("./routes/seller.js");
const userRouter = require("./routes/user.js");

const sessionOptions = {
    secret: process.env.SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000, 
        httpOnly: true,
    }
};
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({ usernameField: 'Pnumber' }, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.warning = req.flash('warning');
    res.locals.currUser = req.user;
    next();
});

app.use((req, res, next) => {
    res.locals.sellerId = req.session.sellerId || null;
    res.locals.contractorId = req.session.contractorId || null;
    res.locals.currUser = req.session.user || null;
    next();
});

const http = require('http');
const socketIo = require('socket.io');
const Chat = require('./model/contractorUserChat.js');

const server = http.createServer(app); // Create HTTP server
const io = socketIo(server);  // Attach Socket.IO

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('joinRoom', (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
    });

    socket.on('sendMessage', async ({ room, senderId, senderModel, message }) => {
        const chat = await Chat.findOne({ _id: room });
        if (chat) {
            chat.messages.push({ sender: senderId, senderModel, content: message });
            await chat.save();
            io.to(room).emit('receiveMessage', { senderId, message });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});



app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const dbUrl = process.env.MONGO_URI;
mongoose.connect(dbUrl)
    .then(() => console.log("Connected to DB"))
    .catch(err => console.log("DB connection error:", err));

app.use('/', userRouter);
app.use('/seller', sellerRouter);
app.use('/product', productRouter);
app.use('/contractor', contractorRouter);
app.use('/contract', contractRouter);
app.use('/admin', adminRouter);

app.get("/predict", (req, res) => {
    res.render("analyzer.ejs")
})

const PORT = process.env.PORT
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
