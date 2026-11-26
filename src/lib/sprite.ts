// Icon sprite (24x24 stroke icons) shared by every section.
export const ic = (n: string, c = "") => `<svg class="zi${c ? " " + c : ""}" aria-hidden="true" focusable="false"><use href="#zi-${n}"/></svg>`;

// icon sprite (24x24, stroke icons)
export const SPRITE = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
<symbol id="zi-check" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m7.5 12.5 3 3 6-7"/></symbol>
<symbol id="zi-chev" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></symbol>
<symbol id="zi-arrow-ur" viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9"/></symbol>
<symbol id="zi-arrow-r" viewBox="0 0 24 24"><path d="M4 12h16M14 6l6 6-6 6"/></symbol>
<symbol id="zi-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></symbol>
<symbol id="zi-bolt" viewBox="0 0 24 24"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></symbol>
<symbol id="zi-house" viewBox="0 0 24 24"><path d="m3 11 9-8 9 8M5 10v10h14V10M10 20v-6h4v6"/></symbol>
<symbol id="zi-panel" viewBox="0 0 24 24"><path d="m3 16 3-11h15l-3 11zM5.5 10.5h15M11.5 5l-1.5 11M16.5 5 15 16M9 20h9M13.5 16v4"/></symbol>
<symbol id="zi-bag" viewBox="0 0 24 24"><path d="M9 3h6l-1.3 3h-3.4zM10.3 6C6 8.8 4.3 14 7.5 18.5c.9 1.400 2.300 2.500 4.500 2.500s3.600-1.100 4.500-2.500C19.700 14 18 8.800 13.700 6"/><path d="M10 12h4.400M10 14.200h4.400M10 12c3 0 3.300 2.800.2 3l3.400 2.800"/></symbol>
<symbol id="zi-sunhouse" viewBox="0 0 48 48"><g style="stroke:var(--amber);stroke-width:1.5"><circle cx="10" cy="9" r="3.4"/><path d="M10 2v2.2M10 13.800V16M3 9h2.200M14.800 9H17M5 4l1.600 1.600M15 4l-1.600 1.600M5 14l1.600-1.600M15 14l-1.600-1.600"/></g><g style="stroke-width:1.5"><path d="M3 30 17 17l14 13M7 28v14h20V28M14 42v-8h6v8M2 42h44"/><path d="m21 15 15-6 6 10-15 6z" style="fill:currentColor;fill-opacity:.2"/><path d="M24 20l15-6M28.500 12l6 10M41 42v-9"/><ellipse cx="41" cy="30" rx="4.500" ry="6.500"/></g></symbol>
<symbol id="zi-rupee" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 8h8M8 11.5h8M10 8c3.5 0 4.5 4-1 4.5L14 17"/></symbol>
<symbol id="zi-chart" viewBox="0 0 24 24"><path d="M3 20h18M5 16l4-4 3 3 6-7M14 8h5v5"/></symbol>
<symbol id="zi-bank" viewBox="0 0 24 24"><path d="m3 9 9-6 9 6M5 9v9M9.5 9v9M14.5 9v9M19 9v9M3 21h18"/></symbol>
<symbol id="zi-doc" viewBox="0 0 24 24"><path d="M6 3h8l5 5v13H6zM14 3v5h5M9.5 13h6M9.5 17h6"/></symbol>
<symbol id="zi-bulb" viewBox="0 0 24 24"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.800c.9.700 1.100 1.500 1.100 2.200h5c0-.700.200-1.500 1.100-2.200A6 6 0 0 0 12 3z"/></symbol>
<symbol id="zi-leaf" viewBox="0 0 24 24"><path d="M5 21c0-10 5-16 16-17 0 11-6 16-16 17zM5 21c3-5 6-8 10-10"/></symbol>
<symbol id="zi-shield" viewBox="0 0 24 24"><path d="M12 3 4 6v6c0 5 3.500 8 8 9 4.500-1 8-4 8-9V6zM8.500 12l2.500 2.500 4.500-5"/></symbol>
<symbol id="zi-gear" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.500"/><path d="M12 2.500v3M12 18.500v3M2.500 12h3M18.500 12h3M5.300 5.300l2.100 2.100M16.600 16.600l2.100 2.100M18.700 5.300l-2.100 2.100M7.400 16.600l-2.100 2.100"/></symbol>
<symbol id="zi-battery" viewBox="0 0 24 24"><rect x="6" y="4" width="12" height="17" rx="2"/><path d="M10 4V2.500h4V4M12.500 8.500 10.500 13h3L11.500 17.500"/></symbol>
<symbol id="zi-ac" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="8" rx="2"/><path d="M6 16.500l-1 3M12 16.500v3M18 16.500l1 3M7 9h10"/></symbol>
<symbol id="zi-fridge" viewBox="0 0 24 24"><rect x="6" y="2.500" width="12" height="19" rx="2"/><path d="M6 10h12M9 6v1.500M9 13v3"/></symbol>
<symbol id="zi-wash" viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="13.500" r="4"/><path d="M7.500 6.500h.01M10.500 6.500h.01"/></symbol>
<symbol id="zi-tv" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/></symbol>
<symbol id="zi-fan" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1.800"/><path d="M12 10.200C10 5 14.500 3 15.500 6.500c.5 2-1.500 3.500-3.500 3.700zM13.800 12c5.200-2 7.200 2.500 3.700 3.500-2 .5-3.500-1.500-3.700-3.500zM12 13.800c2 5.200-2.500 7.200-3.500 3.700-.5-2 1.500-3.500 3.500-3.700zM10.200 12C5 14 3 9.500 6.500 8.500c2-.5 3.500 1.500 3.700 3.500z"/></symbol>
<symbol id="zi-tube" viewBox="0 0 24 24"><rect x="2.500" y="9.500" width="19" height="5" rx="2.500"/><path d="M7 12h10"/></symbol>
<symbol id="zi-phone" viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></symbol>
<symbol id="zi-mail" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.500 7 8.500 6.500L20.500 7"/></symbol>
<symbol id="zi-globe" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3.500 3.500 3.500 14.500 0 18M12 3c-3.500 3.500-3.500 14.500 0 18"/></symbol>
<symbol id="zi-pin" viewBox="0 0 24 24"><path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.500"/></symbol>
<symbol id="zi-fb" viewBox="0 0 24 24"><path d="M14 8h3V4.500h-3A4 4 0 0 0 10 8.500V11H7.500v3.500H10V21h3.500v-6.500H16.500L17 11h-3.500V8.800c0-.5.200-.8.500-.8z" fill="currentColor" stroke="none"/></symbol>
<symbol id="zi-ig" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.800"/><path d="M16.800 7.300h.01"/></symbol>
<symbol id="zi-in" viewBox="0 0 24 24"><path d="M5 9.500h3V19H5zM6.500 5.200h.01M11 9.500h2.800v1.400c.6-1 1.700-1.700 3.200-1.700 2.700 0 3.500 1.700 3.500 4.300V19h-3v-4.800c0-1.300-.3-2.200-1.600-2.200-1.400 0-1.900 1-1.900 2.300V19h-3z" fill="currentColor"/></symbol>
<symbol id="zi-wa" viewBox="0 0 24 24"><path d="M4 20l1.200-4.200A8 8 0 1 1 8.300 18.800zM9 8.500c0 3.500 3 6.500 6.500 6.500l1-1.500-2-1-1 .8a5 5 0 0 1-2.300-2.300l.8-1-1-2z"/></symbol>
<symbol id="zi-hardhat" viewBox="0 0 24 24"><path d="M4.500 15.500a7.500 7.500 0 0 1 15 0M2.500 15.500h19V19h-19zM10 8.300V5.500h4v2.800"/></symbol>
<symbol id="zi-award" viewBox="0 0 24 24"><circle cx="12" cy="9" r="6"/><path d="m9 14.500-1.500 7L12 19l4.500 2.500-1.500-7M9.500 9l1.800 1.800L15 7.200"/></symbol>
<symbol id="zi-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 6.500V12l3.500 2"/></symbol>
<symbol id="zi-headset" viewBox="0 0 24 24"><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="13" width="4" height="6" rx="1.500"/><rect x="17" y="13" width="4" height="6" rx="1.500"/><path d="M19 19v.500a2.500 2.500 0 0 1-2.500 2.500H13"/></symbol>
<symbol id="zi-wrench" viewBox="0 0 24 24"><path d="M14.500 6.500a4 4 0 0 0-5 5L3.500 17.500a1.800 1.800 0 0 0 3 3l6-6a4 4 0 0 0 5-5l-2.500 2.500-2.500-.500-.500-2.500z"/></symbol>
<symbol id="zi-users" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.500"/><path d="M2.500 20a6.500 6.500 0 0 1 13 0M16 4.800a3.500 3.500 0 0 1 0 6.400M18 14a6.500 6.500 0 0 1 3.500 6"/></symbol>
<symbol id="zi-trend" viewBox="0 0 24 24"><path d="M3 7l6 6 4-4 8 8M15 17h6v-6"/></symbol>
<symbol id="zi-swap" viewBox="0 0 24 24"><path d="M7 7h11l-3-3M17 17H6l3 3"/></symbol>
<symbol id="zi-ban" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M5.600 5.600l12.800 12.800"/></symbol>
<symbol id="zi-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.500-4.500"/></symbol>
<symbol id="zi-chat" viewBox="0 0 24 24"><path d="M4 5.500A1.500 1.500 0 0 1 5.500 4h13A1.500 1.500 0 0 1 20 5.500v9a1.500 1.500 0 0 1-1.500 1.500H9l-5 4z"/><path d="M8 9h8M8 12h5"/></symbol>
<symbol id="zi-ruler" viewBox="0 0 24 24"><g transform="rotate(-35 12 12)"><rect x="2" y="9" width="20" height="6" rx="1"/><path d="M6 9v3M10 9v2M14 9v3M18 9v2"/></g></symbol>
<symbol id="zi-truck" viewBox="0 0 24 24"><path d="M2 6h11v10H2zM13 9h4l3 3v4h-7"/><circle cx="6.500" cy="17.500" r="2"/><circle cx="16.500" cy="17.500" r="2"/></symbol>
<symbol id="zi-gauge" viewBox="0 0 24 24"><path d="M4 17a8 8 0 1 1 16 0"/><path d="m12 17 4-6"/><path d="M12 5v2M5.600 8.600l1.400 1.400M18.400 8.600 17 10"/></symbol>
<symbol id="zi-power" viewBox="0 0 24 24"><path d="M12 3v8"/><path d="M6.300 6.300a8 8 0 1 0 11.400 0"/></symbol>
<symbol id="zi-cycle" viewBox="0 0 24 24"><path d="M20 11a8 8 0 0 0-14-4L4 9"/><path d="M4 4v5h5"/><path d="M4 13a8 8 0 0 0 14 4l2-2"/><path d="M20 20v-5h-5"/></symbol>
<symbol id="zi-download" viewBox="0 0 24 24"><path d="M12 3v12M7 11l5 5 5-5M4 20h16"/></symbol>
<symbol id="zi-share" viewBox="0 0 24 24"><circle cx="6" cy="12" r="2.500"/><circle cx="18" cy="6" r="2.500"/><circle cx="18" cy="18" r="2.500"/><path d="m8.200 10.800 7.600-3.600M8.200 13.200l7.600 3.600"/></symbol>
<symbol id="zi-tree" viewBox="0 0 24 24"><path d="M12 21v-5M12 3 7 10h3l-4 6h12l-4-6h3z"/></symbol>
<symbol id="zi-calc" viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 18h.01M12 18h.01M16 18h.01"/></symbol>
<symbol id="zi-info" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></symbol>
<symbol id="zi-edit" viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16zM13.500 6.500l4 4"/></symbol>
<symbol id="zi-user" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4.500 21a7.500 7.500 0 0 1 15 0"/></symbol>
<symbol id="zi-dots" viewBox="0 0 24 24"><path d="M5 12h.01M12 12h.01M19 12h.01" stroke-width="3.200"/></symbol>
<symbol id="zi-bess" viewBox="0 0 24 24"><rect x="6" y="3" width="12" height="18" rx="2"/><path d="m12.800 8-2.600 4.200h3.600L11.200 17"/></symbol>
</defs></svg>`;
