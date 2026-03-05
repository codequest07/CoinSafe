import * as React from "react";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      richColors
      closeButton
      position="top-right"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#1D1D1D] group-[.toaster]:text-slate-50 group-[.toaster]:border-[#272727] group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-slate-300",
          actionButton:
            "group-[.toast]:bg-emerald-500 group-[.toast]:text-slate-950",
          cancelButton:
            "group-[.toast]:bg-slate-800 group-[.toast]:text-slate-200",
        },
      }}
      {...props}
    />
  );
}

