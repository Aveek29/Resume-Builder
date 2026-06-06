import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiArrowLeft, FiZap } from 'react-icons/fi';
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
  summary: 'Results-driven software engineer with 3+ years of experience building scalable cloud applications.',
  education: [{ degree: 'B.S. Computer Science', college: 'Stanford University', startYear: '2018', endYear: '2022', cgpa: '3.8/4.0' }],
  experience: [{ company: 'AWS', position: 'Cloud Developer', startDate: 'Jan 2023', endDate: 'Present', description: 'Built scalable microservices.' }],
  projects: [{ name: 'CloudDeploy', description: 'CI/CD pipeline tool.', technologies: ['React', 'AWS'], githubUrl: '', liveUrl: '' }],
  skills: [
    { category: 'Programming', skills: ['TypeScript', 'Python'] },
    { category: 'Cloud', skills: ['AWS', 'Docker'] },
  ],
  certifications: [],
  achievements: ['Led migration of legacy system to cloud-native architecture'],
};

export default function TemplatesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = templateList.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (templateId: string) => {
    navigate(`/builder/new?template=${templateId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
            <FiArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resume Templates</h1>
              <p className="text-gray-500 mt-1">Choose from {templateList.length} professionally designed templates</p>
            </div>
            <div className="relative w-full sm:w-72">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search templates..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">No templates found for "{search}"</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((tmpl, i) => (
              <motion.div key={tmpl.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} onClick={() => handleSelect(tmpl.id)} className="group cursor-pointer">
                <div className="aspect-[3/4] rounded-xl overflow-hidden border border-gray-200 bg-white mb-3 relative shadow-sm hover:shadow-lg transition-all">
                  <div className="absolute inset-0 scale-[0.25] origin-top-left pointer-events-none">
                    <ExecutiveTemplate resume={{ ...sampleResume, template: tmpl.id }} style={getStyleConfig(tmpl.id)} />
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg text-sm font-medium text-gray-900 shadow-lg">
                      Use Template
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{tmpl.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{tmpl.description}</p>
                  </div>
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: tmpl.color }} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
