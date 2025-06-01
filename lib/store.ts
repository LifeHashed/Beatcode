import { create } from 'zustand';
import { Question, UserProgress, Favorite } from '@prisma/client';

interface QuestionWithRelations extends Question {
  topics: { name: string }[];
  progress?: UserProgress[];
  favorites?: Favorite[];
}

interface AppState {
  questions: QuestionWithRelations[];
  filters: {
    company: string;
    difficulty: string;
    topic: string;
    status: string;
    timeline: string;
  };
  searchTerm: string;
  setQuestions: (questions: QuestionWithRelations[]) => void;
  setFilters: (filters: Partial<AppState['filters']>) => void;
  setSearchTerm: (term: string) => void;
  getFilteredQuestions: () => QuestionWithRelations[];
}

export const useAppStore = create<AppState>((set, get) => ({
  questions: [],
  filters: {
    company: '',
    difficulty: '',
    topic: '',
    status: '',
    timeline: '',
  },
  searchTerm: '',
  
  setQuestions: (questions) => set({ questions }),
  setFilters: (newFilters) => 
    set((state) => ({ 
      filters: { ...state.filters, ...newFilters } 
    })),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  
  getFilteredQuestions: () => {
    const { questions, filters, searchTerm } = get();
    
    let filteredQuestions = questions.filter((question) => {
      const matchesSearch = !searchTerm || 
        question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.topics.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.company.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCompany = !filters.company || 
        question.company.toLowerCase().includes(filters.company.toLowerCase());
      
      const matchesDifficulty = !filters.difficulty || 
        question.difficulty === filters.difficulty;
      
      const matchesTopic = !filters.topic || 
        question.topics.toLowerCase().includes(filters.topic.toLowerCase());
      
      const matchesTimeline = !filters.timeline || 
        question.timeline === filters.timeline;
      
      return matchesSearch && matchesCompany && matchesDifficulty && 
             matchesTopic && matchesTimeline;
    });

    // Add sorting functionality
    return filteredQuestions.sort((a, b) => {
      // Default sort by title ascending
      return a.title.localeCompare(b.title);
    });
  },
}));
