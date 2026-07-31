import { normalizeWorkspace, type SalesWorkspace } from "./types";

const STORAGE_KEY = "ct-vendas-vault-v1";
const ITERATIONS = 250_000;

interface VaultEnvelope {
  version: 1;
  salt: string;
  iv: string;
  ciphertext: string;
  updatedAt: string;
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function deriveKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pin),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: ITERATIONS, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function encrypt(workspace: SalesWorkspace, key: CryptoKey, salt: Uint8Array) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(workspace));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    encoded,
  );

  return {
    version: 1,
    salt: toBase64(salt),
    iv: toBase64(iv),
    ciphertext: toBase64(new Uint8Array(ciphertext)),
    updatedAt: new Date().toISOString(),
  } satisfies VaultEnvelope;
}

export function hasVault(): boolean {
  return typeof window !== "undefined" && Boolean(localStorage.getItem(STORAGE_KEY));
}

export async function createVault(pin: string, workspace: SalesWorkspace) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(pin, salt);
  const envelope = await encrypt(workspace, key, salt);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  return key;
}

export async function unlockVault(pin: string): Promise<{
  key: CryptoKey;
  workspace: SalesWorkspace;
}> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) throw new Error("Cofre não encontrado.");

  const envelope = JSON.parse(raw) as VaultEnvelope;
  const salt = fromBase64(envelope.salt);
  const key = await deriveKey(pin, salt);
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(envelope.iv) as BufferSource },
    key,
    fromBase64(envelope.ciphertext) as BufferSource,
  );
  const workspace = JSON.parse(new TextDecoder().decode(plaintext)) as SalesWorkspace;

  if (workspace.version !== 1 || !Array.isArray(workspace.contacts)) {
    throw new Error("Formato de cofre inválido.");
  }

  return { key, workspace: normalizeWorkspace(workspace) };
}

export async function saveVault(key: CryptoKey, workspace: SalesWorkspace) {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) throw new Error("Cofre não encontrado.");
  const existing = JSON.parse(raw) as VaultEnvelope;
  const salt = fromBase64(existing.salt);
  const envelope = await encrypt(workspace, key, salt);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
}

export function downloadVaultBackup() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) throw new Error("Cofre não encontrado.");
  const blob = new Blob([raw], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `backup-painel-christiano-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export async function importVaultBackup(file: File) {
  const raw = await file.text();
  const envelope = JSON.parse(raw) as VaultEnvelope;
  if (envelope.version !== 1 || !envelope.salt || !envelope.iv || !envelope.ciphertext) {
    throw new Error("Arquivo de backup inválido.");
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
}
