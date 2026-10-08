import { redirect } from "next/navigation";

// Legacy email+password form was retired in favour of the passwordless OTP
// flow in the header's UserMenu. Redirect any lingering /login visits home.
export default function LoginPage() {
  redirect("/");
}
