import { Router } from "express";
import { commentController } from "../controllers/comment.controller";
import auth, { UserRole } from "../middlewares/auth.middleware";

const router = Router();

router.post(
    '/',
    auth(UserRole.USER,UserRole.ADMIN),
    commentController.createComment
)

router.get(
    '/:commentId',
    commentController.commentById
);

router.get(
    '/author/:author',
    commentController.commentByAuthorid
);

router.delete(
    '/:commentId',
    auth(UserRole.ADMIN, UserRole.USER),
    commentController.deleteComment
);

router.patch(
    '/:commentId',
    auth(UserRole.ADMIN, UserRole.USER),
    commentController.updateComment
);

router.patch(
    '/moderate/:commentId',
    auth(UserRole.ADMIN),
    commentController.modarateComment
);

export default router;