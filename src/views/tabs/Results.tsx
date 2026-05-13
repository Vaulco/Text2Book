import copy from '../../assets/copy-icon.png';
import Pagination from '../../components/Pagination.tsx';
import blink from '../../css/blink.module.css';
import fadein from '../../css/fadein.module.css';
import useResults from '../../hooks/useResults.ts';
import { IBookOutput } from '../../global/types.ts';

type Props = {
  results: IBookOutput;
  setFadeIn: React.Dispatch<React.SetStateAction<number>>;
  fadeinProps: { fadein: number };
  timeToGenerate: number;
};

function Results(props: Props) {
  const {
    page,
    blinkProps,
    truncatedResults,
    nextCopyIndex,
    onAnimationEnd,
    copyAndNotify,
    removeCopiedRow,
    checkRowIsCopied,
    prevPage,
    nextPage,
  } = useResults(props.results);

  return (
    <div className='mt-3'>
      {truncatedResults.length > 0 && (
        <div className='text-center text-gray-500 mb-2'>
          Generated {props.results.book.length} items in {props.timeToGenerate}s
          {props.results.book.length > 0 && (
            <span className='ml-2 text-blue-500 font-medium'>
              — Press <kbd className='bg-gray-200 text-gray-700 rounded px-1 py-0.5 text-xs font-mono'>Ctrl+V</kbd> to copy next
              {nextCopyIndex < props.results.book.length
                ? ` (next: #${nextCopyIndex + 1})`
                : ' (all done!)'}
            </span>
          )}
        </div>
      )}
      <ol
        className={`list-decimal ${fadein.fadein}`}
        onAnimationEnd={() => props.setFadeIn(0)}
        {...props.fadeinProps}
      >
        {truncatedResults.map((result) => (
          <li
            key={result.index}
            className={`flex rounded border overflow-hidden h-12 mb-1 listitem noblink ${blink.blink} ${blink.noblink} ${result.index === nextCopyIndex ? 'ring-2 ring-blue-400' : ''}`}
            {...blinkProps}
            onAnimationEnd={onAnimationEnd}
          >
            <button
              onClick={(e) => copyAndNotify(e, result.index, result.value)}
              className='w-12 bg-gray-300 h-full p-2 border-right group'
            >
              <img className='p-1 group-hover:opacity-70 transition' src={copy} />
            </button>
            <input
              className='w-full p-2 opacity-80 font-mono h-full outline-none'
              type='text'
              value={result.value}
              readOnly
            />
            <div className='text-xl p-2 bg-gray-300 select-none'>
              {result.index + 1}
            </div>
            {checkRowIsCopied(result.index) && (
              <div
                className='text-xl p-2 bg-green-300 hover:bg-red-300 select-none cursor-pointer'
                onClick={() => removeCopiedRow(result.index)}
              >
                ✓
              </div>
            )}
          </li>
        ))}
      </ol>
      {props.results.book.length / 10 > 1 && (
        <Pagination
          previousDisabled={page === 1}
          nextDisabled={page === Math.ceil(props.results.book.length / 10)}
          page={page}
          onPrevious={prevPage}
          onNext={nextPage}
          visible={truncatedResults.length > 0}
        />
      )}
    </div>
  );
}

export default Results;