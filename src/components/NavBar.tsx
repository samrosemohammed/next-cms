import Link from "next/link";
import { MaxWidthWrapper } from "./MaxWidthWrapper";
import { buttonVariants } from "@/components/ui/button";

export const NavBar = () => {
  return (
    <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b">
          <Link href={"/"}>Classroom.</Link>
          <div className="hidden items-center space-x-4 sm:flex">
            <Link href="/">About</Link>
            <Link href="/">Features</Link>
            <Link
              className={buttonVariants({
                size: "lg",
              })}
              href="/login"
            >
              Login
            </Link>
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};
