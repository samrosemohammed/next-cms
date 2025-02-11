import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";

interface MaxWidthWrapperProps extends PropsWithChildren {
  className?: string;
}
export const MaxWidthWrapper = ({
  children,
  className,
}: MaxWidthWrapperProps) => {
  return (
    <div
      className={cn(
        "max-w-screen-xl w-full mx-auto px-2.5 md:px-20",
        className
      )}
    >
      {children}
    </div>
  );
};
