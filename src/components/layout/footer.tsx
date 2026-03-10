import { Facebook, Instagram, MapPin, Clock, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#1F2937] text-white mt-auto pb-safe">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Slogan */}
        <div className="text-center mb-8">
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-[#FFC107] mb-2">
            Pedasnya Bikin Nagih!
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Address */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#FFC107] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Alamat Restoran</h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Jl. Medan - Banda Aceh, Simpang Camat,<br />
                  Gampong Tijue, Kec. Pidie,<br />
                  Kab. Pidie, 24151
                </p>
              </div>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#FFC107] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Jam Operasional</h4>
                <p className="text-sm text-gray-300">
                  10:00 – 22:00 WIB
                </p>
                <p className="text-xs text-gray-400 mt-1">Setiap Hari</p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-[#FFC107] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Kontak</h4>
                <a
                  href="https://wa.me/6285260812758"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-300 hover:text-[#FFC107] transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  0852-6081-2758
                </a>
                <div className="flex items-center gap-3 mt-2">
                  <a
                    href="https://instagram.com/ayamgeprek"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-[#FFC107] transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href="https://facebook.com/ayamgeprek"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-[#FFC107] transition-colors"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 pt-6 text-center">
          <p className="text-sm text-gray-400">
            © 2026 Ayam Geprek Sambal Ijo. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
