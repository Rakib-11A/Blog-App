import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { commentService } from "../services/comment.service";
import { CommentStatus } from "../../generated/prisma/enums";

const createComment = asyncHandler(async (req: Request, res: Response) => {
    try {
        const user = req.user;
        req.body.authorId = user?.id;
        const result = await commentService.createComment(req.body);
        res.status(200).json({
            success: true,
            data: result
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error
        })
    }
});

const commentById = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params;
        const result = await commentService.commentById(commentId as string);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Comment fetched failed",
            Error: error
        })
    }
})
const commentByAuthorid = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { authorId } = req.params;
        const result = await commentService.commentByAuthorid(authorId as string);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: `Comment not found: ${error}`
        })
    }
});

const deleteComment = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params;
        const authorId = req.user?.id;
        const result = await commentService.deleteComment(commentId as string, authorId as string);
        res.status(200).json({
            success: true,
            data: result
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Comment deletion failed",
            Error: error
        })
    }
});

const updateComment = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params;
        const authorId = req.user?.id;
        const data: { content: string, status: CommentStatus } = req.body;
        const result = await commentService.updateComment(commentId as string, authorId as string, data);

        res.status(200).json({
            success: true,
            data: result
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "comment update failed..",
            error: error
        })
    }
});

const modarateComment = asyncHandler (async (req: Request, res: Response) => {
    try{
        const {commentId} = req.params;
        
        const result = await commentService.modarateComment(commentId as string, req.body);
        res.status(200).json({
            success: true,
            data: result
        })
    }catch(error){
        const errorMessage = (error instanceof Error) ? error.message : "Comment modaration failed";
        res.status(400).json({
            success: false,
            error: errorMessage
        })
    }
})
export const commentController = {
    createComment,
    commentById,
    commentByAuthorid,
    deleteComment,
    updateComment,
    modarateComment
}