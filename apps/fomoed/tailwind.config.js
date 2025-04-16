import tailwindcssAnimate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			screens: {
				// fhd: "1920px",
				// "2k": "2560px",
				// "4k": "3840px",
				// "-2xl": { max: "1535px" },
				// "-xl": { max: "1279px" },
				// "-lg": { max: "1023px" },
				// "-md": { max: "767px" },
				'-xs': { max: '500px' },
				xs: { min: '500px' },
				'-sm': { max: '639px' },
				// "@md": { min: "640px", max: "767px" },
				// "@lg": { min: "768px", max: "1023px" },
				// "@xl": { min: "1024px", max: "1279px" },
				// "@2xl": { min: "1280px", max: "1535px" },
				desktop: { min: '980px' }, // The maximum width that the homepage look good on
				'-desktop': { max: '980px' }, // The maximum width that the homepage look good on
				'-1120': { max: '1120px' }
			},
			colors: {
				background: '#0d0d0d',
				platform_red: '#f02834',
				platform_orange: '#f07d29',
				platform_light_green: '#99cb81',
				platform_green: '#34b348',
				primary: '#FF3B10',
				yellow: '#F3C111',
				red: '#FF3B10',
				green: '#399F57',
				skeleton: 'rgba(255,255,255,0.1)',
				'new-white': '#F3F4FA',
				border: 'hsl(var(--border) / <alpha-value>)',
				input: 'hsl(var(--input) / <alpha-value>)',
				ring: 'hsl(var(--ring) / <alpha-value>)',
				background: 'hsl(var(--background) / <alpha-value>)',
				foreground: 'hsl(var(--foreground) / <alpha-value>)',
				primary: {
					DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
					foreground: 'hsl(var(--primary-foreground) / <alpha-value>)'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
					foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
					foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
					foreground: 'hsl(var(--muted-foreground) / <alpha-value>)'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
					foreground: 'hsl(var(--accent-foreground) / <alpha-value>)'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
					foreground: 'hsl(var(--popover-foreground) / <alpha-value>)'
				},
				card: {
					DEFAULT: 'hsl(var(--card) / <alpha-value>)',
					foreground: 'hsl(var(--card-foreground) / <alpha-value>)'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			// borderRadius: {
			// 	xl: 'calc(var(--radius) + 4px)',
			// 	lg: 'var(--radius)',
			// 	md: 'calc(var(--radius) - 2px)',
			// 	sm: 'calc(var(--radius) - 4px)'
			// },
			fontFamily: {
				satoshi: ['Satoshi-Variable', 'sans-serif'],
				switzer: ['Switzer-Variable', 'sans-serif'],
				paralucent: ['Paralucent', 'sans-serif'],
				'paralucent-demibold': ['ParalucentDemibold', 'sans-serif'],
				'paralucent-heavy': ['ParalucentHeavy', 'sans-serif'],
				sans: ['Manrope', 'sans-serif'],
				manrope: ['Manrope', 'sans-serif'],
				mono: ['DM Mono', 'monospace'],
				inter: ['Inter', 'sans-serif']
				// sans: ['geist-sans', ...fontFamily.sans]
			},
			boxShadow: {
				'primary-button': '0px 0px 0px 5px #FF3B1033'
			},
			animation: {
				'reverse-spin': 'reverse-spin 1s linear infinite',
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'caret-blink': 'caret-blink 1.25s ease-out infinite'
			},
			keyframes: {
				'reverse-spin': {
					from: {
						transform: 'rotate(360deg)'
					}
				},
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--bits-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--bits-accordion-content-height)' },
					to: { height: '0' }
				},
				'caret-blink': {
					'0%,70%,100%': { opacity: '1' },
					'20%,50%': { opacity: '0' }
				}
			}
		}
	},
	plugins: [tailwindcssAnimate]
};
