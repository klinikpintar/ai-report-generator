import { z } from "zod";
import { isContentSafe } from '@backend/utils/sanitize';

// Validasi skema data laporan
export const ReportSchema = z.object({
  title: z.string().trim().min(3, "Judul minimal 3 karakter"),
  content: z
    .string()
    .trim()
    .min(1, "Isi laporan tidak boleh kosong")
    .refine((val) => isContentSafe(val), {
      message: "Isi laporan tidak boleh mengandung tag HTML",
    }),
  createdAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Format tanggal tidak valid",
  }),
});

export type ReportDTO = z.infer<typeof ReportSchema>;