import { PhoneFrame } from "@/components/layout/PhoneFrame";
import { ModalHost } from "@/components/forms/ModalHost";

export default function PekerjaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PhoneFrame>{children}</PhoneFrame>
      <ModalHost />
    </>
  );
}
