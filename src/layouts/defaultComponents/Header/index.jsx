import { useState, useEffect } from "react";

import { useFetchData } from "../../../hooks";
import services from "../../../services";
import RightHeader from "./RightHeader";
import LeftHeader from "./LeftHeader";

function Header() {
  const [data, setData] = useState(null);

  const { newData, state } = useFetchData({
    request: services.allCategoryService,
  });

  useEffect(() => {
    if (!data) setData(newData);
  }, [newData]);

  return (
    <header className="fixed left-0 right-0 top-0 h-[80px] bg-bg-layout z-[500]">
      <div className="flex items-center justify-between p-[15px] mx-auto 3xl:w-width-layout-3xl 2xl:w-width-layout-2xl xl:w-width-layout-xl ">
        <LeftHeader dataCategory={data} />
        <RightHeader />
      </div>
    </header>
  );
}

export default Header;
