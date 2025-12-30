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
import org.springframework.core.env.Environment;
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

    @Value("${aws.cognito.issuer}")
    private String issuer;

    @Value("${aws.cognito.audience:}")
    private String audience;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        boolean localMode = issuer == null || issuer.isEmpty() || issuer.contains("localstack");

        http.authorizeHttpRequests(auth -> auth
                .requestMatchers("/public/**", "/top").permitAll()
                .anyRequest().authenticated()
        );

        if (localMode) {
            // local 開発モードでは簡易トークンを受け入れるフィルタを追加
            http.addFilterBefore(new LocalAuthFilter(), UsernamePasswordAuthenticationFilter.class);
            // allow CORS from vite dev server
            http.cors();
        } else {
            // build JwtDecoder here to avoid auto-config enabling resource-server in local
            NimbusJwtDecoder jwtDecoder = NimbusJwtDecoder.withJwkSetUri(issuer + "/.well-known/jwks.json").build();
            OAuth2TokenValidator<org.springframework.security.oauth2.jwt.Jwt> withIssuer = JwtValidators.createDefaultWithIssuer(issuer);

            if (audience != null && !audience.isEmpty()) {
                OAuth2TokenValidator<org.springframework.security.oauth2.jwt.Jwt> audienceValidator = new com.example.project.security.AudienceValidator(audience);
                jwtDecoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(withIssuer, audienceValidator));
            } else {
                jwtDecoder.setJwtValidator(withIssuer);
            }

            http.oauth2ResourceServer(oauth -> oauth
                    .jwt(jwt -> jwt.decoder(jwtDecoder))
            );
        }

        // For API-style usage in local dev, disable CSRF to allow POST requests from tools/scripts
        http.csrf().disable();

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOrigin("http://localhost:5173");
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

    @Bean
    public JwtDecoder jwtDecoder() {
        NimbusJwtDecoder jwtDecoder = NimbusJwtDecoder.withJwkSetUri(issuer + "/.well-known/jwks.json").build();

        OAuth2TokenValidator<org.springframework.security.oauth2.jwt.Jwt> withIssuer = JwtValidators.createDefaultWithIssuer(issuer);

        if (audience != null && !audience.isEmpty()) {
            OAuth2TokenValidator<org.springframework.security.oauth2.jwt.Jwt> audienceValidator = new AudienceValidator(audience);
            jwtDecoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(withIssuer, audienceValidator));
        } else {
            jwtDecoder.setJwtValidator(withIssuer);
        }

        return jwtDecoder;
    }
}