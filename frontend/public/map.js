(() => {
  const init = (card) => {
    if (card.dataset.initialized) return;
    card.dataset.initialized = 'true';
    const mapNode = card.querySelector('[data-map]');
    const fallback = card.querySelector('[data-map-fallback]');
    const controls = card.querySelector('[data-map-controls]');
    const apiKey = card.dataset.apiKey;
    const [lng, lat] = (card.dataset.center || '').split(',').map(Number);
    const showFallback = () => { mapNode.hidden = true; fallback.hidden = false; controls.hidden = true; };
    if (!apiKey || apiKey === 'YOUR_API_KEY' || !Number.isFinite(lng) || !Number.isFinite(lat) || !window.ymaps3) { showFallback(); return; }
    window.ymaps3.ready.then(async () => {
      const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker } = window.ymaps3;
      const map = new YMap(mapNode, { location: { center: [lng, lat], zoom: 16 }, behaviors: ['drag', 'pinchZoom'] }, [new YMapDefaultSchemeLayer(), new YMapDefaultFeaturesLayer()]);
      const markerNode = document.createElement('a');
      markerNode.className = 'sabr-map-marker'; markerNode.href = card.dataset.orgUrl; markerNode.target = '_blank'; markerNode.rel = 'noopener'; markerNode.innerHTML = '<span class="sabr-map-marker__icon"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 10h10v8H7zM9 10V7h6v3M5 18h14M10 14h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="sabr-map-marker__label">' + (card.dataset.orgName || 'SABR') + '</span>';
      map.addChild(new YMapMarker({ coordinates: [lng, lat], zIndex: 10 }, markerNode));
      controls.hidden = false;
      card.querySelector('[data-zoom-in]').onclick = () => map.setLocation({ zoom: Math.min(20, map.zoom + 1) });
      card.querySelector('[data-zoom-out]').onclick = () => map.setLocation({ zoom: Math.max(3, map.zoom - 1) });
      card.querySelector('[data-geolocate]').onclick = () => navigator.geolocation?.getCurrentPosition(({ coords }) => map.setLocation({ center: [coords.longitude, coords.latitude], zoom: 16 }));
      card.querySelector('[data-traffic]').hidden = true;
    }).catch(showFallback);
  };
  const load = () => document.querySelectorAll('[data-map-card]').forEach((card) => init(card));
  document.querySelectorAll('[data-map-card]').forEach((card) => new IntersectionObserver((entries, observer) => { if (entries[0].isIntersecting) { load(); observer.disconnect(); } }, { rootMargin: '200px' }).observe(card));
})();
