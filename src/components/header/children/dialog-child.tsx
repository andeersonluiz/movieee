import {
  Dispatch,
  SetStateAction,
  Fragment,
  useEffect,
  useState,
  useRef,
  useContext,
  useLayoutEffect,
} from 'react';
import SearchIcon from '@/components/icon/search-icon';
import { useTranslations } from 'next-intl';
import CloseIcon from '@/components/icon/close-icon';
import {} from 'react-aria-components';
import { Modal, Dialog, Heading, Input } from 'react-aria-components';
import HeaderSearchComponent from '../header-search-component';
import { MultiList, Result } from '@/modules/data/model/multi-list';
import { MovieAndTvShowContext } from '@/modules/presentation/provider/movies-tv-show-provider';
import SearchTile from './search-tile';
import useDebouncer from '@/hooks/debouncer';
import { CircularProgress } from '@nextui-org/progress';
import NotFoundSearch from './not-found-search';

const DialogChild = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: any }) => {
  const t = useTranslations('common');
  const tMetadata = useTranslations('metadata');
  const [isMoved, setIsMoved] = useState(false);
  const [searchData, setSearchData] = useState<Result[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const context = useContext(MovieAndTvShowContext);

  const [query, setQuery] = useState('');
  const debouncerValue = useDebouncer(query);

  const timeoutRef = useRef<any | null>(null);
  const isMounted = useRef(false);
  const heightHeaderRef = useRef<any>();
  const heightInputRef = useRef<any>();
  const [dimensions, setDimensions] = useState('');
  console.log('dimensions', dimensions);

  useLayoutEffect(() => {
    if (heightHeaderRef.current && heightInputRef.current) {
      const value = heightHeaderRef.current.offsetHeight + heightHeaderRef.current.offsetHeight;
      setDimensions('h-[calc(100%-' + value + 'px)]');
    }
  }, []);

  useEffect(() => {
    if (debouncerValue) {
      const fetchData = async () => {
        document.getElementById('search_content')!.scrollTo(0, 0);
        const dataSearch = await context!.searchMultiUseCase.execute(query, tMetadata('language'));

        setSearchData(dataSearch!.results);
        setIsLoading(false);
      };
      fetchData();
    }
    if (debouncerValue == '') {
      setSearchData([]);
      setIsLoading(false);
    }
  }, [debouncerValue]);

  useEffect(() => {
    if (query != '') {
      setIsLoading(true);
    }
  }, [query]);

  const startTimeout = () => {
    timeoutRef.current = setTimeout(() => {
      setIsMoved(true);
    }, 10);
  };

  const clearTimeoutManually = () => {
    clearTimeout(timeoutRef.current);

    setIsMoved(false);
  };

  if (isOpen && !isMoved) {
    startTimeout();
  }

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleClick = async (props: any) => {
    if (isMounted.current) {
      clearTimeoutManually();
      setIsOpen(false);
      await new Promise((resolve) => setTimeout(resolve, 300));
      props.close();
    }
  };
  return (
    <Modal className={``}>
      <Dialog>
        {(props) => {
          return (
            <div
              className={`fixed left-0 right-0 top-0 flex h-full w-full justify-center bg-black bg-opacity-95 duration-500`}
            >
              <Heading id='header_search' className={`w-full`}>
                <div ref={heightHeaderRef} className='bg-black'>
                  <HeaderSearchComponent
                    onClick={async () => {
                      clearTimeoutManually();
                      setIsOpen(false);
                      setSearchData([]);
                      setIsLoading(false);
                      setQuery('');

                      await new Promise((r) => setTimeout(r, 300));
                      props.close();
                    }}
                  />
                </div>
                <hr className='relative z-10 h-px border-0 bg-neutral-500 shadow-none' />

                <div
                  ref={heightInputRef}
                  className={`relative ${!isMoved ? '!-z-10 !-translate-y-20' : ''} ${isOpen ? '-z-0 translate-y-0' : '-z-10 -translate-y-20'} flex h-20 items-center bg-black px-8 shadow-[#c2c1c189_0px_7px_10px_-10px] transition-all duration-300 ease-linear`}
                >
                  <SearchIcon pointer={false} />
                  <Input
                    className='text-input m-2 flex h-10 w-full bg-black p-2 text-white outline-none'
                    name='full_name'
                    placeholder={t('search')}
                    onChange={(text) => setQuery(text.target.value)}
                    type='text'
                  />
                  <a
                    onClick={async () => {
                      clearTimeoutManually();
                      setIsOpen(false);
                      setSearchData([]);
                      setIsLoading(false);
                      setQuery('');
                      await new Promise((r) => setTimeout(r, 300));
                      props.close();
                    }}
                  >
                    <CloseIcon />
                  </a>
                </div>
                <div
                  id='search_content'
                  className={`no-scrollbar flex h-[calc(100%-142px)] w-full overflow-y-scroll ${isOpen ? 'bg-black' : ''}`}
                >
                  {isOpen ? (
                    isLoading ? (
                      <div className='flex h-full w-full content-center justify-center bg-black'>
                        <CircularProgress
                          size='lg'
                          color='warning'
                          className=''
                          aria-label='loading...'
                        />
                      </div>
                    ) : searchData.length == 0 && query != '' ? (
                      <div className='flex w-full bg-black px-4 py-5'>
                        <NotFoundSearch query={query} />
                      </div>
                    ) : (
                      <div className='w-full flex-col gap-4 py-6'>
                        {searchData?.map((item) => <SearchTile key={item.id} media={item} />)}
                        <div className='pb-8'></div>
                      </div>
                    )
                  ) : (
                    <></>
                  )}
                </div>
              </Heading>
            </div>
          );
        }}
      </Dialog>
    </Modal>
  );
};

export default DialogChild;
