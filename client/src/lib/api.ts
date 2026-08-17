import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export interface UploadResponse {
  message: string;
  document: {
    id: string;
    originalName: string;
    fileSize: number;
    processingStatus: string;
    pageCount: number;
    textLength: number;
    chunkCount: number;
    uploadedAt: string;
  };
}

export interface ChatResponse {
  answer: string;
  sources: Array<{
    chunkIndex: number;
    score: number;
    pageNumber?: number;
  }>;
}

export const uploadDocumentApi = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiClient.post<UploadResponse>("/documents/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const chatApi = async (documentId: string, question: string): Promise<ChatResponse> => {
  const response = await apiClient.post<ChatResponse>(`/documents/${documentId}/chat`, {
    question,
  });
  return response.data;
};
