import Image from "next/image";

export function BrandLogo({ inverted = false, compactOnMobile = true }: { inverted?: boolean; compactOnMobile?: boolean }) {
  return (
    <div
      className={`inline-flex items-center ${inverted ? "rounded-md bg-white px-2" : ""}`}
      aria-label="ITSOL - Talents Trusted Partner"
    >
      {/* Mobile / iPad: icon-only logo */}
      <Image
        src="/brand/itsol-logo-icon.png"
        alt="ITSOL"
        width={40}
        height={40}
        className={`h-10 w-10 object-contain ${compactOnMobile ? "md:hidden" : "hidden"}`}
        priority
      />
      {/* Desktop: full logo with text */}
      <Image
        src="/brand/itsol-logo.png"
        alt="ITSOL - Talents Trusted Partner"
        width={190}
        height={73}
        className={`h-10 w-auto object-contain ${compactOnMobile ? "hidden md:block" : "block"}`}
        priority
      />
    </div>
  );
}
