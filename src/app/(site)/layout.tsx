import { SiteFooter } from "@/components/layouts/site-footer";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <main id="main" className="flex-1 pt-11">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
