"use client";

import Image from "next/image";

export default function NotezyIcon({ size = 28 }: { size?: number }) {
  return (
    <Image
      src="/icons/575d6b91-2f68-446b-a345-10eb04b8383f.png"
      alt="Notezy"
      width={size}
      height={size}
      style={{
        display: "block",
        borderRadius: Math.max(8, size * 0.22),
        objectFit: "cover",
        userSelect: "none",
      }}
    />
  );
}
