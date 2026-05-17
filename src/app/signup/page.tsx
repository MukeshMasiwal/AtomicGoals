import { redirect } from "next/navigation";

export default function SignupPage() {
  // Since we use a passwordless OTP flow, signup and login are the same process.
  // Redirect users to the unified login page.
  redirect("/login");
}
