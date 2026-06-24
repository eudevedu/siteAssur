import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import './grapes.css';

const GrapesEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);
  const gjsEditor = useRef(null);
  const onChangeRef = useRef(onChange);
  const [isLoading, setIsLoading] = useState(true);

  // Keep onChangeRef up to date
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!gjsEditor.current && editorRef.current) {
      // Dynamic import — GrapesJS só é baixado quando este componente monta
      Promise.all([
        import('grapesjs'),
        import('grapesjs-preset-webpage'),
        import('grapesjs-blocks-basic'),
        import('grapesjs-plugin-forms'),
        import('grapesjs-component-countdown'),
        import('grapesjs-tabs'),
        import('grapesjs-custom-code'),
        import('grapesjs-style-filter'),
        import('grapesjs/dist/css/grapes.min.css'),
      ]).then(([
        { default: grapesjs },
        { default: gjsPresetWebpage },
        { default: gjsBasicBlocks },
        { default: gjsForms },
        { default: gjsCountdown },
        { default: gjsTabs },
        { default: gjsCustomCode },
        { default: gjsStyleFilter },
      ]) => {
        if (!editorRef.current) return;

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
          setIsLoading(false);
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
      });
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
    <div className="grapesjs-container border border-slate-200 rounded-3xl overflow-hidden shadow-2xl bg-white relative">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50 gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center">
              <Loader2 className="animate-spin text-patriotic-green" size={28} />
            </div>
          </div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">
            Carregando Editor Visual...
          </p>
        </div>
      )}
      <div ref={editorRef}></div>
    </div>
  );
};

export default GrapesEditor;
