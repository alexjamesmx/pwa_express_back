const express = require("express");
const userSchema = require("../models/user");

const router = express.Router();

// GET ALL USERS
router.get("/users", async (req, res) => {
  try {
    const users = await userSchema.find();
    return res.json(users);
  } catch (err) {
    console.log("Error getting users:", err);
    return res.json({ message: err });
  }
});

// LOGIN, CREATE OR RETURN USER
router.post("/users/", async (req, res) => {
  const { email } = req.body;
  const existingUser = await userSchema.findOne({ email });
  if (existingUser) {
    // User already exists
    return res.status(200).json(existingUser);
  }

  const user = new userSchema({
    displayName: req.body.displayName,
    email: req.body.email,
    photoURL: req.body.photoURL,
    _id: req.body._id,
  });

  try {
    const savedUser = await user.save();
    // success
    return res.status(201).json(savedUser);
  } catch (err) {
    console.log("Error saving user:", err);
    return res.status(400).json({ message: err });
  }
});

// GET USER BY ID
router.get("/users/:userId", async (req, res) => {
  try {
    const user = await userSchema.findById(req.params.userId);
    return res.status(200).json(user);
  } catch (err) {
    console.log("Error getting user by ID:", err);
    return res.status(404).json({ message: err });
  }
});

// CREATE OR UPDATE CATEGORIES
router.post("/users/:userId/categories", async (req, res) => {
  const { userId } = req.params;
  const { category } = req.body;

  try {
    const user = await userSchema.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let newKey = Object.keys(category)[0];

    let message = "updated";
    if (!user.categories.has(newKey)) {
      user.categories.set(newKey, category[newKey]);
      message = "created";
    }

    const categoryList = user.categories.get(newKey);

    const imageAlreadySaved = categoryList.some(
      (item) => item.id === category[newKey][0].id
    );

    if (imageAlreadySaved) {
      // delete image from category
      user.categories.set(
        newKey,
        categoryList.filter((item) => item.id !== category[newKey][0].id)
      );
    } else {
      if (category[newKey] && Array.isArray(category[newKey])) {
        category[newKey].forEach((newElement) => {
          const existingIndex = categoryList.findIndex(
            (element) => element.id === newElement.id
          );
          if (existingIndex === -1) {
            categoryList.push(newElement);
          }
        });
      }
    }

    const updatedUser = await user.save();
    const response = {
      message,
      user: updatedUser,
      imageAlreadySaved,
    };

    return res.status(200).json(response);
  } catch (err) {
    console.log("Error creating or updating categories:", err);
    return res.status(400).json({ message: err.message });
  }
});

// FAVORITES
router.post("/users/:userId/toggleSave", async (req, res) => {
  const { userId } = req.params;
  const { id, url } = req.body;
  const { category } = req.body;
  console.log("toggleSave", req.body);
  try {
    const user = await userSchema.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const list = user.categories.get(category) || [];

    const isImageSaved = list.some((item) => item.id === id);

    if (isImageSaved) {
      user.categories.set(
        category,
        list.filter((item) => item.id !== id)
      );
      await user.save();
      return res.status(200).json({ message: "removed" });
    } else {
      const newCategory = list.concat({ id, url });
      user.categories.set(category, newCategory);
      await user.save();
      return res.status(200).json({ message: "added" });
    }
  } catch (err) {
    console.log("Error on toggleSave:", err.message);
    return res.status(400).json({ message: err.message });
  }
});

// IS FAVORITE OR NOT
router.get("/users/:userId/isFavorite/:imageId", async (req, res) => {
  const { userId, imageId } = req.params;

  try {
    const user = await userSchema.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let response = [];

    user.categories.forEach((category, key) => {
      const list = category || [];
      if (list.some((item) => item.id === imageId)) {
        let data = {
          category: key,
          isFavorite: true,
        };
        response.push(data);
      }
    });

    return res.status(200).json(response);
  } catch (err) {
    console.log("Error checking if image is favorite:", err);
    return res.status(400).json({ message: err.message });
  }
});

// GET CATEGORIES
router.get("/users/:userId/categories", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await userSchema.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user.categories);
  } catch (err) {
    console.log("Error getting categories:", err);
    return res.status(400).json({ message: err.message });
  }
});

// UPDATE USERNAME
router.put("/users/:userId", async (req, res) => {
  const { userId } = req.params;
  const { displayName } = req.body;
  try {
    const user = await userSchema.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.displayName = displayName;
    await user.save();

    return res.status(200).json(displayName);
  } catch (err) {
    console.log("Error updating username:", err);
    return res.status(400).json({ message: err.message });
  }
});

module.exports = router;
