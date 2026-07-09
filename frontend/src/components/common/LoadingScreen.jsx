// LoadingScreen.jsx
export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center gap-6">
      <div className="font-display text-4xl tracking-luxury text-obsidian animate-pulse">MAISON LUXE</div>
      <div className="w-24 h-px bg-gold-gradient animate-pulse" />
    </div>
  )
}
