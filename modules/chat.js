import { validate } from '../utils/validator.js';

export class ChatModule {
  /** @param {import('../client.js').OrevaClient} client */
  constructor(client) {
    this._client  = client;
    this._history = [];
  }

  /**
   * Send a message and receive a conversational response.
   * @param {string} message
   * @param {object} [options]
   * @param {boolean} [options.keepHistory=true]
   * @param {'chat'|'code'} [options.mode='chat']
   * @returns {Promise<{ response: string, usage: object }>}
   */
  async send(message, { keepHistory = true, mode = 'chat' } = {}) {
    validate({ message }, { message: 'string:required' });

    const payload = {
      message,
      conversationHistory: keepHistory ? this._history.slice(-10) : [],
      mode,
    };

    const data = await this._client.request('/api/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (keepHistory) {
      this._history.push(
        { role: 'user',      content: message },
        { role: 'assistant', content: data.response }
      );
    }

    return data;
  }

  /**
   * Return a copy of the current conversation history.
   * @returns {Array<{ role: string, content: string }>}
   */
  getHistory() {
    return [...this._history];
  }

  /** Wipe conversation history. */
  clearHistory() {
    this._history = [];
  }
}
