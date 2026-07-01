import SkeletonContainer from ".";

function CatalogSkeleton({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>
          <div className="flex items-center mb-[24px]">
            <div className="w-[50%] flex-shrink-0 max-w-[35%]">
              <SkeletonContainer
                className="!h-[30px]"
                duration={3}
                borderRadius={4}
              />
            </div>
            <div className="ml-auto w-[50%] flex-shrink-0 max-w-[90px]">
              <SkeletonContainer
                className="!h-[30px]"
                duration={3}
                borderRadius={4}
              />
            </div>
          </div>
          <div className="flex items-start mx-[-12px] mb-[40px] overflow-x-hidden">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className="w-[calc(100%/5)] xsm:w-[100%] ssm:w-[calc(100%/2)] lgm:w-[calc(100%/3)] xlm:w-[calc(100%/4)] flex-shrink-0 px-[12px]"
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
        </div>
      ))}
    </>
  );
}

export default CatalogSkeleton;
