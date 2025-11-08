
import { GoogleGenAI } from "@google/genai";

// A robust check for API_KEY
if (!process.env.API_KEY) {
  // In a real app, you might render an error message to the user
  console.error("API_KEY environment variable not set. Gemini API calls will fail.");
  // throw new Error("API_KEY environment variable not set. Please configure it before running the application.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const analyzeStatementOfPurpose = async (statement: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Lỗi: API Key chưa được cấu hình. Vui lòng liên hệ quản trị viên.";
  }
  try {
    const prompt = `Bạn là một cố vấn tuyển sinh đại học chuyên nghiệp. Phân tích Tuyên bố mục đích sau đây về sự rõ ràng, ngữ pháp và sức mạnh của nó. Cung cấp phản hồi mang tính xây dựng theo một vài gạch đầu dòng bằng tiếng Việt. Phản hồi phải mang tính khích lệ và hữu ích.
---
Tuyên bố: "${statement}"
---
Phản hồi của bạn:`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error analyzing statement with Gemini:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
        return "Đã xảy ra lỗi: API key không hợp lệ. Vui lòng kiểm tra lại cấu hình.";
    }
    return "Đã xảy ra lỗi khi phân tích tuyên bố của bạn. Vui lòng thử lại sau.";
  }
};