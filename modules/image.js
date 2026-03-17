import { validate } from '../utils/validator.js';
import { OrevaError } from '../utils/errors.js';

const POLL_INTERVAL = 2000;
const POLL_TIMEOUT  = 120_000;

export class ImageModule {
  /** @param {import('../client.js').OrevaClient} client */
  constructor(client) {
    this._client = client;
  }

  /**
   * Generate an image from a text prompt using oreva.v1.
   * Starts the job, polls until done, and returns the image URL.
   * @param {string} prompt
   * @param {object} [options]
   * @param {'16:9'|'1:1'|'9:16'} [options.aspectRatio='16:9']
   * @param {number} [options.variations=2]
   * @param {function} [options.onProgress]
   * @returns {Promise<{ imageUrl: string, jobId: string }>}
   */
  async generate(prompt, { aspectRatio = '16:9', variations = 2, onProgress } = {}) {
    validate({ prompt }, { prompt: 'string:required' });

    const { jobId } = await this._client.request('/api/generate-image', {
      method: 'POST',
      body: JSON.stringify({ prompt, aspectRatio, variations }),
    });

    return this._poll(jobId, onProgress);
  }

  /** @private */
  async _poll(jobId, onProgress) {
    const deadline = Date.now() + POLL_TIMEOUT;

    while (Date.now() < deadline) {
      await this._sleep(POLL_INTERVAL);

      const status = await this._client.request(`/api/image-status/${jobId}`);
      onProgress?.(status);

      if (status.status === 'succeeded') {
        return { imageUrl: status.imageUrl, jobId };
      }
      if (status.status === 'failed') {
        throw new OrevaError(status.error ?? 'Image generation failed');
      }
    }

    throw new OrevaError('Image generation timed out');
  }

  /** @private */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
