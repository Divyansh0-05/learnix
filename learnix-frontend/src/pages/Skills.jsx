import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { getUserSkills, addSkill, deleteSkill, updateSkill } from '../services/skillService';
import { FiPlus, FiTrash2, FiX, FiEdit2, FiChevronLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Skills() {
    const { user } = useAuth();
    const [offered, setOffered] = useState([]);
    const [wanted, setWanted] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        skillName: '',
        category: 'Programming',
        level: 'beginner',
        type: 'OFFERED',
        description: ''
    });

    const categories = ['Programming', 'Design', 'Music', 'Language', 'Cooking', 'Fitness', 'Photography', 'Writing', 'Business', 'Marketing', 'Other'];
    const levels = ['beginner', 'intermediate', 'expert'];

    useEffect(() => {
        if (user?._id || user?.id) {
            fetchSkills();
        }
    }, [user]);

    const fetchSkills = async () => {
        setLoading(true);
        try {
            const userId = user?._id || user?.id;
            const result = await getUserSkills(userId);
            if (result.success) {
                setOffered(result.data.offered || []);
                setWanted(result.data.wanted || []);
            }
        } catch (error) {
            toast.error(error.error || 'Failed to fetch skills');
        } finally {
            setLoading(false);
        }
    };

    const handleAddSkill = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            let result;
            if (editingId) {
                // Remove type from formData as it shouldn't be updated (backend constraint or logic)
                const { type, ...updateData } = formData;
                result = await updateSkill(editingId, updateData);
            } else {
                result = await addSkill({ ...formData });
            }

            if (result.success) {
                toast.success(`Skill ${editingId ? 'updated' : 'added'} successfully`);
                setIsModalOpen(false);
                setEditingId(null);
                setFormData({
                    skillName: '',
                    category: 'Programming',
                    level: 'beginner',
                    type: 'OFFERED',
                    description: ''
                });
                fetchSkills();
            }
        } catch (error) {
            toast.error(error.error || `Failed to ${editingId ? 'update' : 'add'} skill`);
        } finally {
            setSubmitting(false);
        }
    };

    const openEditModal = (skill) => {
        setFormData({
            skillName: skill.skillName,
            category: skill.category,
            level: skill.level,
            type: skill.type,
            description: skill.description || ''
        });
        setEditingId(skill._id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this skill?')) return;
        try {
            const result = await deleteSkill(id);
            if (result.success) {
                toast.success('Skill deleted successfully');
                fetchSkills();
            }
        } catch (error) {
            toast.error(error.error || 'Failed to delete skill');
        }
    };

    const SkillCard = ({ skill }) => {
        const isOffered = skill.type === 'OFFERED';
        const colorClass = isOffered ? '#34d399' : '#60a5fa'; // Matches Profile page tails
        const bgClass = isOffered ? 'rgba(16,185,129,0.05)' : 'rgba(59,130,246,0.05)';
        const borderClass = isOffered ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)';
        const hoverBgClass = isOffered ? 'rgba(16,185,129,0.08)' : 'rgba(59,130,246,0.08)';
        const hoverBorderClass = isOffered ? 'rgba(16,185,129,0.2)' : 'rgba(59,130,246,0.2)';

        return (
            <div style={{
                background: bgClass,
                border: `1px solid ${borderClass}`,
                borderRadius: '1.25rem',
                padding: '1.5rem',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s'
            }}
                onMouseEnter={e => {
                    e.currentTarget.style.background = hoverBgClass;
                    e.currentTarget.style.borderColor = hoverBorderClass;
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.background = bgClass;
                    e.currentTarget.style.borderColor = borderClass;
                }}
            >
                <div style={{ paddingRight: '4rem' }}>
                    <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
                        {skill.skillName}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            background: 'rgba(255,255,255,0.05)',
                            padding: '0.3rem 0.6rem',
                            borderRadius: '0.5rem',
                            color: 'rgba(255,255,255,0.7)',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            {skill.category}
                        </span>
                        <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            background: isOffered ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)',
                            padding: '0.3rem 0.6rem',
                            borderRadius: '0.5rem',
                            color: colorClass,
                            border: `1px solid ${borderClass}`
                        }}>
                            {skill.level}
                        </span>
                    </div>
                </div>

                {skill.description && (
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                        {skill.description}
                    </p>
                )}

                <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => openEditModal(skill)}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '0.5rem',
                            color: '#fff',
                            cursor: 'pointer',
                            padding: '0.4rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = '#fff';
                            e.currentTarget.style.color = '#000';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                            e.currentTarget.style.color = '#fff';
                        }}
                    >
                        <FiEdit2 size={14} />
                    </button>
                    <button
                        onClick={() => handleDelete(skill._id)}
                        style={{
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: '0.5rem',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '0.4rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = '#ef4444';
                            e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                            e.currentTarget.style.color = '#ef4444';
                        }}
                    >
                        <FiTrash2 size={14} />
                    </button>
                </div>
            </div>
        );
    };

    const inputStyle = {
        width: '100%',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '0.5rem',
        padding: '0.75rem',
        color: '#fff',
        fontSize: '0.9rem',
        outline: 'none',
        marginBottom: '1rem'
    };

    return (
        <>
            <Helmet><title>My Skills — Learnix</title></Helmet>
            <div style={{ minHeight: '100vh', background: '#000000', paddingTop: '7rem', paddingBottom: '4rem' }}>
                <div className="container mx-auto px-4" style={{ maxWidth: '960px' }}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                        <div>
                            <Link
                                to="/dashboard"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    color: 'rgba(255,255,255,0.4)',
                                    textDecoration: 'none',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    marginBottom: '1rem',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                            >
                                <FiChevronLeft size={12} /> Back to Dashboard
                            </Link>
                            <p style={{ color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                Skills
                            </p>
                            <h1 style={{ color: '#fff', fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.04em' }}>
                                Manage Your Skills
                            </h1>
                        </div>
                        <button
                            onClick={() => {
                                setEditingId(null);
                                setFormData({
                                    skillName: '', category: 'Programming', level: 'beginner', type: 'OFFERED', description: ''
                                });
                                setIsModalOpen(true);
                            }}
                            style={{
                                background: '#ffffff',
                                color: '#000000',
                                border: 'none',
                                borderRadius: '2rem',
                                padding: '0.6rem 1.25rem',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#e5e5e5'}
                            onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                        >
                            <FiPlus size={16} /> Add Skill
                        </button>
                    </div>

                    {loading ? (
                        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Loading skills...</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Offered Skills */}
                            <div>
                                <h2 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Skills I Offer</h2>
                                {offered.length === 0 ? (
                                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>You haven't added any skills you can teach yet.</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {offered.map(skill => <SkillCard key={skill._id} skill={skill} />)}
                                    </div>
                                )}
                            </div>

                            {/* Wanted Skills */}
                            <div>
                                <h2 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Skills I Want to Learn</h2>
                                {wanted.length === 0 ? (
                                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>You haven't added any skills you want to learn yet.</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {wanted.map(skill => <SkillCard key={skill._id} skill={skill} />)}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Skill Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div style={{
                        background: '#0a0a0a',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '1.5rem',
                        width: '100%',
                        maxWidth: '500px',
                        padding: '2rem',
                        position: 'relative'
                    }}>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
                        >
                            <FiX size={24} />
                        </button>

                        <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>{editingId ? 'Edit Skill' : 'Add a Skill'}</h2>

                        <form onSubmit={handleAddSkill}>
                            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>Type</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                style={inputStyle}
                                disabled={!!editingId} // User should not change the type once created
                            >
                                <option value="OFFERED">I can teach this skill (Offered)</option>
                                <option value="WANTED">I want to learn this skill (Wanted)</option>
                            </select>

                            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>Skill Name</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Graphic Design, Python, React"
                                value={formData.skillName}
                                onChange={e => setFormData({ ...formData, skillName: e.target.value })}
                                style={inputStyle}
                                maxLength={50}
                                disabled={!!editingId} // Unique constraint logic might prevent rename safely
                            />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        style={inputStyle}
                                    >
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>Proficiency Level</label>
                                    <select
                                        value={formData.level}
                                        onChange={e => setFormData({ ...formData, level: e.target.value })}
                                        style={inputStyle}
                                    >
                                        {levels.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                                    </select>
                                </div>
                            </div>

                            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>Description (Optional)</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                                placeholder="Briefly describe what you know or want to learn..."
                                maxLength={300}
                            />

                            <button
                                type="submit"
                                disabled={submitting}
                                style={{
                                    width: '100%',
                                    background: '#ffffff',
                                    color: '#000000',
                                    border: 'none',
                                    borderRadius: '2rem',
                                    padding: '0.9rem',
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                    cursor: submitting ? 'not-allowed' : 'pointer',
                                    marginTop: '0.5rem',
                                    transition: 'all 0.25s ease',
                                }}
                                onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = '#e5e5e5' }}
                                onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = '#ffffff' }}
                            >
                                {submitting ? 'Saving...' : 'Save Skill'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
