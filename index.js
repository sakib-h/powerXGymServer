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
client.connect((err) => {
	const membershipCollection = client
		.db("PowerXGymDB")
		.collection("GymMembership");
	// perform actions on the collection object
	app.post("/addMembers", (req, res) => {
		const userData = req.body;
		console.log(userData);
		membershipCollection
			.insertOne(userData)
			.then((result) => {
				// process result
				console.log(result);
			})
			.catch((err) => {
				console.log(err);
			});
	});
});

app.listen(process.env.PORT || port);
