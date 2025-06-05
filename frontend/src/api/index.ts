import { API_URL, VECTOR_STORE_URL } from '../config';
import type { Message, EmpathyResponse } from '../types';

interface FeedbackResponse {
  status: string;
  message?: string;
}

export const sendFeedback = async (response: EmpathyResponse, liked: boolean): Promise<FeedbackResponse> => {
  const responseId = response.additional?.id;
  if (!responseId) {
    throw new Error('Response ID is required for feedback');
  }

  const payload = {
    message_id: responseId,
    liked: liked
  };

  console.log('Sending feedback request to:', `${API_URL}/api/feedback`);
  console.log('Request payload:', payload);

  try {
    const feedbackResponse = await fetch(`${API_URL}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!feedbackResponse.ok) {
      const errorText = await feedbackResponse.text();
      console.error('Feedback request failed:', feedbackResponse.status, errorText);
      throw new Error(`Server error: ${feedbackResponse.status} ${errorText}`);
    }

    return feedbackResponse.json();
  } catch (error) {
    console.error('Error sending feedback:', error);
    throw error;
  }
}; 