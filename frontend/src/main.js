import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Vuetify
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
	components,
	directives,
	theme: {
		defaultTheme: 'myTheme',
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
			}
		}
	}
});

const app = createApp(App)
app.use(router)
app.use(vuetify)
app.mount('#app')
