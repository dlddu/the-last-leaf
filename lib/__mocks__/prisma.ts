import { jest } from '@jest/globals'

export const mockFindUnique = jest.fn()
export const mockCreate = jest.fn()
export const mockUpdate = jest.fn()
export const mockUpsert = jest.fn()

export const prisma = {
  user: {
    findUnique: mockFindUnique,
    create: mockCreate,
    update: mockUpdate,
    upsert: mockUpsert,
  },
}
