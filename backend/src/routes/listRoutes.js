import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
    getUserListsController,
    createUserList,
    deleteUserList,
    addBlogToListController,
    removeBlogFromListController,
} from "../controllers/listController.js";

const router = express.Router();

router.get("/", authMiddleware, getUserListsController);
router.post("/", authMiddleware, createUserList);
router.delete("/:id", authMiddleware, deleteUserList);
router.post("/:id/blogs", authMiddleware, addBlogToListController);
router.delete("/:id/blogs/:blogId", authMiddleware, removeBlogFromListController);

export default router;
