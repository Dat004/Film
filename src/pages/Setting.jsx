import SEO from "../components/SEO";
import Button from "../components/Button";
import { useTheme } from "../context/ThemeContext";

function Setting() {
  const { themeMode, resolvedTheme, setThemeMode } = useTheme();

  return (
    <>
      <SEO url={window.location.href} title="Cài đặt" description="Cài đặt" />
      <section className="max-w-[700px] mx-auto px-[15px] pb-[40px]">
        <h1 className="text-primary text-[28px] font-medium mb-[6px]">
          Cài đặt
        </h1>
        <p className="text-title text-[14px] whitespace-normal mb-[18px]">
          Chọn giao diện. Chế độ <span className="text-primary">System</span> sẽ
          tự động theo giao diện hệ điều hành.
        </p>

        <div className="bg-bg-block rounded-[10px] p-[14px]">
          <div className="flex items-center justify-between gap-x-[12px] mb-[10px]">
            <div>
              <p className="text-primary text-[16px] font-medium">Theme</p>
              <p className="text-title text-[13px] whitespace-normal">
                Đang chọn:{" "}
                <span className="text-primary font-medium">{themeMode}</span>
                {themeMode === "system" && (
                  <>
                    {" "}
                    (resolved:{" "}
                    <span className="text-primary font-medium">
                      {resolvedTheme}
                    </span>
                    )
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-[10px]">
            <Button
              outline
              onClick={() => setThemeMode("system")}
              className={`px-[14px] py-[10px] text-[14px] ${
                themeMode === "system" ? "!border-bd-active" : "!border-bd-select-menu"
              }`}
            >
              System
            </Button>
            <Button
              outline
              onClick={() => setThemeMode("light")}
              className={`px-[14px] py-[10px] text-[14px] ${
                themeMode === "light" ? "!border-bd-active" : "!border-bd-select-menu"
              }`}
            >
              Light
            </Button>
            <Button
              outline
              onClick={() => setThemeMode("dark")}
              className={`px-[14px] py-[10px] text-[14px] ${
                themeMode === "dark" ? "!border-bd-active" : "!border-bd-select-menu"
              }`}
            >
              Dark
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

export default Setting;
