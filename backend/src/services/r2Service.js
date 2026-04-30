import crypto from "crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "../config/env.js";

const mimeToExt = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

function requireR2Config() {
  const missing = [];
  if (!env.r2AccountId) missing.push("R2_ACCOUNT_ID");
  if (!env.r2AccessKeyId) missing.push("R2_ACCESS_KEY_ID");
  if (!env.r2SecretAccessKey) missing.push("R2_SECRET_ACCESS_KEY");
  if (!env.r2Bucket) missing.push("R2_BUCKET");

  if (missing.length > 0) {
    throw new Error(`Missing R2 configuration: ${missing.join(", ")}`);
  }
}

function getPublicBaseUrl() {
  if (env.r2PublicBaseUrl) {
    return env.r2PublicBaseUrl.replace(/\/$/, "");
  }

  if (env.r2Bucket && env.r2AccountId) {
    return `https://${env.r2Bucket}.${env.r2AccountId}.r2.cloudflarestorage.com`;
  }

  return null;
}

const r2Client = new S3Client({
  region: "auto",
  endpoint: env.r2AccountId
    ? `https://${env.r2AccountId}.r2.cloudflarestorage.com`
    : undefined,
  credentials: env.r2AccessKeyId && env.r2SecretAccessKey
    ? {
        accessKeyId: env.r2AccessKeyId,
        secretAccessKey: env.r2SecretAccessKey,
      }
    : undefined,
  forcePathStyle: true,
});

export async function uploadAvatarToR2(file, userId) {
  requireR2Config();

  if (!file || !file.buffer) {
    throw new Error("Avatar upload payload is missing");
  }

  const ext = mimeToExt[file.mimetype] || ".jpg";
  const key = `avatars/${userId}-${Date.now()}-${crypto.randomUUID()}${ext}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: env.r2Bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  const publicBaseUrl = getPublicBaseUrl();
  if (!publicBaseUrl) {
    throw new Error("R2 public base URL is not configured");
  }

  return {
    key,
    url: `${publicBaseUrl}/${key}`,
  };
}
