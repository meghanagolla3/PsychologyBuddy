import { RingSpinner } from "@/src/components/ui/Spinners"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  message?: string
  className?: string
}

export function LoadingSpinner({ 
  size = "md", 
  message = "Loading...", 
  className = "" 
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <RingSpinner size={size} color="blue" className="mb-2" />
      {message && (
        <p className="text-gray-600 text-sm">{message}</p>
      )}
    </div>
  )
}

export function FullPageLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" message={message} />
    </div>
  )
}

