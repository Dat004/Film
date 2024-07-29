import classNames from "classnames";

function Status({ isOn = false }) {
    const statusStyles = classNames("ml-[3px] font-medium text-[12px]", {
        "text-[#cae962]": isOn,
        "text-[#ff3017]": !isOn,
    });

  return <span className={statusStyles}>{isOn ? 'On' : 'Off'}</span>;
}

export default Status;
