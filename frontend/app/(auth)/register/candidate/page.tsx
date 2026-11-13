import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Candidate registration" };

export default function CandidateRegisterPage() {
  return <RegisterForm role="CANDIDATE" />;
}
