import authAssets from "@/lib/assets/auth";
import Image from "next/image";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative bg-black w-full overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-screen w-[105vw]">
        <Image src={authAssets.BgIllustration} alt="Auth page pattern" fill />
      </div>
      {children}
    </div>
  );
}
