import { CommentStatus, Post, PostStatus } from "../../generated/prisma/client";
import { PostWhereInput } from "../../generated/prisma/models";
import { prisma } from "../lib/prisma";
import { UserRole } from "../middlewares/auth.middleware";

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
        },
        include: {
            _count: {
                select: { comments: true }
            }
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
        // Verify post exists first
        await tx.post.findUniqueOrThrow({
            where: {
                id
            }
        });

        // Increment views
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
        where: { id },
        include: {
            comments: {
                where: {
                    parentId: null,
                    status: CommentStatus.APPROVED
                },
                orderBy: {createdAt: "desc"},
                include: {
                    replies: {
                        where: {
                            status: CommentStatus.APPROVED
                        },
                        orderBy: { createdAt: "asc"},
                        include: {
                            replies: {
                                where: {
                                    status: CommentStatus.APPROVED
                                },
                                orderBy: { createdAt: "asc"}
                            }
                        }
                    }
                },
            },
            _count: {
                select: { comments: true}
            }
        }
    });

    return postData;
    })
}

const getMyPosts = async(authorId: string) => {

    return await prisma.$transaction(async(tsx) => {
     await tsx.user.findUniqueOrThrow({
        where: {
            id: authorId,
            status: 'ACTIVE'
        }
    });
    
    const result = await tsx.post.findMany({
        where: {
            authorId
        },
        orderBy: { createdAt: "desc"},
        include: {
            _count: {
                select: {
                    comments: true
                }
            }
        }
    });

    const totalPost = await tsx.post.aggregate({
        _count: {
            id: true
        },
        where: {
            authorId
        }
    });

    return result;
    // return {
    //     data: result,
    //     totalPost
    // }
    })
}
const updatePost = async(id: string, data: Partial<Post>, authorId: string, isAdmin: boolean) => {

    return await prisma.$transaction(async(tsx) => {
        const postData = await tsx.post.findUniqueOrThrow({
            where: {
                id
            },
            select: {
                id: true,
                authorId: true
            }
        });
        if(!isAdmin && postData.authorId !== authorId){
            throw new Error("Your are not admin/creator of this post");
        }

        if(!isAdmin){
            delete data.isFeatured
        }

        return await tsx.post.update({
            where: {
                id
            },
            data
        });
    })
}

const deletePost = async(postId: string, authorId: string, isAdmin: boolean) => {
    return await prisma.$transaction(async(tsx) => {
        const postData = await tsx.post.findUniqueOrThrow({
            where: {
                id: postId
            },
            select: {
                id: true,
                authorId: true
            }
        });

        if(!isAdmin && (postData.authorId !== authorId)){
            throw new Error("Your are not admin/creator of this post");
        }

        return await tsx.post.delete({
            where: {
                id: postId
            }
        })
    })
}
const getStats = async () => {
    return await prisma.$transaction(async(tsx) => {
        const [totalPosts, publishedPosts, draftPosts, archivePosts, totalComments, totalUsers, adminCounts, userCounts, totalViews] = 
        await Promise.all([
            await tsx.post.count(),
            await tsx.post.count({ where: { status: PostStatus.PUBLISHED}}),
            await tsx.post.count({ where: { status: PostStatus.DRAFT}}),
            await tsx.post.count({ where: { status: PostStatus.ARCHIVED}}),
            await tsx.comment.count(),
            await tsx.comment.count({ where: {status: CommentStatus.APPROVED}}),
            await tsx.user.count(),
            await tsx.user.count({where: {role: "ADMIN"}}),
            await tsx.user.count({where: {role: "USER"}}),
            await tsx.post.aggregate({
                _sum: {views: true}
            })
        ])

        return {
            totalPosts,
            publishedPosts,
            draftPosts,
            archivePosts,
            totalComments,
            totalUsers,
            adminCounts,
            userCounts,
            totalViews
        }
    })
}
export const postService = {
    createPost,
    getPostById,
    getAllPost,
    getMyPosts,
    updatePost,
    deletePost,
    getStats
}