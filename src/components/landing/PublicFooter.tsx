import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Description */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/Logo.png"
                alt="TMClub"
                className="h-10 w-auto"
              />
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Komunitas perusahaan manufaktur Toyota untuk berkolaborasi, berbagi pengetahuan, dan berkembang bersama.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Menu</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-sm text-gray-600 hover:text-orange-600 transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-sm text-gray-600 hover:text-orange-600 transition-colors">
                  Event
                </Link>
              </li>
              <li>
                <Link to="/companies" className="text-sm text-gray-600 hover:text-orange-600 transition-colors">
                  Company
                </Link>
              </li>
              <li>
                <Link to="/members" className="text-sm text-gray-600 hover:text-orange-600 transition-colors">
                  Members
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm text-gray-600 hover:text-orange-600 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-gray-600 hover:text-orange-600 transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Hubungi Kami</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-600">
                  Jl. Gaya Motor Raya, Sunter II, Jakarta Utara 14330
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <a href="mailto:info@tmclub.id" className="text-sm text-gray-600 hover:text-orange-600">
                  info@tmclub.id
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-600">+62 21 6511228</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Ikuti Kami</h3>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-orange-100 hover:text-orange-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-orange-100 hover:text-orange-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-orange-100 hover:text-orange-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-orange-100 hover:text-orange-600 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 mt-8 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Toyota Manufacturers Club. Semua hak dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
