import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gray-100 bg-gray-50 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
         <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-6">Confían en nosotros empresas líderes</p>
         <div className="flex flex-wrap justify-center gap-8 grayscale opacity-60">
             {/* Simple text placeholders for logos as per style */}
             <span className="text-2xl font-bold text-gray-400">Google</span>
             <span className="text-2xl font-bold text-gray-400">Microsoft</span>
             <span className="text-2xl font-bold text-gray-400">Airbnb</span>
             <span className="text-2xl font-bold text-gray-400">Uber</span>
             <span className="text-2xl font-bold text-gray-400">Spotify</span>
         </div>
         <div className="mt-12 text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} AI Dev Connect. Todos los derechos reservados.
         </div>
      </div>
    </footer>
  );
};

export default Footer;
