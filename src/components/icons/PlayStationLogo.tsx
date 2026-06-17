import { cn } from "@/lib/utils";

interface PlayStationLogoProps {
  className?: string;
}

export function PlayStationLogo({ className }: PlayStationLogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("h-full w-full", className)}
      aria-hidden="true"
    >
      <path d="M8.985 2.596v17.548l3.915 1.261V6.688c0-.69.304-1.151.794-1.151.543 0 .82.47.82 1.151v10.54l3.915 1.262V5.462C18.429 3.178 17.067 2 15.308 2c-1.088 0-2.05.52-2.67 1.33l-.653-.21V2.596H8.985zM2 8.859v2.027l3.915 1.262v-2.028L2 8.859zm0 4.394v2.027l3.915 1.262v-2.028L2 13.253z" />
    </svg>
  );
}
