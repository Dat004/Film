import SkeletonContainer from ".";

function SearchPageSkeleton() {
  return (
    <div className="flex items-start flex-wrap">
      <div className="2xlm:w-[100%] 2xlm:order-1 w-[calc(75%-10px)]">
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="flex items-start mx-[-12px] mb-[30px] flex-grow-0 flex-shrink-0 overflow-x-hidden">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className="w-[calc(100%/4)] xsm:w-[100%] mdm:w-[calc(100%/2)] lgm:w-[calc(100%/3)] xlm:w-[calc(100%/4)] 2xlm:w-[calc(100%/5)] flex-shrink-0 px-[12px]"
              >
                <section className="relative w-[100%] pb-[110%]">
                  <div className="absolute inset-0">
                    <SkeletonContainer duration={3} borderRadius={4} />
                  </div>
                </section>
                <div className="mt-[18px]">
                  <SkeletonContainer
                    className="!h-[15px]"
                    duration={3}
                    borderRadius={4}
                  />
                  <SkeletonContainer
                    className="!h-[15px] max-w-[75%] mt-[8px]"
                    duration={3}
                    borderRadius={4}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="2xlm:w-[100%] 2xlm:order-0 2xlm:mb-[40px] 2xlm:ml-[-12px] w-[calc(25%-10px)] ml-auto gap-y-[12px] flex-grow-0 flex-shrink-0 flex items-center flex-wrap mx-[-8px]">
        <div className="px-[8px] w-[100%] max-w-[120px] h-[25px]">
          <SkeletonContainer borderRadius={20} />
        </div>
        <div className="px-[8px] w-[100%] max-w-[320px] h-[25px]">
          <SkeletonContainer borderRadius={20} />
        </div>
        <div className="px-[8px] w-[100%] max-w-[180px] h-[25px]">
          <SkeletonContainer borderRadius={20} />
        </div>
        <div className="px-[8px] w-[100%] max-w-[145px] h-[25px]">
          <SkeletonContainer borderRadius={20} />
        </div>
        <div className="px-[8px] w-[100%] max-w-[220px] h-[25px]">
          <SkeletonContainer borderRadius={20} />
        </div>
      </div>
    </div>
  );
}

export default SearchPageSkeleton;
