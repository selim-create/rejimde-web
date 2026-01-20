interface Props {
  className?: string;
}

export default function TariftenIcon({ className = "w-5 h-5" }: Props) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Tariften logosu - basit bir yemek/tarif ikonu */}
      <path 
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" 
        fill="currentColor"
      />
      <path 
        d="M12 6c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2s2-.9 2-2V8c0-1.1-.9-2-2-2zm-1 6V8c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1s-1-.45-1-1z" 
        fill="currentColor"
      />
      <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
    </svg>
  );
}
