// API service for LADI backend integration

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://ladi-backend.onrender.com/api' : 'http://localhost:5000/api');

interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  };
}

interface SignupRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

interface EvaluationResponse {
  id: number;
  user_id: number;
  original_filename: string;
  status: string;
  file_size: number;
  text_length: number;
  download_url: string | null;
  error_message: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  line_editing_score: number | null;
  plot_score: number | null;
  character_score: number | null;
  flow_score: number | null;
  worldbuilding_score: number | null;
  readiness_score: number | null;
  overall_score: number | null;
  evaluation_results: any;
}

interface UploadEvaluationResponse {
  success: boolean;
  evaluation_id: number;
  message: string;
  download_url: string | null;
  results: any;
}

interface EvaluationsResponse {
  evaluations: EvaluationResponse[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

class ApiService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('ladi_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      ...options.headers,
    };

    // Only set Content-Type if not already set (for FormData compatibility)
    if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    // Add authorization header if token exists
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      // Create an AbortController for timeout
      const controller = new AbortController();
      // Increase timeout for evaluation requests (5 minutes)
      const timeout = options.body instanceof FormData ? 300000 : 30000;
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok) {
        // Handle token expiration
        if (response.status === 401 && data.error?.includes('expired')) {
          // Try to refresh token
          const refreshResult = await this.refreshToken();
          if (refreshResult.success) {
            // Retry the original request with new token
            const retryResponse = await fetch(url, {
              ...options,
              headers: {
                ...headers,
                'Authorization': `Bearer ${this.token}`,
              },
              signal: controller.signal,
            });
            
            const retryData = await retryResponse.json();
            if (!retryResponse.ok) {
              throw new Error(retryData.error || retryData.message || 'API request failed after token refresh');
            }
            return { success: true, data: retryData };
          } else {
            // Token refresh failed, redirect to login
            this.logout();
            throw new Error('Session expired. Please log in again.');
          }
        }
        throw new Error(data.error || data.message || 'API request failed');
      }

      return { success: true, data };
    } catch (error) {
      console.error('API request failed:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timeout - the evaluation is taking longer than expected. Please try again or contact support if the issue persists.',
        };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      this.token = response.data.access_token;
      localStorage.setItem('ladi_token', this.token);
    }

    return response;
  }

  async signup(userData: SignupRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data) {
      this.token = response.data.access_token;
      localStorage.setItem('ladi_token', this.token);
    }

    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.token = null;
      localStorage.removeItem('ladi_token');
    }
  }

  async refreshToken(): Promise<ApiResponse<{ access_token: string }>> {
    const refreshToken = localStorage.getItem('ladi_refresh_token');
    if (!refreshToken) {
      return { success: false, error: 'No refresh token available' };
    }

    const response = await this.request<{ access_token: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (response.success && response.data) {
      this.token = response.data.access_token;
      localStorage.setItem('ladi_token', this.token);
    }

    return response;
  }

  // Password reset methods
  async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyResetToken(token: string): Promise<ApiResponse<{ user: any }>> {
    // Set the token temporarily for this request
    const originalToken = this.token;
    this.token = token;
    
    try {
      const response = await this.request<{ user: any }>('/auth/verify-reset-token', {
        method: 'POST',
      });
      return response;
    } finally {
      // Restore original token
      this.token = originalToken;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    // Set the token temporarily for this request
    const originalToken = this.token;
    this.token = token;
    
    try {
      const response = await this.request<{ message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ new_password: newPassword }),
      });
      return response;
    } finally {
      // Restore original token
      this.token = originalToken;
    }
  }

  // File upload and evaluation methods
  async uploadAndEvaluate(file: File): Promise<ApiResponse<UploadEvaluationResponse>> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${API_BASE_URL}/upload/evaluate`;
    
    const headers: HeadersInit = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle token expiration for upload requests
        if (response.status === 401 && data.error?.includes('expired')) {
          // Try to refresh token
          const refreshResult = await this.refreshToken();
          if (refreshResult.success) {
            // Retry the upload with new token
            const retryResponse = await fetch(url, {
              method: 'POST',
              headers: {
                ...headers,
                'Authorization': `Bearer ${this.token}`,
              },
              body: formData,
            });
            
            const retryData = await retryResponse.json();
            if (!retryResponse.ok) {
              throw new Error(retryData.error || retryData.message || 'Upload failed after token refresh');
            }
            return { success: true, data: retryData };
          } else {
            // Token refresh failed, redirect to login
            this.logout();
            throw new Error('Session expired. Please log in again.');
          }
        }
        throw new Error(data.error || data.message || 'Upload failed');
      }

      return { success: true, data };
    } catch (error) {
      console.error('Upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  // Template-based evaluation method
  async uploadAndEvaluateWithTemplate(manuscriptFile: File, templateFile: File): Promise<ApiResponse<UploadEvaluationResponse & { template_info: any }>> {
    const formData = new FormData();
    formData.append('manuscript', manuscriptFile);
    formData.append('template', templateFile);

    const url = `${API_BASE_URL}/upload/evaluate-with-template`;
    
    const headers: HeadersInit = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle token expiration for upload requests
        if (response.status === 401 && data.error?.includes('expired')) {
          // Try to refresh token
          const refreshResult = await this.refreshToken();
          if (refreshResult.success) {
            // Retry the upload with new token
            const retryResponse = await fetch(url, {
              method: 'POST',
              headers: {
                ...headers,
                'Authorization': `Bearer ${this.token}`,
              },
              body: formData,
            });
            
            const retryData = await retryResponse.json();
            if (!retryResponse.ok) {
              throw new Error(retryData.error || retryData.message || 'Template evaluation failed after token refresh');
            }
            return { success: true, data: retryData };
          } else {
            // Token refresh failed, redirect to login
            this.logout();
            throw new Error('Session expired. Please log in again.');
          }
        }
        throw new Error(data.error || data.message || 'Template evaluation failed');
      }

      return { success: true, data };
    } catch (error) {
      console.error('Template evaluation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Template evaluation failed',
      };
    }
  }

  async getEvaluation(evaluationId: number): Promise<ApiResponse<EvaluationResponse>> {
    return this.request<EvaluationResponse>(`/upload/evaluation/${evaluationId}`);
  }

  async getEvaluations(): Promise<ApiResponse<EvaluationsResponse>> {
    // Add retry logic for evaluations endpoint
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await this.request<EvaluationsResponse>('/user/evaluations');
        if (response.success) {
          return response;
        }
        lastError = new Error(response.error || 'Failed to get evaluations');
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.warn(`Attempt ${attempt} failed for getEvaluations:`, error);
        
        if (attempt < 3) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    return {
      success: false,
      error: lastError?.message || 'Failed to get evaluations after 3 attempts'
    };
  }

  async downloadEvaluation(evaluationId: number): Promise<ApiResponse<{ download_url: string }>> {
    return this.request<{ download_url: string }>(`/upload/evaluation/${evaluationId}/download`);
  }

  async directDownloadEvaluation(evaluationId: number): Promise<void> {
    // This will redirect directly to the download URL
    const url = `${API_BASE_URL}/upload/evaluation/${evaluationId}/direct-download`;
    const headers: HeadersInit = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    // Open in new tab/window
    window.open(url, '_blank');
  }

  async publicDownload(fileKey: string): Promise<ApiResponse<{ download_url: string }>> {
    return this.request<{ download_url: string }>(`/upload/public/download/${fileKey}`);
  }

  async publicEvaluationDownload(evaluationId: number): Promise<ApiResponse<{ download_url: string; filename: string; evaluation_id: number }>> {
    return this.request<{ download_url: string; filename: string; evaluation_id: number }>(`/upload/public/evaluation/${evaluationId}/download`);
  }

  async publicEvaluationRedirect(evaluationId: number): Promise<void> {
    try {
      // Direct download implementation - fetch PDF as blob and download
      const url = `${API_BASE_URL}/upload/public/evaluation/${evaluationId}/download-file`;
      
      console.log('Starting direct download from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `evaluation_${evaluationId}.pdf`;
      link.style.display = 'none';
      
      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      window.URL.revokeObjectURL(downloadUrl);
      
      console.log('Direct download completed successfully');
      
    } catch (error) {
      console.error('Direct download failed:', error);
      throw new Error('Download failed. Please try again or contact support.');
    }
  }

  async downloadEvaluationPdf(evaluationId: number): Promise<void> {
    try {
      // Primary method: Direct blob download - this ensures file downloads instead of navigating
      const url = `${API_BASE_URL}/upload/public/evaluation/${evaluationId}/download-file`;
      
      console.log('Starting direct blob download from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `evaluation_${evaluationId}.pdf`;
      link.style.display = 'none';
      
      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      window.URL.revokeObjectURL(downloadUrl);
      
      console.log('Direct blob download completed successfully');
      
    } catch (error) {
      console.error('Direct blob download failed:', error);
      
      // Fallback: Try URL method as backup
      try {
        console.log('Trying fallback URL method...');
        const response = await this.publicEvaluationDownload(evaluationId);
        
        if (!response.success || !response.data?.download_url) {
          throw new Error('Failed to get download URL');
        }
        
        // Force download by creating a blob from the URL
        const urlResponse = await fetch(response.data.download_url);
        const urlBlob = await urlResponse.blob();
        
        const downloadUrl = window.URL.createObjectURL(urlBlob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `evaluation_${evaluationId}.pdf`;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.URL.revokeObjectURL(downloadUrl);
        
        console.log('Fallback URL method completed successfully');
        
      } catch (fallbackError) {
        console.error('Fallback method also failed:', fallbackError);
        throw new Error('Download failed. Please try again or contact support.');
      }
    }
  }

  async clearOldDownloadUrls(): Promise<ApiResponse<{ message: string; count: number }>> {
    return this.request<{ message: string; count: number }>('/upload/clear-old-download-urls', {
      method: 'POST',
    });
  }

  async deleteEvaluation(evaluationId: number): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/user/evaluations/${evaluationId}`, {
      method: 'DELETE',
    });
  }

  async bulkDeleteEvaluations(evaluationIds: number[]): Promise<ApiResponse<{ 
    message: string; 
    deleted_count: number; 
    deleted_files_count: number; 
    deleted_evaluation_ids: number[] 
  }>> {
    return this.request<{ 
      message: string; 
      deleted_count: number; 
      deleted_files_count: number; 
      deleted_evaluation_ids: number[] 
    }>('/user/evaluations/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ evaluation_ids: evaluationIds }),
    });
  }

  async updateEvaluation(evaluationId: number, updateData: any): Promise<ApiResponse<EvaluationResponse>> {
    return this.request<EvaluationResponse>(`/user/evaluations/${evaluationId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async getEvaluationsWithFilters(filters: {
    status?: string;
    page?: number;
    per_page?: number;
    search?: string;
  } = {}): Promise<ApiResponse<EvaluationsResponse>> {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.per_page) params.append('per_page', filters.per_page.toString());
    if (filters.search) params.append('search', filters.search);
    
    return this.request<EvaluationsResponse>(`/user/evaluations?${params.toString()}`);
  }

  async testPdfContent(evaluationId: number): Promise<ApiResponse<any>> {
    return this.request<any>(`/upload/public/evaluation/${evaluationId}/test-pdf`);
  }

  // User profile methods
  async getUserProfile(): Promise<ApiResponse<any>> {
    return this.request('/user/profile');
  }

  async updateUserProfile(profileData: any): Promise<ApiResponse<any>> {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(passwordData: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/user/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  }

  async deleteAccount(accountData: {
    password: string;
    confirmation: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/user/delete-account', {
      method: 'POST',
      body: JSON.stringify(accountData),
    });
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.token;
  }

  async checkAuthStatus(): Promise<boolean> {
    try {
      const response = await this.getUserProfile();
      return response.success;
    } catch (error) {
      return false;
    }
  }

  getToken(): string | null {
    return this.token;
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('ladi_token', token);
  }

  // Template management methods
  async getTemplates(): Promise<ApiResponse<{ templates: any[]; total: number }>> {
    return this.request<{ templates: any[]; total: number }>('/templates');
  }

  async uploadTemplate(file: File, metadata: { name: string; description: string; template_type: string }): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('template', file);
    formData.append('name', metadata.name);
    formData.append('description', metadata.description);
    formData.append('template_type', metadata.template_type);

    return this.request<any>('/templates', {
      method: 'POST',
      headers: {
        // Remove Content-Type to let browser set it with boundary for FormData
      },
      body: formData,
    });
  }

  async updateTemplate(templateId: number, updateData: { name?: string; description?: string; is_active?: boolean }): Promise<ApiResponse<any>> {
    return this.request<any>(`/templates/${templateId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async deleteTemplate(templateId: number): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/templates/${templateId}`, {
      method: 'DELETE',
    });
  }

  async downloadTemplate(templateId: number): Promise<void> {
    const response = await this.request<any>(`/templates/${templateId}/download`);
    
    if (response.success && response.data) {
      const { download_url, filename } = response.data;
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = download_url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      throw new Error(response.error || 'Download failed');
    }
  }

  // Enhanced evaluation with multiple methods
  async uploadAndEvaluateWithMethods(
    file: File, 
    evaluationMethods: string[] = ['basic'], 
    selectedTemplates: number[] = []
  ): Promise<ApiResponse<UploadEvaluationResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add evaluation methods
    evaluationMethods.forEach(method => {
      formData.append('evaluation_methods', method);
    });
    
    // Add selected templates
    selectedTemplates.forEach(templateId => {
      formData.append('selected_templates', templateId.toString());
    });

    return this.request<UploadEvaluationResponse>('/upload/evaluate', {
      method: 'POST',
      headers: {
        // Remove Content-Type to let browser set it with boundary for FormData
      },
      body: formData,
    });
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();

// Export types for use in components
export type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  EvaluationResponse,
  UploadEvaluationResponse,
  EvaluationsResponse,
};
