import { apiFetch } from "@/shared/utils/apiClient";
import type { PresignedUrlResult, UploadType } from "@/types";

export async function getPresignedUrls(
  uploadType: UploadType,
  files: { contentType: string }[],
): Promise<PresignedUrlResult> {
  return apiFetch<PresignedUrlResult>("/uploads/presigned-url", {
    method: "POST",
    body: JSON.stringify({ uploadType, files }),
  });
}

export async function uploadToS3(presignedUrl: string, file: File): Promise<void> {
  const res = await fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });
  if (!res.ok) throw new Error(`S3 upload failed: ${res.status}`);
}
