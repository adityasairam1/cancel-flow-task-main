import { 
  getConfig, 
  updateConfig, 
  getCancellationReason, 
  getActiveOffers, 
  getPrimaryOffer,
  formatPrice,
  calculateDiscountedPrice
} from '../config'

describe('Configuration System', () => {
  beforeEach(() => {
    // Reset environment variables
    delete process.env.NEXT_PUBLIC_APP_NAME
    delete process.env.NEXT_PUBLIC_ENABLE_AB_TESTING
    delete process.env.NEXT_PUBLIC_DEFAULT_MONTHLY_PRICE
    delete process.env.NEXT_PUBLIC_DOWSELL_DISCOUNT_AMOUNT
  })

  describe('getConfig', () => {
    it('should return default configuration when no environment variables are set', () => {
      const config = getConfig()
      
      expect(config.appName).toBe('Migrate Mate')
      expect(config.appVersion).toBe('1.0.0')
      expect(config.environment).toBe('development')
      expect(config.enableABTesting).toBe(false)
      expect(config.defaultMonthlyPrice).toBe(2500)
      expect(config.downsellDiscountAmount).toBe(1000)
    })

    it('should use environment variables when provided', () => {
      process.env.NEXT_PUBLIC_APP_NAME = 'Test App'
      process.env.NEXT_PUBLIC_ENABLE_AB_TESTING = 'true'
      process.env.NEXT_PUBLIC_DEFAULT_MONTHLY_PRICE = '3000'
      process.env.NEXT_PUBLIC_DOWSELL_DISCOUNT_AMOUNT = '1500'
      
      const config = getConfig()
      
      expect(config.appName).toBe('Test App')
      expect(config.enableABTesting).toBe(true)
      expect(config.defaultMonthlyPrice).toBe(3000)
      expect(config.downsellDiscountAmount).toBe(1500)
    })

    it('should have valid cancellation reasons', () => {
      const config = getConfig()
      
      expect(config.cancellationReasons).toHaveLength(5)
      expect(config.cancellationReasons[0].id).toBe('too-expensive')
      expect(config.cancellationReasons[0].requiresAmount).toBe(true)
      expect(config.cancellationReasons[1].id).toBe('platform-not-helpful')
      expect(config.cancellationReasons[1].requiresFeedback).toBe(true)
    })

    it('should have valid offers', () => {
      const config = getConfig()
      
      expect(config.offers).toHaveLength(2)
      expect(config.offers[0].id).toBe('50-percent-off')
      expect(config.offers[0].isActive).toBe(true)
      expect(config.offers[1].id).toBe('10-dollar-off')
      expect(config.offers[1].variant).toBe('B')
    })
  })

  describe('updateConfig', () => {
    it('should update configuration with new values', () => {
      const config = getConfig()
      const originalName = config.appName
      
      updateConfig({ appName: 'Updated App' })
      
      const updatedConfig = getConfig()
      expect(updatedConfig.appName).toBe('Updated App')
      expect(updatedConfig.appVersion).toBe(originalName === 'Migrate Mate' ? '1.0.0' : config.appVersion)
    })
  })

  describe('getCancellationReason', () => {
    it('should return cancellation reason by id', () => {
      const reason = getCancellationReason('too-expensive')
      
      expect(reason).toBeDefined()
      expect(reason?.id).toBe('too-expensive')
      expect(reason?.label).toBe('Too expensive')
      expect(reason?.requiresAmount).toBe(true)
    })

    it('should return undefined for non-existent reason', () => {
      const reason = getCancellationReason('non-existent')
      
      expect(reason).toBeUndefined()
    })
  })

  describe('getActiveOffers', () => {
    it('should return all active offers for variant A', () => {
      const offers = getActiveOffers('A')
      
      expect(offers).toHaveLength(1)
      expect(offers[0].id).toBe('50-percent-off')
      expect(offers[0].variant).toBe('both')
    })

    it('should return all active offers for variant B', () => {
      const offers = getActiveOffers('B')
      
      expect(offers).toHaveLength(2)
      expect(offers.some(offer => offer.id === '50-percent-off')).toBe(true)
      expect(offers.some(offer => offer.id === '10-dollar-off')).toBe(true)
    })

    it('should return all active offers when no variant specified', () => {
      const offers = getActiveOffers()
      
      expect(offers).toHaveLength(2)
    })
  })

  describe('getPrimaryOffer', () => {
    it('should return first active offer for variant A', () => {
      const offer = getPrimaryOffer('A')
      
      expect(offer).toBeDefined()
      expect(offer?.id).toBe('50-percent-off')
    })

    it('should return first active offer for variant B', () => {
      const offer = getPrimaryOffer('B')
      
      expect(offer).toBeDefined()
      expect(offer?.id).toBe('50-percent-off')
    })

    it('should return first active offer when no variant specified', () => {
      const offer = getPrimaryOffer()
      
      expect(offer).toBeDefined()
      expect(offer?.id).toBe('50-percent-off')
    })
  })

  describe('formatPrice', () => {
    it('should format price from cents to dollars', () => {
      expect(formatPrice(2500)).toBe('$25.00')
      expect(formatPrice(2900)).toBe('$29.00')
      expect(formatPrice(1500)).toBe('$15.00')
      expect(formatPrice(0)).toBe('$0.00')
    })

    it('should handle decimal prices correctly', () => {
      expect(formatPrice(2550)).toBe('$25.50')
      expect(formatPrice(2999)).toBe('$29.99')
    })
  })

  describe('calculateDiscountedPrice', () => {
    it('should calculate discounted price correctly', () => {
      expect(calculateDiscountedPrice(2500, 1000)).toBe(1500)
      expect(calculateDiscountedPrice(2900, 1000)).toBe(1900)
    })

    it('should not return negative prices', () => {
      expect(calculateDiscountedPrice(500, 1000)).toBe(0)
      expect(calculateDiscountedPrice(0, 1000)).toBe(0)
    })

    it('should handle zero discount', () => {
      expect(calculateDiscountedPrice(2500, 0)).toBe(2500)
    })
  })

  describe('validation rules', () => {
    it('should have valid validation rules', () => {
      const config = getConfig()
      
      expect(config.validation.minFeedbackLength).toBe(25)
      expect(config.validation.maxFeedbackLength).toBe(1000)
      expect(config.validation.minAmount).toBe(0)
      expect(config.validation.maxAmount).toBe(10000)
      expect(config.validation.requiredFields).toContain('reason')
    })
  })
})

