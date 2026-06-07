module.exports = {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: 'var(--color-primary)',
                'primary-container': 'var(--color-primary-container)',
                secondary: 'var(--color-secondary)',
                'secondary-container': 'var(--color-secondary-container)',
                background: 'var(--color-background)',
                'surface-container': 'var(--color-surface-container)',
                'surface-container-low': 'var(--color-surface-container-low)',
                'surface-container-high': 'var(--color-surface-container-high)',
                'on-surface': 'var(--color-on-surface)',
                'on-surface-variant': 'var(--color-on-surface-variant)',
                'outline-variant': 'var(--color-outline-variant)',
                error: 'var(--color-error)',
                'primary-fixed-dim': 'var(--color-primary-fixed-dim)',
            },
        },
    },
    plugins: [],
};
