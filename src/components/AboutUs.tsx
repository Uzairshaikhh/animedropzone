import { Heart, Shield, Truck, Users } from 'lucide-react';

export function AboutUs() {
  return (
    <section id="about" className="py-20 px-4 bg-gradient-to-b from-transparent to-purple-900/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="mb-4 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            About animedropzone
          </h2>
          <p className="text-gray-400 max-w-3xl mx-auto text-lg">
            Your trusted destination for authentic anime merchandise, collectibles, and premium figures
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <img
              src="https://images.unsplash.com/photo-1665042099439-39d93c1117e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMGhlcm8lMjBiYWNrZ3JvdW5kfGVufDF8fHx8MTc2NTI4MDExNXww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="About animedropzone"
              className="w-full rounded-2xl border border-purple-500/30 shadow-2xl shadow-purple-900/50"
            />
          </div>
          <div>
            <h3 className="text-white mb-6">Our Story</h3>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Founded by passionate anime enthusiasts, animedropzone was born from a desire to bring 
              authentic, high-quality anime merchandise to fans across the globe. We understand the 
              joy of collecting and the importance of authenticity.
            </p>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Every product in our collection is carefully curated and verified for authenticity. 
              From limited edition figures to exclusive katanas, we ensure that each item meets 
              our strict quality standards.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Join our community of over 10,000 satisfied collectors who trust animedropzone for 
              their anime merchandise needs.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-white mb-2">100% Authentic</h4>
            <p className="text-gray-400">All products verified for authenticity</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-white mb-2">Fast Shipping</h4>
            <p className="text-gray-400">Worldwide delivery with tracking</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-white mb-2">10k+ Customers</h4>
            <p className="text-gray-400">Trusted by collectors worldwide</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-white mb-2">Customer Support</h4>
            <p className="text-gray-400">24/7 dedicated support team</p>
          </div>
        </div>
      </div>
    </section>
  );
}
