import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { postService } from "../services/posts.service";
import { PostStatus } from "../../generated/prisma/enums";
import paginationHelper from "../helpers/paginationSortingHelpers";

const createPost = asyncHandler(async (req: Request, res: Response) => {
    console.log(req.user)
    const user = req.user;
    if(!user){
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
    // if(!id){
    //     throw new Error("Post id is requiredl!!!");
    // }
    const result = await postService.getPostById(id);
    if(!result){
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

   const {page, limit, skip, sortBy, sortOrder} = paginationHelper(req.query);

   const result = await postService.getAllPost({search: searchString, tags, isFeatured, status, authorId, page, limit, skip, sortBy, sortOrder});

   if(!result){
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



export const PostController = {
    createPost,
    getPostById,
    getAllPost
}