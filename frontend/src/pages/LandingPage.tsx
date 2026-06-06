import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiZap, FiLayout, FiDownload, FiStar, FiSmartphone, FiTrendingUp, FiGlobe, FiCheckCircle } from 'react-icons/fi';
import { FaGithub } from 'react-icons/fa6';
import { BsDiscord } from 'react-icons/bs';
import { FiExternalLink } from 'react-icons/fi';
import { FaXTwitter } from 'react-icons/fa6';
import { templateList, templateStyles, type Resume } from '../types';
import ExecutiveTemplate from '../components/templates/ExecutiveTemplate';
import { getStyleConfig } from '../components/templates/templateStyles';

const sampleResume: Resume = {
  title: 'Sample Resume',
  template: 'tmpl_01',
  personalInfo: {
    fullName: 'Alex Johnson',
    email: 'alex@example.com',
    phone: '+1 (555) 123-4567',
    address: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexjohnson',
    github: 'github.com/alexjohnson',
    portfolio: 'alexjohnson.dev',
  },
  summary: 'Results-driven software engineer with 3+ years of experience building scalable cloud applications. Proficient in React, Node.js, and AWS.',
  education: [{ degree: 'B.S. Computer Science', college: 'Stanford University', startYear: '2018', endYear: '2022', cgpa: '3.8/4.0' }],
  experience: [{ company: 'Amazon Web Services', position: 'Cloud Developer', startDate: 'Jan 2023', endDate: 'Present', description: 'Designed and deployed microservices architecture handling 10M+ requests/day.' }],
  projects: [{ name: 'CloudDeploy', description: 'Automated CI/CD pipeline tool for AWS deployments.', technologies: ['React', 'Node.js', 'AWS', 'Docker'], githubUrl: '', liveUrl: '' }],
  skills: [
    { category: 'Programming', skills: ['TypeScript', 'Python', 'Go'] },
    { category: 'Cloud', skills: ['AWS', 'Docker', 'Kubernetes'] },
  ],
  certifications: [{ name: 'AWS Solutions Architect', issuer: 'Amazon', date: '2023' }],
  achievements: ['Led migration of legacy system serving 5M users to cloud-native architecture'],
};

const features = [
  { icon: FiZap, title: 'AI-Powered', description: 'Generate professional summaries, bullet points, and achievements with AI.' },
  { icon: FiLayout, title: 'Multiple Templates', description: 'Choose from 34 expertly designed ATS-friendly templates.' },
  { icon: FiStar, title: 'Smart Suggestions', description: 'Get real-time suggestions to improve your resume content.' },
  { icon: FiDownload, title: 'Easy Export', description: 'Export as PDF with one click. Print-ready formatting.' },
  { icon: FiSmartphone, title: 'Mobile Friendly', description: 'Build and edit your resume on any device.' },
  { icon: FiTrendingUp, title: 'ATS Optimized', description: 'Templates designed to pass Applicant Tracking Systems.' },
  { icon: FiGlobe, title: 'Multi-Language', description: 'Create resumes in multiple languages for global opportunities.' },
  { icon: FiCheckCircle, title: 'Instant Preview', description: 'See live changes as you type with real-time preview.' },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.5 },
};

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <FiZap className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                ResumeForge AI
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#templates" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Templates</a>
              <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Login</Link>
              <Link to="/register" className="text-sm font-medium px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-sm text-blue-700 font-medium mb-8">
              <FiZap className="w-4 h-4" /> AI-Powered Resume Builder
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight mb-6">
              Build Professional<br />Resumes with <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">AI</span>
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
              Create stunning, ATS-friendly resumes in minutes. Powered by AI to help you land your dream job.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/register" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2">
                Get Started Free <FiArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/templates" className="px-8 py-4 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center gap-2">
                View Templates <FiLayout className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-16" {...fadeUp}>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">Powerful features to help you create the perfect resume.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }} className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="templates" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-16" {...fadeUp}>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Professional Templates</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">Choose from 34 expertly crafted templates designed for every industry.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {templateList.slice(0, 6).map((tmpl) => (
              <motion.div key={tmpl.id} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className="group cursor-pointer">
                <div className="aspect-[3/4] rounded-xl overflow-hidden border border-gray-200 bg-gray-50 mb-3 relative">
                  <div className="absolute inset-0 scale-[0.25] origin-top-left">
                    <ExecutiveTemplate resume={{ ...sampleResume, template: tmpl.id }} style={getStyleConfig(tmpl.id)} />
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
                <h3 className="font-semibold text-gray-900">{tmpl.name}</h3>
                <p className="text-sm text-gray-500">{tmpl.description}</p>
              </motion.div>
            ))}
          </div>
          <motion.div className="text-center mt-10" {...fadeUp}>
            <Link to="/templates" className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all">
              View All Templates <FiArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <FiZap className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">ResumeForge AI</span>
              </div>
              <p className="text-sm">Build professional resumes with the power of AI.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <div className="flex flex-col gap-2 text-sm">
                <a href="#features" className="hover:text-white transition-colors">Features</a>
                <a href="#templates" className="hover:text-white transition-colors">Templates</a>
                <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <div className="flex flex-col gap-2 text-sm">
                <a href="#" className="hover:text-white transition-colors">Documentation</a>
                <a href="#" className="hover:text-white transition-colors">Blog</a>
                <a href="#" className="hover:text-white transition-colors">Support</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <div className="flex flex-col gap-2 text-sm">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-gray-800">
            <p className="text-sm">&copy; {new Date().getFullYear()} ResumeForge AI. All rights reserved.</p>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <a href="#" className="hover:text-white transition-colors"><FaGithub className="w-5 h-5" /></a>
              <a href="#" className="hover:text-white transition-colors"><BsDiscord className="w-5 h-5" /></a>
              <a href="#" className="hover:text-white transition-colors"><FaXTwitter className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
