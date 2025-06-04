export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  analysis?: string;
  timestamp: number;
} 