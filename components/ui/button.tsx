import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const buttonVariants=cva("inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50",{variants:{variant:{default:"bg-[#185d52] text-white hover:bg-[#12483f]",outline:"border bg-white hover:bg-[#eef4f2]",ghost:"hover:bg-[#e9efed]"}},defaultVariants:{variant:"default"}});
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>,VariantProps<typeof buttonVariants>{asChild?:boolean}
export function Button({className,variant,asChild=false,...props}:ButtonProps){const Comp=asChild?Slot:"button";return <Comp className={cn(buttonVariants({variant}),className)} {...props}/>;}
