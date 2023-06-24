const express = require("express");
const bodyparser = require("body-parser");
const session = require('express-session');
const cookieParser = require('cookie-parser');
var jsonparser = bodyparser.json();

const routes = express.Router();

// MongoDB Database Configuration
const { MongoClient, ObjectId } = require('mongodb');
const client = new MongoClient(process.env.URL);

// Email Configuration
const nodemailer = require('nodemailer');
// Create a transporter object with your email service provider settings
const transporter = nodemailer.createTransport({
    // service: 'gmail',
    host: "smtp.gmail.com",
    secureConnection: false,
    port: 587,
    requiresAuth: true,
    domains: ["gmail.com", "googlemail.com"],
    auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_PASSWORD
    }
});


// Load login page at start
routes.get("/", async (req, res) => {
    res.render("login");
});

routes.post('/login_check', jsonparser, async (req, res) => {
    // console.log(req.body.msg);
    let login_success = false;
    success_data = {
        name: null,
        email: null,
        password: null
    };

    // MongoDB Connect
    try {
        await client.connect();
        if (req.body.email) {
            const item = await client.db(process.env.DB_NAME).collection(process.env.AUTH_COLLECTION).findOne({ _id: req.body.email });
            // console.log(item);
            if (req.body.password === item.password) {
                login_success = true;
                success_data.email = item._id;
                success_data.password = item.password;
                success_data.name = item.name;

                req.session.email = item._id;
                req.session.name = item.name;
                req.session.password = item.password;
                // console.log("login_success :", login_success);
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }

    data = {
        message: "msg from Login check",
        success: login_success,
        email: success_data.email,
        password: success_data.password,
        name: success_data.name
    };
    res.send(data);
});


// Sign up Page requests
routes.get('/signup', async (req, res) => {
    // console.log("signup page rendered!");
    res.render('signup');
});

routes.post('/signup_check', jsonparser, async (req, res) => {
    // console.log(req.body.msg);
    let signup_success = false;

    for_insert = {
        name: req.body.name,
        _id: req.body.email,
        password: req.body.password
    };

    // MongoDb connection
    try {
        await client.connect();
        if (req.body.email) {
            const item = await client.db(process.env.DB_NAME).collection(process.env.AUTH_COLLECTION).insertOne(for_insert);
            if (item.acknowledged) {
                const for_insert2 = {
                    _id: "Category",
                    category: ["Income", "Daily", "Purchase", "Recharge/Bill"]
                };
                const status = await client.db(process.env.DB_NAME).collection(req.body.email).insertOne(for_insert2);
                if (status.acknowledged) {
                    signup_success = item.acknowledged;
                    req.session.email = req.body.email;
                    req.session.name = req.body.name;
                    req.session.password = req.body.password;
                }
            }
            // console.log(item);
        }
    } catch (e) {
        // console.log(item);
        console.error(e);
    } finally {
        await client.close();
    }

    data = {
        message: "msg from signup check",
        success: signup_success,
        email: for_insert._id,
        password: for_insert.password,
        name: for_insert.name
    };
    res.send(data);
});


// Forgot password requests
routes.get('/forget_password', async (req, res) => {
    // console.log("forget_password page rendered!");
    res.render('forget_password');
});

routes.post('/forget_password_verification', jsonparser, async (req, res) => {
    // console.log(req.body.msg);
    let verification_success = false;
    let otp_success = false;
    // MongoDB Connect
    try {
        await client.connect();
        if (req.body.email) {
            const item = await client.db(process.env.DB_NAME).collection(process.env.AUTH_COLLECTION).findOne({ _id: req.body.email });
            // console.log("req.body.email", item);

            // Generate OTP and send it to the database and user
            let otp = Math.floor(1000 + Math.random() * 9000);

            const filter = { _id: item._id };
            const updateDoc = {
                $set: {
                    otp: otp
                }
            };
            const options = { upsert: true };
            const result = await client.db(process.env.DB_NAME).collection(process.env.AUTH_COLLECTION).updateOne(filter, updateDoc, options);

            // Define the email options
            const mailOptions = {
                from: process.env.ADMIN_EMAIL,
                to: item._id,
                subject: 'noreply@ reset password',
                text: 'Your OTP to reset password is :' + otp
            };

            // Send the email using the transporter
            const info = await transporter.sendMail(mailOptions);
            // console.log('Email sent:', info.response);
            verification_success = true;
        } else if (req.body.otp) {
            // Retrieve the OTP that was sent to database and 
            // validate it with the OTP from user
            const item = await client.db(process.env.DB_NAME).collection(process.env.AUTH_COLLECTION).findOne({ _id: req.body.email_ });
            // console.log(item);
            if (Number(req.body.otp) == Number(item.otp)) {
                otp_success = true;
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }

    data = {
        message: "msg from forget_password_verification",
        email_success: verification_success,
        otp_success: otp_success
    };
    res.send(data);
});

routes.get('/reset_password', async (req, res) => {
    // console.log("reset_password page rendered!");
    res.render('reset_password');
});

routes.post("/reset_password", jsonparser, async (req, res) => {
    // console.log(req.body.msg);
    // console.log(req.body.email);
    var reset_success = false;
    var null_otp = false;
    try {
        await client.connect();
        if (req.body.email) {
            const item = await client.db(process.env.DB_NAME).collection(process.env.AUTH_COLLECTION).findOne({ _id: req.body.email });
            // console.log("req.body.email", item);
            if (Number(item.otp) == 0) {
                null_otp = true;
            }
            if (Number(req.body.otp) == Number(item.otp)) {
                const filter = { _id: item._id };
                const updateDoc = {
                    $set: {
                        otp: null,
                        password: req.body.password
                    }
                };
                const options = { upsert: true };
                const result = await client.db(process.env.DB_NAME).collection(process.env.AUTH_COLLECTION).updateOne(filter, updateDoc, options);
                // console.log(result);
                reset_success = true;
            }
        }
    }
    catch (e) {
        console.error(e);
    }
    finally {
        await client.close();
    }
    data = {
        message: "msg from reset_password",
        reset_success: reset_success,
        null_otp: null_otp
    };
    res.send(data);
});


// Home page requests
routes.get('/home', async (req, res) => {
    // console.log("home page rendered!");
    let request_for_home = false;
    let Category = null;
    let Profile = null;
    let Trans = null;
    
    try {
        // MongoDB Connect
        await client.connect();
        if (req.session.email) {
            item = await client.db(process.env.DB_NAME).collection(process.env.AUTH_COLLECTION).findOne({ _id: req.session.email });
            if (req.session.password === item.password && req.session.name === item.name) {
                request_for_home = true;
                const category_ = await client.db(process.env.DB_NAME).collection(item._id).findOne({ _id: "Category" });

                let trans = await client.db(process.env.DB_NAME).collection(item._id).find({ _id: { $ne: "Category" } }).toArray();
                // console.log(trans);
                let wallet = 0;
                let income = 0;
                let expense = 0;
                if (trans.length == 0) {
                    trans.empty = true;
                }else{
                    for (let i = 0; i < trans.length; i++) {
                        if(trans[i].type === "Paid"){
                            expense += trans[i].amount;
                        }else if(trans[i].type === "Received"){
                            income += trans[i].amount;
                        }
                    }
                    wallet = income+expense;
                }
                // console.log(trans);
                Category = category_.category;
                Profile = {
                    email: item._id,
                    name: item.name,
                    wallet: wallet,
                    expense: expense,
                    income: income
                };
                Trans = trans;
            }
            console.log(item, "home");
            // req.session.destroy();
            // req.session.email = null;
            // req.session.name = null;
            // req.session.password = null;
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    console.log(request_for_home);
    page_selector = {
        placeholder_home: !request_for_home,
        home: request_for_home
    };

    res.render('index', { page_selector: page_selector, profile: Profile, category: Category, trans: Trans });
});

// routes.post('/home/test', jsonparser, async (req, res) => {

//     req.session.email = req.body.email;
//     req.session.name = req.body.name;
//     req.session.password = req.body.password;

//     res.redirect('/home');
// });

routes.post('/add_transaction', jsonparser, async (req, res) => {
    // MongoDB Connect
    let add_success = false;
    try {
        await client.connect();
        if (req.body.email) {
            const item = await client.db(process.env.DB_NAME).collection(process.env.AUTH_COLLECTION).findOne({ _id: req.body.email });
            // console.log(item);
            if (req.body.password === item.password) {
                for_insertion = {
                    description: req.body.description,
                    category: req.body.category,
                    date: req.body.date,
                    type: req.body.type,
                    amount: Number(req.body.amount)
                };
                const result = await client.db(process.env.DB_NAME).collection(req.body.email).insertOne(for_insertion);
                // console.log(result);
                add_success = result.acknowledged;
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }

    data = {
        success: add_success,
    };
    res.send(data);
});


// Category page requests
routes.get('/category', async (req, res) => {
    if (req.session.email) {
        let Category = null;
        let Trans = null;
        let total = 0;
        try {
            // MongoDB Connect
            await client.connect();

            item = await client.db(process.env.DB_NAME).collection(process.env.AUTH_COLLECTION).findOne({ _id: req.session.email });
            if (req.session.password === item.password) {
                let trans = await client.db(process.env.DB_NAME).collection(item._id).find({ _id: { $ne: "Category" } }).toArray();
                if (trans.length == 0) {
                    trans.empty = true;
                }
                for (let i = 0; i < trans.length; i++) {
                    total += trans[i].amount;
                }
                Trans = trans;
                const category_ = await client.db(process.env.DB_NAME).collection(item._id).findOne({ _id: "Category" });
                if (category_.category.length == 0) {
                    category_.category.empty = true;
                }
                Category = category_.category;
            }
            console.log(item, "category");
            // req.session.destroy();
            // req.session.email = null;
            // req.session.name = null;
            // req.session.password = null;

        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
        res.render('category', { category: Category, trans: Trans, Total: total });
    } else {
        Category = [];
        Category.empty = true;
        Trans = [];
        Trans.empty = true;
        res.render('category', { category: Category, trans: Trans });
        // res.send("category");
    }
});

// routes.post('/category_test', jsonparser, async (req, res) => {

//     req.session.email = req.body.email;
//     req.session.name = req.body.name;
//     req.session.password = req.body.password;

//     res.redirect('/category');
// });

routes.post('/add_category', jsonparser, async (req, res) => {
    let add_success = false;
    try {
        await client.connect();
        if (req.body.email) {
            const item = await client.db(process.env.DB_NAME).collection(process.env.AUTH_COLLECTION).findOne({ _id: req.body.email });
            // console.log(item);
            if (req.body.password === item.password) {
                const status = await client.db(process.env.DB_NAME).collection(req.body.email).findOne({ _id: "Category", category: req.body.category });
                console.log(status);
                if (status) {
                    add_success = false;
                } else {
                    push_category = {
                        $push: {
                            category: req.body.category
                        }
                    };
                    const result = await client.db(process.env.DB_NAME).collection(req.body.email).updateOne({ _id: "Category" }, push_category);
                    // const result = await client.db(process.env.DB_NAME).collection(req.body.email).insertOne(for_insertion);
                    console.log(result);
                    add_success = result.acknowledged;
                }
            }
        }
        console.log(add_success);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }

    data = {
        add_success: add_success,
    };
    res.send(data);
});

routes.post('/delete_category', jsonparser, async (req, res) => {
    let delete_success = false;
    try {
        await client.connect();
        if (req.body.email) {
            const item = await client.db(process.env.DB_NAME).collection(process.env.AUTH_COLLECTION).findOne({ _id: req.body.email });
            if (req.body.password === item.password) {
                pull_category = {
                    $pull: {
                        category: req.body.category
                    }
                };
                const result = await client.db(process.env.DB_NAME).collection(req.body.email).updateOne({ _id: "Category" }, pull_category);
                console.log(result);
                delete_success = result.acknowledged;
            }
        }
        console.log(delete_success);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }

    data = {
        delete_success: delete_success,
    };
    res.send(data);
})

routes.post('/categorical_transactions', jsonparser, async (req, res) => {
    let data = {
        transactions: null,
        total: null,
    };
    try {
        await client.connect();
        if (req.body.email) {
            const item = await client.db(process.env.DB_NAME).collection(process.env.AUTH_COLLECTION).findOne({ _id: req.body.email });
            if (req.body.password === item.password) {
                let trans = await client.db(process.env.DB_NAME).collection(item._id).find({ _id: { $ne: "Category" }, category: req.body.category }).toArray();
                if (trans.length == 0) {
                    trans.empty = true;
                }
                let total = 0;
                for (let i = 0; i < trans.length; i++) {
                    total += trans[i].amount;
                }
                data.transactions = trans;
                data.total = total;
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    res.send(data);
});


// Transaction page requests
routes.get('/transaction', async (req, res) => {
    if (req.session.email) {
        let Category = null;
        let Trans = null;
        try {
            // MongoDB Connect
            await client.connect();

            item = await client.db(process.env.DB_NAME).collection(process.env.AUTH_COLLECTION).findOne({ _id: req.session.email });
            if (req.session.password === item.password) {
                let trans = await client.db(process.env.DB_NAME).collection(item._id).find({ _id: { $ne: "Category" } }).toArray();
                if (trans.length == 0) {
                    trans.empty = true;
                }
                Trans = trans;
                const category_ = await client.db(process.env.DB_NAME).collection(item._id).findOne({ _id: "Category" });
                if (category_.category.length == 0) {
                    category_.category.empty = true;
                }
                Category = category_.category;
            }
            console.log(item, "transaction");
            // req.session.destroy();
            // req.session.email = null;
            // req.session.name = null;
            // req.session.password = null;

        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
        res.render('transaction', { category: Category, trans: Trans });
    } else {
        Category = [];
        Category.empty = true;
        Trans = [];
        Trans.empty = true;
        res.render('transaction', { category: Category, trans: Trans });
        // res.send("category");
    }
});
// There is also add transaction in Transaction Page as well
// Which uses same "/add_transaction" post method as in home page
routes.post("/delete_transaction", jsonparser, async (req, res) => {
    let delete_success = false;
    try {
        await client.connect();
        if (req.body.email) {
            const item = await client.db(process.env.DB_NAME).collection(process.env.AUTH_COLLECTION).findOne({ _id: req.body.email });
            if (req.body.password === item.password) {
                pull_category = {
                    $pull: {
                        category: req.body.category
                    }
                };
                const found = await client.db(process.env.DB_NAME).collection(req.body.email).findOne({ _id: req.body.transID });
                console.log(found);
                const result = await client.db(process.env.DB_NAME).collection(req.body.email).deleteOne({ _id: new ObjectId(req.body.transID) });
                console.log(result);
                if (result.deletedCount > 0) {
                    delete_success = result.acknowledged;
                }
            }
        }
        console.log(delete_success);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }

    data = {
        delete_success: delete_success,
    };
    res.send(data);
});

routes.post('/filter_transaction', jsonparser, async (req, res) => {
    data = {
        filterSuccess: false,
        trans: null,
    };
    try{
        await client.connect();
        if (req.body.email) {
            const item = await client.db(process.env.DB_NAME).collection(process.env.AUTH_COLLECTION).findOne({ _id: req.body.email });
            if (req.body.password === item.password) {
                let trans = await client.db(process.env.DB_NAME).collection(item._id).find({ _id: { $ne: "Category" } }).toArray();
                // console.log(trans);
                let filter = [];

                // Filter 1: Type
                if (req.body.AmtType === "All") {
                    filter = trans;
                }else {
                    let filter1 = [];
                    let type = req.body.AmtType;
                    for (let i = 0; i < trans.length; i++) {
                        if(type === trans[i].type){
                            filter1.push(trans[i]);
                        }
                    }
                    filter = filter1;
                }

                // Filter 2: Category
                if(req.body.Category === "All"){
                    // filter = filter;
                }else{
                    let filter1 = [];
                    let cate = req.body.Category;
                    for (let i = 0; i < filter.length; i++) {
                        if(cate === filter[i].category){
                            filter1.push(filter[i]);
                        }
                    }
                    filter = filter1;
                }

                // Filter 3: Year
                if(req.body.Year === "All"){
                    // filter = filter;
                }else{
                    let filter1 = [];
                    let client_y = Number(req.body.Year);
                    for (let i = 0; i < filter.length; i++) {
                        let date = new Date(filter[i].date);
                        let db_y = date.getFullYear();
                        if(db_y == client_y){
                            filter1.push(filter[i]);
                        }
                    }
                    filter = filter1;
                }

                // Filter 4: Month
                if(req.body.Month === "All"){
                    // filter = filter;
                }else{
                    let filter1 = [];
                    let client_m = Number(req.body.Month);
                    for (let i = 0; i < filter.length; i++) {
                        let date = new Date(filter[i].date);
                        let db_m = date.getMonth()+1;
                        if(db_m == client_m){
                            filter1.push(filter[i]);
                        }
                    }
                    filter = filter1;
                }
                if(filter.length>0){
                    data.filterSuccess = true;
                    data.trans = filter;
                }
            }
        }
    }catch (e){
        console.error(e);
    }finally{
        await client.close();
    }

    res.send(data);
});

// Contact us Page
routes.get('/contact_us', async (req, res) => {
    res.render('contact_us');
});

routes.post("/contact_us", jsonparser, async (req, res) => {
    let contact_success = false;
    try {
        if (req.body.EMAIL) {
            await client.connect();
            for_insertion = {
                F_NAME: req.body.F_NAME,
                L_NAME: req.body.L_NAME,
                EMAIL: req.body.EMAIL,
                MESSAGE: req.body.MESSAGE
            };
            const result = await client.db(process.env.DB_NAME).collection(process.env.CONTACT_COLLECTION).insertOne(for_insertion);
            contact_success = result.acknowledged;
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    data = {
        contact_success: contact_success
    }
    res.send(data);
});


//Logout
routes.post('/logout', jsonparser, async (req, res) => {
    let logout_success = false;
    try {
        req.session.destroy();
        logout_success = true;
        console.log("logout_success", logout_success);
    } catch (e) {
        console.error(e);
        logout_success = false;
    } finally {
        await client.close();
    }
    data = {
        logout_success: logout_success
    }
    res.send(data);
});

module.exports = routes;