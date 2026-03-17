import { OrevaError, RateLimitError, AuthError, NetworkError } from './utils/errors.js';
import { ChatModule }  from './modules/chat.js';
import { CodeModule }  from './modules/code.js';
import { ImageModule } from './modules/image.js';
import { VideoModule } from './modules/video.js';

const DEFAULT_BASE_URL = 'https://oreva-7ti0.onrender.com';
const DEFAULT_TIMEOUT  = 30_000;
const DEFAULT_RETRIES  = 3;

export class OrevaClient {
  /**
   * @param {object} options
   * @param {string} options.apiKey
   * @param {string} [options.baseUrl]
   * @param {number} [options.timeout]
   * @param {number} [options.retries]
   */
  constructor({ apiKey, baseUrl = DEFAULT_BASE_URL, timeout = DEFAULT_TIMEOUT, retries = DEFAULT_RETRIES } = {}) {
    if (!apiKey) throw new AuthError('apiKey is required');

    this.apiKey  = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.timeout = timeout;
    this.retries = retries;

    this.chat  = new ChatModule(this);
    this.code  = new CodeModule(this);
    this.image = new ImageModule(this);
    this.video = new VideoModule(this);
  }

  /**
   * Core fetch wrapper with retry logic and error normalization.
   * @param {string} path
   * @param {RequestInit} init
   * @returns {Promise<any>}
   */
  async request(path, init = {}) {
    const url = `${this.baseUrl}${path}`;
    const headers = {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      ...init.headers,
    };

    let attempt = 0;

    while (attempt <= this.retries) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeout);

      try {
        const res = await fetch(url, { ...init, headers, signal: controller.signal });
        clearTimeout(timer);

        if (res.status === 401) throw new AuthError('Invalid API key');
        if (res.status === 429) {
          const retryAfter = Number(res.headers.get('Retry-After') ?? 60);
          throw new RateLimitError('Rate limit exceeded', retryAfter);
        }
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new OrevaError(body.error ?? `HTTP ${res.status}`, res.status);
        }

        return await res.json();
      } catch (err) {
        clearTimeout(timer);
        if (err instanceof OrevaError) throw err;
        if (err.name === 'AbortError') throw new NetworkError('Request timed out');
        if (attempt === this.retries) throw new NetworkError(err.message);
        attempt++;
      }
    }
  }
}
