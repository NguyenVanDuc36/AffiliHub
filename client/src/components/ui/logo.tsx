import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  textClassName?: string;
}

export function Logo({ className, textClassName }: LogoProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <svg 
        className="h-8 w-8 text-primary mr-2" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M3.38451 9.14502L7.6153 3.94474C9.00393 2.26736 11.5288 2.26736 12.9174 3.94474L17.1482 9.14502C17.9787 10.1428 17.9787 11.5773 17.1482 12.5752L12.9174 17.7755C11.5288 19.4529 9.00393 19.4529 7.6153 17.7755L3.38451 12.5752C2.55407 11.5773 2.55407 10.1428 3.38451 9.14502Z" 
          fill="currentColor"
        />
        <path 
          d="M13.3845 4.14502L17.6153 9.34531C19.0039 11.0227 19.0039 13.5773 17.6153 15.2547L13.3845 20.4549C12.554 21.4528 11.1385 21.4528 10.308 20.4549L6.07726 15.2547C4.68863 13.5773 4.68863 11.0227 6.07726 9.34531L10.308 4.14502C11.1385 3.14716 12.554 3.14716 13.3845 4.14502Z" 
          fill="currentColor"
          fillOpacity="0.5"
        />
      </svg>
      <span className={cn("font-poppins font-bold text-2xl bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent", textClassName)}>
        AffiliHub
      </span>
    </div>
  );
}
