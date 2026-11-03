import { type Meeting } from './meeting';
import { compressSync, decompressSync } from 'fflate';

export interface SharePayload {
  meetings: Meeting[];
  ownerName: string;
  ownerEmail?: string;
}

const bytesToBase64 = (bytes: Uint8Array) => {
  let binary = '';
  bytes.forEach(byte => { binary += String.fromCharCode(byte); });
  return btoa(binary);
};

const base64ToBytes = (value: string) => {
  const binary = atob(value);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
};

const decodePayload = (token: string): Meeting[] | SharePayload => {
  try {
    return JSON.parse(new TextDecoder().decode(decompressSync(base64ToBytes(token)))) as Meeting[] | SharePayload;
  } catch {
    const legacy = decodeURIComponent(atob(token));
    return JSON.parse(legacy) as Meeting[] | SharePayload;
  }
};

// ── Shareable Link Utilities ──────────────────────────────────────────────────
// Encodes meeting data as a compressed base64 URL fragment so recipients can
// view (never edit) data without any backend, login, or Drive account.

export function encodeMeetingsToShareToken(meetings: Meeting[], ownerName = 'Nexus user', ownerEmail = ''): string {
  const payload: SharePayload = { meetings, ownerName, ownerEmail };
  return bytesToBase64(compressSync(new TextEncoder().encode(JSON.stringify(payload)), { level: 9 }));
}

export function decodeMeetingsFromShareToken(token: string): Meeting[] | null {
  try {
    const parsed = decodePayload(token);
    return Array.isArray(parsed) ? parsed : parsed.meetings;
  } catch {
    return null;
  }
}

export function decodeSharePayloadFromToken(token: string): SharePayload | null {
  try {
    const parsed = decodePayload(token);
    return Array.isArray(parsed)
      ? { meetings: parsed, ownerName: 'Nexus user' }
      : parsed;
  } catch {
    return null;
  }
}

export function buildShareableURL(meetings: Meeting[], ownerName = 'Nexus user', ownerEmail = ''): string {
  const token = encodeMeetingsToShareToken(meetings, ownerName, ownerEmail);
  const base = window.location.origin + window.location.pathname;
  return `${base}#view=${token}&by=${encodeURIComponent(ownerName)}`;
}

export function parseShareTokenFromURL(): string | null {
  const hash = window.location.hash;
  const match = hash.match(/^#view=([^&]+)/);
  return match ? match[1] : null;
}

