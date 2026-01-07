import { CommentStatus } from "../../generated/prisma/enums";
import { prisma } from "../lib/prisma";

const createComment = async (payload: {
    content: string;
    postId: string;
    authorId: string;
    parentId?: string;
}) => {
    await prisma.post.findFirstOrThrow({
        where: {
            id: payload.postId
        }
    })
    if(payload.parentId){
        await prisma.comment.findFirstOrThrow({
            where: {
                id: payload.parentId
            }
        })
    }
    return await prisma.comment.create({
        data: {
            content: payload.content,
            postId: payload.postId,
            authorId: payload.authorId,
            parentId: payload.parentId && payload.parentId.trim() !== "" ? payload.parentId : null
        }
    })
}

const commentById = async (id: string) => {
    return await prisma.comment.findUnique({
        where: { id },
        include: {
            post: {
                select: {
                    id: true,
                    title: true,
                    views: true
                }
            }
        }
    });
}

const commentByAuthorid = async(authorId: string) => {
    return await prisma.comment.findMany({
        where: {
            authorId
        },
        orderBy: { createdAt: "desc"},
        include: {
            post: {
                select: {
                    id: true,
                    title: true,
                }
            }
        }
    });
}

// user can be able to delete own comment
// user muse be login
// should check it is user comment or not
const deleteComment = async (commentId: string, authorId: string) => {
    console.log(commentId);
    const commentData = await prisma.comment.findFirstOrThrow({
        where: {
            id: commentId,
            authorId
        }, 
        select: {
            id: true,
            content: true
        }
    });

    return await prisma.comment.delete({
        where: {
            id: commentId
        }
    });
}

const updateComment = async(commentId: string, authorId: string, data: { content?: string, status?: CommentStatus } ) => {
    console.log("Comment will be updated...");
    console.log({commentId, data, authorId});
    return await prisma.$transaction(async(tx) => {
        await tx.comment.findFirstOrThrow({
            where: {
                id: commentId,
                authorId
            }
        });
        return await tx.comment.update({
            where: {
                id: commentId
            },
            data
        });
    })
}
const modarateComment = async (id: string, data: { status: CommentStatus }) => {
    return await prisma.$transaction(async(tx) => {
        const commentData = await tx.comment.findUniqueOrThrow({
            where: {
                id
            },
            select: {
                id: true,
                status: true
            }
        });

        if(commentData.status === data.status){
            throw new Error(`Your provided status (${data.status}) is already up to date`);
        }

        return await tx.comment.update({
            where: {
                id
            },
            data
        });
    });
}
export const commentService = {
    createComment,
    commentById,
    commentByAuthorid,
    deleteComment,
    updateComment,
    modarateComment
}