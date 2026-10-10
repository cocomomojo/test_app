import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Vuetify
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Determine initial theme from localStorage or system preference
const getInitialTheme = () => {
	const stored = localStorage.getItem('app_theme');
	if (stored) {
		return stored === 'dark' ? 'myDarkTheme' : 'myTheme';
	}
	// Check system preference
	if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
		return 'myDarkTheme';
	}
	return 'myTheme';
};

const vuetify = createVuetify({
	components,
	directives,
	theme: {
		defaultTheme: getInitialTheme(),
		themes: {
			myTheme: {
				dark: false,
				colors: {
					primary: '#1976D2',
					secondary: '#9C27B0',
					success: '#4CAF50',
					info: '#2196F3',
					error: '#E53935',
					background: '#F5F7FA',
					surface: '#FFFFFF'
				}
			},
			myDarkTheme: {
				dark: true,
				colors: {
					primary: '#64B5F6',
					secondary: '#BA68C8',
					success: '#81C784',
					info: '#64B5F6',
					error: '#EF5350',
					background: '#121212',
					surface: '#1E1E1E'
				}
			}
		}
	}
});

const app = createApp(App)
app.use(router)
app.use(vuetify)
app.mount('#app')
