import { validate } from '../utils/validator.js';

export class CodeModule {
  /** @param {import('../client.js').OrevaClient} client */
  constructor(client) {
    this._client  = client;
    this._history = [];
  }

  /**
   * Generate clean, functional web code from a text prompt.
   * @param {string} prompt
   * @param {object} [options]
   * @param {'html/css/javascript'|'html'|'css'|'javascript'} [options.language='html/css/javascript']
   * @param {boolean} [options.keepHistory=true]
   * @returns {Promise<{ code: string, usage: object }>}
   */
  async generate(prompt, { language = 'html/css/javascript', keepHistory = true } = {}) {
    validate({ prompt }, { prompt: 'string:required' });

    const payload = {
      prompt,
      language,
      mode: 'code',
      conversationHistory: keepHistory ? this._history.slice(-10) : [],
    };

    const data = await this._client.request('/api/generate-code', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (keepHistory) {
      this._history.push(
        { role: 'user',      content: prompt },
        { role: 'assistant', content: data.code }
      );
    }

    return data;
  }

  /**
   * Edit existing code with a follow-up instruction.
   * @param {string} instruction
   * @param {string} currentCode
   * @returns {Promise<{ code: string, usage: object }>}
   */
  async edit(instruction, currentCode) {
    validate({ instruction, currentCode }, {
      instruction: 'string:required',
      currentCode: 'string:required',
    });

    const prompt = `Current code:\n\n${currentCode}\n\nUser request: ${instruction}`;
    return this.generate(prompt);
  }

  /** Clear code conversation history. */
  clearHistory() {
    this._history = [];
  }
}
