import { getOrAssignVariant, calculateDownsellPrice, generateSecureVariant } from '../ab-testing'
import { supabase } from '../supabase'

/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock Supabase
jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn()
  }
}))

describe('A/B Testing', () => {
  const mockUserId = '550e8400-e29b-41d4-a716-446655440001'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getOrAssignVariant', () => {
    it('should return existing variant if user already has one', async () => {
      const mockSupabase = supabase as jest.Mocked<typeof supabase>
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: [{ downsell_variant: 'B' }],
                error: null
              })
            })
          })
        })
      } as any)

      const result = await getOrAssignVariant(mockUserId)

      expect(result.variant).toBe('B')
      expect(result.isNewAssignment).toBe(false)
    })

    it('should assign new variant if user does not have one', async () => {
      const mockSupabase = supabase as jest.Mocked<typeof supabase>
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: [],
                error: null
              })
            })
          })
        }),
        insert: jest.fn().mockResolvedValue({ error: null })
      } as any)

      const result = await getOrAssignVariant(mockUserId)

      expect(['A', 'B']).toContain(result.variant)
      expect(result.isNewAssignment).toBe(true)
    })

    it('should handle database errors gracefully', async () => {
      const mockSupabase = supabase as jest.Mocked<typeof supabase>
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockRejectedValue(new Error('Database error'))
            })
          })
        })
      } as any)

      const result = await getOrAssignVariant(mockUserId)

      expect(result.variant).toBe('A') // Fallback to variant A
      expect(result.isNewAssignment).toBe(false)
    })
  })

  describe('calculateDownsellPrice', () => {
    it('should return original price for variant A', () => {
      const originalPrice = 2500
      const result = calculateDownsellPrice(originalPrice, 'A')
      expect(result).toBe(2500)
    })

    it('should return discounted price for variant B', () => {
      const originalPrice = 2500
      const result = calculateDownsellPrice(originalPrice, 'B')
      expect(result).toBe(1500) // $25 - $10 = $15
    })

    it('should handle $29 plan correctly', () => {
      const originalPrice = 2900
      const result = calculateDownsellPrice(originalPrice, 'B')
      expect(result).toBe(1900) // $29 - $10 = $19
    })

    it('should not return negative prices', () => {
      const originalPrice = 500 // $5
      const result = calculateDownsellPrice(originalPrice, 'B')
      expect(result).toBe(0) // Minimum price is $0
    })
  })

  describe('generateSecureVariant', () => {
    it('should generate either A or B variant', () => {
      const variants = new Set()
      for (let i = 0; i < 100; i++) {
        variants.add(generateSecureVariant())
      }
      expect(variants).toContain('A')
      expect(variants).toContain('B')
    })

    it('should use crypto.getRandomValues when available', () => {
      const mockGetRandomValues = jest.fn((array) => {
        array[0] = 100 // This should result in variant A (100 < 128)
        return array
      })
      
      Object.defineProperty(window, 'crypto', {
        value: { getRandomValues: mockGetRandomValues },
        writable: true
      })

      const result = generateSecureVariant()
      expect(result).toBe('A')
      expect(mockGetRandomValues).toHaveBeenCalled()
    })
  })
})

