import { Router } from "express";
import { PostController } from "../controllers/post.controller";
import auth, { UserRole } from "../middlewares/auth.middleware";

const router = Router();

// Get post by author id (must be before /:id route)
router.get(
    '/my-posts',
    auth(UserRole.USER, UserRole.ADMIN),
    PostController.getMyPosts
);

// Get a post by id
router.get('/:id', PostController.getPostById);

// Get all posts
router.get('/', PostController.getAllPost);

// Create post
router.post('/',auth(UserRole.USER, UserRole.ADMIN), PostController.createPost);

// Update user own post
router.patch(
    '/:id',
    auth(UserRole.ADMIN, UserRole.USER),
    PostController.updatePost
);

// Delete post user own post
router.delete(
    '/:id',
    auth(UserRole.ADMIN, UserRole.USER),
    PostController.deletePost
)

export default router;