package com.example.project.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import com.example.project.security.LocalAuthFilter;

import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import com.example.project.security.AudienceValidator;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${aws.cognito.issuer:}")
    private String issuer;

    @Value("${aws.cognito.audience:}")
    private String audience;

    @Value("${auth.mode:prod}")
    private String authMode;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        if ("test".equals(authMode)) {
            http.authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable());
            return http.build();
        }

        boolean localMode = "local".equals(authMode);

        http.authorizeHttpRequests(auth -> auth
            .requestMatchers("/public/**", "/top", "/actuator/health", "/actuator/info").permitAll()
            .anyRequest().authenticated()
        );

        if (localMode || issuer == null || issuer.isEmpty()) {
            http.addFilterBefore(new LocalAuthFilter(), UsernamePasswordAuthenticationFilter.class);
            http.cors(cors -> cors.configurationSource(corsConfigurationSource()));
        } else {
            NimbusJwtDecoder jwtDecoder = NimbusJwtDecoder
                .withJwkSetUri(issuer + "/.well-known/jwks.json").build();
            OAuth2TokenValidator<org.springframework.security.oauth2.jwt.Jwt> withIssuer =
                JwtValidators.createDefaultWithIssuer(issuer);

            if (audience != null && !audience.isEmpty()) {
                jwtDecoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
                    withIssuer, new AudienceValidator(audience)));
            } else {
                jwtDecoder.setJwtValidator(withIssuer);
            }

            http.oauth2ResourceServer(oauth -> oauth.jwt(jwt -> jwt.decoder(jwtDecoder)));
        }

        http.csrf(csrf -> csrf.disable());
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOrigin("http://localhost:5173");
        configuration.addAllowedOrigin("http://localhost:8081");
        configuration.addAllowedOrigin("http://127.0.0.1:8081");
        configuration.addAllowedMethod("GET");
        configuration.addAllowedMethod("POST");
        configuration.addAllowedMethod("PUT");
        configuration.addAllowedMethod("DELETE");
        configuration.addAllowedMethod("OPTIONS");
        configuration.addAllowedHeader("*");
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
