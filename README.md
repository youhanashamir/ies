# International Estimating — website

A frontend-only Next.js website for an electrical and MEP estimating service.
Built with Next.js App Router, Tailwind CSS v4, and `lucide-react`.

There is no database, Drizzle ORM, PostgreSQL connection, email API route, or server-side form storage.

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Home — services, process, sectors, and about preview |
| `/services` | Estimating services and systems coverage |
| `/about` | Company introduction and policies |
| `/submit-bid` | Client-side bid request, required PDF plans, requested budget, and bid ID slip |
| `/ask` | Client-side inquiry form and prepared email draft |
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

## Branding

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
