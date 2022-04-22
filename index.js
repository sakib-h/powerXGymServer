/**
 * Project Name: Power X GYM server
 * !Author: Sakib Hasan
 * Date Created: 12-4-2022
 */
// Backend Initialization
const express = require("express");
const app = express();
const port = 5000;
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

// MongoDB initialization
const { MongoClient, ServerApiVersion } = require("mongodb");

// using Middleware
app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
	res.send("Hello World!");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lfa2u.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: ServerApiVersion.v1,
});
// Connecting website with mongoDB
client.connect((err) => {
	// Database Collection declaration
	const membershipCollection = client
		.db("PowerXGymDB")
		.collection("GymMembership");
	// perform actions on the collection object

	// create new membership
	app.post(`/createMembership`, (req, res) => {
		const user = req.body;
		membershipCollection
			.insertOne(user)
			.then(function (result) {
				// process result
				res.send(result.acknowledged);
			})
			.catch((err) => {
				console.log(err);
			});
	});

	// get all the members from Database
	app.get(`/members`, (req, res) => {
		membershipCollection.find({}).toArray((err, documents) => {
			res.send(documents);
		});
	});

	// get specific user info from data base
	app.get(`/user/:userMail`, (req, res) => {
		const Email = req.params.userMail;

		membershipCollection
			.find({ email: Email })
			.toArray((err, documents) => {
				res.send(documents[0]);
			});
	});

	// update user info to database
	app.patch(`/update/:userMail`, (req, res) => {
		const userInfo = req.body;
		console.log(userInfo);
		membershipCollection
			.updateOne({}, { $set: userInfo })
			.then((result) => res.send(result.acknowledged))
			.catch((err) => console.log(err.messages));
	});
});

// !Stripe initialization on preBuilt method
// const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
//
// app.post("/addToCart", async (req, res) => {
// 	try {
// 		const plan = req.body.plan;
// 		const priceInCent = req.body.price * 100;
// 		const quantity = req.body.quantity;
// 		const session = await stripe.checkout.sessions.create({
// 			payment_method_types: ["card"],
// 			mode: "payment",
//
// 			line_items: [
// 				{
// 					price_data: {
// 						currency: "usd",
// 						product_data: {
// 							name: plan,
// 						},
// 						unit_amount: priceInCent,
// 					},
// 					quantity: quantity,
// 				},
// 			],
//
// 			success_url: `${process.env.CLIENT_URL}/aboutUs`,
// 			cancel_url: `${process.env.CLIENT_URL}/pricing`,
// 		});
// 		res.json({ url: session.url });
// 	} catch (error) {
// 		res.status(500).send(error.message);
// 	}
// });

// !Stripe initialization on custom method
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

app.post("/create-payment-intent", async (req, res) => {
	const priceInnCent = req.body.price * 100;

	// Create a PaymentIntent with the order amount and currency
	const paymentIntent = await stripe.paymentIntents.create({
		amount: priceInnCent,
		currency: "usd",
		automatic_payment_methods: {
			enabled: true,
		},
	});

	res.send({
		clientSecret: paymentIntent.client_secret,
	});
});

app.listen(process.env.PORT || port);
