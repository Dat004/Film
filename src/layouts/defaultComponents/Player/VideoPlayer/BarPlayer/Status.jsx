import classNames from "classnames";

function Status({ isOn = false }) {
  const statusStyles = classNames(
    "ml-[6px] inline-flex min-h-[1.25rem] min-w-[1.75rem] shrink-0 items-center justify-center rounded-full px-[7px] text-[11px] font-semibold leading-none tabular-nums",
    isOn
      ? "bg-[var(--status-chip-on-bg)] text-[var(--status-chip-on-fg)]"
      : "bg-[var(--status-chip-off-bg)] text-[var(--status-chip-off-fg)]"
  );

  return <span className={statusStyles}>{isOn ? "On" : "Off"}</span>;
}

export default Status;
