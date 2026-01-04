import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";
import { config } from "../config/env";
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use true for port 465, false for port 587
    auth: {
        user: `${config.appUser}`,
        pass: `${config.appPass}`,
    },
});
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    trustedOrigins: [process.env.APP_URL],
    advanced: {
        disableCSRFCheck: true,
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "USER",
                required: true,
            },
            phone: {
                type: "string",
                required: false
            },
            status: {
                type: "string",
                defaultValue: "ACTIVE",
                required: false
            }
        }
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
        requireEmailVerification: true
    },
    emailVerification: {
        sendOnSignUp: true, // sudhu sign up er somoi email sent korbe
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url, token }, request) => {
            const verificationUrl = `${config.appUrl}/veriry-email?token=${token}`;
            try {
                const info = await transporter.sendMail({
                    from: '"Prisma Blog" <prismablog@mrh.email>',
                    to: user.email,
                    subject: "Please verify you email",
                    text: "As-salamu-alaikum..............?", // Plain-text version of the message
                    html: `<!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="utf-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Email Verification</title>
                            <style>
                                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f7; color: #333; margin: 0; padding: 0; }
                                .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
                                .header { background-color: #4f46e5; color: white; padding: 30px; text-align: center; }
                                .content { padding: 30px; line-height: 1.6; }
                                .btn-container { text-align: center; margin: 30px 0; }
                                .btn { background-color: #4f46e5; color: white !important; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; }
                                .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
                                .note { font-size: 13px; color: #9ca3af; margin-top: 20px; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>Prisma Blog</h1>
                                </div>
                                <div class="content">
                                    <p>As-salamu-alaikum,</p>
                                    <p>আমাদের <b>Prisma Blog</b>-এ যোগ দেওয়ার জন্য ${user.name}আপনাকে ধন্যবাদ! আপনার অ্যাকাউন্টটি সক্রিয় করতে নিচের বাটনে ক্লিক করে ইমেইলটি ভেরিফাই করুন:</p>
                                    
                                    <div class="btn-container">
                                        <a href="${verificationUrl}" class="btn">Verify Email Address</a>
                                    </div>

                                    <p>লিঙ্কটি যদি কাজ না করে, তবে নিচের URL-টি কপি করে ব্রাউজারে পেস্ট করুন:</p>
                                    <p style="word-break: break-all; color: #4f46e5; font-size: 14px;">${verificationUrl}</p>
                                    
                                    <p class="note">যদি আপনি এই অ্যাকাউন্টটি তৈরি না করে থাকেন, তবে এই ইমেইলটি ইগনোর করুন।</p>
                                </div>
                                <div class="footer">
                                    &copy; 2026 Prisma Blog. All rights reserved.
                                </div>
                            </div>
                        </body>
                        </html>`, // HTML version of the message
                });
                console.log("Message sent:", info.messageId);
            }
            catch (error) {
                console.log("X Error: ", error);
            }
        },
    },
    socialProviders: {
        google: {
            clientId: `${config.googleClientId}`,
            clientSecret: `${config.googleClientSecret}`,
            accessType: "offline",
            prompt: "select_account consent",
        },
    },
});
