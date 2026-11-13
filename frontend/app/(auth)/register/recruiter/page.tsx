import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Recruiter registration" };

export default function RecruiterRegisterPage() {
  return <RegisterForm role="RECRUITER" />;
}
