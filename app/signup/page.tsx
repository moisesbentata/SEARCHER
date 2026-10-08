import { redirect } from "next/navigation";

// Legacy signup form was retired in favour of the passwordless OTP flow.
// New accounts materialise on first successful payment.
export default function SignupPage() {
  redirect("/");
}
