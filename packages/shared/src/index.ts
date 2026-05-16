// Tipos e DTOs compartilhados entre API e Web
// Será preenchido durante o desenvolvimento

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
