import CustomPagination from "../components/CustomPagination";

function PhimMoi() {
  return (
    <div>
      <CustomPagination
        activeIndex={1226}
        countsNext={2}
        countsPrev={2}
        startIndex={1}
        endIndex={1230}
      />
    </div>
  );
}

export default PhimMoi;
