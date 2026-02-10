export const APIResponse = (success: boolean, message: string, data?: any) => ({
  success,
  message,
  data,
});

export const ApiResponse = {
  success: (data?: any, message: string = 'Success') => ({
    success: true,
    message,
    data,
  }),
  
  error: (message: string, code: number = 500) => ({
    success: false,
    message,
    error: {
      code,
      message,
    },
  }),
};
