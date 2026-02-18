import { jest } from '@jest/globals'

export const mockFindUnique = jest.fn()
export const mockCreate = jest.fn()
export const mockUpdate = jest.fn()
export const mockUpsert = jest.fn()
export const mockFindMany = jest.fn()
export const mockDelete = jest.fn()
export const mockDiaryFindUnique = jest.fn()
export const mockDiaryUpdate = jest.fn()
export const mockDiaryDelete = jest.fn()

export const mockContactFindMany = jest.fn()
export const mockContactCreate = jest.fn()
export const mockContactDeleteMany = jest.fn()
export const mockContactCreateMany = jest.fn()

export const prisma = {
  user: {
    findUnique: mockFindUnique,
    create: mockCreate,
    update: mockUpdate,
    upsert: mockUpsert,
    delete: mockDelete,
  },
  diary: {
    findMany: mockFindMany,
    findUnique: mockDiaryFindUnique,
    create: mockCreate,
    update: mockDiaryUpdate,
    delete: mockDiaryDelete,
  },
  contact: {
    findMany: mockContactFindMany,
    create: mockContactCreate,
    deleteMany: mockContactDeleteMany,
    createMany: mockContactCreateMany,
  },
}
