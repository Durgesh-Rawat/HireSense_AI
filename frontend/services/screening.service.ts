import { USE_MOCK } from "@/lib/config";
import { ENDPOINTS } from "@/constants/endpoints";
import { mockScreening } from "@/mocks/mockApi";
import type { AnalyzeResponse, ScreeningFilters, ScreeningResult } from "@/types/screening";
import { cleanParams, http } from "./api";

/** The frontend only displays results produced by the AI engine (via the backend). It never scores anything itself. */
export const screeningService = {
  getResults: (jobId: string, filters: ScreeningFilters = {}): Promise<ScreeningResult[]> =>
    USE_MOCK ? mockScreening.results(jobId, filters) : http.get(ENDPOINTS.screening.results(jobId), { params: cleanParams(filters) }),
  analyze: (jobId: string): Promise<AnalyzeResponse> =>
    USE_MOCK ? mockScreening.analyze(jobId) : http.post(ENDPOINTS.screening.analyze(jobId)),
};
