import { Link } from 'react-router-dom'
export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <p className="font-display text-[120px] leading-none text-obsidian-100 select-none">404</p>
      <h1 className="font-display text-4xl text-obsidian -mt-4 mb-4">Page Not Found</h1>
      <p className="text-obsidian-400 font-sans text-sm mb-8 max-w-md">The page you are looking for may have moved or no longer exists. Let us guide you back to the world of Maison Luxe.</p>
      <div className="flex gap-4">
        <Link to="/" className="btn-primary">Return Home</Link>
        <Link to="/shop" className="btn-outline">Browse Collections</Link>
      </div>
    </div>
  )
}
