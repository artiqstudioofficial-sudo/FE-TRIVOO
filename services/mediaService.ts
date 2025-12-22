import type { ApiEnvelope, UploadMediaResponse } from "../types";
import http, { unwrap } from "./http";

type Envelope<T> = ApiEnvelope<T>;

export const mediaService = {
  /**
   * Upload 1 file (field: "file") ke /api/v1/media/upload
   * return URL
   */
  async uploadOne(file: File, purpose = "agent-products"): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("purpose", purpose);

    const res = await http.post<Envelope<UploadMediaResponse>>(
      "/media/upload",
      fd
    );

    const data = unwrap(res.data);
    return data.url;
  },

  /**
   * Upload banyak file (field: "files") ke /api/v1/media/upload
   * return array URL
   */
  async uploadMany(
    files: File[],
    purpose = "agent-products"
  ): Promise<string[]> {
    if (!files.length) return [];

    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));
    fd.append("purpose", purpose);

    const res = await http.post<Envelope<UploadMediaResponse>>(
      "/media/upload",
      fd
    );

    const data = unwrap(res.data);
    return (data.items || []).map((x) => x.url).filter(Boolean);
  },
};
