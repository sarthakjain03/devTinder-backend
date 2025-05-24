const express = require("express");
const connectDB = require("./configs/database");
const User = require("./models/user");
const app = express();
const port = 3003;

// Importing the body-parser middleware from json to javascript object
app.use(express.json());

app.post("/signup", async (req, res) => {
    try {
        const body = req.body;
        console.log(body);
        // Creating a new instance of the User model
        const newUser = new User(body);
        await newUser.save();
        res.send("User created successfully");
        
    } catch (error) {
        res.status(400).send("Error occurred while signing up: " + error?.message);
    }
})

connectDB().then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
}).catch((error) => {
    console.log(error);
});
