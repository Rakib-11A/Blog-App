import { Request, Response } from "express"
export const notFount = (req: Request, res: Response) => {
    res.status(404).json({
        message: "Route Not Found",
        path: req.originalUrl,
        data: Date()
    })
}