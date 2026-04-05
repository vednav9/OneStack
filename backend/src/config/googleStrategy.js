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
            const email = profile?.emails?.[0]?.value?.trim().toLowerCase();
            if (!email) {
                return done(new Error("Google account does not provide email"));
            }

            const userPhoto = profile?.photos?.[0]?.value || null;

            let user = await prisma.user.findUnique({
                where: { email },
            });

            if (!user) {
                user = await prisma.user.create({
                    data: {
                        email,
                        name: profile.displayName,
                        googleId: profile.id,
                        userPhoto,
                    },
                });
            } else {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        googleId: user.googleId || profile.id,
                        userPhoto: userPhoto || user.userPhoto,
                        name: user.name || profile.displayName,
                    },
                });
            }

            done(null, user);
        },
    ),
);
