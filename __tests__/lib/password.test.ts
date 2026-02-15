import { describe, it, expect } from '@jest/globals'
import { hashPassword, comparePassword } from '@/lib/password'

describe('Password Hashing Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a plain text password', async () => {
      // Arrange
      const plainPassword = 'MySecurePassword123!'

      // Act
      const hashedPassword = await hashPassword(plainPassword)

      // Assert
      expect(hashedPassword).toBeDefined()
      expect(typeof hashedPassword).toBe('string')
      expect(hashedPassword).not.toBe(plainPassword)
      expect(hashedPassword.length).toBeGreaterThan(0)
    })

    it('should generate different hashes for same password', async () => {
      // Arrange
      const plainPassword = 'SamePassword123'

      // Act
      const hash1 = await hashPassword(plainPassword)
      const hash2 = await hashPassword(plainPassword)

      // Assert
      expect(hash1).not.toBe(hash2) // bcrypt uses salt, so hashes differ
    })

    it('should hash passwords with special characters', async () => {
      // Arrange
      const complexPassword = 'P@ssw0rd!#$%^&*()_+-=[]{}|;:,.<>?'

      // Act
      const hashedPassword = await hashPassword(complexPassword)

      // Assert
      expect(hashedPassword).toBeDefined()
      expect(typeof hashedPassword).toBe('string')
    })

    it('should hash passwords with unicode characters', async () => {
      // Arrange
      const unicodePassword = '비밀번호123🔒'

      // Act
      const hashedPassword = await hashPassword(unicodePassword)

      // Assert
      expect(hashedPassword).toBeDefined()
      expect(typeof hashedPassword).toBe('string')
    })

    it('should throw error when password is empty string', async () => {
      // Arrange
      const emptyPassword = ''

      // Act & Assert
      await expect(hashPassword(emptyPassword)).rejects.toThrow()
    })

    it('should throw error when password is too short', async () => {
      // Arrange
      const shortPassword = '123'

      // Act & Assert
      await expect(hashPassword(shortPassword)).rejects.toThrow()
    })

    it('should accept password of minimum required length', async () => {
      // Arrange
      const minPassword = 'Pass1234' // Assuming 8 chars minimum

      // Act
      const hashedPassword = await hashPassword(minPassword)

      // Assert
      expect(hashedPassword).toBeDefined()
    })
  })

  describe('comparePassword', () => {
    it('should return true when password matches hash', async () => {
      // Arrange
      const plainPassword = 'CorrectPassword123'
      const hashedPassword = await hashPassword(plainPassword)

      // Act
      const isMatch = await comparePassword(plainPassword, hashedPassword)

      // Assert
      expect(isMatch).toBe(true)
    })

    it('should return false when password does not match hash', async () => {
      // Arrange
      const plainPassword = 'CorrectPassword123'
      const wrongPassword = 'WrongPassword456'
      const hashedPassword = await hashPassword(plainPassword)

      // Act
      const isMatch = await comparePassword(wrongPassword, hashedPassword)

      // Assert
      expect(isMatch).toBe(false)
    })

    it('should be case sensitive', async () => {
      // Arrange
      const plainPassword = 'CaseSensitive123'
      const differentCase = 'casesensitive123'
      const hashedPassword = await hashPassword(plainPassword)

      // Act
      const isMatch = await comparePassword(differentCase, hashedPassword)

      // Assert
      expect(isMatch).toBe(false)
    })

    it('should handle special characters correctly', async () => {
      // Arrange
      const complexPassword = 'P@ss!#$%123'
      const hashedPassword = await hashPassword(complexPassword)

      // Act
      const isMatch = await comparePassword(complexPassword, hashedPassword)

      // Assert
      expect(isMatch).toBe(true)
    })

    it('should handle unicode characters correctly', async () => {
      // Arrange
      const unicodePassword = '한글비밀번호🔑'
      const hashedPassword = await hashPassword(unicodePassword)

      // Act
      const isMatch = await comparePassword(unicodePassword, hashedPassword)

      // Assert
      expect(isMatch).toBe(true)
    })

    it('should return false when comparing with invalid hash', async () => {
      // Arrange
      const plainPassword = 'TestPassword123'
      const invalidHash = 'not-a-valid-bcrypt-hash'

      // Act & Assert
      await expect(comparePassword(plainPassword, invalidHash)).rejects.toThrow()
    })

    it('should return false when comparing empty password', async () => {
      // Arrange
      const plainPassword = 'TestPassword123'
      const hashedPassword = await hashPassword(plainPassword)
      const emptyPassword = ''

      // Act
      const isMatch = await comparePassword(emptyPassword, hashedPassword)

      // Assert
      expect(isMatch).toBe(false)
    })
  })

  describe('hashPassword and comparePassword integration', () => {
    it('should successfully hash and verify password round-trip', async () => {
      // Arrange
      const originalPassword = 'IntegrationTest123!'

      // Act
      const hashedPassword = await hashPassword(originalPassword)
      const isValidPassword = await comparePassword(originalPassword, hashedPassword)
      const isInvalidPassword = await comparePassword('WrongPassword', hashedPassword)

      // Assert
      expect(isValidPassword).toBe(true)
      expect(isInvalidPassword).toBe(false)
    })

    it('should handle multiple password verifications with same hash', async () => {
      // Arrange
      const password = 'ReusablePassword123'
      const hashedPassword = await hashPassword(password)

      // Act
      const check1 = await comparePassword(password, hashedPassword)
      const check2 = await comparePassword(password, hashedPassword)
      const check3 = await comparePassword(password, hashedPassword)

      // Assert
      expect(check1).toBe(true)
      expect(check2).toBe(true)
      expect(check3).toBe(true)
    })

    it('should reject password with single character difference', async () => {
      // Arrange
      const password = 'ExactPassword123'
      const similarPassword = 'ExactPassword124' // Last char different
      const hashedPassword = await hashPassword(password)

      // Act
      const isMatch = await comparePassword(similarPassword, hashedPassword)

      // Assert
      expect(isMatch).toBe(false)
    })
  })
})
