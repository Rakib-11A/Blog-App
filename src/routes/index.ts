import { Router } from "express";
import postRoutes from './post.routes';
import commentRoutes from './comment.routes'

const router = Router();

router.use('/posts', postRoutes);
router.use('/comments', commentRoutes)

export default router;
