import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-bold">
      <span className="text-xl">DEVOPS ENGINEERS</span>
    </Link>
  );
}
