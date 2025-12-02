import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
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
				},
				// Enhanced scientific color system with brand colors
				brand: {
					orange: 'hsl(var(--brand-orange))',
					'orange-light': 'hsl(var(--brand-orange-light))',
					'orange-dark': 'hsl(var(--brand-orange-dark))',
					red: 'hsl(var(--brand-red))',
					'red-light': 'hsl(var(--brand-red-light))',
					'red-dark': 'hsl(var(--brand-red-dark))',
				},
				success: {
					light: 'hsl(var(--success-light))',
					DEFAULT: 'hsl(var(--success-DEFAULT))',
					dark: 'hsl(var(--success-dark))'
				},
				warning: {
					light: 'hsl(var(--warning-light))',
					DEFAULT: 'hsl(var(--warning-DEFAULT))',
					dark: 'hsl(var(--warning-dark))'
				},
				error: {
					light: 'hsl(var(--error-light))',
					DEFAULT: 'hsl(var(--error-DEFAULT))',
					dark: 'hsl(var(--error-dark))'
				},
				// Interactive element colors
				interactive: {
					primary: 'hsl(var(--interactive-primary))',
					secondary: 'hsl(var(--interactive-secondary))',
					success: 'hsl(var(--interactive-success))',
					warning: 'hsl(var(--interactive-warning))',
					error: 'hsl(var(--interactive-error))'
				}
			},
			fontFamily: {
				display: 'var(--font-display)',
				body: 'var(--font-body)',
				mono: 'var(--font-mono)'
			},
			boxShadow: {
				'scientific': 'var(--shadow-scientific)',
				'elevated': 'var(--shadow-elevated)',
				'glow-primary': 'var(--glow-primary)',
				'glow-secondary': 'var(--glow-secondary)',
				'glow-success': 'var(--glow-success)',
				'glow-warning': 'var(--glow-warning)',
				'glow-error': 'var(--glow-error)'
			},
			dropShadow: {
				'glow-primary': 'var(--glow-primary)',
				'glow-secondary': 'var(--glow-secondary)',
				'glow-success': 'var(--glow-success)',
				'glow-warning': 'var(--glow-warning)',
				'glow-error': 'var(--glow-error)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'shimmer': {
					'0%': { backgroundPosition: '200% 0' },
					'100%': { backgroundPosition: '-200% 0' }
				},
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'slideUp': {
					from: {
						transform: 'translateY(100%) translateZ(0)',
						opacity: '0'
					},
					to: {
						transform: 'translateY(0) translateZ(0)',
						opacity: '1'
					}
				},
				'slideDown': {
					from: {
						transform: 'translateY(-100%) translateZ(0)',
						opacity: '0'
					},
					to: {
						transform: 'translateY(0) translateZ(0)',
						opacity: '1'
					}
				},
				'fadeIn': {
					from: {
						opacity: '0',
						transform: 'translateY(10px) translateZ(0)'
					},
					to: {
						opacity: '1',
						transform: 'translateY(0) translateZ(0)'
					}
				},
				'scaleIn': {
					from: {
						transform: 'scale(0.95) translateZ(0)',
						opacity: '0'
					},
					to: {
						transform: 'scale(1) translateZ(0)',
						opacity: '1'
					}
				},
				// iOS-style slide transitions
				'slide-in-right': {
					from: {
						transform: 'translateX(100%)',
						opacity: '0'
					},
					to: {
						transform: 'translateX(0)',
						opacity: '1'
					}
				},
				'slide-out-right': {
					from: {
						transform: 'translateX(0)',
						opacity: '1'
					},
					to: {
						transform: 'translateX(100%)',
						opacity: '0'
					}
				},
				'slide-in-left': {
					from: {
						transform: 'translateX(-30%)',
						opacity: '0.5'
					},
					to: {
						transform: 'translateX(0)',
						opacity: '1'
					}
				},
				'slide-out-left': {
					from: {
						transform: 'translateX(0)',
						opacity: '1'
					},
					to: {
						transform: 'translateX(-30%)',
						opacity: '0.5'
					}
				},
				'spin': {
					from: { transform: 'rotate(0deg)' },
					to: { transform: 'rotate(360deg)' }
				}
			},
			animation: {
				"shimmer": "shimmer 1.5s ease-in-out infinite",
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				"slide-up": "slideUp 0.3s ease-out",
				"slide-down": "slideDown 0.3s ease-out", 
				"fade-in": "fadeIn 0.3s ease-out",
				"scale-in": "scaleIn 0.2s ease-out",
				"slide-in": "slide-in-right 0.25s cubic-bezier(0.32, 0.72, 0, 1) forwards",
				"slide-in-left": "slide-in-left 0.25s cubic-bezier(0.32, 0.72, 0, 1) forwards",
				"slide-out-right": "slide-out-right 0.2s cubic-bezier(0.32, 0.72, 0, 1) forwards",
				"slide-out-left": "slide-out-left 0.2s cubic-bezier(0.32, 0.72, 0, 1) forwards",
				"spin": "spin 1s linear infinite",
			},
			spacing: {
				'safe-top': 'var(--safe-area-inset-top)',
				'safe-bottom': 'var(--safe-area-inset-bottom)',
				'safe-left': 'var(--safe-area-inset-left)',
				'safe-right': 'var(--safe-area-inset-right)',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
