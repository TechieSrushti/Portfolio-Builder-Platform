import React, { createContext, useState, useContext, useCallback } from 'react';

const BuilderContext = createContext();

export const BuilderProvider = ({ children }) => {
  const [portfolio, setPortfolio] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const saveToHistory = useCallback((newState) => {
    if (!newState) return;
    // Deep clone state to prevent reference mutations
    const stateCopy = JSON.parse(JSON.stringify(newState));
    const cleanHistory = history.slice(0, historyIndex + 1);
    
    setHistory([...cleanHistory, stateCopy].slice(-10)); // limit history to last 10 actions
    setHistoryIndex(prev => Math.min(prev + 1, 9));
  }, [history, historyIndex]);

  const loadPortfolio = useCallback((pData) => {
    setPortfolio(pData);
    setHistory([JSON.parse(JSON.stringify(pData))]);
    setHistoryIndex(0);
  }, []);

  const updatePortfolioState = useCallback((updater) => {
    setPortfolio(prev => {
      if (!prev) return prev;
      const updated = typeof updater === 'function' ? updater(prev) : updater;
      saveToHistory(updated);
      return updated;
    });
  }, [saveToHistory]);

  const updateSectionContent = useCallback((sectionId, content) => {
    updatePortfolioState(prev => {
      const sections = prev.sections.map(s => {
        if (s.id === sectionId) {
          return { ...s, content: { ...s.content, ...content } };
        }
        return s;
      });
      return { ...prev, sections };
    });
  }, [updatePortfolioState]);

  const updateSectionSettings = useCallback((sectionId, settings) => {
    updatePortfolioState(prev => {
      const sections = prev.sections.map(s => {
        if (s.id === sectionId) {
          return { ...s, settings: { ...s.settings, ...settings } };
        }
        return s;
      });
      return { ...prev, sections };
    });
  }, [updatePortfolioState]);

  const addSection = useCallback((type) => {
    const id = `${type.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    const newSection = {
      id,
      type,
      title: type,
      visible: true,
      content: getSectionDefaultContent(type),
      settings: {},
    };

    updatePortfolioState(prev => {
      // Add section before footer if footer exists, otherwise at the end
      const footerIdx = prev.sections.findIndex(s => s.type === 'Footer');
      const sections = [...prev.sections];
      if (footerIdx > -1) {
        sections.splice(footerIdx, 0, newSection);
      } else {
        sections.push(newSection);
      }
      return { ...prev, sections };
    });
  }, [updatePortfolioState]);

  const deleteSection = useCallback((sectionId) => {
    updatePortfolioState(prev => {
      const sections = prev.sections.filter(s => s.id !== sectionId);
      return { ...prev, sections };
    });
  }, [updatePortfolioState]);

  const duplicateSection = useCallback((sectionId) => {
    updatePortfolioState(prev => {
      const idx = prev.sections.findIndex(s => s.id === sectionId);
      if (idx === -1) return prev;
      
      const original = prev.sections[idx];
      const clone = {
        ...JSON.parse(JSON.stringify(original)),
        id: `${original.type.toLowerCase()}-${Date.now()}`,
        title: `${original.title} (Copy)`,
      };

      const sections = [...prev.sections];
      sections.splice(idx + 1, 0, clone);
      return { ...prev, sections };
    });
  }, [updatePortfolioState]);

  const toggleSectionVisibility = useCallback((sectionId) => {
    updatePortfolioState(prev => {
      const sections = prev.sections.map(s => {
        if (s.id === sectionId) {
          return { ...s, visible: !s.visible };
        }
        return s;
      });
      return { ...prev, sections };
    });
  }, [updatePortfolioState]);

  const reorderSections = useCallback((startIndex, endIndex) => {
    updatePortfolioState(prev => {
      const result = [...prev.sections];
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return { ...prev, sections: result };
    });
  }, [updatePortfolioState]);

  const updateColors = useCallback((colors) => {
    updatePortfolioState(prev => ({
      ...prev,
      colors: { ...prev.colors, ...colors },
    }));
  }, [updatePortfolioState]);

  const updateFont = useCallback((font) => {
    updatePortfolioState(prev => ({ ...prev, font }));
  }, [updatePortfolioState]);

  const updateSeo = useCallback((seoData) => {
    updatePortfolioState(prev => ({
      ...prev,
      seo: { ...prev.seo, ...seoData },
    }));
  }, [updatePortfolioState]);

  const undo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setPortfolio(JSON.parse(JSON.stringify(history[prevIdx])));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setPortfolio(JSON.parse(JSON.stringify(history[nextIdx])));
    }
  };

  return (
    <BuilderContext.Provider
      value={{
        portfolio,
        setPortfolio,
        loadPortfolio,
        updatePortfolioState,
        updateSectionContent,
        updateSectionSettings,
        addSection,
        deleteSection,
        duplicateSection,
        toggleSectionVisibility,
        reorderSections,
        updateColors,
        updateFont,
        updateSeo,
        undo,
        redo,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
      }}
    >
      {children}
    </BuilderContext.Provider>
  );
};

// Helper defaults for section creation
const getSectionDefaultContent = (type) => {
  switch (type) {
    case 'About Me':
      return { title: 'A New Story', description: 'Enter details about your background, achievements, and career path.' };
    case 'Skills':
      return { skillsList: [{ name: 'React', level: 90 }, { name: 'JavaScript', level: 95 }] };
    case 'Experience':
      return { jobs: [{ company: 'Acme Corp', position: 'Developer', period: '2023 - Present', description: 'Brief description.' }] };
    case 'Education':
      return { educationList: [{ institution: 'State University', degree: 'BS', fieldOfStudy: 'Computer Science', period: '2019 - 2023' }] };
    case 'Projects':
      return { projectsList: [{ title: 'Cool App', description: 'A sleek modern dashboard.', tech: ['React', 'CSS3'] }] };
    case 'Services':
      return { servicesList: [{ title: 'Fullstack Development', description: 'Building fast React client portals and custom APIs.' }] };
    case 'Testimonials':
      return { reviews: [{ clientName: 'Jane Smith', company: 'Founder, DesignCo', text: 'Amazing work! Super clean code and beautiful design.' }] };
    case 'Gallery':
      return { images: [{ url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80', caption: 'Creative design' }] };
    case 'Contact':
      return { email: 'work@example.com', whatsapp: '', socials: { github: '', linkedin: '', twitter: '' } };
    default:
      return {};
  }
};

export const useBuilder = () => useContext(BuilderContext);
