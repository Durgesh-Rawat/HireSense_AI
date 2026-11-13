/**
 * All backend endpoint paths live here so they can be changed in ONE place once the backend contract is confirmed.
 * Entries marked (proposed) are in the original project brief; entries marked (extra) are additional endpoints
 * the UI needs and must be confirmed/added by the backend developer. See API_INTEGRATION.md.
 */
export const ENDPOINTS = {
  auth: {
    register: "/api/auth/register", // (proposed)
    login: "/api/auth/login", // (proposed)
    me: "/api/auth/me", // (proposed)
    logout: "/api/auth/logout", // (proposed)
    forgotPassword: "/api/auth/forgot-password", // (extra)
    resetPassword: "/api/auth/reset-password", // (extra)
  },
  candidate: {
    dashboard: "/api/candidates/dashboard", // (extra)
    profile: "/api/candidates/profile", // (proposed)
    avatar: "/api/candidates/profile/avatar", // (extra)
    resume: "/api/candidates/resume", // (extra) GET metadata, DELETE
    resumeUpload: "/api/candidates/resume/upload", // (proposed)
    resumeDownload: "/api/candidates/resume/download", // (extra)
    applications: "/api/candidates/applications", // (proposed)
    recommendedJobs: "/api/candidates/recommended-jobs", // (proposed)
    bookmarks: "/api/candidates/bookmarks", // (extra)
  },
  public: {
    contact: "/api/contact", // (extra)
  },
  notifications: {
    list: "/api/notifications", // (extra)
    markRead: (id: string) => `/api/notifications/${id}/read`, // (extra)
    markAllRead: "/api/notifications/read-all", // (extra)
  },
  jobs: {
    list: "/api/jobs", // (proposed)
    detail: (id: string) => `/api/jobs/${id}`, // (proposed)
    create: "/api/jobs", // (proposed)
    update: (id: string) => `/api/jobs/${id}`, // (proposed)
    remove: (id: string) => `/api/jobs/${id}`, // (proposed)
    setActive: (id: string) => `/api/jobs/${id}/active`, // (extra)
  },
  applications: {
    create: "/api/applications", // (proposed)
    list: "/api/applications", // (proposed)
    updateStatus: (id: string) => `/api/applications/${id}/status`, // (proposed)
  },
  recruiter: {
    dashboard: "/api/recruiter/dashboard", // (proposed)
    jobs: "/api/recruiter/jobs", // (proposed)
    applicants: "/api/recruiter/applicants", // (extra) cross-job applicants list
    jobApplicants: (jobId: string) => `/api/recruiter/jobs/${jobId}/applicants`, // (proposed)
    candidateDetails: (applicationId: string) => `/api/recruiter/applications/${applicationId}`, // (extra)
    candidateResume: (candidateId: string) => `/api/recruiter/candidates/${candidateId}/resume`, // (extra)
    company: "/api/recruiter/company", // (extra)
    companyLogo: "/api/recruiter/company/logo", // (extra)
  },
  screening: {
    analyze: (jobId: string) => `/api/screening/${jobId}/analyze`, // (proposed)
    results: (jobId: string) => `/api/screening/${jobId}/results`, // (proposed)
  },
  admin: {
    dashboard: "/api/admin/dashboard", // (proposed)
    users: "/api/admin/users", // (proposed)
    userStatus: (id: string) => `/api/admin/users/${id}/status`, // (extra)
    jobs: "/api/admin/jobs", // (proposed)
    jobModeration: (id: string) => `/api/admin/jobs/${id}/moderation`, // (extra)
    analytics: "/api/admin/analytics", // (proposed)
  },
} as const;
