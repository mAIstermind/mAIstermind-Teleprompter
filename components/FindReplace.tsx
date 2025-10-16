import React from 'react';

interface FindReplaceProps {
  onFind: (term: string) => number;
  onReplace: (find: string, replace: string) => void;
  onReplaceAll: (find: string, replace: string) => void;
  onClose: () => void;
}

const FindReplace: React.FC<FindReplaceProps> = ({ onFind, onReplace, onReplaceAll, onClose }) => {
  const [findTerm, setFindTerm] = React.useState('');
  const [replaceTerm, setReplaceTerm] = React.useState('');
  const [matchCount, setMatchCount] = React.useState(0);
  const findInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    findInputRef.current?.focus();
  }, []);
  
  React.useEffect(() => {
    const handler = setTimeout(() => {
        const count = onFind(findTerm);
        setMatchCount(count);
    }, 200);
    return () => clearTimeout(handler);
  }, [findTerm, onFind]);

  const handleReplaceClick = () => {
    if (findTerm) onReplace(findTerm, replaceTerm);
  };
  
  const handleReplaceAllClick = () => {
    if (findTerm) {
      onReplaceAll(findTerm, replaceTerm);
      setFindTerm('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleReplaceClick();
  };

  return (
    <div className="absolute top-14 right-4 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-3 w-80 z-20">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-gray-300">Find & Replace</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl leading-none">&times;</button>
      </div>
      <div className="space-y-2">
        <input ref={findInputRef} type="text" placeholder="Find" value={findTerm} onChange={(e) => setFindTerm(e.target.value)} className="w-full bg-gray-800 text-sm rounded-md px-2 py-1.5 focus:ring-1 focus:ring-cyan-500 focus:outline-none" />
        <input type="text" placeholder="Replace with" value={replaceTerm} onChange={(e) => setReplaceTerm(e.target.value)} onKeyDown={handleKeyDown} className="w-full bg-gray-800 text-sm rounded-md px-2 py-1.5 focus:ring-1 focus:ring-cyan-500 focus:outline-none" />
      </div>
      <div className="text-xs text-gray-500 mt-2 text-right h-4">
        {findTerm && <span>{matchCount} {matchCount === 1 ? 'match' : 'matches'}</span>}
      </div>
      <div className="flex justify-end space-x-2 mt-2">
        <button onClick={handleReplaceClick} disabled={!findTerm || matchCount === 0} className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-md disabled:opacity-50">Replace</button>
        <button onClick={handleReplaceAllClick} disabled={!findTerm || matchCount === 0} className="text-xs bg-cyan-700 hover:bg-cyan-600 px-3 py-1 rounded-md disabled:opacity-50">Replace All</button>
      </div>
    </div>
  );
};

export default FindReplace;
