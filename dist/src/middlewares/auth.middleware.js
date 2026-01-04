import { auth as betterAuth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";
export var UserRole;
(function (UserRole) {
    UserRole["USER"] = "USER";
    UserRole["ADMIN"] = "ADMIN";
})(UserRole || (UserRole = {}));
// auth middleware 
const auth = (...roles) => {
    return async (req, res, next) => {
        // get user session
        try {
            console.log(req.headers);
            const session = await betterAuth.api.getSession({
                headers: fromNodeHeaders(req.headers),
            });
            if (!session) {
                return res.status(401).json({
                    success: false,
                    message: "You are not authorized!"
                });
            }
            if (!session.user.emailVerified) {
                return res.status(403).json({
                    success: false,
                    message: "Email verification required please verify your email",
                });
            }
            req.user = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                role: session.user.role || UserRole.USER,
                emailVerified: session.user.emailVerified
            };
            if (roles.length && !roles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: "Forbiden! You don't have permission to access this resource"
                });
            }
            next();
        }
        catch (error) {
            console.log("X Error: ", error);
        }
    };
};
export default auth;
