export function DemoSlot({ versions }: { versions: string }) {
  return (
    <div className="mx-auto w-full max-w-[1100px] break-words rounded-xl border border-dashed border-border p-8 text-center">
      <p className="text-sm text-foreground">준비 중이에요. 이 자리에 {versions} 체험이 들어와요.</p>
      <p className="mt-2 text-xs text-muted-foreground">
        마우스로 체험하는 데모예요. 데스크톱에서 보세요.
      </p>
    </div>
  );
}
