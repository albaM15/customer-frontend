import { z } from 'zod'
import { languages } from '../constants/Languages'
import { countries } from '../constants/Countries'

export const CreateUserSchema = z.object({
  name: z.string().min(1).max(100),
  nativeLanguage: z.string().refine((v) => languages.some((lang) => lang.id === v), {
    message: 'Invalid native language',
  }),
  targetLanguage: z.string().refine((v) => languages.some((lang) => lang.id === v), {
    message: 'Invalid target language',
  }),
  gender: z.string().refine((v) => ['male', 'female', 'other'].includes(v), {
    message: 'Invalid gender',
  }),
  location: z.string().refine((v) => countries.some((country) => country.id === v), {
    message: 'Invalid location',
  }),
})

export type CreateUser = z.infer<typeof CreateUserSchema>
