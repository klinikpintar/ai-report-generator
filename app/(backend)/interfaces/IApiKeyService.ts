/**
 * Interface for API key management operations.
 * Provides functionality to securely handle API keys including validation,
 * encryption, and decryption across different service providers.
 */
export interface IApiKeyService {
  /**
   * Validates an API key with the specified provider.
   * 
   * @param providerName - The name of the API provider (e.g., 'gemini', 'deepseek')
   * @param apiKey - The API key to validate
   * @returns A promise that resolves to true if the API key is valid, or throws an error if invalid
   */
  validateApiKey(providerName: string, apiKey: string): Promise<boolean>;
  
  /**
   * Encrypts an API key for secure storage.
   * Uses AES-256-GCM encryption algorithm.
   * 
   * @param apiKey - The plain text API key to encrypt
   * @returns The encrypted API key string in the format "iv:encryptedData:authTag"
   */
  encryptApiKey(apiKey: string): string;
  
  /**
   * Decrypts an encrypted API key.
   * 
   * @param encryptedApiKey - The encrypted API key in the format "iv:encryptedData:authTag"
   * @returns The decrypted plain text API key
   * @throws Error if the encrypted format is invalid or decryption fails
   */
  decryptApiKey(encryptedApiKey: string): string;
}