import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import axios from "axios";
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

            let userPhoto =
                profile?.photos?.[0]?.value ||
                profile?._json?.picture ||
                profile?._json?.pictureUrl ||
                null;

            if (!userPhoto && accessToken) {
                try {
                    const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
                        headers: { Authorization: `Bearer ${accessToken}` },
                        timeout: 8000,
                    });
                    userPhoto = response?.data?.picture || response?.data?.pictureUrl || userPhoto;
                } catch {
                    // Ignore profile-photo lookup failures.
                }
            }

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
                const shouldUpdatePhoto = !user.userPhoto || /googleusercontent\.com/i.test(user.userPhoto);
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        googleId: user.googleId || profile.id,
                        userPhoto: shouldUpdatePhoto ? (userPhoto || user.userPhoto) : user.userPhoto,
                        name: user.name || profile.displayName,
                    },
                });
            }

            done(null, user);
        },
    ),
);