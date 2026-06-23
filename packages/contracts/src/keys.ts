/** One provider's API-key status — never carries secret material. */
export interface MaskedKey {
  env: string;
  provider: string;
  set: boolean;
}

/** Response of `GET /api/keys`. */
export interface KeysResponse {
  keys: MaskedKey[];
}

/** Request body of `PUT /api/keys`. */
export interface KeysUpdateRequest {
  env: string;
  value: string;
}

/** Response of `PUT /api/keys`. */
export interface KeysUpdateResponse {
  ok: true;
  keys: MaskedKey[];
}
