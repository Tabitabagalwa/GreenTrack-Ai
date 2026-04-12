import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import {join} from 'node:path';
import { GoogleGenAI, Type } from "@google/genai";

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
app.use(express.json({ limit: '10mb' }));
const angularApp = new AngularNodeAppEngine();

const genAI = new GoogleGenAI({ apiKey: process.env['GEMINI_API_KEY'] || '' });

/**
 * API Endpoint for Waste Classification
 * This keeps the API key secure on the server.
 */
app.post('/api/classify', async (req, res): Promise<any> => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const prompt = "Identify the waste in this image. Categorize it as one of: plastic, organic, metal, paper, e-waste, or other. Provide a brief disposal instruction and a recyclability score (0-100). Return ONLY JSON.";

    const response = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "image/jpeg", data: image } }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            disposalInstruction: { type: Type.STRING },
            recyclabilityScore: { type: Type.NUMBER }
          },
          required: ["category", "disposalInstruction", "recyclabilityScore"]
        }
      }
    });

    return res.json(JSON.parse(response.text || '{}'));
  } catch (error) {
    console.error('Classification error:', error);
    return res.status(500).json({ error: 'Failed to classify image' });
  }
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
