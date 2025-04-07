import { z } from "zod";

// Validasi skema data laporan
export const ReportSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  content: z.string().min(1, "Isi laporan tidak boleh kosong"),
  createdAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Format tanggal tidak valid",
  }),
});

export type ReportDTO = z.infer<typeof ReportSchema>;
