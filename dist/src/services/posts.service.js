import { prisma } from "../lib/prisma";
const createPost = async (data, userId) => {
    const result = await prisma.post.create({
        data: {
            ...data,
            authorId: userId
        }
    });
    return result;
};
const getPostById = async (id) => {
    const result = await prisma.post.findUnique({
        where: { id }
    });
    return result;
};
const getAllPost = async () => {
    const result = await prisma.post.findMany();
    return result;
};
const searchPostByTitle = async (title) => {
    const result = await prisma.post.findMany({
        where: {
            title: {
                contains: title,
                mode: 'insensitive'
            }
        }
    });
    return result;
};
export const postService = {
    createPost,
    getPostById,
    getAllPost,
    searchPostByTitle
};
