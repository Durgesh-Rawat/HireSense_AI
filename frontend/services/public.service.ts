import { USE_MOCK } from "@/lib/config";
import { ENDPOINTS } from "@/constants/endpoints";
import { sleep } from "@/lib/utils";
import { http } from "./api";

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const publicService = {
  async sendContactMessage(payload: ContactPayload): Promise<void> {
    if (USE_MOCK) {
      await sleep(700);
      return;
    }
    await http.post(ENDPOINTS.public.contact, payload);
  },
};
