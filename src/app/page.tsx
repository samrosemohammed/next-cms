import Link from "next/link";
import dashboardImg from "../../public/demo-4.png";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { MaxWidthWrapper } from "@/components/MaxWidthWrapper";
import { buttonVariants } from "@/components/ui/button";
import { NavBar } from "@/components/NavBar";

export default function Home() {
  return (
    <>
      <NavBar />
      <MaxWidthWrapper className="mb-12 mt-28 sm:mt-14 flex justify-center text-center items-center flex-col">
        <div className="mx-auto mb-4 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full border px-7 py-2 shadow-md backdrop-blur transition-all hover:border-gray-300 hover:bg-white/50">
          <p>Classroom is now public !</p>
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Empowering Classrooms, <br /> Enhancing{" "}
          <span className="text-green-600">Learning.</span>
        </h1>
        <p className="mt-5 text-lg text-[hsl(var(--muted-foreground))] sm:text-xl md:text-2xl max-w-prose">
          A seamless, interactive platform designed for modern education.
          Connect, collaborate, and inspire anytime, anywhere.
        </p>
        <Link
          className={buttonVariants({
            size: "lg",
            className: "mt-5",
          })}
          href={"/dashboard"}
          target="_blank"
        >
          Get started <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </MaxWidthWrapper>
      <div>
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="mt-16 flow-root sm:mt-24">
            <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <Image
                className="rounded-md bg-white shadow-2xl ring-1 ring-gray-900/10"
                src={dashboardImg}
                alt="Product Preview"
                width={1915}
                height={903}
                quality={100}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
