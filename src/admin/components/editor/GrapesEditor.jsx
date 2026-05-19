import React, { useEffect, useRef } from 'react';
import grapesjs from 'grapesjs';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import gjsBasicBlocks from 'grapesjs-blocks-basic';
import gjsForms from 'grapesjs-plugin-forms';
import gjsCountdown from 'grapesjs-component-countdown';
import gjsTabs from 'grapesjs-tabs';
import gjsCustomCode from 'grapesjs-custom-code';
import gjsStyleFilter from 'grapesjs-style-filter';

import 'grapesjs/dist/css/grapes.min.css';
import './grapes.css';

const GrapesEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);
  const gjsEditor = useRef(null);
  const onChangeRef = useRef(onChange);

  // Keep onChangeRef up to date
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!gjsEditor.current && editorRef.current) {
      const editor = grapesjs.init({
        container: editorRef.current,
        height: '800px',
        width: '100%',
        plugins: [
          gjsPresetWebpage,
          gjsBasicBlocks,
          gjsForms,
          gjsCountdown,
          gjsTabs,
          gjsCustomCode,
          gjsStyleFilter
        ],
        pluginsOpts: {
          [gjsPresetWebpage]: {},
          [gjsBasicBlocks]: { flexGrid: true },
          [gjsForms]: {},
          [gjsCountdown]: {},
          [gjsTabs]: {},
          [gjsCustomCode]: {},
          [gjsStyleFilter]: {}
        },
        storageManager: false,
        canvas: {
          styles: [
            'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@700;800;900&display=swap',
          ],
        },
        deviceManager: {
          devices: [
            { name: 'Desktop', width: '' },
            { name: 'Tablet', width: '768px', widthMedia: '768px' },
            { name: 'Mobile', width: '320px', widthMedia: '480px' },
          ],
        },
      });

      // Set initial content once the editor is ready
      editor.on('load', () => {
        if (value) {
          editor.setComponents(value);
        }
      });

      // Sync content
      const syncContent = () => {
        const html = editor.getHtml();
        const css = editor.getCss();
        const fullContent = `${html}<style>${css}</style>`;
        
        if (onChangeRef.current) {
          onChangeRef.current(fullContent);
        }
      };

      // Listen to all relevant events for real-time sync
      const events = [
        'component:add', 
        'component:remove', 
        'component:clone', 
        'component:update', 
        'style:update', 
        'canvas:drop', 
        'undo', 
        'redo',
        'rte:custom'
      ];
      
      events.forEach(event => {
        editor.on(event, syncContent);
      });

      // Also sync on general update to be safe
      editor.on('update', syncContent);

      gjsEditor.current = editor;
    }

    return () => {
      if (gjsEditor.current) {
        gjsEditor.current.destroy();
        gjsEditor.current = null;
      }
    };
  }, []);

  // Update editor only if it's empty and value arrives (initial load)
  useEffect(() => {
    if (gjsEditor.current && value && gjsEditor.current.getComponents().length === 0) {
      gjsEditor.current.setComponents(value);
    }
  }, [value]);

  return (
    <div className="grapesjs-container border border-slate-200 rounded-3xl overflow-hidden shadow-2xl bg-white">
      <div ref={editorRef}></div>
    </div>
  );
};

export default GrapesEditor;
