const express = require("express");
var bodyParser = require("body-parser");
const connectDB = require("./config/db");
var UserModel = require("./models/User");
var ProductSchema = require("./models/product");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
let li=0;

const app = express();
connectDB();

//setting view engine
app.set("view-engine", "ejs");

//using body-parser
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());


const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
  secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
  saveUninitialized: true,
  cookie: {
    maxAge: oneDay
  },
  resave: false
}));


//setting static data path
app.use(express.static(__dirname + "/public"));


// app.get('*',(req, res)=>{
//   res.status(404).send( 'Not found');
// });



//session data to local
app.use(function (req, res, next) {
  res.locals.user = req.session.user;
  res.locals.email = req.session.email;
  res.locals.locality = req.session.locality;
  res.locals.mobile = req.session.mobile;

  next();

});

app.get("/", async(req, res) => {
  let product = []
    product = await ProductSchema.find()
  res.render("index.ejs",{p:product});
});

app.get('/product/:Pname', async(req,res)=>{
  // req.route.query.tagId

  let product = []
    product = await ProductSchema.find({
      Pname: req.params.Pname
    })
  res.render("product.ejs",{p:product[0]});
});

app.get("/shopfront", async(req, res) => {
  if (req.session.user){
    let product = []
    product = await ProductSchema.find({
      ShopOwner: req.session.user
    })
    // console.log(product);
    res.render("shopfront.ejs",{p:product ,li:li--});
  }
  else res.status(404).send('Not logged in! Please <a href="/login0">LogIn</a> to view');
});
app.get("/profile", (req, res) => {
  if (req.session.user)
    res.render("profile.ejs");
  else res.status(404).send('Not logged in! Please <a href="/login0">LogIn</a> to view');

});
app.get("/login0", (req, res) => {
  if (req.session.user)
    res.redirect("/shopfront");
  else 
  res.render("login0.ejs");
});

app.get("/signup0", (req, res) => {
  res.render("signup0.ejs", {

  });
});
app.get("/Addproduct0", (req, res) => {
  if (req.session.user)
  res.render("addproduct.ejs");
  else res.status(404).send('Not logged in! Please <a href="/login0">LogIn</a> to view');
  
});

app.get("/contact", (req, res) => {
  res.render("contact.ejs");
});
app.get("/marketing", (req, res) => {
  res.render("marketing.ejs");
});
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});


// cookie parser middleware
app.use(cookieParser());

//login routes
app.get("/login", function (req, res) {
  res.render("form");
});

app.post("/login", async (req, res) => {

  if (req.session.user) {
    res.redirect('/shopfront');

  } else {
    li=1;

    let user = []
    user = await UserModel.find({
      email: req.body.email
    })


    if (user.length) {
      if (user[0].password == req.body.password) {
        session = req.session;
        session.user = user[0].name;
        session.email = user[0].email;
        session.locality = user[0].locality;
        session.mobile = user[0].mobile;

        res.redirect('/shopfront');
      } else {
        // console.log("wrong password");
        res.redirect('/login0');
      }
    } else {
      // console.log("wrong userid");

      res.redirect('/login0');
    }
  }
});



//signup routes
app.get("/signup", function (req, res) {
  res.render("form");
});

app.post("/signup", (req, res) => {
  // Insert Login Code Here
  let name0 = req.body.name;
  let password0 = req.body.password;
  let email0 = req.body.email;
  let mobile0 = req.body.mobile;
  let locality0 = req.body.locality;

  var user = new UserModel();
  user.name = name0;
  user.email = email0;
  user.password = password0;
  user.locality = locality0;
  user.mobile = mobile0;

  user.save(function (err, data) {
    if (err) {
      // console.log(error);
    } else {
      res.redirect('/login0');
    }
  });
});
app.get("/AddProduct", function (req, res) {
  res.render("form");
});
app.post("/AddProduct", (req, res) => {

  var product = new ProductSchema();
  product.Pname = req.body.Pname;
  product.price = req.body.price;
  product.ShopOwner = req.body.ShopOwner;
  product.dis = req.body.dis;

  product.save(function (err, data) {
    if (err) {
      // console.log(error);
    } else {
      res.redirect('/shopfront');
    }
  });
});

const port = 5000; // Port we will listen on

// Function to listen on the port
app.listen(port, () => console.log(`This app is listening on port ${port}`));