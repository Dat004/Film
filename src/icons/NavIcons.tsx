import React from 'react';

import type { IconProps } from './index';

export const BarMenuIcon: React.FC<IconProps> = ({ width = '1em', height = '1em', ...props }) => (
  <svg
    viewBox="0 0 16 16"
    width={width}
    height={height}
    focusable="false"
    role="img"
    aria-label="list"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    {...props}
  >
    <g>
      <path
        fillRule="evenodd"
        d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"
      />
    </g>
  </svg>
);

export const BlockEyesIcon: React.FC<IconProps> = ({
  width = '14px',
  height = '14px',
  ...props
}) => (
  <svg
    viewBox="0 0 16 16"
    width={width}
    height={height}
    focusable="false"
    role="img"
    aria-label="eye slash"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    {...props}
  >
    <g transform="translate(8 8) scale(1.5 1.5) translate(-8 -8)">
      <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z" />
      <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z" />
      <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z" />
    </g>
  </svg>
);

export const BackToTopIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="60"
    height="60"
    viewBox="0 0 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect width="60" height="60" rx="8" fill="var(--bg-video-controls)" />
    <path
      d="M18.3333 18.3333H41.6666"
      stroke="var(--hover-color)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M29.4253 22.214L21.5086 29.7537C20.9639 30.2725 21.3311 31.1904 22.0833 31.1904H26.1667C26.6269 31.1904 27 31.5635 27 32.0238V44.1666C27 44.6269 27.3731 45 27.8333 45H32.1667C32.6269 45 33 44.6269 33 44.1666V32.0238C33 31.5635 33.3731 31.1904 33.8333 31.1904H37.9167C38.6689 31.1904 39.0361 30.2725 38.4914 29.7537L30.5747 22.214C30.2529 21.9075 29.7471 21.9075 29.4253 22.214Z"
      fill="var(--hover-color)"
    />
  </svg>
);

export const DotIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 16 16"
    width="1em"
    height="1em"
    focusable="false"
    role="img"
    aria-label="record fill"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    style={{ color: 'var(--icon-muted)' }}
    {...props}
  >
    <g transform="translate(8 8) scale(0.3 0.3) translate(-8 -8)">
      <path fillRule="evenodd" d="M8 13A5 5 0 1 0 8 3a5 5 0 0 0 0 10z" />
    </g>
  </svg>
);
