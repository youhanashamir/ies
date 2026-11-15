import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[80svh] items-center overflow-hidden pt-[100px] pb-20">
      <div className="container-ie relative">
        <p className="eyebrow eyebrow-dot mb-6">Error 404</p>
        <h1 className="display-h1 max-w-[14ch] text-balance">
          This sheet isn&apos;t <span className="serif-accent">in the set.</span>
        </h1>
        <p className="mt-6 max-w-lg text-lg text-muted">
          The page you are looking for does not exist or has moved. Head back home or start a new project request.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="btn-ghost">
            <ArrowLeft size={14} /> Back home
          </Link>
          <Link href="/submit-bid" className="btn-primary">
              Submit a Project <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
