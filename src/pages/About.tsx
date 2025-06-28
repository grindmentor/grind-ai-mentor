
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            onClick={() => window.history.back()}
            variant="ghost"
            className="text-gray-400 hover:text-white hover:bg-gray-800/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">About Myotopia</h1>
          
          <div className="space-y-8">
            <section className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">Our Mission</h2>
              <p className="text-gray-300 leading-relaxed">
                Myotopia is dedicated to revolutionizing fitness through science-backed training methodologies. 
                We believe that every individual deserves access to evidence-based fitness guidance that delivers real results.
              </p>
            </section>

            <section className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">Science-First Approach</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Every recommendation, workout plan, and nutritional guidance in Myotopia is backed by peer-reviewed 
                scientific research. We continuously update our knowledge base with the latest findings in exercise 
                science, nutrition, and recovery.
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2">
                <li>Evidence-based training protocols</li>
                <li>Research-backed nutrition strategies</li>
                <li>Scientific recovery optimization</li>
                <li>Data-driven progress tracking</li>
              </ul>
            </section>

            <section className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">Our Team</h2>
              <p className="text-gray-300 leading-relaxed">
                Myotopia is built by a team of fitness professionals, researchers, and technology experts 
                who are passionate about making scientific fitness knowledge accessible to everyone.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
