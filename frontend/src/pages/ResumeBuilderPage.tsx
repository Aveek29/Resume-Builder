import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSave, FiDownload, FiSend, FiZap, FiPlus, FiTrash2, FiChevronRight, FiChevronLeft, FiMessageSquare, FiX, FiSmartphone, FiMonitor, FiUser, FiFileText, FiBookOpen, FiBriefcase, FiFolder, FiCode, FiAward, FiStar, FiMenu } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useResumeStore } from '../store/resumeStore';
import { emptyResume } from '../types';
import type { Resume, Education, Experience, Project, Certification } from '../types';
import ExecutiveTemplate from '../components/templates/ExecutiveTemplate';
import { getStyleConfig } from '../components/templates/templateStyles';
import { aiApi } from '../api/ai';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const steps = [
  { key: 'personalInfo', label: 'Personal Info', icon: FiUser },
  { key: 'summary', label: 'Summary', icon: FiFileText },
  { key: 'education', label: 'Education', icon: FiBookOpen },
  { key: 'experience', label: 'Experience', icon: FiBriefcase },
  { key: 'projects', label: 'Projects', icon: FiFolder },
  { key: 'skills', label: 'Skills', icon: FiCode },
  { key: 'certifications', label: 'Certifications', icon: FiAward },
  { key: 'achievements', label: 'Achievements', icon: FiStar },
];

export default function ResumeBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentResume, currentStep, setCurrentStep, fetchResume, updateCurrentResume, updateResume, isSaving } = useResumeStore();
  const [resume, setResume] = useState<Resume>(emptyResume);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [enhancing, setEnhancing] = useState<string | null>(null);

  useEffect(() => {
    if (id && id !== 'new') {
      fetchResume(id);
    }
  }, [id]);

  useEffect(() => {
    if (currentResume) {
      setResume(currentResume);
    }
  }, [currentResume]);

  const handleSave = async () => {
    if (!resume._id) {
      toast.error('Save the resume first');
      return;
    }
    try {
      await updateResume(resume._id, resume);
      toast.success('Resume saved!');
    } catch {
      toast.error('Failed to save');
    }
  };

  const handleExport = () => {
    window.print();
  };

  const updateField = useCallback(<K extends keyof Resume>(key: K, value: Resume[K]) => {
    setResume((prev) => ({ ...prev, [key]: value }));
    updateCurrentResume({ [key]: value });
  }, []);

  const handleEnhance = async (type: string, input: string, field: keyof Resume) => {
    if (!input.trim()) {
      toast.error('Please add some content first');
      return;
    }
    setEnhancing(type);
    try {
      let result: string;
      switch (type) {
        case 'summary':
          result = (await aiApi.generateSummary(input)).data.summary;
          break;
        case 'project':
          result = (await aiApi.enhanceProject(input)).data.enhanced;
          break;
        case 'achievement':
          result = (await aiApi.generateAchievement(input)).data.achievement;
          break;
        case 'text':
          result = (await aiApi.enhanceText(input, type)).data.enhanced;
          break;
        default:
          return;
      }
      updateField(field, result as any);
      toast.success(`${type} enhanced!`);
    } catch {
      toast.error('AI enhancement failed');
    } finally {
      setEnhancing(null);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = { role: 'user', content: chatInput };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);
    try {
      const { data } = await aiApi.chat(chatInput);
      setChatMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const step = steps[currentStep];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            <FiMenu className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-gray-900 truncate max-w-[200px]">{resume.title || 'New Resume'}</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setPreviewMode('desktop')} className={`p-2 rounded-md transition-all ${previewMode === 'desktop' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              <FiMonitor className="w-4 h-4" />
            </button>
            <button onClick={() => setPreviewMode('mobile')} className={`p-2 rounded-md transition-all ${previewMode === 'mobile' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              <FiSmartphone className="w-4 h-4" />
            </button>
          </div>
          <button onClick={handleSave} disabled={isSaving || !resume._id} className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50">
            <FiSave className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={handleExport} className="px-3 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-1.5 shadow-sm">
            <FiDownload className="w-4 h-4" /> Export PDF
          </button>
          <button onClick={() => setShowChat(!showChat)} className={`p-2 rounded-lg transition-all ${showChat ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}>
            <FiMessageSquare className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}
        </AnimatePresence>

        <aside className={`w-64 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto ${sidebarOpen ? 'fixed inset-y-0 left-0 z-40 shadow-xl' : 'hidden'} lg:block transition-all`}>
          <div className="p-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Sections</h2>
            <div className="space-y-1">
              {steps.map((s, i) => (
                <button key={s.key} onClick={() => { setCurrentStep(i); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${i === currentStep ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${i === currentStep ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <s.icon className="w-3.5 h-3.5" />
                  </div>
                  <span>{s.label}</span>
                  {i < currentStep && <FiChevronRight className="w-3.5 h-3.5 ml-auto text-green-500" />}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex-1 flex overflow-hidden">
          <div className={`flex-1 overflow-y-auto ${showChat ? 'hidden lg:block' : ''}`}>
            <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div key={step?.key} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{step?.label}</h2>
                  <p className="text-sm text-gray-500 mb-6">Fill in the details below</p>

                  {step?.key === 'personalInfo' && (
                    <div className="space-y-4">
                      {(['fullName', 'email', 'phone', 'address', 'linkedin', 'github', 'portfolio'] as const).map((field) => (
                        <div key={field}>
                          <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{field === 'fullName' ? 'Full Name' : field === 'github' ? 'GitHub URL' : field === 'linkedin' ? 'LinkedIn URL' : field === 'portfolio' ? 'Portfolio URL' : field}</label>
                          <input type={field === 'email' ? 'email' : 'text'} value={resume.personalInfo[field]} onChange={(e) => updateField('personalInfo', { ...resume.personalInfo, [field]: e.target.value })} placeholder={`Enter your ${field}`} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        </div>
                      ))}
                    </div>
                  )}

                  {step?.key === 'summary' && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">Professional Summary</label>
                        <button onClick={() => handleEnhance('summary', resume.summary, 'summary')} disabled={enhancing === 'summary'} className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 disabled:opacity-50">
                          <FiZap className="w-3.5 h-3.5" /> {enhancing === 'summary' ? 'Enhancing...' : 'AI Enhance'}
                        </button>
                      </div>
                      <textarea rows={6} value={resume.summary} onChange={(e) => updateField('summary', e.target.value)} placeholder="Write a brief professional summary..." className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
                    </div>
                  )}

                  {step?.key === 'education' && (
                    <div className="space-y-4">
                      {resume.education.map((edu, i) => (
                        <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-700">Education #{i + 1}</span>
                            {resume.education.length > 1 && (
                              <button onClick={() => updateField('education', resume.education.filter((_, j) => j !== i))} className="text-red-500 hover:text-red-600"><FiTrash2 className="w-4 h-4" /></button>
                            )}
                          </div>
                          {(['degree', 'college', 'startYear', 'endYear', 'cgpa'] as const).map((field) => (
                            <input key={field} type="text" value={edu[field]} onChange={(e) => { const updated = [...resume.education]; updated[i] = { ...updated[i], [field]: e.target.value }; updateField('education', updated); }} placeholder={field === 'cgpa' ? 'CGPA' : field === 'degree' ? 'Degree' : field === 'college' ? 'College/University' : field === 'startYear' ? 'Start Year' : 'End Year'} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white" />
                          ))}
                        </div>
                      ))}
                      <button onClick={() => updateField('education', [...resume.education, { degree: '', college: '', startYear: '', endYear: '', cgpa: '' }])} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-all flex items-center justify-center gap-2">
                        <FiPlus className="w-4 h-4" /> Add Education
                      </button>
                    </div>
                  )}

                  {step?.key === 'experience' && (
                    <div className="space-y-4">
                      {resume.experience.map((exp, i) => (
                        <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-700">Experience #{i + 1}</span>
                            <button onClick={() => updateField('experience', resume.experience.filter((_, j) => j !== i))} className="text-red-500 hover:text-red-600"><FiTrash2 className="w-4 h-4" /></button>
                          </div>
                          {(['company', 'position', 'startDate', 'endDate'] as const).map((field) => (
                            <input key={field} type="text" value={exp[field]} onChange={(e) => { const updated = [...resume.experience]; updated[i] = { ...updated[i], [field]: e.target.value }; updateField('experience', updated); }} placeholder={field === 'company' ? 'Company' : field === 'position' ? 'Position' : field === 'startDate' ? 'Start Date' : 'End Date'} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white" />
                          ))}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-medium text-gray-500">Description</label>
                              <button onClick={() => handleEnhance('project', exp.description, 'experience')} disabled={enhancing === 'experience'} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 disabled:opacity-50">
                                <FiZap className="w-3 h-3" /> {enhancing === 'experience' ? '...' : 'AI Enhance'}
                              </button>
                            </div>
                            <textarea rows={3} value={exp.description} onChange={(e) => { const updated = [...resume.experience]; updated[i] = { ...updated[i], description: e.target.value }; updateField('experience', updated); }} placeholder="Describe your responsibilities and achievements..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white" />
                          </div>
                        </div>
                      ))}
                      <button onClick={() => updateField('experience', [...resume.experience, { company: '', position: '', startDate: '', endDate: '', description: '' }])} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-all flex items-center justify-center gap-2">
                        <FiPlus className="w-4 h-4" /> Add Experience
                      </button>
                    </div>
                  )}

                  {step?.key === 'projects' && (
                    <div className="space-y-4">
                      {resume.projects.map((proj, i) => (
                        <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-700">Project #{i + 1}</span>
                            <button onClick={() => updateField('projects', resume.projects.filter((_, j) => j !== i))} className="text-red-500 hover:text-red-600"><FiTrash2 className="w-4 h-4" /></button>
                          </div>
                          {(['name', 'description', 'technologies', 'githubUrl', 'liveUrl'] as const).map((field) => (
                            field === 'technologies' ? (
                              <input key={field} type="text" value={proj.technologies.join(', ')} onChange={(e) => { const updated = [...resume.projects]; updated[i] = { ...updated[i], technologies: e.target.value.split(',').map((s) => s.trim()) }; updateField('projects', updated); }} placeholder="Technologies (comma separated)" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white" />
                            ) : (
                              <input key={field} type="text" value={proj[field]} onChange={(e) => { const updated = [...resume.projects]; updated[i] = { ...updated[i], [field]: e.target.value }; updateField('projects', updated); }} placeholder={field === 'name' ? 'Project Name' : field === 'description' ? 'Description' : field === 'githubUrl' ? 'GitHub URL' : 'Live URL'} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white" />
                            )
                          ))}
                          <div className="flex items-center justify-end">
                            <button onClick={() => handleEnhance('project', proj.description, 'projects')} disabled={enhancing === `project-${i}`} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 disabled:opacity-50">
                              <FiZap className="w-3 h-3" /> {enhancing === `project-${i}` ? '...' : 'AI Enhance'}
                            </button>
                          </div>
                        </div>
                      ))}
                      <button onClick={() => updateField('projects', [...resume.projects, { name: '', description: '', technologies: [], githubUrl: '', liveUrl: '' }])} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-all flex items-center justify-center gap-2">
                        <FiPlus className="w-4 h-4" /> Add Project
                      </button>
                    </div>
                  )}

                  {step?.key === 'skills' && (
                    <div className="space-y-4">
                      {resume.skills.map((skill, i) => (
                        <div key={i} className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-700">{skill.category}</span>
                            <button onClick={() => handleEnhance('text', skill.skills.join(', '), 'skills')} disabled={enhancing === 'skills'} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 disabled:opacity-50">
                              <FiZap className="w-3 h-3" /> {enhancing === 'skills' ? '...' : 'AI Suggest'}
                            </button>
                          </div>
                          <input type="text" value={skill.skills.join(', ')} onChange={(e) => { const updated = [...resume.skills]; updated[i] = { ...updated[i], skills: e.target.value.split(',').map((s) => s.trim()) }; updateField('skills', updated); }} placeholder="Skills (comma separated)" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white" />
                        </div>
                      ))}
                    </div>
                  )}

                  {step?.key === 'certifications' && (
                    <div className="space-y-4">
                      {resume.certifications.map((cert, i) => (
                        <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-700">Certification #{i + 1}</span>
                            <button onClick={() => updateField('certifications', resume.certifications.filter((_, j) => j !== i))} className="text-red-500 hover:text-red-600"><FiTrash2 className="w-4 h-4" /></button>
                          </div>
                          {(['name', 'issuer', 'date'] as const).map((field) => (
                            <input key={field} type="text" value={cert[field]} onChange={(e) => { const updated = [...resume.certifications]; updated[i] = { ...updated[i], [field]: e.target.value }; updateField('certifications', updated); }} placeholder={field === 'name' ? 'Certification Name' : field === 'issuer' ? 'Issuer' : 'Date'} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white" />
                          ))}
                        </div>
                      ))}
                      <button onClick={() => updateField('certifications', [...resume.certifications, { name: '', issuer: '', date: '' }])} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-all flex items-center justify-center gap-2">
                        <FiPlus className="w-4 h-4" /> Add Certification
                      </button>
                    </div>
                  )}

                  {step?.key === 'achievements' && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">Achievements</label>
                        <button onClick={() => {
                          const last = resume.achievements[resume.achievements.length - 1] || '';
                          handleEnhance('achievement', last, 'achievements');
                        }} disabled={enhancing === 'achievements'} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 disabled:opacity-50">
                          <FiZap className="w-3 h-3" /> {enhancing === 'achievements' ? '...' : 'AI Generate'}
                        </button>
                      </div>
                      <div className="space-y-3">
                        {resume.achievements.map((ach, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <input type="text" value={ach} onChange={(e) => { const updated = [...resume.achievements]; updated[i] = e.target.value; updateField('achievements', updated); }} placeholder="e.g., Increased team productivity by 20%" className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                            <button onClick={() => updateField('achievements', resume.achievements.filter((_, j) => j !== i))} className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><FiTrash2 className="w-4 h-4" /></button>
                          </div>
                        ))}
                        <button onClick={() => updateField('achievements', [...resume.achievements, ''])} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-all flex items-center justify-center gap-2">
                          <FiPlus className="w-4 h-4" /> Add Achievement
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                <button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0} className="px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  <FiChevronLeft className="w-4 h-4" /> Previous
                </button>
                {currentStep < steps.length - 1 ? (
                  <button onClick={() => setCurrentStep(currentStep + 1)} className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all text-sm font-medium flex items-center gap-2 shadow-sm">
                    Next <FiChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button onClick={handleSave} className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all text-sm font-medium flex items-center gap-2 shadow-sm">
                    <FiSave className="w-4 h-4" /> Save Resume
                  </button>
                )}
              </div>
            </div>
          </div>

          <aside className={`${previewMode === 'mobile' ? 'w-[375px]' : 'flex-1'} bg-white border-l border-gray-200 hidden lg:block overflow-hidden ${showChat ? 'hidden xl:block' : ''}`}>
            <div className="h-full overflow-y-auto p-4">
              <div className={`mx-auto ${previewMode === 'mobile' ? 'w-[375px] shadow-lg rounded-xl border border-gray-200 overflow-hidden' : 'w-full max-w-[850px]'}`}>
                <ExecutiveTemplate resume={resume} style={getStyleConfig(resume.template)} />
              </div>
            </div>
          </aside>
        </div>

        <AnimatePresence>
          {showChat && (
            <motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: 360, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="bg-white border-l border-gray-200 flex-shrink-0 overflow-hidden hidden lg:block">
              <div className="w-[360px] h-full flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">AI Assistant</h3>
                  <button onClick={() => setShowChat(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded"><FiX className="w-5 h-5" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-8">Ask me anything about your resume!</p>
                  )}
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleChat()} placeholder="Ask for help..." className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
                    <button onClick={handleChat} disabled={chatLoading || !chatInput.trim()} className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      <FiSend className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
