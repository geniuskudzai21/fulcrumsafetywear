import { googleAction } from "@/lib/actions/auth";
import SubmitButton from "./SubmitButton";

export default function GoogleForm({ next }: { next: string }) {
  return (
    <form action={googleAction}>
      <input type="hidden" name="next" value={next} />
      <SubmitButton variant="secondary">Continue with Google</SubmitButton>
    </form>
  );
}
