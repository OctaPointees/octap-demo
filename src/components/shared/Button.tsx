import { Button as Base, type ButtonProps } from "@base-ui/react";
import { cn } from "../../utils/cn";

export function Button({ className, ...props }: ButtonProps) {
  return <Base {...props} className={cn("btn", className)} />;
}
