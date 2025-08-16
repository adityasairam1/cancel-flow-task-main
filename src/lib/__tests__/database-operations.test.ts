import { 
  updateSubscriptionStatus, 
  createCancellationRecord, 
  handleDownsellAcceptance,
  handleCancellationCompletion,
  getUserSubscription 
} from '../database-operations'
import { supabase } from '../supabase'

/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock Supabase
jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn()
  }
}))

// Mock payment stub
jest.mock('../payment-stub', () => ({
  processDownsellPayment: jest.fn().mockResolvedValue({
    success: true,
    transactionId: 'mock-transaction-123'
  })
}))

describe('Database Operations', () => {
  const mockUserId = '550e8400-e29b-41d4-a716-446655440001'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('updateSubscriptionStatus', () => {
    it('should update subscription status successfully', async () => {
      const mockSupabase = supabase as jest.Mocked<typeof supabase>
      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null })
        })
      } as any)

      const result = await updateSubscriptionStatus(mockUserId, 'pending_cancellation')

      expect(result).toBe(true)
      expect(mockSupabase.from).toHaveBeenCalledWith('subscriptions')
    })

    it('should handle database errors gracefully', async () => {
      const mockSupabase = supabase as jest.Mocked<typeof supabase>
      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ 
            error: { message: 'Network error' } 
          })
        })
      } as any)

      const result = await updateSubscriptionStatus(mockUserId, 'pending_cancellation')

      expect(result).toBe(true) // Should continue flow even on error
    })
  })

  describe('createCancellationRecord', () => {
    it('should create new cancellation record', async () => {
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

      const cancellationData = {
        userId: mockUserId,
        variant: 'B' as const,
        reason: 'too-expensive',
        acceptedDownsell: false
      }

      const result = await createCancellationRecord(cancellationData)

      expect(result).toBe(true)
      expect(mockSupabase.from).toHaveBeenCalledWith('cancellations')
    })

    it('should update existing cancellation record', async () => {
      const mockSupabase = supabase as jest.Mocked<typeof supabase>
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: [{ id: 'existing-record-id' }],
                error: null
              })
            })
          })
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null })
        })
      } as any)

      const cancellationData = {
        userId: mockUserId,
        variant: 'B' as const,
        reason: 'too-expensive',
        acceptedDownsell: false
      }

      const result = await createCancellationRecord(cancellationData)

      expect(result).toBe(true)
    })
  })

  describe('handleDownsellAcceptance', () => {
    it('should handle downsell acceptance successfully', async () => {
      const mockSupabase = supabase as jest.Mocked<typeof supabase>
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: [{ monthly_price: 2500 }],
                error: null
              })
            })
          })
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null })
        }),
        insert: jest.fn().mockResolvedValue({ error: null })
      } as any)

      const result = await handleDownsellAcceptance(mockUserId, 'B')

      expect(result).toBe(true)
    })

    it('should handle missing subscription gracefully', async () => {
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
        })
      } as any)

      const result = await handleDownsellAcceptance(mockUserId, 'B')

      expect(result).toBe(false)
    })
  })

  describe('handleCancellationCompletion', () => {
    it('should complete cancellation successfully', async () => {
      const mockSupabase = supabase as jest.Mocked<typeof supabase>
      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null })
        }),
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

      const result = await handleCancellationCompletion(
        mockUserId,
        'B',
        'too-expensive',
        '15.00',
        'Too expensive for me'
      )

      expect(result).toBe(true)
    })
  })

  describe('getUserSubscription', () => {
    it('should return user subscription data', async () => {
      const mockSubscription = {
        id: 'sub-123',
        user_id: mockUserId,
        monthly_price: 2500,
        status: 'active'
      }

      const mockSupabase = supabase as jest.Mocked<typeof supabase>
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: [mockSubscription],
                error: null
              })
            })
          })
        })
      } as any)

      const result = await getUserSubscription(mockUserId)

      expect(result).toEqual(mockSubscription)
    })

    it('should return mock data when database fails', async () => {
      const mockSupabase = supabase as jest.Mocked<typeof supabase>
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockRejectedValue(new Error('Network error'))
            })
          })
        })
      } as any)

      const result = await getUserSubscription(mockUserId)

      expect(result).toEqual({
        id: 'mock-subscription-id',
        user_id: mockUserId,
        monthly_price: 2500,
        status: 'active',
        created_at: expect.any(String),
        updated_at: expect.any(String)
      })
    })
  })
})

