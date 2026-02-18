/**
 * @jest-environment node
 */

// Mock Prisma using factory function that requires __mocks__ file
const mockModule = jest.requireActual<typeof import('@/lib/__mocks__/prisma')>(
  '../../../lib/__mocks__/prisma'
)
const {
  mockFindUnique,
  mockContactFindMany,
  mockContactDeleteMany,
  mockContactCreateMany,
  prisma: mockPrisma,
} = mockModule

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

// Mock auth module
const mockVerifyToken = jest.fn()
jest.mock('@/lib/auth', () => ({
  verifyToken: mockVerifyToken,
}))

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { NextRequest } from 'next/server'

// Use require after jest.mock calls are registered
const { GET, PUT } = require('@/app/api/user/contacts/route') as typeof import('@/app/api/user/contacts/route')

// ---------------------------------------------------------------------------
// GET /api/user/contacts
// ---------------------------------------------------------------------------

describe('GET /api/user/contacts', () => {
  beforeEach(() => {
    mockVerifyToken.mockClear()
    mockContactFindMany.mockClear()
  })

  afterEach(() => {
    mockVerifyToken.mockClear()
    mockContactFindMany.mockClear()
  })

  describe('authentication', () => {
    it('should return 401 when auth token is missing', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/user/contacts', {
        method: 'GET',
      })

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data).toHaveProperty('error')
    })

    it('should return 401 when auth token is invalid', async () => {
      // Arrange
      mockVerifyToken.mockRejectedValue(new Error('Invalid token'))

      const request = new NextRequest('http://localhost:3000/api/user/contacts', {
        method: 'GET',
        headers: {
          Cookie: 'auth-token=invalid-token',
        },
      })

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data).toHaveProperty('error')
    })
  })

  describe('successful retrieval', () => {
    it('should return contacts array when authenticated', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })

      const mockContacts = [
        {
          contact_id: 'contact-1',
          user_id: userId,
          email: 'contact1@example.com',
          phone: '010-1234-5678',
        },
        {
          contact_id: 'contact-2',
          user_id: userId,
          email: 'contact2@example.com',
          phone: '010-9876-5432',
        },
      ]

      mockContactFindMany.mockResolvedValue(mockContacts)

      const request = new NextRequest('http://localhost:3000/api/user/contacts', {
        method: 'GET',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('contacts')
      expect(Array.isArray(data.contacts)).toBe(true)
      expect(data.contacts).toHaveLength(2)
    })

    it('should return empty array when user has no contacts', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockContactFindMany.mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/user/contacts', {
        method: 'GET',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('contacts')
      expect(data.contacts).toHaveLength(0)
    })

    it('should call findMany with correct userId filter', async () => {
      // Arrange
      const userId = 'specific-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'specific@example.com' })
      mockContactFindMany.mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/user/contacts', {
        method: 'GET',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      // Act
      await GET(request)

      // Assert
      expect(mockContactFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: userId },
        })
      )
    })

    it('should return contact fields including email and phone', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })

      const mockContacts = [
        {
          contact_id: 'contact-1',
          user_id: userId,
          email: 'hello@example.com',
          phone: '010-0000-1111',
        },
      ]

      mockContactFindMany.mockResolvedValue(mockContacts)

      const request = new NextRequest('http://localhost:3000/api/user/contacts', {
        method: 'GET',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      const contact = data.contacts[0]
      expect(contact).toHaveProperty('contact_id')
      expect(contact).toHaveProperty('email', 'hello@example.com')
      expect(contact).toHaveProperty('phone', '010-0000-1111')
    })
  })

  describe('error handling', () => {
    it('should return 500 when database query fails', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockContactFindMany.mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3000/api/user/contacts', {
        method: 'GET',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
    })
  })
})

// ---------------------------------------------------------------------------
// PUT /api/user/contacts
// ---------------------------------------------------------------------------

describe('PUT /api/user/contacts', () => {
  beforeEach(() => {
    mockVerifyToken.mockClear()
    mockContactFindMany.mockClear()
    mockContactDeleteMany.mockClear()
    mockContactCreateMany.mockClear()
  })

  afterEach(() => {
    mockVerifyToken.mockClear()
    mockContactFindMany.mockClear()
    mockContactDeleteMany.mockClear()
    mockContactCreateMany.mockClear()
  })

  describe('authentication', () => {
    it('should return 401 when auth token is missing', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/user/contacts', {
        method: 'PUT',
        body: JSON.stringify({ contacts: [] }),
      })

      // Act
      const response = await PUT(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data).toHaveProperty('error')
    })

    it('should return 401 when auth token is invalid', async () => {
      // Arrange
      mockVerifyToken.mockRejectedValue(new Error('Token verification failed'))

      const request = new NextRequest('http://localhost:3000/api/user/contacts', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=bad-token',
        },
        body: JSON.stringify({ contacts: [] }),
      })

      // Act
      const response = await PUT(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data).toHaveProperty('error')
    })
  })

  describe('successful update', () => {
    it('should delete existing contacts and insert new ones', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockContactDeleteMany.mockResolvedValue({ count: 2 })
      mockContactCreateMany.mockResolvedValue({ count: 1 })

      const newContacts = [
        { email: 'new@example.com', phone: '010-1111-2222' },
      ]

      const request = new NextRequest('http://localhost:3000/api/user/contacts', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contacts: newContacts }),
      })

      // Act
      const response = await PUT(request)

      // Assert
      expect(response.status).toBe(200)
      expect(mockContactDeleteMany).toHaveBeenCalledTimes(1)
      expect(mockContactCreateMany).toHaveBeenCalledTimes(1)
    })

    it('should call deleteMany with correct userId', async () => {
      // Arrange
      const userId = 'specific-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'specific@example.com' })
      mockContactDeleteMany.mockResolvedValue({ count: 0 })
      mockContactCreateMany.mockResolvedValue({ count: 1 })

      const request = new NextRequest('http://localhost:3000/api/user/contacts', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contacts: [{ email: 'a@example.com', phone: '' }] }),
      })

      // Act
      await PUT(request)

      // Assert
      expect(mockContactDeleteMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: userId },
        })
      )
    })

    it('should call createMany with user_id attached to each contact', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockContactDeleteMany.mockResolvedValue({ count: 0 })
      mockContactCreateMany.mockResolvedValue({ count: 2 })

      const newContacts = [
        { email: 'first@example.com', phone: '010-1111-2222' },
        { email: 'second@example.com', phone: '010-3333-4444' },
      ]

      const request = new NextRequest('http://localhost:3000/api/user/contacts', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contacts: newContacts }),
      })

      // Act
      await PUT(request)

      // Assert
      expect(mockContactCreateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({ user_id: userId, email: 'first@example.com' }),
            expect.objectContaining({ user_id: userId, email: 'second@example.com' }),
          ]),
        })
      )
    })

    it('should save empty contacts array (delete all)', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockContactDeleteMany.mockResolvedValue({ count: 3 })
      mockContactCreateMany.mockResolvedValue({ count: 0 })

      const request = new NextRequest('http://localhost:3000/api/user/contacts', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contacts: [] }),
      })

      // Act
      const response = await PUT(request)

      // Assert
      expect(response.status).toBe(200)
      expect(mockContactDeleteMany).toHaveBeenCalledTimes(1)
    })

    it('should return contacts in the response after successful save', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockContactDeleteMany.mockResolvedValue({ count: 0 })
      mockContactCreateMany.mockResolvedValue({ count: 1 })

      const request = new NextRequest('http://localhost:3000/api/user/contacts', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contacts: [{ email: 'saved@example.com', phone: '' }] }),
      })

      // Act
      const response = await PUT(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('contacts')
    })
  })

  describe('validation', () => {
    it('should return 400 when email format is invalid', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })

      const request = new NextRequest('http://localhost:3000/api/user/contacts', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contacts: [{ email: 'not-a-valid-email', phone: '' }],
        }),
      })

      // Act
      const response = await PUT(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(mockContactDeleteMany).not.toHaveBeenCalled()
      expect(mockContactCreateMany).not.toHaveBeenCalled()
    })

    it('should return 400 when one of multiple contacts has an invalid email', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })

      const request = new NextRequest('http://localhost:3000/api/user/contacts', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contacts: [
            { email: 'valid@example.com', phone: '' },
            { email: 'bad-email@@', phone: '' },
          ],
        }),
      })

      // Act
      const response = await PUT(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })

    it('should accept contact with empty email (email is optional)', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockContactDeleteMany.mockResolvedValue({ count: 0 })
      mockContactCreateMany.mockResolvedValue({ count: 1 })

      const request = new NextRequest('http://localhost:3000/api/user/contacts', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contacts: [{ email: '', phone: '010-1234-5678' }],
        }),
      })

      // Act
      const response = await PUT(request)

      // Assert
      expect(response.status).toBe(200)
    })

    it('should accept contact with null email (email is optional)', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockContactDeleteMany.mockResolvedValue({ count: 0 })
      mockContactCreateMany.mockResolvedValue({ count: 1 })

      const request = new NextRequest('http://localhost:3000/api/user/contacts', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contacts: [{ email: null, phone: '010-9999-8888' }],
        }),
      })

      // Act
      const response = await PUT(request)

      // Assert
      expect(response.status).toBe(200)
    })

    it('should return 400 when request body is missing contacts field', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })

      const request = new NextRequest('http://localhost:3000/api/user/contacts', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })

      // Act
      const response = await PUT(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })
  })

  describe('error handling', () => {
    it('should return 500 when database deleteMany fails', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockContactDeleteMany.mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3000/api/user/contacts', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contacts: [] }),
      })

      // Act
      const response = await PUT(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
    })

    it('should return 500 when database createMany fails', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockContactDeleteMany.mockResolvedValue({ count: 0 })
      mockContactCreateMany.mockRejectedValue(new Error('Insert failed'))

      const request = new NextRequest('http://localhost:3000/api/user/contacts', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contacts: [{ email: 'ok@example.com', phone: '' }] }),
      })

      // Act
      const response = await PUT(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
    })

    it('should return 400 or 500 when request body is invalid JSON', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })

      const request = new NextRequest('http://localhost:3000/api/user/contacts', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: 'not-valid-json-{',
      })

      // Act
      const response = await PUT(request)
      const data = await response.json()

      // Assert
      expect([400, 500]).toContain(response.status)
      expect(data).toHaveProperty('error')
    })
  })
})
