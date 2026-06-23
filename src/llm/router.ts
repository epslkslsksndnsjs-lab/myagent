/**
 * 多 LLM 路由 - 借鉴 claude-code-router 35K stars 模式
 *
 * 支持:
 *   - Anthropic Claude
 *   - OpenAI GPT
 *   - DeepSeek
 *   - Qwen
 *   - Mock(本地测试)
 *
 * 路由策略 + 降级链
 */

import { logger } from '../utils/logger';
import { MockLLM } from './mock';

export interface LLMConfig {
  anthropic?: string;
  openai?: string;
  deepseek?: string;
  qwen?: string;
  mock?: boolean;  // 强制使用 mock
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  provider?: 'anthropic' | 'openai' | 'deepseek' | 'qwen' | 'mock';
}

export interface ChatResponse {
  content: string;
  provider: string;
  model: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export class LLMRouter {
  private config: LLMConfig;
  private mockLLM: MockLLM;

  constructor(config: LLMConfig) {
    this.config = config;
    this.mockLLM = new MockLLM();
  }

  getAvailableProviders(): string[] {
    const available: string[] = [];
    if (this.config.mock) available.push('mock');
    if (this.config.anthropic) available.push('anthropic');
    if (this.config.openai) available.push('openai');
    if (this.config.deepseek) available.push('deepseek');
    if (this.config.qwen) available.push('qwen');
    return available;
  }

  async chat(req: ChatRequest): Promise<ChatResponse> {
    // Mock 模式优先
    if (req.provider === 'mock' || (this.config.mock && !req.provider)) {
      return await this.mockLLM.chat(req);
    }

    const provider = req.provider || this.selectProvider();

    try {
      switch (provider) {
        case 'mock':
          return await this.mockLLM.chat(req);
        case 'anthropic':
          return await this.callAnthropic(req);
        case 'openai':
          return await this.callOpenAI(req);
        case 'deepseek':
          return await this.callDeepSeek(req);
        case 'qwen':
          return await this.callQwen(req);
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }
    } catch (error) {
      logger.error(`LLM ${provider} failed:`, error);
      return await this.fallback(req, provider);
    }
  }

  private selectProvider(): 'anthropic' | 'openai' | 'deepseek' | 'qwen' | 'mock' {
    if (this.config.mock) return 'mock';
    if (this.config.anthropic) return 'anthropic';
    if (this.config.openai) return 'openai';
    if (this.config.deepseek) return 'deepseek';
    if (this.config.qwen) return 'qwen';
    // 都没配就用 mock
    return 'mock';
  }

  private async callAnthropic(req: ChatRequest): Promise<ChatResponse> {
    const { default: Anthropic } = await import('@anthropic-ai/sdk').catch(() => {
      throw new Error('@anthropic-ai/sdk not installed');
    });
    const client = new Anthropic({ apiKey: this.config.anthropic });

    const systemMessage = req.messages.find(m => m.role === 'system');
    const userMessages = req.messages.filter(m => m.role !== 'system');

    const response = await client.messages.create({
      model: 'claude-sonnet-4.5',
      max_tokens: req.maxTokens || 1024,
      system: systemMessage?.content,
      messages: userMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    });

    const content = response.content[0];
    return {
      content: content.type === 'text' ? content.text : '',
      provider: 'anthropic',
      model: 'claude-sonnet-4.5',
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  }

  private async callOpenAI(req: ChatRequest): Promise<ChatResponse> {
    const { default: OpenAI } = await import('openai').catch(() => {
      throw new Error('openai not installed');
    });
    const client = new OpenAI({ apiKey: this.config.openai });

    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: req.maxTokens || 1024,
      messages: req.messages.map(m => ({ role: m.role, content: m.content })),
    });

    return {
      content: response.choices[0].message.content || '',
      provider: 'openai',
      model: 'gpt-4o',
      usage: {
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0,
      },
    };
  }

  private async callDeepSeek(req: ChatRequest): Promise<ChatResponse> {
    const { default: OpenAI } = await import('openai').catch(() => {
      throw new Error('openai not installed');
    });
    const client = new OpenAI({
      apiKey: this.config.deepseek,
      baseURL: 'https://api.deepseek.com',
    });

    const response = await client.chat.completions.create({
      model: 'deepseek-chat',
      max_tokens: req.maxTokens || 1024,
      messages: req.messages.map(m => ({ role: m.role, content: m.content })),
    });

    return {
      content: response.choices[0].message.content || '',
      provider: 'deepseek',
      model: 'deepseek-chat',
      usage: {
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0,
      },
    };
  }

  private async callQwen(req: ChatRequest): Promise<ChatResponse> {
    const { default: OpenAI } = await import('openai').catch(() => {
      throw new Error('openai not installed');
    });
    const client = new OpenAI({
      apiKey: this.config.qwen,
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    });

    const response = await client.chat.completions.create({
      model: 'qwen-max',
      max_tokens: req.maxTokens || 1024,
      messages: req.messages.map(m => ({ role: m.role, content: m.content })),
    });

    return {
      content: response.choices[0].message.content || '',
      provider: 'qwen',
      model: 'qwen-max',
      usage: {
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0,
      },
    };
  }

  private async fallback(req: ChatRequest, failedProvider: string): Promise<ChatResponse> {
    // 降级链
    const chain: Array<'mock' | 'anthropic' | 'openai' | 'deepseek' | 'qwen'> = ['mock', 'anthropic', 'openai', 'deepseek', 'qwen'];
    const startIndex = chain.indexOf(failedProvider as any);

    for (let i = startIndex + 1; i < chain.length; i++) {
      const provider = chain[i];
      const key = this.config[provider];
      if (!key) continue;

      try {
        return await this.chat({ ...req, provider });
      } catch (e) {
        logger.error(`Fallback to ${provider} failed:`, e);
      }
    }

    // 全部失败,降级到 mock
    logger.warn('All real LLMs failed, using mock');
    return await this.mockLLM.chat(req);
  }
}
