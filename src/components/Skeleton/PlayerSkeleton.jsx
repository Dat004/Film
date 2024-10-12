import SkeletonContainer from ".";

function PlayerSkeleton() {
  return (
    <div className="relative px-[15px] my-[40px] clm:px-0">
      <div className="flex flex-wrap gap-x-[30px] mx-auto 2xlm:w-width-detail-film-layout-2xlm slm:w-width-detail-film-layout-slm clm:w-width-detail-film-layout-clm">
        <div className="relative flex-grow flex-shrink w-[75%] 2xlm:w-[100%]">
          <div className="pl-[300px] slm:pl-0">
            <div className="pb-[56.25%] 2xls:pb-[460px] 2xlm:pb-[56.25%] relative">
              <div className="absolute inset-0">
                <SkeletonContainer borderRadius={0} />
              </div>
            </div>
          </div>
          <div className="absolute left-0 top-0 w-[300px] h-[100%] slm:relative slm:w-[100%] slm:h-auto bg-bg-player p-[15px]">
            <div className="max-w-[110px] h-[15px]">
              <SkeletonContainer
                borderRadius={2}
                baseColor="#504e4e"
                highlightColor="#756666"
              />
            </div>
            <div className="flex items-center w-[100%] my-[12px]">
              <div className="flex-shrink-0 max-w-[30%] h-[20px] flex-grow">
                <SkeletonContainer
                  borderRadius={2}
                  baseColor="#504e4e"
                  highlightColor="#756666"
                />
              </div>
              <div className="h-[20px] w-[50%] flex-grow-0 flex-shrink ml-auto">
                <SkeletonContainer
                  borderRadius={2}
                  baseColor="#504e4e"
                  highlightColor="#756666"
                />
              </div>
            </div>
            <div className="mt-[32px]">
              {Array.from({ length: 2 }, (_, i) => (
                <div key={i} className="flex items-center mb-[12px]">
                  <div className="max-w-[90px] w-[100%] h-[20px] flex-shrink pr-[12px]">
                    <SkeletonContainer
                      borderRadius={2}
                      baseColor="#504e4e"
                      highlightColor="#756666"
                    />
                  </div>
                  <div className="w-[100%] h-[20px] flex-shrink pr-[12px]">
                    <SkeletonContainer
                      borderRadius={2}
                      baseColor="#504e4e"
                      highlightColor="#756666"
                    />
                  </div>
                  <div className="size-[24px] flex-shrink-0">
                    <SkeletonContainer
                      circle
                      borderRadius={2}
                      baseColor="#504e4e"
                      highlightColor="#756666"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col 2xlm:my-[32px] 2xlm:px-[15px] 2xlm:flex-row 2xlm:w-[100%] flex-grow-0 flex-shrink-0 w-[calc(25%-30px)]">
          <div className="relative w-[100px] mr-[15px]">
            <div className="relative w-[100%] pb-[148%]">
              <div className="absolute inset-0">
                <SkeletonContainer
                  borderRadius={0}
                  baseColor="#504e4e"
                  highlightColor="#756666"
                />
              </div>
            </div>
          </div>
          <div className="mt-[32px] 2xlm:mt-0 flex-grow flex-shrink">
            <div className="w-[100%] max-w-[80%] h-[35px]">
              <SkeletonContainer
                borderRadius={2}
                baseColor="#504e4e"
                highlightColor="#756666"
              />
            </div>
            <div className="hidden 2xlm:block mt-[24px]">
              <div className="flex items-center gap-x-[8px]">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="h-[15px] max-w-[70px] min-w-[54px]">
                    <SkeletonContainer
                      borderRadius={2}
                      baseColor="#504e4e"
                      highlightColor="#756666"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-[24px]">
              <div className="w-[100%] h-[15px]">
                <SkeletonContainer
                  borderRadius={2}
                  baseColor="#504e4e"
                  highlightColor="#756666"
                />
              </div>
              <div className="max-w-[90px] mt-[8px] h-[15px]">
                <SkeletonContainer
                  borderRadius={2}
                  baseColor="#504e4e"
                  highlightColor="#756666"
                />
              </div>
            </div>
            <div className="mt-[24px] 2xlm:hidden">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex items-center mb-[8px]">
                  <div className="max-w-[110px] min-w-[90px] h-[15px]">
                    <SkeletonContainer
                      borderRadius={2}
                      baseColor="#504e4e"
                      highlightColor="#756666"
                    />
                  </div>
                  <div className="ml-[12px] max-w-[150px] h-[15px] w-[100%]">
                    <SkeletonContainer
                      borderRadius={2}
                      baseColor="#504e4e"
                      highlightColor="#756666"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlayerSkeleton;
