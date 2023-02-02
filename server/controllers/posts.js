import express from 'express';
import mongoose from 'mongoose';
import multer from "multer"

import PostMessage from '../models/postMessage.js';

const router = express.Router();
//####################################################################################
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/lotteries");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname.toLowerCase().split(' ').join('-'));
    }
});
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            return cb('Only .png, .jpg and .jpeg format allowed!', false);
        }
    }
});

const cpUpload = upload.single('image');
function uploadImage(req, res, next) {
    cpUpload(req, res, function (err) {
        if (!fs.existsSync("lotteries")) {
            fs.mkdirSync("lotteries");
        }
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: JSON.stringify(err) });
        } else if (err) {
            return res.status(400).json({ message: err });
        }
        next();
    });
}

//####################################################################################

export const getPosts = async (req, res) => {
    try {
        const postMessages = await PostMessage.find();
        res.status(200).json(postMessages);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getPost = async (req, res) => {
    const { id } = req.params;
    try {
        const post = await PostMessage.findById(id);
        res.status(200).json(post);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const createPost = async (req, res) => {
    const { title, message, selectedFile, creator, tags } = req.body;
    const newPostMessage = new PostMessage({ title, message, selectedFile, creator, tags })
    if (req.file) {
        req.body.image = `${process.env.ASSET_URL}/file/${req.file.filename}`;
    }
    try {
        await newPostMessage.save();
        res.status(201).json(newPostMessage);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}

export const updatePost = async (req, res) => {
    const { id } = req.params;
    const { title, message, creator, selectedFile, tags } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);
    const updatedPost = { creator, title, message, tags, selectedFile, _id: id };
    await PostMessage.findByIdAndUpdate(id, updatedPost, { new: true });
    res.json(updatedPost);
}

export const deletePost = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);
    await PostMessage.findByIdAndRemove(id);
    res.json({ message: "Post deleted successfully." });
}

export const likePost = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);
    const post = await PostMessage.findById(id);
    const updatedPost = await PostMessage.findByIdAndUpdate(id, { likeCount: post.likeCount + 1 }, { new: true });
    res.json(updatedPost);
}


export default router;


