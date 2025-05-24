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
        res.status(500).send("Error occurred while signing up: " + error?.message);
    }
})

app.get("/user", async (req, res) => {
    try {
        const userEmail = req.body?.email;
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            res.status(404).send("User not found");
        } else {
            res.send(user);
        }
        
    } catch (error) {
        res.status(500).send("Error occurred while fetching user: " + error?.message);
    }
})

app.get("/feed", async (req, res) => {
    try {
        const users = await User.find({});
        if (users?.length === 0) {
            res.status(404).send("No User Found");
        } else {
            res.send(users);
        }
        
    } catch (error) {
        res.status(500).send("Error occurred while fetching users: " + error?.message);
    }
})

app.delete("/user", async (req, res) => {
    try {
        const userId = req.body?.userId;
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            res.status(404).send("User not found");
        } else {
            res.send("User deleted successfully");
        }
        
    } catch (error) {
        res.status(500).send("Error occurred while deleting user: " + error?.message);
    }
})

app.patch("/user", async (req, res) => {
    try {
        const userId = req.body?.userId;
        const data = req.body
        const user = await User.findByIdAndUpdate(userId, data);
        // Same as const user = await User.findByIdAndUpdate({ _id: userId }, data);
        if (!user) {
            res.status(404).send("User not found");
        } else {
            res.send("User updated successfully");
        }
        
    } catch (error) {
        res.status(500).send("Error occurred while updating user: " + error?.message);
    }
})

connectDB().then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
}).catch((error) => {
    console.log(error);
});
