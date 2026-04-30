import crypto from "crypto";
import axios from "axios";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "../config/env.js";

const mimeToExt = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const allowedContentTypes = new Set(Object.keys(mimeToExt));

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

function ensureContentType(contentType) {
  if (!contentType || !allowedContentTypes.has(contentType)) {
    throw new Error("Unsupported image type");
  }

  return contentType;
}

async function putAvatarObject({ buffer, contentType, userId }) {
  requireR2Config();

  if (!buffer || !userId) {
    throw new Error("Avatar upload payload is missing");
  }

  const safeContentType = ensureContentType(contentType);
  const ext = mimeToExt[safeContentType] || ".jpg";
  const key = `avatars/${userId}-${Date.now()}-${crypto.randomUUID()}${ext}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: env.r2Bucket,
      Key: key,
      Body: buffer,
      ContentType: safeContentType,
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

export async function uploadAvatarToR2(file, userId) {
  if (!file || !file.buffer) {
    throw new Error("Avatar upload payload is missing");
  }

  return putAvatarObject({
    buffer: file.buffer,
    contentType: file.mimetype,
    userId,
  });
}

export async function uploadAvatarUrlToR2(imageUrl, userId) {
  if (!imageUrl) {
    return null;
  }

  const response = await axios.get(imageUrl, {
    responseType: "arraybuffer",
    timeout: 8000,
    maxContentLength: 2 * 1024 * 1024,
    maxBodyLength: 2 * 1024 * 1024,
    validateStatus: (status) => status >= 200 && status < 300,
  });

  const contentType = response.headers?.["content-type"]?.split(";")[0]?.trim();
  const buffer = Buffer.from(response.data);

  return putAvatarObject({
    buffer,
    contentType,
    userId,
  });
}
