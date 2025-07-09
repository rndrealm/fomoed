import authAssets from "@/lib/assets/auth";
import Image from "next/image";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative">
      <div className="absolute inset-0 w-screen h-screen">
        <Image src={authAssets.BgIllustration} alt="Auth page pattern" fill />
      </div>
      {children}
    </div>
  );
}
