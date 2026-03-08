import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import prisma from "./db.js";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            const email = profile.emails[0].value;

            let user = await prisma.user.findUnique({
                where: { email },
            });

            if (!user) {
                user = await prisma.user.create({
                    data: {
                        email,
                        name: profile.displayName,
                        googleId: profile.id,
                    },
                });
            }

            done(null, user);
        },
    ),
);
