// src/lib/responsive.ts
// Responsive design utilities and breakpoints

export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const deviceSizes = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1280px',
} as const;

// Responsive utility functions
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < parseInt(breakpoints.md);
}

export function isTablet(): boolean {
  if (typeof window === 'undefined') return false;
  const width = window.innerWidth;
  return width >= parseInt(breakpoints.md) && width < parseInt(breakpoints.lg);
}

export function isDesktop(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= parseInt(breakpoints.lg);
}

// Responsive hook for React components
export function useResponsive() {
  const [isMobileView, setIsMobileView] = React.useState(false);
  const [isTabletView, setIsTabletView] = React.useState(false);
  const [isDesktopView, setIsDesktopView] = React.useState(false);

  React.useEffect(() => {
    const updateResponsive = () => {
      const width = window.innerWidth;
      setIsMobileView(width < parseInt(breakpoints.md));
      setIsTabletView(width >= parseInt(breakpoints.md) && width < parseInt(breakpoints.lg));
      setIsDesktopView(width >= parseInt(breakpoints.lg));
    };

    updateResponsive();
    window.addEventListener('resize', updateResponsive);
    return () => window.removeEventListener('resize', updateResponsive);
  }, []);

  return {
    isMobile: isMobileView,
    isTablet: isTabletView,
    isDesktop: isDesktopView,
    breakpoint: isMobileView ? 'mobile' : isTabletView ? 'tablet' : 'desktop'
  };
}

// Responsive CSS classes
export const responsiveClasses = {
  // Container classes
  container: {
    mobile: 'px-4 py-6',
    tablet: 'px-6 py-8',
    desktop: 'px-8 py-12'
  },
  
  // Modal classes
  modal: {
    mobile: 'w-full h-full max-w-none rounded-none',
    tablet: 'w-11/12 max-w-2xl rounded-lg',
    desktop: 'w-4/5 max-w-4xl rounded-xl'
  },
  
  // Text classes
  text: {
    title: {
      mobile: 'text-xl font-bold',
      tablet: 'text-2xl font-bold',
      desktop: 'text-3xl font-bold'
    },
    subtitle: {
      mobile: 'text-lg font-semibold',
      tablet: 'text-xl font-semibold',
      desktop: 'text-2xl font-semibold'
    },
    body: {
      mobile: 'text-sm',
      tablet: 'text-base',
      desktop: 'text-lg'
    }
  },
  
  // Button classes
  button: {
    primary: {
      mobile: 'px-4 py-3 text-sm',
      tablet: 'px-6 py-3 text-base',
      desktop: 'px-8 py-4 text-lg'
    },
    secondary: {
      mobile: 'px-3 py-2 text-sm',
      tablet: 'px-4 py-2 text-base',
      desktop: 'px-6 py-3 text-lg'
    }
  },
  
  // Spacing classes
  spacing: {
    section: {
      mobile: 'space-y-4',
      tablet: 'space-y-6',
      desktop: 'space-y-8'
    },
    content: {
      mobile: 'space-y-3',
      tablet: 'space-y-4',
      desktop: 'space-y-6'
    }
  }
};

// Get responsive class based on current breakpoint
export function getResponsiveClass(
  classes: Record<string, string>,
  breakpoint: 'mobile' | 'tablet' | 'desktop' = 'mobile'
): string {
  return classes[breakpoint] || classes.mobile;
}

// Responsive image handling
export function getResponsiveImage(src: string): string {
  // This can be extended to use different image sizes based on device
  // For now, return the original src
  return src;
}

// Responsive layout utilities
export const layoutUtils = {
  // Grid layouts
  grid: {
    mobile: 'grid-cols-1 gap-4',
    tablet: 'grid-cols-2 gap-6',
    desktop: 'grid-cols-3 gap-8'
  },
  
  // Flex layouts
  flex: {
    mobile: 'flex-col space-y-4',
    tablet: 'flex-row space-x-6',
    desktop: 'flex-row space-x-8'
  },
  
  // Padding
  padding: {
    mobile: 'p-4',
    tablet: 'p-6',
    desktop: 'p-8'
  },
  
  // Margin
  margin: {
    mobile: 'm-4',
    tablet: 'm-6',
    desktop: 'm-8'
  }
};

// Import React for the hook
import React from 'react';

