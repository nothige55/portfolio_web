import { VariantSwitcher } from "@/components/layouts/variant-switcher";

export default function VariantsLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <main id="main" className="flex-1">
        {children}
      </main>
      <VariantSwitcher />
    </>
  );
}
