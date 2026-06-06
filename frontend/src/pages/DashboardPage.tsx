import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiFileText, FiTrash2, FiCopy, FiExternalLink, FiZap, FiClock, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useResumeStore } from '../store/resumeStore';
import { useAuthStore } from '../store/authStore';
import { templateStyles } from '../types';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { resumes, isLoading, fetchResumes, createResume, deleteResume, duplicateResume } = useResumeStore();
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleCreate = async () => {
    try {
      const resume = await createResume({ title: 'Untitled Resume', template: 'tmpl_01' });
      navigate(`/builder/${resume._id}`);
    } catch {
      toast.error('Failed to create resume');
    }
  };

  const handleGenerate = async () => {
    try {
      const { resumesApi } = await import('../api/resumes');
      await resumesApi.generateSample();
      toast.success('Sample resume generated!');
      fetchResumes();
    } catch {
      toast.error('Failed to generate sample');
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await deleteResume(id);
      toast.success('Resume deleted');
    } catch {
      toast.error('Failed to delete resume');
    }
    setDeleting(null);
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateResume(id);
      toast.success('Resume duplicated');
    } catch {
      toast.error('Failed to duplicate resume');
    }
  };

  const timeAgo = (date?: string) => {
    if (!date) return 'Never';
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const stats = [
    { label: 'Total Resumes', value: resumes.length, icon: FiFileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Last Updated', value: resumes.length > 0 ? timeAgo(resumes[0].updatedAt) : 'N/A', icon: FiClock, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'AI Features', value: 'Unlimited', icon: FiStar, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-500 mt-1">Welcome back, {user?.name || 'User'}</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleGenerate} className="px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all text-sm font-medium flex items-center gap-2">
                <FiZap className="w-4 h-4" /> Generate Sample
              </button>
              <button onClick={handleCreate} className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all text-sm font-medium flex items-center gap-2 shadow-lg shadow-blue-200">
                <FiPlus className="w-4 h-4" /> New Resume
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : resumes.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiFileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No resumes yet</h3>
            <p className="text-gray-500 mb-6">Create your first resume to get started.</p>
            <button onClick={handleCreate} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200 inline-flex items-center gap-2">
              <FiPlus className="w-5 h-5" /> Create Resume
            </button>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumes.map((resume, i) => (
              <motion.div key={resume._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all group">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{resume.title}</h3>
                      <p className="text-sm text-gray-500">{templateStyles[resume.template]?.name || 'Custom'}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mb-4">Updated {timeAgo(resume.updatedAt)}</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => navigate(`/builder/${resume._id}`)} className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-all flex items-center justify-center gap-1.5">
                      <FiExternalLink className="w-3.5 h-3.5" /> Open
                    </button>
                    <button onClick={() => handleDuplicate(resume._id!)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Duplicate">
                      <FiCopy className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(resume._id!)} disabled={deleting === resume._id} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50" title="Delete">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
