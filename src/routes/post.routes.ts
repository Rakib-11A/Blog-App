import { Router } from "express";
import { PostController } from "../controllers/post.controller";
import auth, { UserRole } from "../middlewares/auth.middleware";

const router = Router();

// Create post
router.post('/',auth(UserRole.USER, UserRole.ADMIN), PostController.createPost);
// Get a post by id
router.get('/:id', PostController.getPostById);
// Get all posts
router.get('/', PostController.getAllPost);

export default router;