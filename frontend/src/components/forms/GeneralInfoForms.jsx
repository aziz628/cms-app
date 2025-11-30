import  { useState, useEffect } from 'react';
import { aboutSchema, hero_title_Schema, hero_subtitle_Schema } from '../../validation/schemas/GeneralinfoSchema.js';

function AboutSummaryForm({ AboutSummary, onSubmit }) {
    const [summary, setAboutSummary] = useState(AboutSummary || '');
    const [error, setError] = useState(null);

    useEffect(() => {
        setAboutSummary(AboutSummary || '');
    }, [AboutSummary]);

    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            await aboutSchema.validate({ about_summary: summary })
            onSubmit({ about_summary: summary });
        } catch (err) {
            setError(err.message);
        }
    }
    return (
        <form onSubmit={handleSubmit} className=''>
            <div className='flex flex-wrap items-center space-x-3'>
            <textarea
                id="about-summary"
                value={summary}
                onChange={(e) => setAboutSummary(e.target.value)}
                className="h-20 min-w-48 p-2 border border-gray-300 rounded"
                rows="4"
                placeholder="Enter your gym summary..."
            />
            <button type="submit" className="btn-primary">
                      <i className="fa-solid fa-save"></i>
                  </button>
            </div>
            {error && <p className="text-danger text-sm mt-2">{error} <i className="fas fa-exclamation-circle"></i></p>}
        </form>
    );
}

function HeroTitleForm({ HeroTitle, onSubmit }) {
    const [title, setHeroTitle] = useState(HeroTitle || '');
    const [error, setError] = useState(null);
    useEffect(() => {
        setHeroTitle(HeroTitle || '');
    }, [HeroTitle]);

    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            await hero_title_Schema.validate({ hero_title: title })
            onSubmit({ hero_title: title });
        } catch (err) {
            setError(err.message);
        }
    }
    return (
        <form onSubmit={handleSubmit} className=''>
            <div className='flex flex-wrap items-center space-x-3'>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    className="border border-gray-300 rounded p-2"
                    placeholder="Enter hero title..."
                />
                <button type="submit" className="btn-primary">
                    <i className="fa-solid fa-save"></i>
                </button>
            </div>
            {error && <p className="text-danger text-sm mt-2">{error} <i className="fas fa-exclamation-circle"></i></p>}
        </form>
    );
}
function HeroSubtitleForm({ HeroSubtitle, onSubmit }) {
    const [subtitle, setHeroSubtitle] = useState(HeroSubtitle || '');
    const [error, setError] = useState(null);

    useEffect(() => {
        setHeroSubtitle(HeroSubtitle || '');
    }, [HeroSubtitle]);

    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            await hero_subtitle_Schema.validate({ hero_subtitle: subtitle })
            onSubmit({ hero_subtitle: subtitle });
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <form onSubmit={handleSubmit} className=''>
            <div className='flex flex-wrap items-center space-x-3'>
                <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    className="border border-gray-300 rounded p-2"
                    placeholder="Enter hero subtitle..."
                />
                <button type="submit" className="btn-primary">
                    <i className="fa-solid fa-save"></i>
                </button>
            </div>
            {error && <p className="text-danger text-sm mt-2">{error} <i className="fas fa-exclamation-circle"></i></p>}
        </form>
    );
}
export { AboutSummaryForm, HeroTitleForm, HeroSubtitleForm };