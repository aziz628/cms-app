export default {
  content: [
    "./index.html", 
    "./src/**/*.{js,jsx,ts,tsx,html}"
  ],
  theme: {
    container: {
      center: true,
      padding: 'var(--space-4)',
      screens: { xl: '1200px' }
    },
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        containerBg: 'var(--color-container-bg)',
        surface: 'var(--color-surface)',

        text: 'var(--color-text)',
        btnText: 'var(--color-btn-text)',
        muted: 'var(--color-muted)',
        hoverMuted: 'var(--color-hover-muted)',

        primary: 'var(--color-primary)',
        hoverPrimary: 'var(--hover-primary)',
        secondary: 'var(--color-secondary)',
        tertiary: 'var(--color-tertiary)',
        
        success: 'var(--color-success)',
        hoverSuccess: 'var(--color-hover-success)',
        warning: 'var(--color-warning)',
        hoverWarning: 'var(--color-hover-warning)',
        danger: 'var(--color-danger)',
        hoverDanger: 'var(--color-hover-danger)',
        
        tableHeaderBg: 'var(--color-table-header-bg)',
        shadowColor: 'var(--color-shadow)',

        inputBg: 'var(--color-input-bg)',
        successLight: 'var(--color-success-light)',
        dangerLight: 'var(--color-danger-light)',
        warningLight: 'var(--color-warning-light)',
        primaryLight: 'var(--color-primary-light)',

        borderColor: 'var(--color-border)',
        borderMuted: 'var(--color-border-muted)'

        
      },
      spacing: {
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        '4': 'var(--space-4)',
        '8': 'var(--space-8)'
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)'
      },
      boxShadow: {
        card: 'var(--shadow-card)'
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        heading: ['var(--font-heading)']
      },
      maxWidth: {
        'content': 'var(--container-max)'
      }
    }
  },
  plugins: [],
}
