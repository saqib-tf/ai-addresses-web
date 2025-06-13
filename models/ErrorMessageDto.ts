export interface ErrorMessageDto {
  message: string;
  detail?: string;
  errors?: Record<string, string[]>;
}
