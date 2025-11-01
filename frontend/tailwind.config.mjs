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
        primary: 'var(--color-primary)',
        muted: 'var(--color-muted)',
        shadowColor: 'var(--color-shadow)',
        secondary: 'var(--color-secondary)',
        tertiary: 'var(--color-tertiary)',
        hoverPrimary: 'var(--hover-primary)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
        hoverDanger: 'var(--color-hover-danger)',
        success: 'var(--color-success)',
        hoverSuccess: 'var(--color-hover-success)',
        tableHeaderBg: 'var(--color-table-header-bg)',
        inputBg: 'var(--color-input-bg)'
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
