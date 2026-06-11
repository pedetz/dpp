import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-xl border border-gray-200 bg-white shadow-sm", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-b border-gray-100 p-4", className)}>{children}</div>;
}

export function CardBody({ className, children }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4", className)}>{children}</div>;
}

export function CardFooter({ className, children }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("border-t border-gray-100 p-4", className)}>{children}</div>
  );
}
