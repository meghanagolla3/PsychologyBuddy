import { toast as sonnerToast } from 'sonner';

interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export const useToast = () => {
  const toast = (props: ToastProps) => {
    if (props.variant === 'destructive') {
      sonnerToast.error(props.title, {
        description: props.description,
      });
    } else {
      sonnerToast.success(props.title, {
        description: props.description,
      });
    }
  };

  return { toast };
};

export type { ToastProps };
