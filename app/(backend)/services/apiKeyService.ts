import crypto from 'crypto';
import config from "../config";
import axios, { AxiosInstance } from 'axios';
import { BadRequestResponse } from '../utils/exceptions';
import { IApiKeyService } from '../interfaces/IApikeyService';

export class ApiKeyService implements IApiKeyService {
    private ENCRYPTION_KEY: string;
    private ALGORITHM: string;
    private SECRET_KEY: Buffer;
    private httpClient: AxiosInstance;

    constructor(
        configService = config,
        httpClientService = axios
    ) {
        this.ENCRYPTION_KEY = configService.ENCRYPTION_KEY;
        this.ALGORITHM = 'aes-256-gcm';
        this.httpClient = httpClientService;

        if (!this.ENCRYPTION_KEY) {
            throw new Error('ENCRYPTION_KEY environment variable is not set');
        }

        this.SECRET_KEY = Buffer.from(this.ENCRYPTION_KEY, 'hex');

        if (this.SECRET_KEY.length !== 32) {
            throw new Error('Encryption key must be exactly 32 bytes (64-character hex string)');
        }
    }

    /**
     * Mengenkripsi API key menggunakan algoritma AES-256-GCM
     */
    encryptApiKey(text: string): string {
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv(this.ALGORITHM, this.SECRET_KEY, iv) as crypto.CipherGCM;

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag().toString('hex');
        return `${iv.toString('hex')}:${encrypted}:${authTag}`;
    }

    /**
     * Mendekripsi API key yang telah dienkripsi
     */
    decryptApiKey(encryptedText: string): string {
        const parts = encryptedText.split(':');

        if (parts.length !== 3) {
            throw new Error('Invalid encrypted format');
        }

        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = Buffer.from(parts[1], 'hex');
        const authTag = Buffer.from(parts[2], 'hex');

        const decipher = crypto.createDecipheriv(this.ALGORITHM, this.SECRET_KEY, iv) as crypto.DecipherGCM;
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encrypted, undefined, 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }

    /**
     * Memvalidasi API key untuk provider tertentu
     * @returns true jika API key valid, throw BadRequestResponse jika tidak valid
     */
    async validateApiKey(providerName: string, apiKey: string): Promise<boolean> {
        try {
            const normalizedName = providerName.toLowerCase();
            switch (normalizedName) {
                case 'gemini':
                    const geminiResponse = await this.httpClient.get(
                        `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`,
                        { timeout: 5000 }
                    );
                    return geminiResponse.status === 200;

                case 'deepseek':
                    const deepseekResponse = await this.httpClient.get('https://api.deepseek.com/v1/models', {
                        headers: {
                            'Authorization': `Bearer ${apiKey}`,
                            'Content-Type': 'application/json'
                        },
                        timeout: 5000
                    });
                    return deepseekResponse.status === 200;

                default:
                    // Semua provider lain (kalau ada) tidak divalidasi karena belum diatur mekanismenya
                    return true;
            }
        } catch (error) {
            // Ekstrak pesan error yang paling informatif
            let errorMessage = 'Invalid API key';

            if (axios.isAxiosError(error)) {
                // Coba ambil pesan error dari response API jika ada
                if (error.response?.data?.error?.message) {
                    errorMessage += `: ${error.response.data.error.message}`;
                } else if (error.message) {
                    errorMessage += `: ${error.message}`;
                }
            } else if (error instanceof Error) {
                errorMessage += `: ${error.message}`;
            } else {
                errorMessage += `: ${String(error)}`;
            }

            throw new BadRequestResponse(errorMessage);
        }
    }
}