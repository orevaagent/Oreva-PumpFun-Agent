import { validate } from '../utils/validator.js';
import { OrevaError } from '../utils/errors.js';

const POLL_INTERVAL = 3000;
const POLL_TIMEOUT  = 300_000;

export class VideoModule {
  /** @param {import('../client.js').OrevaClient} client */
  constructor(client) {
    this._client = client;
  }

  /**
   * Generate a video from a text prompt.
   * Starts the job, polls until done, and returns the video URL.
   * @param {string} prompt
   * @param {object} [options]
   * @param {'5s'|'10s'} [options.duration='5s']
   * @param {'1080p'|'720p'} [options.resolution='1080p']
   * @param {number} [options.variations=2]
   * @param {function} [options.onProgress]
   * @returns {Promise<{ videoUrl: string, jobId: string }>}
   */
  async generate(prompt, { duration = '5s', resolution = '1080p', variations = 2, onProgress } = {}) {
    validate({ prompt }, { prompt: 'string:required' });

    const { jobId } = await this._client.request('/api/generate-video', {
      method: 'POST',
      body: JSON.stringify({ prompt, duration, resolution, variations }),
    });

    return this._poll(jobId, onProgress);
  }

  /** @private */
  async _poll(jobId, onProgress) {
    const deadline = Date.now() + POLL_TIMEOUT;

    while (Date.now() < deadline) {
      await this._sleep(POLL_INTERVAL);

      const status = await this._client.request(`/api/video-status/${jobId}`);
      onProgress?.(status);

      if (status.status === 'succeeded') {
        return { videoUrl: status.videoUrl, jobId };
      }
      if (status.status === 'failed') {
        throw new OrevaError(status.error ?? 'Video generation failed');
      }
    }

    throw new OrevaError('Video generation timed out');
  }

  /** @private */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
