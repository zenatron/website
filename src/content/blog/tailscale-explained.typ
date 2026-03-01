#metadata((
  title: "Tailscale Explained: The Mesh VPN That Feels Like Magic",
  date: "2025-02-17",
  readingTime: "24min",
  excerpt: "A practical, human‑readable breakdown of how Tailscale works, why it's different, and when it's the right tool.",
  tags: ("tailscale", "vpn", "networking", "homelab", "wireguard"),
))<frontmatter>

#import "_components.typ": callout, nerd-corner

The first time you SSH into your home server from a coffee shop *without* opening a port on your router, it feels like magic. Tailscale is that kind of magic — but it's actually just smart networking built on solid cryptography.

#html.elem("img", attrs: (src: "/images/blog/tailscale-explained/tailnet-mesh.svg", alt: "A simplified tailnet mesh diagram", style: "border-radius: 0.5rem; margin: 1.5rem auto; max-width: 100%; height: auto;"))
#html.elem("img", attrs: (src: "/images/blog/tailscale-explained/control-plane-data-plane.svg", alt: "Diagram showing control plane coordination and direct data plane traffic", style: "border-radius: 0.5rem; margin: 1.5rem auto; max-width: 100%; height: auto;"))

= What Tailscale is (and is not)

Tailscale is a *mesh #link("https://en.wikipedia.org/wiki/Virtual_private_network")[VPN]* built on *#link("https://en.wikipedia.org/wiki/WireGuard")[WireGuard]*. Instead of routing all your traffic through a single VPN server, it creates *direct, encrypted connections between your devices* whenever possible. Think of it as a private *#link("https://en.wikipedia.org/wiki/Mesh_networking")[mesh network]* with strong identity controls.

- *It _is_:* a secure way to connect devices across the internet.
- *It _is not_:* a traditional VPN for hiding your browsing from websites (though you can route traffic that way if you want).

If you're new to VPNs entirely, start here: #link("/blog/what-is-a-vpn")[What Is a VPN?]

= The short version of how it works

+ *You install the app* on devices you own.
+ *You log in* with an identity provider (Google, GitHub, etc.).
+ *Tailscale brokers the connection* so your devices can find each other.
+ *Devices connect directly* (#link("https://en.wikipedia.org/wiki/Peer-to-peer")[peer‑to‑peer]) whenever possible.

Under the hood, it uses a mix of *#link("https://en.wikipedia.org/wiki/STUN")[STUN]* and NAT traversal to discover how each device can be reached. If the network won't allow it, Tailscale falls back to relays (DERP).

= WireGuard under the hood

Tailscale uses WireGuard, which is fast, minimal, and audited. WireGuard gives you:

- Strong modern cryptography (#link("https://en.wikipedia.org/wiki/ChaCha20-Poly1305")[ChaCha20-Poly1305] for encryption, #link("https://en.wikipedia.org/wiki/Curve25519")[Curve25519] for key exchange)
- Low overhead (great for laptops and mobile)
- Simple key management
- ~4,000 lines of code vs 100,000+ for OpenVPN — less code means fewer bugs

Here's WireGuard's official paper for the curious: #link("https://www.wireguard.com/papers/wireguard.pdf")[WireGuard: Next Generation Kernel Network Tunnel]

#nerd-corner(title: "WireGuard Cryptography Deep Dive", subtitle: "How the Noise protocol handshake actually works")[

== How WireGuard key exchange actually works

Here's where it gets nerdy (in a good way). WireGuard uses the *#link("http://www.noiseprotocol.org/")[Noise Protocol Framework]* — specifically the `Noise_IKpsk2` handshake pattern. Don't worry, I'll translate.

When two devices want to talk:

+ *Each device has a static key pair* — a long-term #link("https://en.wikipedia.org/wiki/Curve25519")[Curve25519] public/private key. This is your device's cryptographic identity.

+ *The initiator generates an ephemeral key pair* — a temporary keypair used only for this handshake. This provides #link("https://en.wikipedia.org/wiki/Forward_secrecy")[forward secrecy]: even if your long-term keys get compromised later, past sessions can't be decrypted.

+ *#link("https://en.wikipedia.org/wiki/Diffie%E2%80%93Hellman_key_exchange")[Diffie-Hellman] happens (multiple times)*:
  - Initiator's ephemeral × Responder's static
  - Initiator's static × Responder's static
  - Initiator's ephemeral × Responder's ephemeral

+ *All those DH outputs get mixed together* using #link("https://en.wikipedia.org/wiki/HKDF")[HKDF] to derive the actual symmetric encryption keys.

+ *Optional pre-shared key* gets mixed in too (the `psk2` part), adding quantum resistance if you're paranoid about future quantum computers.

The whole handshake is *1-RTT* (one round trip) and fits in a single UDP packet each way. Compare that to TLS, which needs multiple round trips and way more complexity.

#callout("tip", title: "Why this matters for Tailscale")[
Tailscale's control plane distributes the static public keys. Your device never sends its private key anywhere — Tailscale just tells Device A "here's Device B's public key" and vice versa. The actual key exchange happens directly between devices.
]

For the full cryptographic details, see the #link("https://www.wireguard.com/protocol/")[WireGuard protocol documentation].
]

= Control plane vs data plane (why it's still fast)

Tailscale has a *control plane* that helps devices discover each other and exchange keys, but the *data plane* (the actual traffic) goes directly between your devices when possible. That's why it feels fast — you're not hair‑pinning through a central server unless you have to.

Because only metadata flows through the control plane, the coordination service never sees your actual encrypted traffic. If you self‑host with *#link("https://github.com/juanfont/headscale")[Headscale]*, you take over that coordination role.

== Tailscale vs Headscale (quick breakdown)

- *Tailscale*: hosted control plane, easiest setup, polished admin UI.
- *Headscale*: open‑source control plane you host yourself, more work, more control.

If you already run a homelab and want to minimize third‑party trust, Headscale is worth a look.

= How Tailscale compares to traditional VPN architectures

Let me be blunt: traditional VPNs and Tailscale solve fundamentally different problems. Here's the real breakdown:

== Traditional hub-and-spoke VPN (OpenVPN, IPsec, etc.)

```
          ┌─────────────┐
          │  VPN Server │
          │  (gateway)  │
          └──────┬──────┘
       ┌─────────┼─────────┐
       │         │         │
       ▼         ▼         ▼
    Device A  Device B  Device C
```

- *All traffic routes through central server* — even if Device A wants to talk to Device B sitting next to it
- *Single point of failure* — server goes down, everyone's disconnected
- *Bandwidth bottleneck* — server handles all traffic
- *Perimeter security model* — once you're "in," you're trusted
- *Complex configuration* — certificates, firewall rules, port forwarding

== Tailscale's mesh architecture

```
    Device A ◄────────► Device B
        ▲                   ▲
        │                   │
        └───────┬───────────┘
                │
                ▼
            Device C
    
    (Control plane handles discovery,
     but data flows directly)
```

- *Direct peer-to-peer connections* — traffic takes the shortest path
- *No single point of failure* — control plane outage doesn't kill existing connections
- *Scales horizontally* — adding devices doesn't increase central load
- *Zero-trust model* — every device authenticated individually
- *Almost zero configuration* — install, log in, done

== The "site-to-site" problem

Traditional VPNs excel at connecting _networks_ (your office LAN to the datacenter). Tailscale excels at connecting _devices_ regardless of what network they're on. Different tools, different jobs.

If you need a contractor to access one internal service without touching the rest of your network, Tailscale wins. If you need to bridge two entire subnets with legacy equipment that can't run clients, traditional VPN (or Tailscale's #link("https://tailscale.com/kb/1019/subnets")[subnet routers]) might be the answer.

= Identity + keys (the real security story)

Every device gets a unique key pair, and access is tied to your identity provider. That's the *#link("https://en.wikipedia.org/wiki/Zero_trust_security_model")[zero‑trust]* feel: instead of trusting a network, you trust *who* (and *which device*) is connecting. Under the hood it's standard *#link("https://en.wikipedia.org/wiki/Public-key_cryptography")[public‑key cryptography]*, but with sane defaults.

Tailscale also #link("https://tailscale.com/kb/1028/key-expiry")[rotates keys] over time, which limits the impact of a long‑lost laptop or a compromised device.

== A note on identity provider trust

Here's the uncomfortable truth: your tailnet is only as secure as your identity provider. If someone compromises your Google or GitHub account, they can add their own device to your tailnet and access everything your ACLs allow. This is the trade-off for the convenience of SSO.

Mitigations worth considering:
- *Enable MFA* on your identity provider — preferably with hardware security keys, not SMS
- *Use a separate account* for your homelab if you're paranoid (a dedicated Google Workspace account, for example)
- *Enable #link("https://tailscale.com/kb/1226/tailnet-lock")[Tailnet Lock]* — this requires existing nodes to sign new device keys, so even a compromised identity provider can't unilaterally add devices

#callout("warning", title: "For the truly paranoid")[
Tailnet Lock is the nuclear option. It adds friction (you need to approve new devices from an existing node), but it means your tailnet's security doesn't collapse if your identity provider does.
]

= NAT traversal + DERP relays (the "how did it work?" part)

Most home networks sit behind #link("https://en.wikipedia.org/wiki/Network_address_translation")[NAT], which makes inbound connections hard. Tailscale uses *#link("https://en.wikipedia.org/wiki/NAT_traversal")[NAT traversal]* techniques to punch through when it can. If that fails, it falls back to *DERP relays* (basically a secure relay network) so your devices still connect.

Relays are a fallback — not the default. You can check in the Tailscale admin panel whether a connection is direct or relayed.

#callout("info", title: "Why this matters")[
Direct connections are faster and more private, but relays make sure it still works in tricky networks (office Wi‑Fi, hotels, strict firewalls).
]

== How NAT hole-punching actually works (step by step)

NAT hole-punching sounds like hacker movie nonsense, but it's actually elegant. Here's what happens when Device A (behind NAT) wants to connect to Device B (also behind NAT):

*Step 1: STUN discovery*

Both devices send packets to Tailscale's #link("https://en.wikipedia.org/wiki/STUN")[STUN] servers. The STUN server sees the _external_ IP and port that the NAT assigned, and reports it back. Now each device knows its own public-facing address.

```
Device A ──► NAT A ──► STUN Server
                           │
            "Your public address is 1.2.3.4:54321"
```

*Step 2: Coordination server exchange*

Tailscale's control plane tells each device the other's public address. Device A learns that Device B is at `5.6.7.8:12345`, and vice versa.

*Step 3: Simultaneous connection attempts*

Here's the magic: both devices send packets to each other _at roughly the same time_.

```
Device A (1.2.3.4:54321) ──────► Device B (5.6.7.8:12345)
Device B (5.6.7.8:12345) ──────► Device A (1.2.3.4:54321)
```

When Device A sends a packet _out_ to Device B, NAT A creates a mapping: "packets from Device A going to 5.6.7.8:12345 should use external port 54321."

When Device B's packet arrives at NAT A, it looks like a _reply_ to Device A's outbound packet — so NAT A lets it through. The same happens in reverse at NAT B.

*Step 4: Connection established*

Both NATs have now "punched holes" for this specific peer. Traffic flows directly.

#callout("warning", title: "When hole-punching fails")[
Some NATs are jerks. *Symmetric NAT* assigns a different external port for every destination, breaking the assumption that Device B can reach the same port Device A used for STUN. Corporate firewalls often block UDP entirely. That's when DERP kicks in.
]

For more details, see Tailscale's excellent #link("https://tailscale.com/blog/how-nat-traversal-works")[How NAT traversal works] blog post.

== DERP relay infrastructure: what's actually happening

DERP stands for *Designated Encrypted Relay for Packets* (yes, really). When direct connections fail, your traffic routes through DERP servers — but here's the key thing: *DERP can't read your traffic*. It's still WireGuard-encrypted end-to-end; DERP just forwards the opaque blobs.

Tailscale operates #link("https://tailscale.com/kb/1232/derp-servers")[DERP servers worldwide]:
- North America: NYC, San Francisco, Seattle, Chicago, Dallas, Miami, Denver, Los Angeles
- Europe: Amsterdam, Frankfurt, London, Paris, Warsaw
- Asia-Pacific: Singapore, Sydney, Tokyo, Hong Kong, Bangalore
- South America: São Paulo

When you run `tailscale netcheck`, you'll see latency to each DERP region. The client automatically picks the fastest one.

`````bash
$ tailscale netcheck

Report:
    * UDP: true
    * IPv4: yes, 1.2.3.4:54321
    * IPv6: yes, [2001:db8::1]:54321
    * MappingVariesByDestAddr: false
    * HairPinning: false
    * PortMapping: UPnP
    * Nearest DERP: San Francisco
    * DERP latency:
        - sfo: 12ms
        - lax: 18ms
        - sea: 25ms
        - nyc: 65ms
        - fra: 142ms
`````

#callout("tip", title: "Self-hosting DERP")[
If you're paranoid (or have specific latency requirements), you can #link("https://tailscale.com/kb/1118/custom-derp-servers")[run your own DERP server]. It's a single Go binary. I do this for my homelab to ensure traffic between local devices never leaves my network even when hole-punching fails.
]

= Tailscale Funnel: public access without the port forwarding nightmare

Here's a feature that made me delete my Cloudflare Tunnel setup: *#link("https://tailscale.com/kb/1223/funnel")[Tailscale Funnel]*. It lets you expose a service on your tailnet to the _public internet_ — no port forwarding, no dynamic DNS, no reverse proxy configuration.

== How it works

```
Public Internet ──► Tailscale's edge ──► Your device (via DERP/direct)
    https://mybox.tail1234.ts.net
```

+ Tailscale provisions a public hostname for your device (like `mybox.tail1234.ts.net`)
+ They handle TLS termination with a valid certificate
+ Traffic flows through their edge, then to your device over the encrypted tailnet
+ Your device never needs to accept inbound connections from the internet

== Setting it up

```bash
# Expose a local web server on port 8080
tailscale funnel 8080

# Or expose with a specific path
tailscale funnel --set-path=/api localhost:3000
```

That's it. You get a working HTTPS URL in seconds.

== When to use Funnel vs other options

#table(
  columns: 5,
  table.header([*Scenario*], [*Use Funnel*], [*Use Cloudflare Tunnel*], [*Use port forwarding*]),
  [Quick demo/webhook testing], [✅], [Overkill], [Overkill],
  [Production with custom domain], [Maybe], [✅], [✅],
  [Self-hosted apps for friends], [✅], [✅], [Pain],
  [Bandwidth-heavy (video streaming)], [Consider limits], [✅], [✅],
  [Full control over edge], [❌], [Partial], [✅],
)

#callout("warning", title: "Funnel limitations")[
Funnel has bandwidth limits on the free plan, and you're trusting Tailscale's edge with unencrypted HTTP traffic (before it hits WireGuard). For serious production use, consider #link("https://tailscale.com/kb/1312/serve")[Tailscale Serve] for tailnet-only access, or combine with your own reverse proxy.
]

See the #link("https://tailscale.com/kb/1223/funnel")[Funnel documentation] for the full details.

== Exit nodes vs Funnel vs Cloudflare Tunnel: which do you need?

These three get confused constantly. Here's the decision tree:

*What are you trying to do?*

#table(
  columns: 3,
  table.header([*Goal*], [*Use*], [*Why*]),
  [Route my internet traffic through a trusted location], [*Exit Node*], [Tunnels _outbound_ traffic from your device through another node in your tailnet],
  [Let someone _outside_ my tailnet access a service I'm running], [*Funnel* or *Cloudflare Tunnel*], [Creates an _inbound_ path from the public internet],
  [Access my own services from my own devices], [*Neither* — just use Tailscale directly], [That's the default behavior],
)

*Funnel vs Cloudflare Tunnel decision:*

#table(
  columns: 3,
  table.header([*Consideration*], [*Funnel*], [*Cloudflare Tunnel*]),
  [*Setup complexity*], [One command], [More config, but still reasonable],
  [*Custom domain*], [Limited (uses `*.ts.net`)], [Full control],
  [*DDoS protection*], [Basic], [Cloudflare's full stack],
  [*Bandwidth limits*], [Yes (free tier)], [Generous],
  [*TLS termination*], [Tailscale's edge], [Cloudflare's edge],
  [*Caching/CDN*], [No], [Yes],
  [*Zero-trust access policies*], [Via Tailscale ACLs], [Via Cloudflare Access],
)

*My recommendation:*
- *Quick demos, webhooks, sharing with a few friends* → Funnel
- *Anything "production" with custom domains* → Cloudflare Tunnel
- *Internal services for your own devices* → Neither, just Tailscale

#callout("info", title: "They're not mutually exclusive")[
You can run both. I use Tailscale for private access to everything, and Cloudflare Tunnel for the handful of services I expose publicly. Different tools, different jobs.
]

= MagicDNS + ACLs = sane networking

Two features make Tailscale feel polished:

- *#link("https://tailscale.com/kb/1081/magicdns")[MagicDNS]* gives your devices friendly names (like `nas.tailnet`), instead of memorizing IPs, by handling *#link("https://en.wikipedia.org/wiki/Domain_Name_System")[DNS]* for your tailnet.
- *#link("https://tailscale.com/kb/1018/acls")[ACLs]* (access control lists) let you define who can access what — same idea as a classic *#link("https://en.wikipedia.org/wiki/Access-control_list")[ACL]*, but applied to your tailnet.

Example ACL snippet:

```json
{
  "acls": [
    {"action": "accept", "src": ["group:admins"], "dst": ["tag:server:*"]}
  ]
}
```

You can also create *device tags* (like `tag:server`), then grant access to groups rather than specific devices. That makes permissions easier to reason about as your tailnet grows.

== ACL patterns for homelabs

Here's a real-world ACL structure I use for my homelab. It's not minimal, but it's sane:

`````json
{
  "groups": {
    "group:admins": ["user@gmail.com"],
    "group:family": ["spouse@gmail.com", "kid@gmail.com"]
  },
  "tagOwners": {
    "tag:server": ["group:admins"],
    "tag:media": ["group:admins"],
    "tag:nas": ["group:admins"]
  },
  "acls": [
    // Admins can access everything
    {"action": "accept", "src": ["group:admins"], "dst": ["*:*"]},
    
    // Family can access media servers (Jellyfin, etc.)
    {"action": "accept", "src": ["group:family"], "dst": ["tag:media:80,443,8096"]},
    
    // Family can access NAS for file sharing
    {"action": "accept", "src": ["group:family"], "dst": ["tag:nas:445,5000"]},
    
    // Servers can talk to each other (for backups, monitoring, etc.)
    {"action": "accept", "src": ["tag:server"], "dst": ["tag:server:*"]},
    
    // All devices can use the exit node
    {"action": "accept", "src": ["autogroup:members"], "dst": ["autogroup:internet:*"]}
  ]
}
`````

*Why this structure works:*
- *Groups* represent people, not devices — when you add a new phone, permissions follow automatically
- *Tags* represent roles, not specific machines — swap your NAS hardware, just re-tag
- *Autogroups* like `autogroup:members` and `autogroup:internet` reduce boilerplate
- *Explicit port lists* for family access — they get Jellyfin, not SSH

*Common footguns to avoid:*
- *Accidentally allowing `*:*` to everyone* — always start restrictive, then open up
- *Forgetting to tag servers* — an untagged device might fall through to a permissive rule, or worse, be unreachable
- *Not approving routes* — subnet routers and exit nodes need explicit approval in the admin console, not just ACLs
- *Overly complex ACLs* — if you can't explain a rule in one sentence, simplify it

#callout("tip", title: "Testing ACLs")[
Use `tailscale status` and `tailscale ping <device>` to verify connectivity. The admin console also has an ACL preview tool that shows what each user/device can access.
]

= Real‑world use cases

- *Remote #link("https://en.wikipedia.org/wiki/Secure_Shell")[SSH] access* to your server without port forwarding
- *Private media servers* (Jellyfin, Plex, Audiobookshelf)
- *Family tech support* without a complex router setup
- *Development environments* — access your home dev server from anywhere
- *IoT device management* — reach your smart home gear securely
- *Game servers* — friends can join without exposing ports

= Two power features worth knowing

- *#link("https://tailscale.com/kb/1019/subnets")[Subnet routers]* let you reach non‑Tailscale devices on a LAN (like a printer or a smart TV) through a tagged router.
- *#link("https://tailscale.com/kb/1103/exit-nodes")[Exit nodes]* let you route _all_ your internet traffic through a trusted device, similar to a traditional VPN but still within your tailnet.

= Performance tips

- Prefer *direct connections* when possible; relays add latency.
- Put the exit node close to the users who need it.
- If you're self‑hosting, keep the coordination server in a low‑latency region.
- Run `tailscale netcheck` to diagnose connectivity issues.
- Check `tailscale status` to see which connections are direct vs relayed.

= Tailscale SSH (no more shared SSH keys)

Tailscale can act as an *#link("https://en.wikipedia.org/wiki/Secure_Shell")[SSH]* access broker, which means you authenticate with your identity provider instead of copying keys around. It's particularly nice for teams: access can be revoked instantly without touching server configs.

See #link("https://tailscale.com/kb/1193/tailscale-ssh")[Tailscale SSH documentation] for setup instructions.

= File sharing: Taildrop

Tailscale includes *#link("https://tailscale.com/kb/1106/taildrop")[Taildrop]*, a simple file transfer feature that works inside your tailnet. It's not Dropbox, but it's excellent for "get this file to my other device right now."

If you want the practical walkthrough, here's the full guide: #link("/blog/self-hosting-with-tailscale")[Self‑Hosting With Tailscale]

= Troubleshooting common Tailscale issues

After running Tailscale for a while, you'll hit some of these. Here's how to fix them:

== "Connection is relayed" (not direct)

*Symptoms:* Slow connections, `tailscale status` shows "relay" instead of "direct"

*Diagnosis:*
```bash
tailscale status
tailscale ping <device-name>
tailscale netcheck
```

*Common causes:*
- *Symmetric NAT* — your router assigns different ports per destination. Try enabling UPnP/NAT-PMP on your router.
- *Firewall blocking UDP* — Tailscale needs UDP port 41641 (or uses random ports). Check corporate/hotel firewalls.
- *Double NAT* — you're behind two NAT layers (ISP's CGNAT + your router). Not much you can do except use DERP.
- *One peer behind strict firewall* — if only one side is restricted, hole-punching might still fail.

*Fixes:*
+ Enable UPnP on your router
+ Try a different network (mobile hotspot) to isolate the problem
+ If you control the network, forward UDP 41641 to one device
+ Accept that DERP is your reality and move on

== Device not showing up in tailnet

*Symptoms:* New device installed Tailscale but doesn't appear in admin console

*Causes:*
- Device needs to be authorized (if your tailnet requires admin approval)
- Device is on a different tailnet (logged into wrong account)
- Tailscale service isn't running

*Fixes:*
```bash
# Check if tailscale is running
tailscale status

# See which account you're logged into
tailscale status --json | jq .Self.UserID

# Force re-authentication
tailscale logout
tailscale login
```

== Key expiry issues

*Symptoms:* Device suddenly can't connect, "key expired" in logs

*Cause:* By default, device keys expire after 180 days. This is a security feature.

*Fixes:*
+ Re-authenticate: `tailscale login`
+ Disable key expiry for specific devices in admin console (not recommended for laptops)
+ Use `--authkey` with a reusable, non-expiring key for servers (create in admin console)

== MagicDNS not resolving

*Symptoms:* Can ping by Tailscale IP but not by name

*Causes:*
- MagicDNS not enabled (check admin console → DNS)
- Local DNS resolver interfering
- systemd-resolved conflicts (common on Linux)

*Fixes for Linux:*
```bash
# Check if tailscale is handling DNS
resolvectl status

# Force tailscale to take over DNS
sudo tailscale up --accept-dns=true
```

== Subnet router not advertising routes

*Symptoms:* Subnet router shows as "advertising" but other devices can't reach the subnet

*Causes:*
- Routes need approval in admin console
- IP forwarding not enabled on the router device
- Firewall on router device blocking forwarded traffic

*Fixes:*
```bash
# Enable IP forwarding (Linux)
echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.conf
echo 'net.ipv6.conf.all.forwarding = 1' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Check routes are approved in admin console
# Then restart tailscale
sudo tailscale up --advertise-routes=192.168.1.0/24 --reset
```

#callout("tip", title: "The nuclear option")[
When all else fails: `tailscale logout && tailscale login && sudo systemctl restart tailscaled`. Sometimes you just need to start fresh.
]

For more debugging, check the #link("https://tailscale.com/kb/1023/troubleshooting")[Tailscale troubleshooting guide] and the #link("https://forum.tailscale.com/")[community forum].

= When Tailscale is _not_ the right tool

- You need anonymous browsing (use a commercial VPN like Mullvad instead)
- You can't install a client on a managed device
- You want full control of the coordination server (use #link("https://github.com/juanfont/headscale")[Headscale])
- You need to connect networks at layer 2 (Tailscale is layer 3 only)
- You're bridging legacy equipment that can't run modern clients

= How to evaluate it honestly

Ask yourself:

- Do I trust an identity‑based model more than IP‑based firewalls?
- Do I want device‑to‑device access rather than a single VPN gateway?
- Is my primary goal remote access, not anonymity?

If you answer "yes" to most of these, Tailscale is a strong fit.

= Quick demo video (setup in 5 minutes)

#html.elem("iframe", attrs: (title: "Tailscale quickstart", src: "https://www.youtube.com/embed/dJjRr2dK3wI", style: "width: 100%; aspect-ratio: 16/9; border: 0; border-radius: 0.5rem; margin: 1.5rem 0;", allowfullscreen: "true"))

= Further reading

- #link("https://tailscale.com/kb")[Tailscale documentation] — the official knowledge base
- #link("https://tailscale.com/blog/how-tailscale-works")[How Tailscale works] — their own deep-dive
- #link("https://tailscale.com/blog/how-nat-traversal-works")[How NAT traversal works] — excellent technical explainer
- #link("https://www.wireguard.com/papers/wireguard.pdf")[WireGuard whitepaper] — the cryptographic foundation
- #link("http://www.noiseprotocol.org/")[Noise Protocol Framework] — the handshake pattern WireGuard uses
- #link("https://github.com/juanfont/headscale/tree/main/docs")[Headscale documentation] — if you want to self-host the control plane

= Summary

Tailscale is a VPN in the most practical sense — *it makes your devices feel like they're on the same private network*, without the pain of legacy VPN setups. If your goal is _private remote access_ rather than "hide my browsing," it's one of the cleanest solutions available.

Next up: #link("/blog/self-hosting-with-tailscale")[Self‑Hosting With Tailscale]
