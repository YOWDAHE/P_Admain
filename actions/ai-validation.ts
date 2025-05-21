import axios from 'axios';

// Define structure for validation response
interface ValidationResponse {
    success: boolean;
    isEventRelated: boolean;
    confidence: number;
    message: string;
}

/**
 * Extracts plain text content from HTML strings
 * 
 * @param html - HTML content to extract text from
 * @returns Plain text content
 */
const extractTextFromHtml = (html: string): string => {
    
    return html
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

/**
 * Validates if the provided description is related to an event using AI
 * 
 * @param description - The event description to validate
 * @returns A promise with validation results
 */
export const validateEventDescription = async (
    description: string
): Promise<ValidationResponse> => {
    
    const plainTextDescription = extractTextFromHtml(description);
    console.log('Plain text description:', plainTextDescription);
    
    if (!plainTextDescription || plainTextDescription.trim().length < 15) {
        return {
            success: false,
            isEventRelated: false,
            confidence: 0,
            message: 'Description is too short or empty. Please provide more details.'
        };
    }

    const commonPlaceholders = ['desc', 'description', 'text', 'content', 'enter text here'];
    if (commonPlaceholders.some(placeholder => 
        plainTextDescription.toLowerCase().trim() === placeholder)) {
        return {
            success: false,
            isEventRelated: false,
            confidence: 0,
            message: 'Description appears to be a placeholder. Please provide actual event details.'
        };
    }

    try {
        const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        console.log("Using Gemini API Key:", geminiApiKey ? "Available" : "Not available");

        if (!geminiApiKey) {
            return simpleValidation(plainTextDescription);
        }

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
            {
                contents: [
                    {
                        parts: [
                            {
                                text: `Analyze if the following text is describing an event (like a concert, conference, meetup, party, etc.).
                                Respond with a JSON object only with properties: "isEventRelated" (boolean), "confidence" (number 0-1), "reason" (string).
                                Text to analyze: "${plainTextDescription}"`
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 200
                }
            }
        );

        // Parse the Gemini response
        const geminiResponse = response.data;
        const textResponse = geminiResponse.candidates[0].content.parts[0].text;
        
        // Extract JSON from the response text
        const jsonStr = textResponse.replace(/```json|```/g, '').trim();
        const parsedResponse = JSON.parse(jsonStr);

        return {
            success: true,
            isEventRelated: parsedResponse.isEventRelated,
            confidence: parsedResponse.confidence,
            message: parsedResponse.reason
        };
    } catch (error) {
        console.error('Error validating with Gemini:', error);
        // Fallback to simple validation in case of API error
        return simpleValidation(plainTextDescription);
    }
};

/**
 * A simple fallback validation approach using keyword matching
 * This is used when the AI API is not available
 */
const simpleValidation = (description: string): ValidationResponse => {
    const plainText = description.toLowerCase();

    const eventKeywords = [
        'event', 'workshop', 'concert', 'conference', 'meetup', 'webinar',
        'party', 'gathering', 'festival', 'celebration', 'lecture', 'seminar',
        'date', 'time', 'schedule', 'location', 'venue', 'attend', 'join',
        'register', 'rsvp', 'ticket', 'free', 'paid', 'host', 'speaker',
        'performer', 'artist', 'agenda', 'program'
    ];

    // Count words in the description (rough approximation)
    const wordCount = plainText.split(/\s+/).filter(Boolean).length;

    // If it's extremely short, reject it
    if (wordCount < 5) {
        return {
            success: true,
            isEventRelated: false,
            confidence: 0,
            message: 'Description is too brief to be an event description. Please provide more details.'
        };
    }

    const matchedKeywords = eventKeywords.filter(keyword =>
        plainText.includes(keyword)
    );

    const confidence = Math.min(matchedKeywords.length / 5, 1);
    const isEventRelated = confidence > 0.3;

    return {
        success: true,
        isEventRelated,
        confidence,
        message: isEventRelated
            ? `Content appears to be event-related with ${Math.round(confidence * 100)}% confidence.`
            : `Content doesn't appear to be describing an event. Consider adding more event details like date, time, location, etc.`
    };
}; 