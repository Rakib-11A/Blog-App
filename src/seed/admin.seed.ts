import { prisma } from "../lib/prisma";
import { UserRole } from "../middlewares/auth.middleware";

async function seedAdmin() {
    try {
        console.log("********* Admin Seeding Started ***********");
        const adminData = {
            name: "Mr. Admin 1",
            email: "admin1@blog.com",
            password: "admin1234",
            phone: "01303129853",
            role: UserRole.ADMIN,
            status: "ACTIVE"
        };
        console.log("-------------- Checking Admin Exist or Not ------------------  ");
        const existingUser = await prisma.user.findUnique({
            where: {
                email: adminData.email
            }
        });

        if (existingUser) {
            throw new Error("User already exists.....");
        }
        const singUpAdmin = await fetch('http://localhost:5000/api/auth/sign-up/email', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Origin": "http://localhost:5000"
            },
            body: JSON.stringify(adminData)
        });

        console.log("********* Admin Create Successfully ***************");

        if(singUpAdmin.ok){
            await prisma.user.update({
                where: {
                    email: adminData.email
                },
                data: {
                    emailVerified: true
                }
            });
        }
        console.log("=============== Email verification status updated =============");
        console.log(singUpAdmin);


    } catch (error) {
        console.log("X Error on admin creation", error);
    }
}

seedAdmin();