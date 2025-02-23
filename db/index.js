const index = require("mongoose");
require("dotenv").config();


// const { MONGO_USERNAME, MONGO_PASSWORD, MONGO_HOSTNAME, MONGO_PORT, MONGO_DB } =
//   process.env;

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 10000,
};
const url = process.env.MONGO_URI;

index
    .connect(url, options)
    .then(function () {
        console.log("MongoDB is connected");

    })
    .catch(function (err) {
        console.log(err, "Mongoose Could Not connect");
    });