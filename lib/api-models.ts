// If you don't have this file yet, create it to define types for your API responses

export interface Question {
  id: string;
  title: string;
  url: string;
  difficulty: string;
  company: string;
  timeline: string;
  createdAt: string;
  updatedAt: string;
  topics: Array<{
    id: string;
    name: string;
  }>;
  _count: {
    progress: number;
    favorites: number;
  };
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface QuestionsResponse {
  questions: Question[];
  pagination: PaginationInfo;
}
