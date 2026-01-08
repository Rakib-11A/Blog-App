import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { postService } from "../services/posts.service";
import { PostStatus } from "../../generated/prisma/enums";
import paginationHelper from "../helpers/paginationSortingHelpers";
import { userInfo } from "node:os";

const createPost = asyncHandler(async (req: Request, res: Response) => {
    console.log(req.user)
    const user = req.user;
    if (!user) {
        return res.status(400).json({
            success: false,
            message: "Unauthorized!, user"
        })
    }
    const result = await postService.createPost(req.body, user?.id as string);
    res.status(201).json({
        success: true,
        message: 'Post created successfully.. Alhamdulillah...',
        data: result,
    });
});

const getPostById = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        if(!id){
            throw new Error("The post id is invalid.....");
        }
        const result = await postService.getPostById(id);
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Post not found...."
            });
        }
        res.status(200).json({
            success: true,
            data: result
        })
});

const getAllPost = asyncHandler(async (req: Request, res: Response) => {
    const { search } = req.query;
    const searchString = typeof search === "string" ? search : undefined;

    const tags = req.query.tags ? (req.query.tags as string).split(",") : [];

    const isFeatured = req.query.isFeatured ?
        req.query.isFeatured === "true" ?
            true : req.query.isFeatured === "false" ?
                false : undefined : undefined;

    const status = req.query.status as PostStatus | undefined;

    const authorId = req.query.authorId as string | undefined;

    const { page, limit, skip, sortBy, sortOrder } = paginationHelper(req.query);

    const result = await postService.getAllPost({ search: searchString, tags, isFeatured, status, authorId, page, limit, skip, sortBy, sortOrder });

    if (!result) {
        return res.status(404).json({
            success: false,
            message: "Post not found"
        });
    }

    res.status(200).json({
        success: true,
        data: result
    });

});

const getMyPosts = asyncHandler(async (req: Request, res: Response) => {
    try {
        const result = await postService.getMyPosts(req.user?.id as string);
        res.status(200).json({
            success: true,
            data: result
        })
    } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : "Post not found";
        res.status(404).json({
            success: true,
            error: errorMessage
        })
    }
});

const updatePost = asyncHandler (async(req: Request, res: Response) => {
    try{
        const isAdmin = req.user?.role === 'ADMIN';
        if(!req.user) {
            throw new Error("You are not authorized.....");
        }
        const result = await postService.updatePost(req.params.id as string, req.body, req.user?.id as string, isAdmin);

        res.status(200).json({
            success: true,
            data: result
        })
    }catch(error){
        const errorMessage = (error instanceof Error) ? error.message : "Update post failed";
        res.status(400).json({
            success: false,
            error: errorMessage
        })
    }
})

const deletePost = asyncHandler( async(req: Request, res: Response) => {
    try{
        const isAdmin = req.user?.role === 'ADMIN';
        const result = await postService.deletePost(req.params.id as string, req.user?.id as string, isAdmin as boolean);

        res.status(200).json({
            success: true,
            data: result
        })
    }catch(error){
        const errorMessage = (error instanceof Error) ? error.message : "Post deletion failed";
        res.status(401).json({
            success: false,
            error: errorMessage
        })
    }
});

const getStats = asyncHandler (async(req: Request, res: Response) => {
    
        const result = await postService.getStats();
        res.status(200).json({
            success: true,
            data: result
        });
    
})
export const PostController = {
    createPost,
    getPostById,
    getAllPost,
    getMyPosts,
    updatePost,
    deletePost,
    getStats
}