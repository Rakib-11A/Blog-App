import { asyncHandler } from "../utils/asyncHandler";
import { postService } from "../services/posts.service";
const createPost = asyncHandler(async (req, res) => {
    console.log(req.user);
    const user = req.user;
    if (!user) {
        return res.status(400).json({
            success: false,
            message: "Unauthorized!, user"
        });
    }
    const result = await postService.createPost(req.body, user?.id);
    res.status(201).json({
        success: true,
        message: 'Post created successfully.. Alhamdulillah...',
        data: result,
    });
});
const getPostById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await postService.getPostById(id);
    if (!result) {
        return res.status(404).json({
            success: false,
            message: 'Post not found',
        });
    }
    res.status(200).json({
        success: true,
        data: result,
    });
});
const getAllPost = asyncHandler(async (req, res) => {
    const { search } = req.query;
    let result;
    if (search && typeof search === 'string') {
        console.log("Search Post by title route hit....Alhamdulillah....");
        result = await postService.searchPostByTitle(search);
    }
    else {
        result = await postService.getAllPost();
    }
    if (!result || result.length === 0) {
        return res.status(404).json({
            success: false,
            message: "Post not found",
        });
    }
    res.status(200).json({
        success: true,
        data: result
    });
});
const searchPostByTitle = asyncHandler(async (req, res) => {
    console.log("Search Post by title route hit....Alhamdulillah....");
});
export const PostController = {
    createPost,
    getPostById,
    getAllPost,
    searchPostByTitle
};
