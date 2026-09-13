export default function Footer() {
  return (
    <footer className="w-full bg-coffee text-paper py-16 px-6 md:px-16 border-t border-paper/10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
        
        {/* Left: Branding */}
        <div className="flex items-center space-x-3">
          <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="20" cy="20" r="13" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="20" cy="20" r="8" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="20" cy="20" r="3" fill="currentColor"/>
            <path d="M20 2V38" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          <span className="font-sans font-semibold tracking-[0.1em] text-sm text-paper/80">
            AGRISMART AI
          </span>
        </div>

        {/* Right: Links */}
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-16 font-sans text-xs tracking-widest uppercase text-paper/50">
          <div className="flex flex-col items-center md:items-start space-y-4">
            <a href="#" className="hover:text-paper transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-paper transition-colors">Terms of Service</a>
          </div>
          <div className="flex flex-col items-center md:items-start space-y-4">
            <a href="#" className="hover:text-paper transition-colors">Documentation</a>
            <a href="#" className="hover:text-paper transition-colors">Contact</a>
          </div>
        </div>

      </div>

      <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-paper/10 flex justify-between items-center font-sans text-[10px] tracking-widest uppercase text-paper/30">
        <span>&copy; {new Date().getFullYear()} AGRISMART. All rights reserved.</span>
        <span>SIH 2026</span>
      </div>
    </footer>
  );
}
