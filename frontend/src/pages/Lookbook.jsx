export default function Lookbook() {
  const looks = [
    { img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80', title: 'Evening Glamour', season: 'SS 2025' },
    { img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80', title: 'Urban Sophistication', season: 'SS 2025' },
    { img: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&q=80', title: 'Modern Minimal', season: 'SS 2025' },
    { img: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80', title: 'Coastal Dreams', season: 'SS 2025' },
    { img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80', title: 'Power Dressing', season: 'SS 2025' },
    { img: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80', title: 'The New Gentleman', season: 'SS 2025' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[40vh] sm:h-[45vh] md:h-[50vh] flex items-end pb-8 sm:pb-12 md:pb-16 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1800&q=90" 
          alt="Lookbook hero" 
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-obsidian/40 to-transparent" />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs sm:text-sm tracking-[0.2em] text-gold-400 font-sans font-medium mb-2 sm:mb-3 uppercase">
              SS 2025
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white font-light leading-tight">
              The Lookbook
            </h1>
          </div>
        </div>
      </div>

      {/* Grid Section */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        {/* Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {looks.map((look, index) => {
            // Make specific items span multiple rows on larger screens
            const isSpanRow = index === 0 || index === 3
            const isLastItem = index === looks.length - 1
            
            return (
              <div 
                key={index} 
                className={`
                  group cursor-pointer
                  ${isSpanRow ? 'sm:row-span-2' : ''}
                  ${isLastItem && looks.length % 2 !== 0 ? 'sm:col-span-2 lg:col-span-1' : ''}
                `}
              >
                <div className={`
                  relative overflow-hidden bg-cream rounded-lg shadow-md hover:shadow-xl transition-all duration-300
                  ${isSpanRow 
                    ? 'aspect-[3/4] sm:aspect-[2/3]' 
                    : 'aspect-[4/5] sm:aspect-[3/4]'
                  }
                `}>
                  <img 
                    src={look.img} 
                    alt={look.title} 
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading={index < 3 ? "eager" : "lazy"}
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-obsidian/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                  
                  {/* Content on hover */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 md:p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                      <p className="text-[10px] sm:text-xs tracking-[0.2em] text-gold-300 font-sans font-medium uppercase mb-1 sm:mb-2">
                        {look.season}
                      </p>
                      <p className="font-display text-base sm:text-lg md:text-xl text-white font-light leading-tight">
                        {look.title}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Optional: View More Button */}
        <div className="text-center mt-12 sm:mt-16 md:mt-20">
          <button className="group inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 border-2 border-obsidian hover:border-gold-600 bg-transparent hover:bg-gold-600 transition-all duration-300">
            <span className="text-xs sm:text-sm tracking-[0.2em] uppercase font-sans font-medium text-obsidian group-hover:text-white transition-colors">
              View Full Collection
            </span>
            <svg 
              className="w-4 h-4 text-obsidian group-hover:text-white transition-colors" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}