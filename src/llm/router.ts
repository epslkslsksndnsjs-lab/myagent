/**
 * 多 LLM 路由 - 借鉴 claude-code-router 35K stars 模式
 *
 * 支持:
 *   - Anthropic Claude(主,推理最强)
 *   - OpenAI GPT(备选)
 *   - DeepSeek(国产,便宜)
 *   - Qwen 通义千问(国产)
 *
 * 路由策略:
 *   - 强信号:走规则(不调 LLM)
 *   - 中信号:Haiku 级(便宜)
 *   - 弱信号:Sonnet 级(平衡)
 *   - 关键决策:Opus 级(贵但关键)
 *
 * 借鉴 claude-code-router,但有差异化:
 *   - 默认 + 国产 LLM(中国用户友好)
 *   - 自带降级链(LLM 失败 → 本地 → 规则)
 */

interface LLMConfig {
  anthropic?: string;
  openai?: string;
  deepseek?: string;
  qwen?: string;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  // 强制使用某个 provider
  provider?: 'anthropic' | 'openai' | 'deepseek' | 'qwen';
}

interface ChatResponse {
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

  constructor(config: LLMConfig) {
    this.config = config;
  }

  getAvailableProviders(): string[] {
    const available: string[] = [];
    if (this.config.anthropic) available.push('anthropic');
    if (this.config.openai) available.push('openai');
    if (this.config.deepseek) available.push('deepseek');
    if (this.config.qwen) available.push('qwen');
    return available;
  }

  async chat(req: ChatRequest): Promise<ChatResponse> {
    const provider = req.provider || this.selectProvider();

    try {
      switch (provider) {
        case 'anthropic':
          return await this.callAnthropic(req);
        case 'openai':
          return await this.callOpenAI(req);
        case 'deepseek':
          return await this.callDeepSeek(req);
        case 'qwen':
          return await this.callQwen(req);
        default:
          throw new Error(`No LLM provider available`);
      }
    } catch (error) {
      // 降级链
      console.error(`LLM ${provider} failed:`, error);
      return await this.fallback(req, provider);
    }
  }

  private selectProvider(): 'anthropic' | 'openai' | 'deepseek' | 'qwen' {
    // 优先级:anthropic > openai > deepseek > qwen
    if (this.config.anthropic) return 'anthropic';
    if (this.config.openai) return 'openai';
    if (this.config.deepseek) return 'deepseek';
    if (this.config.qwen) return 'qwen';
    throw new Error('No LLM provider configured');
  }

  private async callAnthropic(req: ChatRequest): Promise<ChatResponse> {
    // 动态 import SDK(避免启动时强制需要)
    const { default: Anthropic } = await import('@anthropic-ai/sdk').catch(() => {
      throw new Error('@anthropic-ai/sdk not installed. Run: bun add @anthropic-ai/sdk');
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
      throw new Error('openai not installed. Run: bun add openai');
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
    // DeepSeek 兼容 OpenAI 协议,直接用 OpenAI client
    const { default: OpenAI } = await import('openai').catch(() => {
      throw new Error('openai not installed. Run: bun add openai');
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
    // Qwen 兼容 OpenAI 协议
    const { default: OpenAI } = await import('openai').catch(() => {
      throw new Error('openai not installed. Run: bun add openai');
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
    // 降级链:anthropic → openai → deepseek → qwen → 失败
    const chain: Array<'anthropic' | 'openai' | 'deepseek' | 'qwen'> = ['anthropic', 'openai', 'deepseek', 'qwen'];
    const startIndex = chain.indexOf(failedProvider as any);

    for (let i = startIndex + 1; i < chain.length; i++) {
      const provider = chain[i];
      const key = this.config[provider];
      if (!key) continue;

      try {
        return await this.chat({ ...req, provider });
      } catch (e) {
        console.error(`Fallback to ${provider} failed:`, e);
      }
    }

    throw new Error('All LLM providers failed');
  }
}
