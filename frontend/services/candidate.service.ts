import { USE_MOCK } from "@/lib/config";
import { ENDPOINTS } from "@/constants/endpoints";
import { mockCandidate } from "@/mocks/mockApi";
import type { CandidateDashboardData, CandidateProfile, Resume } from "@/types/candidate";
import type { Job, RecommendedJob } from "@/types/job";
import { api, getBlob, http } from "./api";

export const candidateService = {
  dashboard: (): Promise<CandidateDashboardData> => (USE_MOCK ? mockCandidate.dashboard() : http.get(ENDPOINTS.candidate.dashboard)),
  getProfile: (): Promise<CandidateProfile> => (USE_MOCK ? mockCandidate.getProfile() : http.get(ENDPOINTS.candidate.profile)),
  updateProfile: (patch: Partial<CandidateProfile>): Promise<CandidateProfile> =>
    USE_MOCK ? mockCandidate.updateProfile(patch) : http.put(ENDPOINTS.candidate.profile, patch),

  /** Returns the stored avatar URL. */
  async uploadAvatar(file: File): Promise<string> {
    if (USE_MOCK) return mockCandidate.uploadAvatar(file);
    const form = new FormData();
    form.append("file", file);
    const res = await api.post<{ url: string }>(ENDPOINTS.candidate.avatar, form);
    return res.data.url;
  },

  getResume: (): Promise<Resume | null> => (USE_MOCK ? mockCandidate.getResume() : http.get(ENDPOINTS.candidate.resume)),

  /** multipart/form-data, field name "file" (UNCONFIRMED — see API_INTEGRATION.md). Parsing is done by the backend. */
  async uploadResume(file: File, onProgress?: (pct: number) => void): Promise<Resume> {
    if (USE_MOCK) return mockCandidate.uploadResume(file, onProgress);
    const form = new FormData();
    form.append("file", file);
    const res = await api.post<Resume>(ENDPOINTS.candidate.resumeUpload, form, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => e.total && onProgress?.(Math.round((e.loaded / e.total) * 100)),
    });
    return res.data;
  },
  deleteResume: (): Promise<void> => (USE_MOCK ? mockCandidate.deleteResume() : http.delete(ENDPOINTS.candidate.resume)),
  downloadResume: (fallbackName = "resume"): Promise<{ blob: Blob; fileName: string }> =>
    USE_MOCK ? mockCandidate.downloadResume() : getBlob(ENDPOINTS.candidate.resumeDownload, fallbackName),

  /** Recommendations come from the AI engine. `matchScore` is displayed as returned and never calculated here. */
  recommendedJobs: (): Promise<RecommendedJob[]> =>
    USE_MOCK ? mockCandidate.recommended() : http.get(ENDPOINTS.candidate.recommendedJobs),

  /** Jobs the candidate has saved/bookmarked. */
  savedJobs: (): Promise<Job[]> => (USE_MOCK ? mockCandidate.savedJobs() : http.get(ENDPOINTS.candidate.bookmarks)),
  /** Returns the new bookmarked state. */
  async toggleBookmark(jobId: string, currentlyBookmarked: boolean): Promise<boolean> {
    if (USE_MOCK) return mockCandidate.toggleBookmark(jobId);
    if (currentlyBookmarked) await http.delete(`${ENDPOINTS.candidate.bookmarks}/${jobId}`);
    else await http.post(ENDPOINTS.candidate.bookmarks, { jobId });
    return !currentlyBookmarked;
  },
};
