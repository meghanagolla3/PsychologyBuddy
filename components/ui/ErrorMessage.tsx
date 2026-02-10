import { AlertCircle } from "lucide-react"
import { Button } from "./button"

interface ErrorMessageProps {
  title?: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function ErrorMessage({ 
  title = "Error", 
  message, 
  action,
  className = "" 
}: ErrorMessageProps) {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-xl p-4 ${className}`}>
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <p className="text-sm text-red-700 mt-1">{message}</p>
          {action && (
            <Button 
              onClick={action.onClick}
              className="mt-3 bg-red-600 hover:bg-red-700"
              size="sm"
            >
              {action.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export function AuthError({ onRetry }: { onRetry: () => void }) {
  return (
    <ErrorMessage
      title="Authentication Required"
      message="Please log in to access this page."
      action={{
        label: "Go to Login",
        onClick: onRetry
      }}
    />
  )
}
