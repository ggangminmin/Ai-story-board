import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateSummary(content: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '당신은 텍스트를 간결하게 요약하는 AI입니다. 핵심 내용을 2-3문장으로 요약해주세요.',
        },
        {
          role: 'user',
          content: `다음 내용을 요약해주세요:\n\n${content}`,
        },
      ],
      max_tokens: 200,
      temperature: 0.5,
    });

    return response.choices[0]?.message?.content || '요약을 생성할 수 없습니다.';
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return '요약 생성 중 오류가 발생했습니다.';
  }
}

export async function generateTags(content: string): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '텍스트에서 핵심 키워드를 추출하여 3-5개의 태그를 생성해주세요. 태그는 쉼표로 구분해주세요.',
        },
        {
          role: 'user',
          content: `다음 내용에서 태그를 추출해주세요:\n\n${content}`,
        },
      ],
      max_tokens: 100,
      temperature: 0.5,
    });

    const tagsString = response.choices[0]?.message?.content || '';
    return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return [];
  }
}

export async function generateLinkDescription(link: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'URL을 보고 해당 링크가 어떤 내용일지 한 문장으로 설명해주세요.',
        },
        {
          role: 'user',
          content: `다음 링크를 설명해주세요: ${link}`,
        },
      ],
      max_tokens: 100,
      temperature: 0.5,
    });

    return response.choices[0]?.message?.content || '링크 설명을 생성할 수 없습니다.';
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return '';
  }
}

export async function generateFileSummary(fileName: string, fileContent: string): Promise<string> {
  try {
    if (!fileContent || fileContent.trim().length === 0) {
      return `${fileName} 파일입니다.`;
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '파일의 내용을 간단히 요약해주세요. 한 문장으로 핵심만 설명하세요.',
        },
        {
          role: 'user',
          content: `파일명: ${fileName}\n\n내용:\n${fileContent.substring(0, 2000)}`,
        },
      ],
      max_tokens: 150,
      temperature: 0.5,
    });

    return response.choices[0]?.message?.content || `${fileName} 파일입니다.`;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return `${fileName} 파일입니다.`;
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('OpenAI Embedding API Error:', error);
    return [];
  }
}
