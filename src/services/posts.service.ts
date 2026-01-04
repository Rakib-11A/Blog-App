import { skip } from "node:test";
import { Post, PostStatus } from "../../generated/prisma/client";
import { PostWhereInput } from "../../generated/prisma/models";
import { prisma } from "../lib/prisma";

const createPost = async (data: Omit<Post, "id" | "createdAt" | "updatedAt" | 'authorId'>, userId: string) => {
    const result = await prisma.post.create({
        data: {
            ...data,
            authorId: userId
        }
    });

    return result;
} 


const getAllPost = async (
    { search, tags, isFeatured, status, authorId, page, limit, skip, sortBy, sortOrder }: {
    search: string | undefined,
    tags: string[] | [],
     isFeatured: boolean | undefined,
     status: PostStatus | undefined,
     authorId: string | undefined
     page: number,
     limit: number,
     skip: number,
     sortBy: string,
     sortOrder: string ;
}) => {
    const andCondition: PostWhereInput[] = [];

    // search thakle search re nibo
    if(search){
        andCondition.push(
            {
                    OR: [
                        {
                            title: {
                                contains: search as string,
                                mode: "insensitive"
                            }
                        },
                        {
                            content: {
                                contains: search as string,
                                mode: "insensitive"
                            }
                        },
                        {
                            tags: {
                                has: search as string
                            }
                        }
                    ]
                }
        )
    }
    // tag thakle tag re nibo
    if(tags.length > 0) {
        andCondition.push(
            {
                    tags: {
                        hasEvery: tags
                    }
                }
        )
    }
    // searching by isFeatured
    if(typeof isFeatured === "boolean") {
        andCondition.push({
            isFeatured
        })
    }
    // Filtering by status
    if(status) {
        andCondition.push({
            status
        })
    }
    // Filtering by authorId
    if(authorId){
        andCondition.push({
            authorId
        })
    }
    
    const result = await prisma.post.findMany({
        take: limit,
        skip,
        where: {
            AND: andCondition
        },
        orderBy: {
            [sortBy]: sortOrder
        }
    });
    const totalData = await prisma.post.count({
        where: {
            AND: andCondition      
        }
    });

    return {
        data: result,
        pagination: {
            totalData,
            page,
            limit,
            totalPages: Math.ceil(totalData / limit)
        }
    }
}

const getPostById = async (id: string) => {
    return await prisma.$transaction(async (tx) => {
        await tx.post.update({
            where: {
                id
            },
            data: {
                views: {
                    increment: 1
                }
            }
        });
    
    const postData = await tx.post.findUnique({
        where: { id }
    });

    return postData;
    })
}

export const postService = {
    createPost,
    getPostById,
    getAllPost
}