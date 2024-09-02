import { Orbit } from "lucide-react";

export default function ComingSoon() {
  return (
    <div className="h-svh dark:bg-[#000000]">
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
        <Orbit size={72} className="dark:text-white" />
        <h1 className="text-4xl font-bold dark:text-white leading-tight">
          Coming Soon 👀
        </h1>
        <p className="text-center text-muted-foreground">
          This page has not been created yet. <br />
          Stay tuned though!
        </p>
      </div>
    </div>
  );
}
