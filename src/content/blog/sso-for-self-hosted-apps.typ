#import "_components.typ": callout, nerd-corner

#metadata((
  title: "SSO for Self‑Hosted Apps: One Login to Rule Them All",
  date: "2025-02-23",
  readingTime: "20min",
  excerpt: "How to set up single sign‑on for your homelab using Pocket ID, Tinyauth, and a reverse proxy, so you're not juggling dozens of passwords.",
  tags: ("self-hosting", "homelab", "security", "sso", "oidc"),
))<frontmatter>

You've got Jellyfin, Nextcloud, Grafana, n8n, and a dozen other services running on your homelab. Each one has its own login. Some use email, some use usernames, and you've probably reused the same password more times than you'd like to admit.

*Single sign-on (SSO)* fixes this: one login, one identity, access to everything. It's not just convenient — it's more secure, because you can enforce MFA in one place instead of hoping each app supports it.

#html.elem("img", attrs: (src: "/images/blog/sso-for-self-hosted-apps/sso-flow.svg", alt: "SSO authentication flow diagram", style: "border-radius: 0.5rem; margin: 1.5rem auto; max-width: 100%; height: auto;"))

= What SSO actually means (and doesn't mean)

*#link("https://en.wikipedia.org/wiki/Single_sign-on")[Single sign-on]* means you authenticate once, and that authentication is trusted by multiple applications. Instead of each app managing its own user database, they all ask the same *identity provider* (IdP) to verify who you are.

What SSO is *not*:
- *A password manager* — that syncs passwords across apps; SSO eliminates per-app passwords
- *The same as OAuth* — OAuth is for _authorization_ (what you can access), though it's often used alongside authentication protocols
- *Automatically secure* — SSO centralizes authentication, which means if your IdP is compromised, everything is

#callout("info", title: "The homelab SSO stack")[
For self-hosters, the typical setup is:

+ *Identity provider* — stores users, handles login (Pocket ID, Authentik, Keycloak)
+ *Reverse proxy with auth* — sits in front of apps, enforces authentication (Caddy + Tinyauth, Traefik + Authelia)
+ *Apps that support SSO* — use the IdP directly via OIDC/SAML, or trust headers from the proxy
]

= OIDC vs SAML vs "forward auth" (in plain English)

These acronyms get thrown around a lot. Here's what they actually mean:

== OIDC (OpenID Connect)

*#link("https://openid.net/connect/")[OIDC]* is the modern standard. It's built on top of OAuth 2.0 and adds an identity layer. When you click "Sign in with Google," that's OIDC.

The flow:
+ App redirects you to the IdP's login page
+ You authenticate with the IdP
+ IdP redirects you back with a token
+ App verifies the token and logs you in

Most self-hosted apps that support SSO use OIDC: Grafana, Nextcloud, GitLab, and many others.

== SAML (Security Assertion Markup Language)

*#link("https://en.wikipedia.org/wiki/Security_Assertion_Markup_Language")[SAML]* is older and more enterprise-focused. It uses XML instead of JSON and is common in corporate environments. If your app only supports SAML, you'll need an IdP that speaks it (Authentik and Keycloak both do).

For homelabs, OIDC is almost always the better choice — simpler, better tooling, and more apps support it.

== Forward auth / auth middleware

Some apps don't support SSO at all. For those, you put an *auth layer in front* via your reverse proxy. The proxy checks if you're authenticated before forwarding the request. If not, it redirects you to login.

This is where tools like *Tinyauth* and *Authelia* come in — they handle the authentication check, and the proxy (Caddy, Nginx, Traefik) enforces it.

#nerd-corner(title: "How forward auth actually works", subtitle: "The HTTP headers and trust model")[

When you use forward auth, here's the flow:

+ Request hits your reverse proxy for `app.yourdomain.com`
+ Proxy sends a *subrequest* to the auth server: "Is this user authenticated?"
+ Auth server checks session/cookie:
   - If valid: returns 200 + headers like `X-Forwarded-User`
   - If not: returns 401 or redirects to login
+ Proxy either forwards the request (with user headers) or blocks it

The critical part: your backend app must *trust these headers*. If someone can reach the app directly (bypassing the proxy), they could forge headers. That's why you need firewall rules ensuring apps only accept traffic from the proxy.

```
Client → Reverse Proxy → Auth Server (subrequest)
                ↓
         Forward to App (with X-Forwarded-User header)
```

]

= Option 1: Pocket ID (lightweight OIDC provider)

*#link("https://pocket-id.org/")[Pocket ID]* is a minimal, self-hosted OIDC provider. It's designed for homelabs: simple to set up, passkey-first, and doesn't try to be an enterprise IAM solution.

== What it does

- Provides OIDC for apps that support it (Grafana, Nextcloud, etc.)
- Supports passkeys (WebAuthn) as the primary login method
- Minimal footprint — runs in a single container

== Setting it up

```yaml
services:
  pocket-id:
    image: stonith404/pocket-id:latest
    container_name: pocket-id
    volumes:
      - ./pocket-id-data:/app/data
    environment:
      - APP_URL=https://auth.yourdomain.com
      - TRUST_PROXY=true
    ports:
      - "3000:3000"
    restart: unless-stopped
```

After starting, visit the URL and create your first user. Pocket ID will guide you through setting up a passkey.

== Connecting an app (Grafana example)

In Grafana's config:

```ini
[auth.generic_oauth]
enabled = true
name = Pocket ID
client_id = YOUR_CLIENT_ID
client_secret = YOUR_CLIENT_SECRET
scopes = openid email profile
auth_url = https://auth.yourdomain.com/authorize
token_url = https://auth.yourdomain.com/token
api_url = https://auth.yourdomain.com/userinfo
allow_sign_up = true
```

Create a new OIDC client in Pocket ID's admin panel, grab the client ID and secret, and you're done. Grafana now uses Pocket ID for authentication.

#callout("tip", title: "Start with Pocket ID if...")[
You want a simple, passkey-first OIDC provider and your apps already support OIDC. It's not as feature-rich as Authentik or Keycloak, but it's far easier to run.
]

= Option 2: Tinyauth (forward auth for apps without SSO)

*#link("https://tinyauth.app/")[Tinyauth]* is an auth server designed for forward auth. It sits behind your reverse proxy and protects apps that don't support SSO natively.

== What it does

- Provides a login page for your homelab
- Works with Caddy, Nginx, Traefik (any proxy supporting forward auth)
- Supports OIDC upstream (use Pocket ID or Google as the actual IdP)

== Setting it up

```yaml
services:
  tinyauth:
    image: ghcr.io/steveiliop56/tinyauth:latest
    container_name: tinyauth
    environment:
      - SECRET=your-secret-key-here
      - APP_URL=https://auth.yourdomain.com
      - USERS=admin:$2a$10$hashedpassword  # or use OIDC
    ports:
      - "3001:3000"
    restart: unless-stopped
```

== Using with Caddy

In your Caddyfile, add forward auth to any site:

```caddyfile
# The auth endpoint
auth.yourdomain.com {
    reverse_proxy tinyauth:3000
}

# Protected app
jellyfin.yourdomain.com {
    forward_auth tinyauth:3000 {
        uri /api/auth/caddy
        copy_headers Remote-User Remote-Email
    }
    reverse_proxy jellyfin:8096
}
```

Now Jellyfin is protected by Tinyauth. If you're not logged in, you'll see the Tinyauth login page. After authenticating, you're forwarded to Jellyfin with your identity passed in headers.

== Connecting Tinyauth to Pocket ID

For the best of both worlds, use Tinyauth as your forward auth layer but authenticate against Pocket ID via OIDC:

```yaml
environment:
  - OIDC_ENABLED=true
  - OIDC_ISSUER=https://auth.yourdomain.com
  - OIDC_CLIENT_ID=tinyauth
  - OIDC_CLIENT_SECRET=your-secret
```

Now you get passkey-based authentication (via Pocket ID) protecting apps that don't support SSO (via Tinyauth forward auth).

= Protecting apps that have no auth at all

Some self-hosted apps ship with no authentication. Uptime Kuma has an optional login. Some dashboards are wide open. For these, forward auth is essential.

The pattern:
+ App runs on internal port, not exposed to the internet
+ Reverse proxy exposes the app on a public domain
+ Proxy requires authentication via forward auth before serving

Example protecting a dashboard:

```caddyfile
dashboard.yourdomain.com {
    forward_auth tinyauth:3000 {
        uri /api/auth/caddy
    }
    reverse_proxy heimdall:80
}
```

#callout("warning", title: "Don't rely on Tailscale alone")[
Even on a private tailnet, you probably want authentication on sensitive dashboards. If a family member's phone is on your tailnet, should they have access to your NAS admin panel? Layers matter.
]

= The full stack: putting it together

Here's how I run my homelab SSO:

```
                    Internet
                        │
                   Cloudflare
                        │
                ┌───────▼───────┐
                │    Caddy      │  ← TLS termination, forward auth
                └───────┬───────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
   Tinyauth        Pocket ID       Apps (OIDC)
   (forward         (IdP)         Grafana, etc.
    auth)              │
        │              │
        └──────OIDC────┘
```

- *Pocket ID* is the identity provider — it knows who you are
- *Tinyauth* protects apps that don't support OIDC, authenticating against Pocket ID
- *Caddy* routes traffic and enforces authentication
- *Apps with OIDC support* (Grafana, Nextcloud) talk to Pocket ID directly

= Common mistakes (and how to avoid them)

== 1. Exposing apps directly

If an app is reachable without going through the proxy, forward auth is useless. Use firewall rules:

```bash
# Apps only accept traffic from the reverse proxy container
sudo ufw allow from 172.17.0.0/16 to any port 8096  # Docker network
sudo ufw deny 8096
```

== 2. Not enabling MFA

SSO centralizes authentication. If your IdP account is compromised, everything is. Enable MFA — ideally hardware keys or passkeys.

== 3. Trusting headers without verification

If your app reads `X-Forwarded-User` headers, make sure it only accepts them from trusted sources. Some apps have a "trusted proxies" setting.

== 4. Over-complicating it

You don't need Keycloak. You don't need a full IAM suite. For a homelab with a handful of users, Pocket ID + Tinyauth is plenty.

= When to use what

#table(
  columns: 2,
  table.header([*Scenario*], [*Use*]),
  [App supports OIDC (Grafana, Nextcloud, GitLab)], [*Pocket ID* (or Authentik) directly],
  [App has no SSO support (dashboards, simple tools)], [*Tinyauth* forward auth],
  [Need groups/roles/complex permissions], [*Authentik* (more features, more complexity)],
  [Corporate environment / SAML requirement], [*Keycloak* (enterprise-grade, steep learning curve)],
)

= Troubleshooting

== "Redirect loop" after login

Usually a cookie domain mismatch. Make sure:
- Your IdP and apps share a common parent domain (e.g., `*.yourdomain.com`)
- Cookies are set with the correct domain scope
- You're not mixing HTTP and HTTPS

== Forward auth always returns 401

Check:
- The auth server is reachable from the proxy
- The `uri` path matches what your auth server expects
- Session cookies are being set and sent

== App doesn't receive user headers

Verify:
- `copy_headers` directive includes the headers your app expects
- The auth server is actually returning those headers on success
- The app is configured to trust headers from the proxy IP

= Further reading

- #link("https://pocket-id.org/")[Pocket ID documentation]
- #link("https://tinyauth.app/")[Tinyauth setup guide]
- #link("https://caddyserver.com/docs/caddyfile/directives/forward_auth")[Caddy forward_auth directive]
- #link("https://developer.okta.com/blog/2019/10/21/illustrated-guide-to-oauth-and-oidc")[OIDC explained simply]
- #link("https://goauthentik.io/docs/")[Authentik documentation] (if you want more features)

= Next steps

Once you have SSO working:
- Set up a proper #link("/blog/reverse-proxy-homelab")[reverse proxy] for all your services
- Configure #link("/blog/tailscale-explained")[Tailscale] for secure remote access
- Consider #link("/blog/self-hosting-with-tailscale#crowdsec-crowd-sourced-threat-intelligence")[CrowdSec] if you're exposing anything publicly

One login. MFA in one place. No more password reuse across a dozen apps.
