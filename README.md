# International Estimating — website

A frontend-only Next.js website for an electrical and MEP estimating service.
Built with Next.js App Router, Tailwind CSS v4, and `lucide-react`.

There is no database. Form submissions are emailed by the API routes in `src/app/api/`.

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Home — services, process, sectors, and about preview |
| `/services` | Estimating services and systems coverage |
| `/about` | Company introduction and policies |
| `/submit-bid` | Client-side bid request, required PDF plans, requested budget, and bid ID slip |
| `/services/[slug]` | One page per service (electrical takeoffs, electrical estimating, MEP estimating) |
| `/contact` | Inquiry form and FAQs (`/ask` redirects here) |
| `/policies` | Company policies |
| `/terms` | Service terms |

## Form behavior

Forms validate in the browser and generate a grouped unique ID locally.

- **Submit a Bid** requires one or more PDF plans and a positive requested budget with a selected currency.
- The bid confirmation provides a printable submission slip, copyable summary, and a **Prepare Email** button.
- The prepared email opens the visitor’s email application addressed to `internationalestimatingservice@gmail.com`; selected PDF plan names are listed so the visitor can attach them manually.
- **Ask a Question** works the same way: it generates an inquiry ID and prepares a local email draft.

Automatic emails, confirmation receipts, file uploads, and request storage require an external service or a server-side integration.

### Optional Formspree delivery (no custom backend)

To notify the company and send a client confirmation without adding a custom backend:

1. Create a Formspree form and copy its endpoint (`https://formspree.io/f/YOUR_FORM_ID`).
2. Set `NEXT_PUBLIC_FORMSPREE_BID_ENDPOINT` to that endpoint in your deployment environment.
3. In Formspree, set the submission notification recipient to `internationalestimatingservice@gmail.com`.
4. Enable the **Autoresponse** plugin and use the `email` field as the recipient. Configure the message to state that the client’s bid is in review and the team will contact them using the submitted email or phone number.
5. Enable file uploads for the form. Formspree stores submitted PDFs and includes links in the notification email; their plan and autoresponder availability depends on the selected Formspree plan.

When no Formspree endpoint is configured, the website intentionally uses the Prepare Email fallback and does not send data automatically.

## Optional public contact variables

Copy `.env.example` to `.env` if needed:

- `NEXT_PUBLIC_CONTACT_EMAIL`

## Email delivery (required for PDF plans to arrive)

Bid and contact form emails, including the uploaded PDF plans as attachments, are sent by the server.
Set **one** of these in the hosting environment (Hostinger → Website → Node.js → Environment variables), then redeploy.
Check `/api/health`; it must show `"mailConfigured": true`.

**Option A: Gmail (simplest)**

1. Turn on 2-Step Verification for the Gmail account.
2. Create an App Password at https://myaccount.google.com/apppasswords.
3. Set:
   - `SMTP_HOST=smtp.gmail.com`
   - `SMTP_PORT=465`
   - `SMTP_USER=internationalestimatingservice@gmail.com`
   - `SMTP_PASS=<the 16-character app password>`

**Option B: Resend**: `RESEND_API_KEY` plus `CONTACT_FROM_EMAIL` on a domain verified in Resend.

Optional: `CONTACT_TO_EMAIL` (inbox that receives submissions; defaults to the public contact email).

PDF plans are uploaded in 4 MB chunks (`/api/bid-upload`) because the hosting CDN rejects requests over about 8 MB. Plan sets larger than one email can hold are split across several emails with the same Bid ID.

## SEO

- **Site URL**: defaults to `https://internationalestimatingservice.com`; override with `NEXT_PUBLIC_SITE_URL`. `www` redirects to the apex domain.
- **Sitemap**: `/sitemap.xml`, generated from `INDEXED_ROUTES` in `src/lib/seo.ts`. Add new pages there.
- **Robots**: `/robots.txt` allows everything except `/api/` and points to the sitemap.
- **Metadata**: every page uses `pageMetadata()` from `src/lib/seo.ts` (title, description, canonical, Open Graph, Twitter).
- **Service pages**: `/services/[slug]`, one per service, with copy in `src/lib/service-pages.ts`.
- **Structured data**: ProfessionalService + WebSite site-wide, BreadcrumbList on inner pages, Service list on `/services`, Service + FAQPage on each service page, FAQPage on `/contact`.
- **Share image**: `/og-image.png` is generated at build time from `public/logo.png`.
- **Search console verification** (optional): `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` and `NEXT_PUBLIC_BING_SITE_VERIFICATION` add the verification meta tags.

After deploying, submit `https://internationalestimatingservice.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools.

## Branding / logo

Drop your logo image file into the `public/` folder as **`public/logo.png`**.

That single file is used automatically everywhere:
- desktop header
- mobile header
- footer
- intro splash
- favicon (`icons: { icon: "/logo.png" }`)

No logo is generated or hard-coded by the site. If `public/logo.png` is missing, a plain “IES” text fallback is shown instead. To change the logo later, just replace `public/logo.png` with a new image and redeploy — nothing else to edit.

## Development

```bash
npm install
npm run dev
```
