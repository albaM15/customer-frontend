import { z } from 'zod'
import { languages } from '../constants/Languages'
import { countries } from '../constants/Countries'

export const MatchmakingRequestSchema = z.object({
    action: z.literal("find_match"),
    userData: z.object({
        userId: z
            .string()
            .regex(
                /^(usr|gst)_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
                "Invalid userId format",
            ),
        nativeLanguage: z
            .string()
            .refine((val) => languages.some((lang) => lang.id === val) || val === "any"),
        targetLanguage: z
            .string()
            .refine((val) => languages.some((lang) => lang.id === val) || val === "any"),
        location: z.string().refine((val) => countries.some((country) => country.id === val)),
        name: z.string().max(100).optional(),
    }),
    filters: z.object({
        requiredNativeLanguage: z
            .string()
            .refine((val) => languages.some((lang) => lang.id === val) || val === "any")
            .optional(),
        requiredTargetLanguage: z
            .string()
            .refine((val) => languages.some((lang) => lang.id === val) || val === "any")
            .optional(),
        requiredLocation: z
            .string()
            .refine((val) => countries.some((country) => country.id === val))
            .optional(),
    }),
});
