# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please report it via the issue tracker, marking it as "Security" or "Private" if possible.

## Security Architecture

### Authentication & Persistence
This application uses **Supabase** for authentication.
- **Token Storage**: By default, `supabase-js` stores sessions in `localStorage`.
- **Implications**: If an XSS vulnerability exists in the application, authentication tokens could be compromised. We rely on strict XSS prevention (React's default escaping) to mitigate this.
- **Future Improvements**: For high-security environments, consider moving to HttpOnly cookies using a backend proxy or Edge Functions.

### Content Security
- **Output Encoding**: We rely on React's automatic output encoding to prevent XSS.
- **Unsafe Methods**: The codebase minimizes usage of `dangerouslySetInnerHTML`.
    - `chart.tsx`: This component uses `dangerouslySetInnerHTML` for dynamic styling. It includes sanitization checks, but usage should still be monitored.

## Best Practices for Contributors
- **Secrets**: Never commit `.env` files. Ensure `VITE_SUPABASE_ANON_KEY` is the *only* exposed key (it is safe to be public).
- **Dependencies**: Keep `package.json` dependencies updated. Run `npm audit` regularly.
- **Input Validation**: Validate all user inputs on both client and server (Supabase RLS).
