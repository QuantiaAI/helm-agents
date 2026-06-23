import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

export const API = "http://localhost:5171/api";

// Default handler for the external tokenized-stock invite links (the CTA fetches
// it on mount); tests register the API handlers they need via server.use().
export const server = setupServer(
  http.get("https://fangeiwo.net/invite_links.json", () =>
    HttpResponse.json([]),
  ),
);
